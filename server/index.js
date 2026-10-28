import Fastify from 'fastify'
import { readFile, writeFile } from 'node:fs/promises'

const PORT = Number(process.env.PORT ?? 3001)
// Render এ বাইরে থেকে ডাকতে হয়, তাই সব ঠিকানায় শোনে। নিজের কম্পিউটারে শুধু 127.0.0.1।
const HOST = process.env.HOST ?? (process.env.RENDER ? '0.0.0.0' : '127.0.0.1')
const PRODUCTS_FILE = new URL('../data/products.json', import.meta.url)
const ORDERS_FILE = new URL('../data/orders.json', import.meta.url)
const DELIVERY_FEE = { Dhaka: 60, 'Outside Dhaka': 120 }

const app = Fastify({ logger: true })

// ডেমো এপিআই। ভাইট ডেভ সার্ভার (৫১৭৩) আর প্রিভিউ (৪১৭৩) ডাকতে পারে।
app.addHook('onRequest', async (req, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Headers', 'Content-Type')
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    reply.code(204).send()
  }
})

async function loadProducts() {
  const raw = await readFile(PRODUCTS_FILE, 'utf-8')
  return JSON.parse(raw)
}

async function loadOrders() {
  try {
    return JSON.parse(await readFile(ORDERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

app.get('/api/health', async () => ({ ok: true, service: 'bangaliyana-bazar-api' }))

app.get('/api/products', async () => loadProducts())

app.get('/api/products/:id', async (req, reply) => {
  const products = await loadProducts()
  const product = products.find((p) => p.id === req.params.id)
  if (!product) return reply.code(404).send({ error: 'পণ্যটি পাওয়া যায়নি।' })
  return product
})

app.post('/api/orders', async (req, reply) => {
  const body = req.body ?? {}
  const { name, phone, district, address, delivery, items } = body

  if (typeof name !== 'string' || name.trim().length < 3) {
    return reply.code(400).send({ error: 'নাম লিখুন।' })
  }
  if (typeof phone !== 'string' || !/^01[3-9]\d{8}$/.test(phone.trim())) {
    return reply.code(400).send({ error: 'সঠিক মোবাইল নম্বর দিন।' })
  }
  if (typeof district !== 'string' || district.trim().length === 0) {
    return reply.code(400).send({ error: 'জেলা লিখুন।' })
  }
  if (typeof address !== 'string' || address.trim().length < 8) {
    return reply.code(400).send({ error: 'ঠিকানা লিখুন।' })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return reply.code(400).send({ error: 'ঝুড়িতে কিছু নেই।' })
  }
  // ডেমো অর্ডার। শুধু ক্যাশ অন ডেলিভারি। অন্য পেমেন্ট নেওয়া হয় না।
  if (body.paymentMethod !== undefined && body.paymentMethod !== 'ক্যাশ অন ডেলিভারি') {
    return reply.code(400).send({ error: 'শুধু ক্যাশ অন ডেলিভারি হবে।' })
  }
  const deliveryKey = delivery === 'Outside Dhaka' ? 'Outside Dhaka' : 'Dhaka'
  const fee = DELIVERY_FEE[deliveryKey]

  const products = await loadProducts()
  const byId = new Map(products.map((p) => [p.id, p]))
  let subtotal = 0
  const lines = []
  for (const item of items) {
    const product = byId.get(item?.id)
    const qty = Number(item?.qty)
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return reply.code(400).send({ error: 'অর্ডারের জিনিস ঠিক নেই।' })
    }
    subtotal += product.price * qty
    lines.push({ id: product.id, nameBn: product.nameBn, price: product.price, qty })
  }

  const orders = await loadOrders()
  const order = {
    id: `BB${String(orders.length + 1).padStart(4, '0')}${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    phone: phone.trim(),
    district: district.trim(),
    address: address.trim(),
    delivery: deliveryKey,
    deliveryFee: fee,
    paymentMethod: 'ক্যাশ অন ডেলিভারি',
    items: lines,
    subtotal,
    total: subtotal + fee,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2) + '\n', 'utf-8')
  return reply.code(201).send({ id: order.id, total: order.total, paymentMethod: order.paymentMethod, status: order.status })
})

app.get('/api/orders/:id', async (req, reply) => {
  const orders = await loadOrders()
  const order = orders.find((o) => o.id === req.params.id)
  if (!order) return reply.code(404).send({ error: 'অর্ডারটি পাওয়া যায়নি।' })
  return order
})

app.listen({ port: PORT, host: HOST }).then(() => {
  app.log.info(`Bangaliyana Bazar API listening on http://${HOST}:${PORT}`)
})
