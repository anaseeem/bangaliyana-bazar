import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from './helper.js'

const t = await start()
const { call, signup, admin, order } = t
after(() => t.app.close())

test('admin routes: 401 anonymous, 403 customer, 200 admin', async () => {
  const c = await signup()
  const adm = await admin()
  assert.equal((await call('GET', '/api/admin/summary')).status, 401)
  assert.equal((await call('GET', '/api/admin/orders', { as: c.as })).status, 403)
  assert.equal((await call('GET', '/api/admin/users', { as: c.as })).status, 403)
  const sum = await call('GET', '/api/admin/summary', { as: adm })
  assert.equal(sum.status, 200)
  assert.equal(sum.json.store, 'file')
  assert.equal(sum.json.totals.sellers, 9)
  assert.equal((await call('GET', '/api/nothing')).json.error, 'পাওয়া যায়নি।')
})

test('settings PUT changes the fee used by the next order', async () => {
  const adm = await admin()
  assert.equal((await call('PUT', '/api/admin/settings', { as: adm, body: { feeDhaka: 90 } })).status, 200)
  assert.equal((await order(null, [{ id: 'kather-ghora', qty: 1 }])).json.total, 90 + (await call('GET', '/api/products/kather-ghora')).json.price)
  assert.equal((await call('PUT', '/api/admin/settings', { as: adm, body: { feeDhaka: -5 } })).status, 400)
})

test('admin cancel restores stock once; users and reset password', async () => {
  const adm = await admin()
  const u = await signup()
  const s0 = (await call('GET', '/api/products/hans-nouka')).json.stock
  const o = await order(u.as, [{ id: 'hans-nouka', qty: 1 }])
  for (let i = 0; i < 2; i++) await call('PATCH', `/api/admin/orders/${o.json.id}`, { as: adm, body: { status: 'cancelled' } })
  assert.equal((await call('GET', '/api/products/hans-nouka')).json.stock, s0)
  const users = (await call('GET', '/api/admin/users', { as: adm })).json
  const me = users.find((x) => x.id === u.user.id)
  assert.equal(me.orderCount, 1)
  assert.equal('passHash' in me, false)
  const pw = (await call('POST', `/api/admin/users/${u.user.id}/reset-password`, { as: adm })).json.password
  assert.match(pw, /^\d{6}$/)
  assert.equal((await call('POST', '/api/auth/login', { body: { phone: u.phone, password: pw } })).status, 200)
  await call('PATCH', `/api/admin/users/${u.user.id}`, { as: adm, body: { blocked: true } })
  assert.equal((await call('GET', '/api/me', { as: u.as })).status, 401)
  assert.equal((await call('POST', '/api/auth/login', { body: { phone: u.phone, password: pw } })).status, 403)
  const self = users.find((x) => x.role === 'admin')
  assert.equal((await call('PATCH', `/api/admin/users/${self.id}`, { as: adm, body: { blocked: true } })).status, 400)
})

test('posts: draft hidden from the public, published shows, slug unique', async () => {
  const adm = await admin()
  const made = await call('POST', '/api/admin/posts', { as: adm, body: { title: 'একটি গল্প', body: 'গল্প শুরু।', slug: 'ekti-golpo' } })
  assert.equal(made.status, 201)
  assert.equal(made.json.status, 'draft')
  assert.equal((await call('GET', '/api/posts')).json.length, 0)
  assert.equal((await call('GET', '/api/posts/ekti-golpo')).status, 404)
  assert.equal((await call('POST', '/api/admin/posts', { as: adm, body: { title: 'আরেকটি', slug: 'ekti-golpo' } })).status, 400)
  const pub = await call('PATCH', `/api/admin/posts/${made.json.id}`, { as: adm, body: { status: 'published' } })
  assert.ok(pub.json.publishedAt)
  const list = (await call('GET', '/api/posts')).json
  assert.equal(list.length, 1)
  assert.equal('body' in list[0], false)
  assert.equal((await call('GET', '/api/posts/ekti-golpo')).json.body, 'গল্প শুরু।')
  const xml = (await call('GET', '/api/sitemap.xml')).res.body
  assert.match(xml, /\/golpo\/ekti-golpo/)
})

test('messages and pages', async () => {
  const adm = await admin()
  const ok = await call('POST', '/api/messages', { body: { name: 'রিনা', phone: '01911111111', text: 'একটা প্রশ্ন আছে।' } })
  assert.equal(ok.status, 201)
  assert.equal((await call('GET', '/api/admin/messages', { as: adm })).json.length, 1)
  assert.equal((await call('GET', '/api/pages/niyom')).status, 404)
  await call('PUT', '/api/admin/pages/niyom', { as: adm, body: { title: 'নিয়ম', body: 'নিয়মগুলো।' } })
  assert.equal((await call('GET', '/api/pages/niyom')).json.title, 'নিয়ম')
  assert.equal((await call('PUT', '/api/admin/pages/other', { as: adm, body: { title: 'ক', body: 'খ' } })).status, 404)
})

test('file upload round trip', async () => {
  const adm = await admin()
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
  const up = await call('POST', '/api/files', { as: adm, body: { dataUrl: `data:image/png;base64,${png.toString('base64')}` } })
  assert.equal(up.status, 201)
  assert.match(up.json.url, /^\/api\/files\/[a-f0-9]{24}$/)
  const got = await t.app.inject({ method: 'GET', url: up.json.url })
  assert.equal(got.headers['content-type'], 'image/png')
  assert.match(got.headers['cache-control'], /immutable/)
  assert.deepEqual(got.rawPayload, png)
  assert.equal((await call('POST', '/api/files', { body: { dataUrl: 'x' } })).status, 401)
  assert.equal((await call('POST', '/api/files', { as: adm, body: { dataUrl: 'data:image/gif;base64,AAAA' } })).status, 400)
})
