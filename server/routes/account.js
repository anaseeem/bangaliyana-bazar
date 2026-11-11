import { httpError, bodyOf, isStr, isPhone, normPhone, newId } from '../validate.js'
import { hashPassword, checkPassword } from '../auth.js'

export default function accountRoutes(app, { store, auth, d }) {
  const { requireUser, limiter } = auth

  app.post('/api/auth/signup', async (req, reply) => {
    const b = bodyOf(req)
    const phone = normPhone(b.phone)
    if (!isStr(b.name, 3, 80)) throw httpError(400, 'নাম লিখুন।')
    if (!isPhone(phone)) throw httpError(400, 'সঠিক মোবাইল নম্বর দিন।')
    if (typeof b.password !== 'string' || b.password.length < 6 || b.password.length > 200) throw httpError(400, 'পাসওয়ার্ড অন্তত ছয় অক্ষরের হবে।')
    if (store.all('users').some((u) => u.phone === phone)) throw httpError(400, 'এই নম্বরে আগেই অ্যাকাউন্ট আছে। ঢুকুন।')
    const user = { id: newId('u'), name: b.name.trim(), phone, passHash: await hashPassword(b.password), role: 'customer', createdAt: new Date().toISOString() }
    await store.put('users', user)
    auth.setCookie(reply, user.id)
    return reply.code(201).send(d.me(user))
  })

  app.post('/api/auth/login', async (req, reply) => {
    const b = bodyOf(req)
    const phone = normPhone(b.phone)
    if (limiter.blocked(phone)) throw httpError(429, 'অনেকবার ভুল হয়েছে। একটু পরে আবার চেষ্টা করুন।')
    const user = store.all('users').find((u) => u.phone === phone)
    const ok = user && typeof b.password === 'string' && b.password.length <= 200 && (await checkPassword(b.password, user.passHash))
    if (!ok) {
      limiter.fail(phone)
      throw httpError(401, 'নম্বর বা পাসওয়ার্ড মিলছে না।')
    }
    if (user.blocked) throw httpError(403, 'এই অ্যাকাউন্ট বন্ধ আছে। দোকানে যোগাযোগ করুন।')
    limiter.reset(phone)
    auth.setCookie(reply, user.id)
    return d.me(user)
  })

  app.post('/api/auth/logout', async (_req, reply) => {
    auth.clearCookie(reply)
    return { ok: true }
  })

  app.get('/api/me', { preHandler: requireUser }, async (req) => d.me(req.user))

  app.patch('/api/me', { preHandler: requireUser }, async (req) => {
    const b = bodyOf(req)
    const next = { ...req.user }
    if (b.name !== undefined) {
      if (!isStr(b.name, 3, 80)) throw httpError(400, 'নাম লিখুন।')
      next.name = b.name.trim()
    }
    if (b.district !== undefined) {
      if (!isStr(b.district, 0, 60)) throw httpError(400, 'জেলা ঠিক নেই।')
      next.district = b.district.trim()
    }
    if (b.address !== undefined) {
      if (!isStr(b.address, 0, 300)) throw httpError(400, 'ঠিকানা ঠিক নেই।')
      next.address = b.address.trim()
    }
    await store.put('users', next)
    return d.me(next)
  })

  // বডি: { current, password }
  app.post('/api/me/password', { preHandler: requireUser }, async (req) => {
    const b = bodyOf(req)
    if (typeof b.current !== 'string' || !(await checkPassword(b.current, req.user.passHash))) throw httpError(400, 'এখনকার পাসওয়ার্ড মিলছে না।')
    if (typeof b.password !== 'string' || b.password.length < 6 || b.password.length > 200) throw httpError(400, 'পাসওয়ার্ড অন্তত ছয় অক্ষরের হবে।')
    await store.put('users', { ...req.user, passHash: await hashPassword(b.password) })
    return { ok: true }
  })

  app.get('/api/me/orders', { preHandler: requireUser }, async (req) =>
    store.all('orders').filter((o) => o.userId === req.user.id).sort(d.newestFirst).map(d.buyerOrder))

  // পণ্য হাতে পেয়েছেন, তাঁরাই মতামত দিতে পারেন। একজন একবারই।
  app.post('/api/products/:id/reviews', { preHandler: requireUser }, async (req, reply) => {
    const b = bodyOf(req)
    const pid = req.params.id
    if (!store.get('products', pid)) throw httpError(404, 'পণ্যটি পাওয়া যায়নি।')
    if (!Number.isInteger(b.stars) || b.stars < 1 || b.stars > 5) throw httpError(400, 'এক থেকে পাঁচ তারা দিন।')
    const text = b.text === undefined ? '' : b.text
    if (typeof text !== 'string' || text.trim().length > 400) throw httpError(400, 'মতামত চারশো অক্ষরের মধ্যে লিখুন।')
    const bought = store.all('orders').some((o) => o.userId === req.user.id && o.status === 'delivered' && o.items.some((i) => i.id === pid))
    if (!bought) throw httpError(403, 'পণ্যটা হাতে পাওয়ার পরে মতামত দেওয়া যায়।')
    if (store.all('reviews').some((r) => r.productId === pid && r.userId === req.user.id)) throw httpError(400, 'আপনি আগেই মতামত দিয়েছেন।')
    const review = { id: newId('r'), productId: pid, userId: req.user.id, name: req.user.name, stars: b.stars, text: text.trim(), createdAt: new Date().toISOString() }
    await store.put('reviews', review)
    return reply.code(201).send(review)
  })
}
