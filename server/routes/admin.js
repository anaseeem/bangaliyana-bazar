import { randomInt } from 'node:crypto'
import { httpError, bodyOf, isStr, isPhone, normPhone, newId, PHOTO_OK } from '../validate.js'
import { hashPassword } from '../auth.js'
import { readShop } from './seller.js'

const PAGES = ['amader-kotha', 'sahajjo', 'niyom']
const KINDS = ['মানুষ', 'সংস্কৃতি', 'অন্য কথা']
const POST_ART = ['moyur', 'nouka', 'pakhi', 'shapla', 'jhalor']
const SELLER_STATUS = ['pending', 'approved', 'rejected', 'paused']
const SLUG = /^[a-z0-9-]{3,80}$/
const dhaka = (iso) => new Date(Date.parse(iso) + 6 * 3600000).toISOString() // ঢাকা = UTC+৬

export default function adminRoutes(app, { store, auth, d }) {
  const pre = { preHandler: auth.requireAdmin }
  const A = '/api/admin'
  const must = (col, id, msg = 'পাওয়া যায়নি।') => {
    const x = store.get(col, id)
    if (!x) throw httpError(404, msg)
    return x
  }
  const str = (v, max, msg) => {
    if (typeof v !== 'string' || v.length > max) throw httpError(400, msg)
    return v.trim()
  }

  app.get(`${A}/summary`, pre, async () => {
    const now = dhaka(new Date().toISOString())
    const live = store.all('orders').filter((o) => o.status !== 'cancelled')
    const sum = (list) => ({ orders: list.length, sales: list.reduce((t, o) => t + o.total, 0) })
    const placed = store.all('orders').filter((o) => o.status === 'placed')
    return {
      store: store.kind,
      today: sum(live.filter((o) => dhaka(o.createdAt).slice(0, 10) === now.slice(0, 10))),
      month: sum(live.filter((o) => dhaka(o.createdAt).slice(0, 7) === now.slice(0, 7))),
      toConfirm: placed.filter((o) => !o.confirmed).length,
      toSend: placed.length,
      pendingSellers: store.all('sellers').filter((s) => s.status === 'pending').length,
      lowStock: store.all('products').filter((p) => p.stock <= 2 && !p.hidden).slice(0, 12).map((p) => ({ id: p.id, nameBn: p.nameBn, stock: p.stock })),
      unreadMessages: store.all('messages').filter((m) => !m.read).length,
      totals: { products: store.all('products').length, sellers: store.all('sellers').length, users: store.all('users').length, orders: store.all('orders').length },
    }
  })

  // ---- অর্ডার ----
  app.get(`${A}/orders`, pre, async () => store.all('orders').sort(d.newestFirst))
  app.patch(`${A}/orders/:id`, pre, async (req) => {
    const o = must('orders', req.params.id, 'অর্ডারটি পাওয়া যায়নি।')
    const b = bodyOf(req)
    let next = { ...o }
    const pairs = []
    if (b.confirmed !== undefined) next.confirmed = b.confirmed === true
    if (b.courier !== undefined) next.courier = str(b.courier, 120, 'কুরিয়ারের কথা ছোট করুন।')
    if (b.note !== undefined) next.note = str(b.note, 500, 'নোট ছোট করুন।')
    if (b.status !== undefined) {
      if (!['delivered', 'cancelled', 'placed'].includes(b.status)) throw httpError(400, 'অবস্থা ঠিক নেই।')
      if (b.status === 'cancelled') {
        if (o.status === 'delivered') throw httpError(400, 'পৌঁছে যাওয়া অর্ডার বাতিল হয় না।')
        if (o.status !== 'cancelled') pairs.push(...d.restoreOps(o))
        next.status = 'cancelled'
      } else if (b.status === 'delivered') {
        if (o.status === 'cancelled') throw httpError(400, 'বাতিল অর্ডার পৌঁছায় না।')
        next.status = 'delivered'
        next.deliveredAt = o.deliveredAt ?? new Date().toISOString()
      } else {
        if (o.status === 'cancelled') {
          // আবার চালু করলে স্টক আবার কমে
          for (const i of o.items) {
            const p = store.get('products', i.id)
            if (!p || p.stock < i.qty) throw httpError(400, p ? d.lowStockLine(p, p.stock) : 'অর্ডারের জিনিস ঠিক নেই।')
            pairs.push(['products', { ...p, stock: p.stock - i.qty }])
          }
        }
        next.status = 'placed'
        delete next.deliveredAt
      }
    }
    if (b.sent !== undefined) {
      if (!o.items.some((i) => i.sellerId === b.sent)) throw httpError(400, 'এই বিক্রেতার জিনিস অর্ডারে নেই।')
      next.sentBy = [...new Set([...next.sentBy, b.sent])]
    }
    next = d.settle(next)
    await store.putMany([['orders', next], ...pairs])
    return next
  })

  // ---- পণ্য ----
  app.get(`${A}/products`, pre, async () => store.all('products').sort(d.newestFirst))
  app.post(`${A}/products`, pre, async (req, reply) => {
    const f = d.readProduct(bodyOf(req), { admin: true, create: true })
    const s = store.get('sellers', f.sellerId)
    const p = d.mergeProduct({
      story: '', rating: 0, ...d.artFor(f.category), artisan: s.ownerName, district: s.district, id: newId('p'), sellerId: f.sellerId, createdAt: new Date().toISOString(),
    }, f)
    await store.put('products', p)
    return reply.code(201).send(p)
  })
  app.patch(`${A}/products/:id`, pre, async (req) => {
    const p = must('products', req.params.id, 'পণ্যটি পাওয়া যায়নি।')
    const next = d.mergeProduct(p, d.readProduct(bodyOf(req), { admin: true, create: false }))
    await store.put('products', next)
    return next
  })
  app.delete(`${A}/products/:id`, pre, async (req) => {
    await store.del('products', must('products', req.params.id, 'পণ্যটি পাওয়া যায়নি।').id)
    return { ok: true }
  })

  // ---- বিক্রেতা ----
  app.get(`${A}/sellers`, pre, async () => store.all('sellers').sort(d.newestFirst))
  app.post(`${A}/sellers`, pre, async (req, reply) => {
    const b = bodyOf(req)
    const f = readShop(b, true)
    const seller = { id: newId('s'), userId: null, ownerName: isStr(b.ownerName, 2, 80) ? b.ownerName.trim() : f.shopName, ...f, status: 'approved', createdAt: new Date().toISOString() }
    if (b.years !== undefined) seller.years = readYears(b.years)
    await store.put('sellers', seller)
    return reply.code(201).send(seller)
  })
  const readYears = (v) => {
    if (!Number.isInteger(v) || v < 0 || v > 100) throw httpError(400, 'বছরের সংখ্যা ঠিক নেই।')
    return v
  }
  app.patch(`${A}/sellers/:id`, pre, async (req) => {
    const s = must('sellers', req.params.id, 'বিক্রেতা পাওয়া যায়নি।')
    const b = bodyOf(req)
    const next = { ...s, ...readShop(b, false) }
    if (b.status !== undefined) {
      if (!SELLER_STATUS.includes(b.status)) throw httpError(400, 'অবস্থা ঠিক নেই।')
      next.status = b.status
    }
    if (b.ownerName !== undefined) {
      if (!isStr(b.ownerName, 2, 80)) throw httpError(400, 'মালিকের নাম লিখুন।')
      next.ownerName = b.ownerName.trim()
    }
    if (b.years !== undefined) next.years = readYears(b.years)
    const pairs = [['sellers', next]]
    // দোকানের জেলা আর মালিকের নাম পণ্যেও বদলায়
    if (next.district !== s.district || next.ownerName !== s.ownerName) {
      for (const p of store.all('products')) if (p.sellerId === s.id) pairs.push(['products', { ...p, district: next.district, artisan: next.ownerName }])
    }
    await store.putMany(pairs)
    return next
  })

  // ---- ক্রেতা ----
  app.get(`${A}/users`, pre, async () => {
    const counts = new Map()
    for (const o of store.all('orders')) if (o.userId) counts.set(o.userId, (counts.get(o.userId) ?? 0) + 1)
    return store.all('users').sort(d.newestFirst).map((u) => ({ ...d.safeUser(u), orderCount: counts.get(u.id) ?? 0 }))
  })
  app.patch(`${A}/users/:id`, pre, async (req) => {
    const u = must('users', req.params.id, 'ক্রেতা পাওয়া যায়নি।')
    const b = bodyOf(req)
    if (u.id === req.user.id) throw httpError(400, 'নিজের অ্যাকাউন্ট এখানে বদলানো যায় না।')
    const next = { ...u }
    if (b.blocked !== undefined) next.blocked = b.blocked === true
    if (b.role !== undefined) {
      if (!['customer', 'admin'].includes(b.role)) throw httpError(400, 'ভূমিকা ঠিক নেই।')
      next.role = b.role
    }
    await store.put('users', next)
    return d.safeUser(next)
  })
  app.post(`${A}/users/:id/reset-password`, pre, async (req) => {
    const u = must('users', req.params.id, 'ক্রেতা পাওয়া যায়নি।')
    const password = String(randomInt(100000, 1000000))
    await store.put('users', { ...u, passHash: await hashPassword(password) })
    return { password }
  })

  // ---- গল্প ----
  const readPost = (b, cur) => {
    const f = {}
    const has = (k) => b[k] !== undefined
    if (has('title')) { if (!isStr(b.title, 3, 150)) throw httpError(400, 'শিরোনাম লিখুন।'); f.title = b.title.trim() }
    if (has('slug')) {
      if (typeof b.slug !== 'string' || !SLUG.test(b.slug)) throw httpError(400, 'লিংকের নাম ইংরেজি ছোট হাতের অক্ষর, সংখ্যা আর দাগ দিয়ে তিন থেকে আশি অক্ষরের হবে।')
      if (store.all('posts').some((p) => p.slug === b.slug && p.id !== cur?.id)) throw httpError(400, 'এই লিংকের নাম আগেই আছে।')
      f.slug = b.slug
    }
    if (has('excerpt')) f.excerpt = str(b.excerpt, 400, 'ছোট বিবরণ চারশো অক্ষরের মধ্যে লিখুন।')
    if (has('body')) f.body = str(b.body, 40000, 'লেখা অনেক বড়।')
    if (has('cover')) {
      if (!PHOTO_OK(b.cover)) throw httpError(400, 'ছবিটা ঠিক নেই।')
      f.cover = b.cover
    }
    if (has('kind')) { if (!KINDS.includes(b.kind)) throw httpError(400, 'ধরন ঠিক নেই।'); f.kind = b.kind }
    if (has('lang')) { if (!['bn', 'en'].includes(b.lang)) throw httpError(400, 'ভাষা ঠিক নেই।'); f.lang = b.lang }
    if (has('art')) { if (!POST_ART.includes(b.art)) throw httpError(400, 'নকশা ঠিক নেই।'); f.art = b.art }
    if (has('status')) { if (!['draft', 'published'].includes(b.status)) throw httpError(400, 'অবস্থা ঠিক নেই।'); f.status = b.status }
    return f
  }
  const stamp = (p) => (p.status === 'published' && !p.publishedAt ? { ...p, publishedAt: p.updatedAt } : p)
  app.get(`${A}/posts`, pre, async () => store.all('posts').sort(d.newestFirst))
  app.post(`${A}/posts`, pre, async (req, reply) => {
    const b = bodyOf(req)
    const f = readPost({ ...b, slug: b.slug ?? `golpo-${Date.now().toString(36)}` })
    if (!f.title) throw httpError(400, 'শিরোনাম লিখুন।')
    const now = new Date().toISOString()
    const p = stamp({ excerpt: '', body: '', kind: 'অন্য কথা', lang: 'bn', art: 'moyur', status: 'draft', ...f, id: newId('g'), createdAt: now, updatedAt: now })
    await store.put('posts', p)
    return reply.code(201).send(p)
  })
  app.patch(`${A}/posts/:id`, pre, async (req) => {
    const p = must('posts', req.params.id, 'গল্পটি পাওয়া যায়নি।')
    const next = stamp({ ...p, ...readPost(bodyOf(req), p), updatedAt: new Date().toISOString() })
    await store.put('posts', next)
    return next
  })
  app.delete(`${A}/posts/:id`, pre, async (req) => {
    await store.del('posts', must('posts', req.params.id, 'গল্পটি পাওয়া যায়নি।').id)
    return { ok: true }
  })

  // ---- পাতা ----
  app.put(`${A}/pages/:id`, pre, async (req) => {
    const id = req.params.id
    if (!PAGES.includes(id)) throw httpError(404, 'পাতাটি পাওয়া যায়নি।')
    const b = bodyOf(req)
    if (!isStr(b.title, 1, 100)) throw httpError(400, 'শিরোনাম লিখুন।')
    const page = { id, title: b.title.trim(), body: str(b.body, 40000, 'লেখা অনেক বড়।'), updatedAt: new Date().toISOString() }
    await store.put('pages', page)
    return page
  })

  // ---- বার্তা ----
  app.get(`${A}/messages`, pre, async () => store.all('messages').sort(d.newestFirst))
  app.patch(`${A}/messages/:id`, pre, async (req) => {
    const m = must('messages', req.params.id, 'বার্তাটি পাওয়া যায়নি।')
    const next = { ...m, read: bodyOf(req).read === true }
    await store.put('messages', next)
    return next
  })
  app.delete(`${A}/messages/:id`, pre, async (req) => {
    await store.del('messages', must('messages', req.params.id, 'বার্তাটি পাওয়া যায়নি।').id)
    return { ok: true }
  })

  // ---- মতামত ----
  app.get(`${A}/reviews`, pre, async () => store.all('reviews').sort(d.newestFirst).map((r) => ({ ...r, productName: store.get('products', r.productId)?.nameBn ?? '' })))
  app.patch(`${A}/reviews/:id`, pre, async (req) => {
    const r = must('reviews', req.params.id, 'মতামতটি পাওয়া যায়নি।')
    const next = { ...r, hidden: bodyOf(req).hidden === true }
    await store.put('reviews', next)
    return next
  })

  // ---- টাকা ----
  app.get(`${A}/payouts`, pre, async () => store.all('sellers').filter((s) => s.status === 'approved').flatMap((s) => {
    const { earned, commission, paid, due } = d.money(s.id)
    return earned > 0 || paid > 0 ? [{ seller: { id: s.id, shopName: s.shopName, ownerName: s.ownerName, phone: s.phone }, earned, commission, paid, due }] : []
  }))
  app.post(`${A}/payouts`, pre, async (req, reply) => {
    const b = bodyOf(req)
    must('sellers', b.sellerId, 'বিক্রেতা পাওয়া যায়নি।')
    if (!Number.isInteger(b.amount) || b.amount <= 0) throw httpError(400, 'টাকার অঙ্ক ঠিক নেই।')
    const payout = { id: newId('t'), sellerId: b.sellerId, amount: b.amount, note: b.note === undefined ? '' : str(b.note, 200, 'নোট ছোট করুন।'), createdAt: new Date().toISOString() }
    await store.put('payouts', payout)
    return reply.code(201).send(payout)
  })

  // ---- সাজানো ----
  app.get(`${A}/settings`, pre, async () => d.settings())
  app.put(`${A}/settings`, pre, async (req) => {
    const b = bodyOf(req)
    const cur = d.settings()
    const next = { ...cur }
    const text = (k, max) => { if (b[k] !== undefined) next[k] = str(b[k], max, 'লেখা বেশি বড়।') }
    for (const [k, max] of [['announcement', 200], ['heroBadge', 100], ['heroTitle', 200], ['heroText', 500], ['daysDhaka', 60], ['daysOutside', 60], ['footerLine', 200], ['heroProductId', 100], ['featuredSellerId', 100]]) text(k, max)
    for (const k of ['feeDhaka', 'feeOutside']) {
      if (b[k] !== undefined) {
        if (!Number.isInteger(b[k]) || b[k] < 0 || b[k] > 5000) throw httpError(400, 'ডেলিভারির টাকা ঠিক নেই।')
        next[k] = b[k]
      }
    }
    if (b.commissionPercent !== undefined) {
      if (!Number.isInteger(b.commissionPercent) || b.commissionPercent < 0 || b.commissionPercent > 100) throw httpError(400, 'কমিশন শূন্য থেকে একশোর মধ্যে হবে।')
      next.commissionPercent = b.commissionPercent
    }
    if (b.whatsapp !== undefined) {
      const w = normPhone(b.whatsapp)
      if (!isPhone(w)) throw httpError(400, 'WhatsApp নম্বর ঠিক নেই।')
      next.whatsapp = w
    }
    for (const [k, min, max, len] of [['categories', 1, 30, 40], ['newIds', 0, 30, 100], ['roomIds', 0, 30, 100]]) {
      if (b[k] !== undefined) {
        if (!Array.isArray(b[k]) || b[k].length < min || b[k].length > max || !b[k].every((x) => isStr(x, 1, len))) throw httpError(400, 'তালিকাটা ঠিক নেই।')
        next[k] = b[k].map((x) => x.trim())
      }
    }
    await store.put('settings', next)
    return next
  })
}
