import { randomInt } from 'node:crypto'
import { httpError, bodyOf, isStr, isPhone, normPhone } from '../validate.js'

export default function orderRoutes(app, { store, auth, d }) {
  const orderId = () => {
    for (;;) {
      const id = `BB${String(randomInt(0, 1000000)).padStart(6, '0')}`
      if (!store.get('orders', id)) return id
    }
  }

  app.post('/api/orders', async (req, reply) => {
    const b = bodyOf(req)
    const phone = normPhone(b.phone)
    if (!isStr(b.name, 3, 80)) throw httpError(400, 'নাম লিখুন।')
    if (!isPhone(phone)) throw httpError(400, 'সঠিক মোবাইল নম্বর দিন।')
    if (!isStr(b.district, 1, 60)) throw httpError(400, 'জেলা লিখুন।')
    if (!isStr(b.address, 8, 300)) throw httpError(400, 'ঠিকানা লিখুন।')
    if (!Array.isArray(b.items) || b.items.length === 0) throw httpError(400, 'ঝুড়িতে কিছু নেই।')
    // ডেমো অর্ডার। শুধু ক্যাশ অন ডেলিভারি। অন্য পেমেন্ট নেওয়া হয় না।
    if (b.paymentMethod !== undefined && b.paymentMethod !== 'ক্যাশ অন ডেলিভারি') throw httpError(400, 'শুধু ক্যাশ অন ডেলিভারি হবে।')

    // একই পণ্য দুবার এলে যোগ করে নেয়
    const want = new Map()
    for (const it of b.items) {
      const qty = Number(it?.qty)
      if (typeof it?.id !== 'string' || !Number.isInteger(qty) || qty < 1 || qty > 99) throw httpError(400, 'অর্ডারের জিনিস ঠিক নেই।')
      want.set(it.id, (want.get(it.id) ?? 0) + qty)
    }
    const lines = []
    for (const [id, qty] of want) {
      const p = store.get('products', id)
      if (!p || !d.isPublic(p)) throw httpError(400, 'অর্ডারের জিনিস ঠিক নেই।')
      if (p.stock < qty) throw httpError(400, d.lowStockLine(p, p.stock))
      lines.push({ p, qty })
    }

    const s = d.settings()
    const district = b.district.trim()
    const deliveryFee = district === 'ঢাকা' ? s.feeDhaka : s.feeOutside
    const subtotal = lines.reduce((t, l) => t + l.p.price * l.qty, 0)
    const user = auth.userFrom(req)
    const order = {
      id: orderId(),
      userId: user?.id ?? null,
      name: b.name.trim(),
      phone,
      district,
      address: b.address.trim(),
      delivery: district === 'ঢাকা' ? 'Dhaka' : 'Outside Dhaka',
      items: lines.map((l) => ({ id: l.p.id, nameBn: l.p.nameBn, price: l.p.price, qty: l.qty, sellerId: l.p.sellerId })),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: 'ক্যাশ অন ডেলিভারি',
      status: 'placed',
      sentBy: [],
      confirmed: false,
      createdAt: new Date().toISOString(),
    }
    // স্টক কমানো আর অর্ডার এক সাথে লেখা হয়
    const pairs = [['orders', order], ...lines.map((l) => ['products', { ...l.p, stock: l.p.stock - l.qty }])]
    if (user) pairs.push(['users', { ...user, district: order.district, address: order.address }])
    await store.putMany(pairs)
    return reply.code(201).send({ id: order.id, total: order.total, paymentMethod: order.paymentMethod, status: order.status })
  })

  const mine = (req) => {
    const o = store.get('orders', req.params.id)
    if (!o || o.userId !== req.user.id) throw httpError(404, 'অর্ডারটি পাওয়া যায়নি।')
    return o
  }

  app.post('/api/orders/:id/received', { preHandler: auth.requireUser }, async (req) => {
    const o = mine(req)
    if (o.status !== 'sent') throw httpError(400, 'অর্ডার এখনও সবটা পাঠানো হয়নি।')
    const next = { ...o, status: 'delivered', deliveredAt: new Date().toISOString() }
    await store.put('orders', next)
    return d.buyerOrder(next)
  })

  app.post('/api/orders/:id/cancel', { preHandler: auth.requireUser }, async (req) => {
    const o = mine(req)
    if (o.status !== 'placed' || o.sentBy.length > 0) throw httpError(400, 'এই অর্ডার আর বাতিল করা যাবে না।')
    const next = { ...o, status: 'cancelled' }
    await store.putMany([['orders', next], ...d.restoreOps(o)])
    return d.buyerOrder(next)
  })
}
