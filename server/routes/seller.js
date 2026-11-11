import { randomBytes } from 'node:crypto'
import { httpError, bodyOf, isStr, isPhone, normPhone, newId } from '../validate.js'

const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/

// দোকানের তথ্য যাচাই (SellerDashboard এর ShopForm এর মতো)
export function readShop(b, full) {
  const f = {}
  const has = (k) => full || b[k] !== undefined
  if (has('shopName')) { if (!isStr(b.shopName, 3, 80)) throw httpError(400, 'দোকানের নাম লিখুন।'); f.shopName = b.shopName.trim() }
  if (has('craft')) { if (!isStr(b.craft, 2, 80)) throw httpError(400, 'কী বানান, লিখুন।'); f.craft = b.craft.trim() }
  if (has('district')) { if (!isStr(b.district, 1, 60)) throw httpError(400, 'জেলা লিখুন।'); f.district = b.district.trim() }
  if (has('story')) { if (!isStr(b.story, 20, 1500)) throw httpError(400, 'নিজের কাজের কথা দুই-এক লাইনে লিখুন।'); f.story = b.story.trim() }
  if (has('phone')) {
    const p = normPhone(b.phone)
    if (!isPhone(p)) throw httpError(400, 'WhatsApp নম্বর ঠিক নেই।')
    f.phone = p
  }
  return f
}

export default function sellerRoutes(app, { store, auth, d }) {
  const { requireUser } = auth
  const mySeller = (req) => {
    const s = d.sellerOfUser(req.user.id)
    if (!s) throw httpError(403, 'আগে দোকান খুলুন।')
    return s
  }
  const approved = (req) => {
    const s = mySeller(req)
    if (s.status !== 'approved') throw httpError(403, 'দোকান অনুমোদনের পরে এটা করা যাবে।')
    return s
  }

  app.post('/api/seller', { preHandler: requireUser }, async (req, reply) => {
    if (d.sellerOfUser(req.user.id)) throw httpError(400, 'আপনার দোকান আগেই খোলা আছে।')
    const seller = { id: newId('s'), userId: req.user.id, ownerName: req.user.name, ...readShop(bodyOf(req), true), status: 'pending', createdAt: new Date().toISOString() }
    await store.put('sellers', seller)
    return reply.code(201).send(seller)
  })

  app.patch('/api/seller', { preHandler: requireUser }, async (req) => {
    const s = mySeller(req)
    const f = readShop(bodyOf(req), false)
    const next = { ...s, ...f }
    const pairs = [['sellers', next]]
    if (f.district) {
      for (const p of store.all('products')) if (p.sellerId === s.id) pairs.push(['products', { ...p, district: f.district }])
    }
    await store.putMany(pairs)
    return next
  })

  app.get('/api/seller/products', { preHandler: requireUser }, async (req) => {
    const s = mySeller(req)
    return store.all('products').filter((p) => p.sellerId === s.id).sort(d.newestFirst)
  })

  app.post('/api/seller/products', { preHandler: requireUser }, async (req, reply) => {
    const s = approved(req)
    const f = d.readProduct(bodyOf(req), { admin: false, create: true })
    const p = {
      story: '', ...f, id: newId('p'), sellerId: s.id, artisan: s.ownerName, district: s.district, rating: 0,
      ...d.artFor(f.category), createdAt: new Date().toISOString(),
    }
    await store.put('products', p)
    return reply.code(201).send(p)
  })

  const ownProduct = (req, s) => {
    const p = store.get('products', req.params.id)
    if (!p || p.sellerId !== s.id) throw httpError(404, 'পণ্যটি পাওয়া যায়নি।')
    return p
  }
  app.patch('/api/seller/products/:id', { preHandler: requireUser }, async (req) => {
    const s = approved(req)
    const p = ownProduct(req, s)
    const next = d.mergeProduct(p, d.readProduct(bodyOf(req), { admin: false, create: false }))
    await store.put('products', next)
    return next
  })
  app.delete('/api/seller/products/:id', { preHandler: requireUser }, async (req) => {
    const s = approved(req)
    await store.del('products', ownProduct(req, s).id)
    return { ok: true }
  })

  // শুধু এই বিক্রেতার লাইনগুলো। ক্রেতার ঠিকানা লাগে পাঠাতে, তাই থাকে।
  app.get('/api/seller/orders', { preHandler: requireUser }, async (req) => {
    const s = mySeller(req)
    return store.all('orders').filter((o) => o.items.some((i) => i.sellerId === s.id)).sort(d.newestFirst).map((o) => {
      const items = o.items.filter((i) => i.sellerId === s.id)
      return {
        id: o.id, name: o.name, phone: o.phone, district: o.district, address: o.address, items,
        total: items.reduce((t, i) => t + i.price * i.qty, 0), status: o.status, sent: o.sentBy.includes(s.id), createdAt: o.createdAt,
      }
    })
  })
  app.post('/api/seller/orders/:id/sent', { preHandler: requireUser }, async (req) => {
    const s = mySeller(req)
    const o = store.get('orders', req.params.id)
    if (!o || !o.items.some((i) => i.sellerId === s.id)) throw httpError(404, 'অর্ডারটি পাওয়া যায়নি।')
    if (o.status !== 'placed' && o.status !== 'sent') throw httpError(400, 'এই অর্ডার আর পাঠানোর নয়।')
    const next = d.settle({ ...o, sentBy: [...new Set([...o.sentBy, s.id])] })
    await store.put('orders', next)
    return { id: next.id, status: next.status, sent: true }
  })

  app.get('/api/seller/payouts', { preHandler: requireUser }, async (req) => d.money(mySeller(req).id))

  // ছবি: JPEG, PNG বা WebP, ১.৫ এমবির মধ্যে। শুধু অনুমোদিত বিক্রেতা আর অ্যাডমিন।
  app.post('/api/files', { preHandler: requireUser }, async (req, reply) => {
    if (req.user.role !== 'admin') approved(req)
    const m = DATA_URL.exec(String(bodyOf(req).dataUrl ?? ''))
    if (!m) throw httpError(400, 'ছবি JPEG, PNG বা WebP হতে হবে।')
    const bytes = Buffer.from(m[2], 'base64')
    if (bytes.length > 1.5 * 1024 * 1024) throw httpError(400, 'ছবিটা বেশি বড়। ছোট ছবি দিন।')
    const id = randomBytes(12).toString('hex')
    await store.putFile(id, m[1], bytes)
    return reply.code(201).send({ url: `/api/files/${id}` })
  })
}
