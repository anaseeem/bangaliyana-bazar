import Fastify from 'fastify'
import { randomBytes } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { openStore } from './store.js'
import { makeAuth, hashPassword } from './auth.js'
import { seed } from './seed.js'
import { makeDomain } from './domain.js'
import { newId, normPhone } from './validate.js'
import publicRoutes from './routes/public.js'
import accountRoutes from './routes/account.js'
import orderRoutes from './routes/orders.js'
import sellerRoutes from './routes/seller.js'
import adminRoutes from './routes/admin.js'
import { serveSite } from './static.js'

const PORT = Number(process.env.PORT ?? 3001)
// Render এ বাইরে থেকে ডাকতে হয়, তাই সব ঠিকানায় শোনে। নিজের কম্পিউটারে শুধু 127.0.0.1।
const HOST = process.env.HOST ?? (process.env.RENDER ? '0.0.0.0' : '127.0.0.1')
// অনলাইনে চলছে কি না: Render নিজে RENDER বসায়, নিজের সার্ভারে NODE_ENV=production দিতে হয়
export const LIVE = Boolean(process.env.RENDER) || process.env.NODE_ENV === 'production'

// অ্যাডমিন: ADMIN_PHONE আর ADMIN_PASSWORD থাকলে সেটা। নিজের কম্পিউটারে না থাকলে ডিফল্ট।
async function ensureAdmin(store, log) {
  let phone = normPhone(process.env.ADMIN_PHONE ?? '')
  let password = process.env.ADMIN_PASSWORD
  if (!phone || !password) {
    if (LIVE) return
    phone = '01700000000'
    password = 'admin123'
    log.warn('অ্যাডমিন ঢোকার ডিফল্ট নম্বর 01700000000, পাসওয়ার্ড admin123 (শুধু নিজের কম্পিউটারে)')
  }
  const u = store.all('users').find((x) => x.phone === phone)
  if (u) {
    if (u.role !== 'admin') await store.put('users', { ...u, role: 'admin' })
    return
  }
  await store.put('users', { id: newId('u'), name: 'অ্যাডমিন', phone, passHash: await hashPassword(password), role: 'admin', createdAt: new Date().toISOString() })
}

export async function buildApp(opts = {}) {
  const dataDir = opts.dataDir ?? process.env.DATA_DIR ?? fileURLToPath(new URL('../data', import.meta.url))
  const databaseUrl = 'databaseUrl' in opts ? opts.databaseUrl : process.env.DATABASE_URL
  const app = Fastify({ logger: opts.logger ?? true, bodyLimit: 3 * 1024 * 1024, trustProxy: true })

  const store = await openStore({ dataDir, databaseUrl })
  app.addHook('onClose', async () => { await store.close() })
  await seed(store)
  await ensureAdmin(store, app.log)
  let secret = process.env.JWT_SECRET ?? store.getMeta('jwt')
  if (!secret) {
    secret = randomBytes(32).toString('hex')
    await store.setMeta('jwt', secret)
  }
  const auth = makeAuth(store, secret)
  const ctx = { store, auth, d: makeDomain(store) }

  // খালি বডির POST (যেমন logout) ঠিকমতো নেয়
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (!body) return done(null, {})
    try { done(null, JSON.parse(body)) } catch { done(Object.assign(new Error('bad json'), { statusCode: 400 })) }
  })
  // GET ছাড়া সব অনুরোধ জেসন হতে হবে
  app.addHook('onRequest', async (req, reply) => {
    const ct = req.headers['content-type']
    if (req.method !== 'GET' && req.method !== 'HEAD' && ct && !ct.startsWith('application/json')) {
      return reply.code(400).send({ error: 'অনুরোধটা ঠিক নেই।' })
    }
  })

  app.setErrorHandler((err, req, reply) => {
    if (err.expose) return reply.code(err.statusCode).send({ error: err.message })
    if (err.statusCode === 413) return reply.code(413).send({ error: 'ছবিটা বেশি বড়।' })
    if (err.statusCode && err.statusCode < 500) return reply.code(400).send({ error: 'অনুরোধটা ঠিক নেই।' })
    req.log.error(err)
    return reply.code(500).send({ error: 'সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।' })
  })
  app.setNotFoundHandler((_req, reply) => reply.code(404).send({ error: 'পাওয়া যায়নি।' }))

  publicRoutes(app, ctx)
  accountRoutes(app, ctx)
  orderRoutes(app, ctx)
  sellerRoutes(app, ctx)
  adminRoutes(app, ctx)
  // SERVE_DIST=1 হলে বানানো দোকানও এখান থেকে যায় (নিজের সার্ভারে এক প্রসেসেই সব)
  if (opts.distDir ?? process.env.SERVE_DIST) {
    const siteUrl = (process.env.SITE_URL ?? 'https://bangaliyana-bazar.vercel.app').replace(/\/$/, '')
    await serveSite(app, ctx, { distDir: opts.distDir ?? fileURLToPath(new URL('../dist', import.meta.url)), siteUrl })
    app.get('/sitemap.xml', async (_req, reply) => reply.redirect('/api/sitemap.xml'))
  }
  await app.ready()
  return app
}

// সরাসরি চালালে শোনা শুরু করে। টেস্টে শুধু buildApp ব্যবহার হয়।
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = await buildApp()
  await app.listen({ port: PORT, host: HOST })
  app.log.info(`Bangaliyana Bazar API listening on http://${HOST}:${PORT}`)
}
