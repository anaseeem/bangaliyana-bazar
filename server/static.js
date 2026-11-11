import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

/**
 * নিজের সার্ভারে (VPS) চালালে এই ফাইল বানানো দোকানটাও (dist) দেয়, আলাদা ওয়েব সার্ভার লাগে না।
 * পণ্য, গল্প আর দোকানের পাতায় শিরোনাম, বিবরণ আর ছবির ট্যাগ বসিয়ে দেয়,
 * যাতে গুগল আর ফেসবুক-হোয়াটসঅ্যাপের লিংকে ঠিক জিনিস দেখায়।
 */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
}
const SITE = 'বাঙালিয়ানা বাজার'
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const short = (s, n = 160) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t }

/** পাতার ঠিকানা দেখে শিরোনাম, বিবরণ, ছবি। না পেলে found: false, তখন ৪০৪ যায়। */
export function pageMeta(path, { store, d }, siteUrl) {
  const abs = (u) => (u && u.startsWith('/') ? `${siteUrl}${u}` : u)
  const [, kind, id] = path.split('/')
  const key = decodeURIComponent(id ?? '')
  if (kind === 'product' && id) {
    const p = store.get('products', key)
    if (!p || !d.isPublic(p)) return { found: false }
    const view = d.withRating()(p)
    return {
      found: true, title: `${p.nameBn} | ${SITE}`, description: short(p.description), image: abs(p.photo), type: 'product',
      ld: {
        '@context': 'https://schema.org', '@type': 'Product', name: p.nameBn, description: p.description, image: abs(p.photo), category: p.category,
        brand: { '@type': 'Brand', name: p.artisan },
        offers: { '@type': 'Offer', priceCurrency: 'BDT', price: p.price, availability: `https://schema.org/${p.stock > 0 ? 'InStock' : 'OutOfStock'}`, url: `${siteUrl}/product/${p.id}` },
        ...(view.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: view.rating, reviewCount: view.ratingCount } } : {}),
      },
    }
  }
  if (kind === 'golpo' && id) {
    const g = store.all('posts').find((x) => x.slug === key && x.status === 'published')
    if (!g) return { found: false }
    return {
      found: true, title: `${g.title} | ${SITE}`, description: short(g.excerpt || g.body), image: abs(g.cover), type: 'article',
      ld: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.excerpt, image: abs(g.cover), datePublished: g.publishedAt, dateModified: g.updatedAt, inLanguage: g.lang, publisher: { '@type': 'Organization', name: SITE } },
    }
  }
  if (kind === 'dokan' && id) {
    const s = store.get('sellers', key)
    if (!s || s.status !== 'approved') return { found: false }
    return { found: true, title: `${s.shopName}, ${s.craft} | ${SITE}`, description: short(s.story) }
  }
  const fixed = {
    shop: ['বাজার: সব পণ্য', 'জামদানি, নকশি কাঁথা, মাটির কাজ, কাঠ, পিতল, বাঁশ-বেত আর পাটের জিনিস। সরাসরি কারিগরের কাছ থেকে।'],
    artisans: ['কারিগর', 'যাঁদের হাতে এই বাজার। বাংলাদেশের কারিগরদের দোকান আর তাঁদের গল্প।'],
    golpo: ['গল্পের আসর', 'কারিগরের কথা, হাটের কথা, বাংলার হাতের কাজের কথা।'],
    'amader-kotha': ['আমাদের কথা', 'বাঙালিয়ানা বাজার একটা অনলাইন হাট। কারিগররা নিজের হাতে বানানো জিনিস এখানে বিক্রি করেন।'],
    sahajjo: ['সাহায্য', 'অর্ডার, ডেলিভারি, টাকা দেওয়া আর ফেরত নিয়ে যা জানা দরকার।'],
    khoj: ['অর্ডার খুঁজুন', 'অর্ডার নম্বর আর মোবাইল নম্বর দিয়ে দেখুন অর্ডার কোথায় আছে।'],
    bikreta: ['বিক্রেতা হোন', 'নিজের হাতের কাজ সারা দেশে বিক্রি করুন। কোনো খরচ নেই।'],
  }[kind]
  if (fixed) return { found: true, title: `${fixed[0]} | ${SITE}`, description: fixed[1] }
  return { found: true }
}

/** index.html-এ ট্যাগ বদলে দেয়। যা নেই তা আগের মতোই থাকে। */
export function injectMeta(html, meta, url) {
  let out = html
  const set = (re, value) => { if (value) out = out.replace(re, (_m, a, b) => `${a}${esc(value)}${b}`) }
  set(/(<title>)[^<]*(<\/title>)/, meta.title)
  set(/(<meta property="og:title" content=")[^"]*(")/, meta.title)
  set(/(<meta\s+name="description"\s+content=")[^"]*(")/, meta.description)
  set(/(<meta property="og:description" content=")[^"]*(")/, meta.description)
  set(/(<meta property="og:image" content=")[^"]*(")/, meta.image)
  set(/(<meta property="og:type" content=")[^"]*(")/, meta.type)
  set(/(<meta property="og:url" content=")[^"]*(")/, url)
  set(/(<link rel="canonical" href=")[^"]*(")/, url)
  // জেসনের ভেতরে < থাকলে স্ক্রিপ্ট ট্যাগ ভাঙতে পারে, তাই বদলে দিই
  if (meta.ld) out = out.replace('</head>', `<script type="application/ld+json">${JSON.stringify(meta.ld).replace(/</g, '\\u003c')}</script></head>`)
  return out
}

export async function serveSite(app, ctx, { distDir, siteUrl }) {
  let index
  try { index = await readFile(join(distDir, 'index.html'), 'utf-8') } catch {
    app.log.warn(`dist পাওয়া যায়নি (${distDir})। আগে pnpm build চালান।`)
    return false
  }
  app.setNotFoundHandler(async (req, reply) => {
    const path = req.url.split('?')[0]
    if (path.startsWith('/api/') || (req.method !== 'GET' && req.method !== 'HEAD')) return reply.code(404).send({ error: 'পাওয়া যায়নি।' })
    // বানানো ফাইল: নামের ভেতরে হ্যাশ থাকে, তাই এক বছর রাখা যায়
    const ext = extname(path)
    if (ext && TYPES[ext]) {
      const file = normalize(join(distDir, decodeURIComponent(path)))
      if (file.startsWith(distDir)) {
        try {
          if ((await stat(file)).isFile()) {
            reply.header('Cache-Control', path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=86400')
            return reply.type(TYPES[ext]).send(await readFile(file))
          }
        } catch { /* নেই, নিচে ৪০৪ */ }
      }
      return reply.code(404).type('text/plain; charset=utf-8').send('নেই')
    }
    const meta = pageMeta(path, ctx, siteUrl)
    reply.header('Cache-Control', 'no-cache')
    return reply.code(meta.found ? 200 : 404).type(TYPES['.html']).send(injectMeta(index, meta, `${siteUrl}${path === '/' ? '' : path}`))
  })
  return true
}
