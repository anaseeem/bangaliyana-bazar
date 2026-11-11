import { httpError, bodyOf, isStr, isPhone, normPhone, newId } from '../validate.js'

const PAGES = ['amader-kotha', 'sahajjo', 'niyom']
const SITE = () => (process.env.SITE_URL ?? 'https://bangaliyana-bazar.vercel.app').replace(/\/$/, '')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

export default function publicRoutes(app, { store, auth, d }) {
  app.get('/api/health', async () => ({ ok: true, service: 'bangaliyana-bazar-api', store: store.kind }))

  app.get('/api/boot', async (req) => ({
    settings: d.settings(),
    products: d.publicProducts(),
    sellers: store.all('sellers').filter((s) => s.status === 'approved').map(d.publicSeller),
    me: d.me(auth.userFrom(req)),
  }))

  app.get('/api/products', async () => d.publicProducts())
  app.get('/api/products/:id', async (req) => {
    const p = d.publicProducts().find((x) => x.id === req.params.id)
    if (!p) throw httpError(404, 'পণ্যটি পাওয়া যায়নি।')
    return p
  })
  app.get('/api/products/:id/reviews', async (req) =>
    store.all('reviews').filter((r) => r.productId === req.params.id && !r.hidden).sort(d.newestFirst))

  app.get('/api/posts', async () =>
    store.all('posts').filter((p) => p.status === 'published')
      .sort((a, b) => ((a.publishedAt ?? a.createdAt) < (b.publishedAt ?? b.createdAt) ? 1 : -1))
      .map(({ body: _b, ...p }) => p))
  app.get('/api/posts/:slug', async (req) => {
    const p = store.all('posts').find((x) => x.slug === req.params.slug && x.status === 'published')
    if (!p) throw httpError(404, 'গল্পটি পাওয়া যায়নি।')
    return p
  })
  app.get('/api/pages/:id', async (req) => {
    const p = store.get('pages', req.params.id)
    if (!p || !PAGES.includes(p.id)) throw httpError(404, 'পাতাটি পাওয়া যায়নি।')
    return { id: p.id, title: p.title, body: p.body, updatedAt: p.updatedAt }
  })

  // বার্তা: এক আইপি থেকে ঘণ্টায় ৫টি
  const sent = new Map()
  app.post('/api/messages', async (req, reply) => {
    const b = bodyOf(req)
    const phone = normPhone(b.phone)
    if (!isStr(b.name, 2, 80)) throw httpError(400, 'নাম লিখুন।')
    if (!isPhone(phone)) throw httpError(400, 'সঠিক মোবাইল নম্বর দিন।')
    if (!isStr(b.text, 5, 1000)) throw httpError(400, 'বার্তা পাঁচ অক্ষরের বেশি আর এক হাজারের কম হবে।')
    const recent = (sent.get(req.ip) ?? []).filter((t) => t > Date.now() - 3600000)
    if (recent.length >= 5) throw httpError(429, 'অনেকগুলো বার্তা হয়েছে। একটু পরে আবার পাঠান।')
    sent.set(req.ip, [...recent, Date.now()])
    await store.put('messages', { id: newId('m'), name: b.name.trim(), phone, text: b.text.trim(), read: false, createdAt: new Date().toISOString() })
    return reply.code(201).send({ ok: true })
  })

  // নম্বর আর ফোন দুটোই মিলতে হবে
  app.get('/api/orders/track', async (req) => {
    const { id, phone } = req.query ?? {}
    const o = typeof id === 'string' && store.get('orders', id.trim().toUpperCase())
    if (!o || o.phone !== normPhone(phone)) throw httpError(404, 'অর্ডারটি পাওয়া যায়নি। নম্বর দুটো আবার দেখুন।')
    const { userId: _u, ...rest } = d.buyerOrder(o)
    return rest
  })

  app.get('/api/files/:id', async (req, reply) => {
    const f = /^[a-f0-9]{24}$/.test(req.params.id) ? await store.getFile(req.params.id) : null
    if (!f) throw httpError(404, 'ছবিটা পাওয়া যায়নি।')
    return reply.header('Cache-Control', 'public, max-age=31536000, immutable').header('X-Content-Type-Options', 'nosniff').type(f.mime).send(f.bytes)
  })

  app.get('/api/sitemap.xml', async (_req, reply) => {
    const base = SITE()
    const paths = ['/', '/shop', '/artisans', '/golpo', '/amader-kotha', '/sahajjo', '/niyom', '/jogajog',
      ...d.publicProducts().map((p) => `/product/${p.id}`),
      ...store.all('sellers').filter((s) => s.status === 'approved').map((s) => `/dokan/${s.id}`),
      ...store.all('posts').filter((p) => p.status === 'published').map((p) => `/golpo/${p.slug}`)]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `<url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`
    return reply.type('application/xml').send(xml)
  })
}
