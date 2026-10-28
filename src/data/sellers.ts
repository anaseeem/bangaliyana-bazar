import { ARTISANS, type ArtKind, type Product } from './products'

export interface Seller {
  id: string
  userId: string | null
  shopName: string
  ownerName: string
  craft: string
  district: string
  story: string
  phone: string
  status: 'pending' | 'approved'
  years?: number
  createdAt: string
}

/** আগে থেকে থাকা কারিগররা অনুমোদিত বিক্রেতা। তাঁদের পণ্য data/products.ts থেকে আসে। */
export const SEED_SELLERS: Seller[] = ARTISANS.map((a, i) => ({
  id: `k${i + 1}`,
  userId: null,
  shopName: a.name,
  ownerName: a.name,
  craft: a.craft,
  district: a.district,
  story: a.note,
  phone: '',
  status: 'approved',
  years: a.years,
  createdAt: '2026-01-01T00:00:00.000Z',
}))
const SEED_BY_NAME = new Map(SEED_SELLERS.map((s) => [s.ownerName, s.id]))

/** কোন পণ্য কোন বিক্রেতার */
export const sellerIdOf = (p: Product) => p.sellerId ?? SEED_BY_NAME.get(p.artisan) ?? 'k1'

/** ধরন দেখে ছবি না থাকলে কোন আঁকা নকশা দেখাব */
export const ART_FOR: Record<string, { art: ArtKind; palette: [string, string, string] }> = {
  'শাড়ি': { art: 'jamdani', palette: ['#7f1d1d', '#f59e0b', '#fff7e6'] },
  'কাঁথা': { art: 'kantha', palette: ['#b91c1c', '#2f6b3a', '#fde68a'] },
  'মাটির কাজ': { art: 'terracotta', palette: ['#c2410c', '#fff7e6', '#fde68a'] },
  'বাঁশ-বেত': { art: 'bamboo', palette: ['#a0702a', '#2f6b3a', '#fff7e6'] },
  'পাট': { art: 'jute', palette: ['#8a5a1a', '#2f6b3a', '#fde68a'] },
  'কাঠের কাজ': { art: 'pitha', palette: ['#92400e', '#f59e0b', '#fff7e6'] },
  'কাঁসা-পিতল': { art: 'kansa', palette: ['#b45309', '#f59e0b', '#fff7e6'] },
  'গয়না': { art: 'diya', palette: ['#b45309', '#be185d', '#fff7e6'] },
  'লোকশিল্প': { art: 'jhapi', palette: ['#be185d', '#f59e0b', '#fff7e6'] },
}
