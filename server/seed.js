import { readFile } from 'node:fs/promises'
import { newId } from './validate.js'

const REPO_DATA = new URL('../data/', import.meta.url)
const readJson = async (name) => {
  try { return JSON.parse(await readFile(new URL(name, REPO_DATA), 'utf-8')) } catch { return null }
}
const SEED_DATE = '2026-01-01T00:00:00.000Z'

export const DEFAULT_SETTINGS = {
  id: 'site',
  announcement: 'সারা দেশে ডেলিভারি • পণ্য হাতে পেয়ে টাকা দিন',
  heroBadge: 'শুভ নববর্ষ • পহেলা বৈশাখের মেলা',
  heroTitle: 'হাতের কাজ,\nবাংলার গল্প।',
  heroText: 'জামদানি, নকশি কাঁথা, পোড়ামাটি, কাঠ আর পিতলের কাজ। বাংলাদেশের কারিগরদের হাতে বোনা, গড়া আর আঁকা জিনিস, সরাসরি আপনার ঘরে।',
  heroProductId: 'kather-ghora',
  whatsapp: '01608332564',
  feeDhaka: 60,
  feeOutside: 120,
  daysDhaka: 'দুই দিনে',
  daysOutside: 'দুই থেকে চার দিনে',
  commissionPercent: 0,
  categories: ['শাড়ি', 'কাঁথা', 'মাটির কাজ', 'কাঠের কাজ', 'কাঁসা-পিতল', 'গয়না', 'বাঁশ-বেত', 'পাট', 'লোকশিল্প'],
  newIds: ['dhokra-lonthon', 'hans-nouka', 'shola-mala', 'pot-thala'],
  roomIds: ['pitoler-tob', 'matir-pakhi', 'alor-kulungi', 'bet-tray', 'kather-hati'],
  featuredSellerId: 'k1',
  footerLine: 'হাতে বোনা, হাতে গড়া, হাতে সেলাই করা।',
}

export async function seed(store) {
  // সেটিংসে নতুন কোনো চাবি না থাকলে ডিফল্ট জুড়ে দেয়
  const cur = store.get('settings', 'site')
  if (!cur) await store.put('settings', { ...DEFAULT_SETTINGS })
  else if (Object.keys(DEFAULT_SETTINGS).some((k) => !(k in cur))) await store.put('settings', { ...DEFAULT_SETTINGS, ...cur })

  // গল্প আর পাতা আলাদা করে বসে, যাতে পরে যোগ করা লেখাও প্রথমবার উঠে যায়
  const content = await readJson('content-seed.json')
  const now = new Date().toISOString()
  if (store.all('posts').length === 0) {
    await store.putMany((content?.posts ?? []).map((p) => ['posts', { status: 'published', ...p, id: p.id ?? newId('g'), createdAt: p.createdAt ?? p.publishedAt ?? now, updatedAt: p.updatedAt ?? p.publishedAt ?? now, publishedAt: p.publishedAt ?? now }]))
  }
  if (store.all('pages').length === 0) {
    await store.putMany((content?.pages ?? []).map((pg) => ['pages', { ...pg, updatedAt: pg.updatedAt ?? now }]))
  }

  if (store.all('products').length > 0) return
  const products = (await readJson('products.json')) ?? []
  const sellers = (await readJson('seed.json'))?.sellers ?? []
  const byName = new Map(sellers.map((s) => [s.ownerName, s.id]))
  await store.putMany([
    ...sellers.map((s) => ['sellers', s]),
    ...products.map((p) => ['products', { ...p, sellerId: p.sellerId ?? byName.get(p.artisan) ?? 'k1', createdAt: SEED_DATE }]),
  ])
}
