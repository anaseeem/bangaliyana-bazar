import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from './helper.js'

const t = await start()
const { call, signup, admin, order } = t
after(() => t.app.close())
const stockOf = async (id) => (await call('GET', `/api/products/${id}`)).json.stock

test('health', async () => {
  const r = await call('GET', '/api/health')
  assert.equal(r.status, 200)
  assert.equal(r.json.store, 'file')
})

test('boot has products with sellerId and 9 sellers', async () => {
  const { json } = await call('GET', '/api/boot')
  assert.ok(json.products.length >= 30)
  assert.ok(json.products.every((p) => p.sellerId && 'ratingCount' in p))
  assert.equal(json.sellers.length, 9)
  assert.equal(json.me, null)
  assert.equal(json.settings.feeDhaka, 60)
})

test('signup, me, logout, login, wrong password, duplicate phone', async () => {
  const u = await signup('করিম মিয়া')
  assert.equal((await call('GET', '/api/me', { as: u.as })).json.user.name, 'করিম মিয়া')
  assert.equal((await call('GET', '/api/me')).status, 401)
  assert.equal(JSON.stringify((await call('GET', '/api/me', { as: u.as })).json).includes('passHash'), false)
  const out = await call('POST', '/api/auth/logout', { as: u.as })
  assert.equal(out.status, 200)
  assert.match(String(out.res.headers['set-cookie']), /Max-Age=0/)
  assert.equal((await call('POST', '/api/auth/login', { body: { phone: u.phone, password: 'secret1' } })).status, 200)
  assert.equal((await call('POST', '/api/auth/login', { body: { phone: u.phone, password: 'nope' } })).status, 401)
  const dup = await call('POST', '/api/auth/signup', { body: { name: 'আরেকজন', phone: u.phone, password: 'secret1' } })
  assert.equal(dup.status, 400)
  assert.match(dup.json.error, /আগেই অ্যাকাউন্ট/)
  const bad = await call('POST', '/api/auth/signup', { body: { name: 'আর', phone: '123', password: '1' } })
  assert.equal(bad.status, 400)
})

test('non-json write is rejected', async () => {
  const r = await t.app.inject({ method: 'POST', url: '/api/messages', headers: { 'content-type': 'text/plain' }, payload: 'x' })
  assert.equal(r.statusCode, 400)
})

test('order reduces stock, over-stock refused, cancel restores', async () => {
  const u = await signup()
  const before = await stockOf('jamdani-shari')
  const r = await order(u.as, [{ id: 'jamdani-shari', qty: 1 }])
  assert.equal(r.status, 201)
  assert.match(r.json.id, /^BB\d{6}$/)
  assert.equal(r.json.total, 8500 + 60)
  assert.equal(await stockOf('jamdani-shari'), before - 1)
  const over = await order(null, [{ id: 'jamdani-shari', qty: before + 5 }])
  assert.equal(over.status, 400)
  assert.match(over.json.error, /আর .*টি আছে/)
  const out = await order(null, [{ id: 'jamdani-shari', qty: 1 }], { district: 'সিলেট' })
  assert.equal(out.json.total, 8500 + 120)
  const c = await call('POST', `/api/orders/${r.json.id}/cancel`, { as: u.as })
  assert.equal(c.json.status, 'cancelled')
  assert.equal(await stockOf('jamdani-shari'), before - 1) // একটা ফেরত, আরেকটা সিলেটের অর্ডারে গেছে
  assert.equal((await call('POST', `/api/orders/${r.json.id}/cancel`, { as: u.as })).status, 400)
  const mine = await call('GET', '/api/me/orders', { as: u.as })
  assert.equal(mine.json.length, 1)
})

test('track needs matching phone', async () => {
  const r = await order(null, [{ id: 'kather-ghora', qty: 1 }])
  const ok = await call('GET', `/api/orders/track?id=${r.json.id}&phone=০১৭১২৩৪৫৬৭৮`)
  assert.equal(ok.status, 200)
  assert.equal('note' in ok.json, false)
  assert.equal((await call('GET', `/api/orders/track?id=${r.json.id}&phone=01799999999`)).status, 404)
  assert.equal((await call('GET', `/api/orders/${r.json.id}`)).status, 404)
})

test('seller flow: register, approve, product, sent, received, review, payouts', async () => {
  const adm = await admin()
  const s = await signup('শিউলি আক্তার')
  const reg = await call('POST', '/api/seller', { as: s.as, body: { shopName: 'শিউলির দোকান', craft: 'নকশি কাঁথা', district: 'বগুড়া', story: 'আমি নিজের হাতে কাঁথা সেলাই করি বহু বছর ধরে।', phone: '01811111111' } })
  assert.equal(reg.status, 201)
  assert.equal(reg.json.status, 'pending')
  const newP = { nameBn: 'শিউলির কাঁথা', price: 1500, stock: 5, description: 'হাতে সেলাই করা কাঁথা।', category: 'কাঁথা' }
  assert.equal((await call('POST', '/api/seller/products', { as: s.as, body: newP })).status, 403)
  assert.equal((await call('PATCH', `/api/admin/sellers/${reg.json.id}`, { as: adm, body: { status: 'approved' } })).status, 200)
  const made = await call('POST', '/api/seller/products', { as: s.as, body: newP })
  assert.equal(made.status, 201)
  assert.equal(made.json.sellerId, reg.json.id)
  assert.equal(made.json.district, 'বগুড়া')
  assert.equal((await call('POST', '/api/seller/products', { as: s.as, body: { ...newP, price: 10 } })).status, 400)
  assert.ok((await call('GET', '/api/boot')).json.products.some((p) => p.id === made.json.id))

  // দুই বিক্রেতার জিনিস এক অর্ডারে
  const buyer = await signup('ক্রেতা')
  const o = await order(buyer.as, [{ id: made.json.id, qty: 2 }, { id: 'kather-ghora', qty: 1 }])
  assert.equal(o.status, 201)
  const mineOrders = await call('GET', '/api/seller/orders', { as: s.as })
  assert.equal(mineOrders.json.length, 1)
  assert.deepEqual(mineOrders.json[0].items.map((i) => i.id), [made.json.id])
  assert.equal((await call('POST', `/api/orders/${o.json.id}/received`, { as: buyer.as })).status, 400)
  await call('POST', `/api/seller/orders/${o.json.id}/sent`, { as: s.as })
  assert.equal((await call('GET', `/api/me/orders`, { as: buyer.as })).json[0].status, 'placed') // কাঁথার ঘোড়া এখনও যায়নি
  const k = (await call('GET', '/api/admin/orders', { as: adm })).json.find((x) => x.id === o.json.id).items.find((i) => i.id === 'kather-ghora').sellerId
  await call('PATCH', `/api/admin/orders/${o.json.id}`, { as: adm, body: { sent: k } })
  assert.equal((await call('GET', `/api/me/orders`, { as: buyer.as })).json[0].status, 'sent')

  // হাতে পাওয়ার আগে মতামত নয়, পরে হ্যাঁ, না কেনা লোকের না
  const review = { stars: 5, text: 'খুব সুন্দর' }
  assert.equal((await call('POST', `/api/products/${made.json.id}/reviews`, { as: buyer.as, body: review })).status, 403)
  assert.equal((await call('POST', `/api/orders/${o.json.id}/received`, { as: buyer.as })).json.status, 'delivered')
  assert.equal((await call('POST', `/api/products/${made.json.id}/reviews`, { as: buyer.as, body: review })).status, 201)
  assert.equal((await call('POST', `/api/products/${made.json.id}/reviews`, { as: buyer.as, body: review })).status, 400)
  const stranger = await signup('অন্য কেউ')
  assert.equal((await call('POST', `/api/products/${made.json.id}/reviews`, { as: stranger.as, body: review })).status, 403)
  const shown = (await call('GET', '/api/boot')).json.products.find((p) => p.id === made.json.id)
  assert.equal(shown.rating, 5)
  assert.equal(shown.ratingCount, 1)

  // পাওনা: ৩০০০ টাকা, কমিশন ১০%, ৫০০ দেওয়া হয়েছে
  assert.equal((await call('PUT', '/api/admin/settings', { as: adm, body: { commissionPercent: 10 } })).status, 200)
  assert.equal((await call('POST', '/api/admin/payouts', { as: adm, body: { sellerId: reg.json.id, amount: 500, note: 'বিকাশে' } })).status, 201)
  const mine = (await call('GET', '/api/seller/payouts', { as: s.as })).json
  assert.deepEqual([mine.earned, mine.commission, mine.paid, mine.due], [3000, 300, 500, 2200])
  const row = (await call('GET', '/api/admin/payouts', { as: adm })).json.find((x) => x.seller.id === reg.json.id)
  assert.deepEqual([row.earned, row.commission, row.paid, row.due], [3000, 300, 500, 2200])
  await call('PUT', '/api/admin/settings', { as: adm, body: { commissionPercent: 0 } })
})
