// সব রুটে লাগে এমন হিসাব: কোন পণ্য সবার জন্য, রেটিং, অর্ডারের অবস্থা, পাওনা
import { isStr, httpError, PHOTO_OK, toBn } from './validate.js'

// SellerDashboard এর ধরন অনুযায়ী পণ্যের নকশা (src/data/sellers.ts এর ART_FOR থেকে নেওয়া)
export const ART_FOR = {
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
export const ART_KINDS = ['jamdani', 'kantha', 'monipuri', 'terracotta', 'jhapi', 'bamboo', 'jute', 'rickshaw', 'gamchha', 'cushion', 'kansa', 'pitha', 'pati', 'diya']
const SELLER_PUBLIC = ['id', 'userId', 'shopName', 'ownerName', 'craft', 'district', 'story', 'phone', 'status', 'years', 'createdAt']

export function makeDomain(store) {
  const settings = () => store.get('settings', 'site')
  const safeUser = ({ passHash: _p, ...u }) => u
  const sellerOfUser = (uid) => store.all('sellers').find((s) => s.userId === uid)
  const me = (user) => (user ? { user: safeUser(user), seller: sellerOfUser(user.id) ?? null } : null)
  const publicSeller = (s) => Object.fromEntries(SELLER_PUBLIC.filter((k) => k in s).map((k) => [k, s[k]]))
  const isPublic = (p) => !p.hidden && store.get('sellers', p.sellerId)?.status === 'approved'

  // দেখানো রেটিং: দৃশ্যমান মতামতের গড়, না থাকলে আগের রেটিং
  const withRating = () => {
    const sums = new Map()
    for (const r of store.all('reviews')) {
      if (r.hidden) continue
      const e = sums.get(r.productId) ?? { n: 0, sum: 0 }
      e.n += 1
      e.sum += r.stars
      sums.set(r.productId, e)
    }
    return (p) => {
      const e = sums.get(p.id)
      return e ? { ...p, rating: Math.round((e.sum / e.n) * 10) / 10, ratingCount: e.n } : { ...p, ratingCount: 0 }
    }
  }
  const publicProducts = () => {
    const rate = withRating()
    return store.all('products').filter(isPublic).map(rate)
  }

  const buyerOrder = ({ note: _n, ...o }) => o
  const newestFirst = (a, b) => (a.createdAt < b.createdAt ? 1 : -1)

  // সব বিক্রেতা পাঠালে 'sent'
  const settle = (o) => {
    if (o.status !== 'placed' && o.status !== 'sent') return o
    const ids = [...new Set(o.items.map((i) => i.sellerId))]
    return { ...o, status: ids.every((id) => o.sentBy.includes(id)) ? 'sent' : 'placed' }
  }

  // অর্ডার বাতিল হলে স্টক ফেরত, একবারই (আগের অবস্থা cancelled না হলে)
  const restoreOps = (o) => o.items.map((i) => store.get('products', i.id)).filter(Boolean).map((p) => {
    const qty = o.items.find((i) => i.id === p.id).qty
    return ['products', { ...p, stock: p.stock + qty }]
  })

  const money = (sellerId) => {
    const pct = settings().commissionPercent
    const earned = store.all('orders').filter((o) => o.status === 'delivered')
      .flatMap((o) => o.items).filter((i) => i.sellerId === sellerId).reduce((s, i) => s + i.price * i.qty, 0)
    const commission = Math.round((earned * pct) / 100)
    const payouts = store.all('payouts').filter((p) => p.sellerId === sellerId).sort(newestFirst)
    const paid = payouts.reduce((s, p) => s + p.amount, 0)
    return { earned, commission, paid, due: earned - commission - paid, payouts }
  }

  // পণ্যের ফিল্ড যাচাই। mode: 'seller' | 'admin', create: নতুন কিনা। ফেরত দেয় শুধু যেগুলো এসেছে।
  const readProduct = (input, { admin, create }) => {
    const f = {}
    const has = (k) => input[k] !== undefined
    const need = (k) => { if (create && !has(k)) throw httpError(400, 'সব ঘর পূরণ করুন।') }
    for (const k of ['nameBn', 'price', 'stock', 'description', 'category']) need(k)
    if (admin && create) need('sellerId')
    if (has('nameBn')) {
      if (!isStr(input.nameBn, 3, 100)) throw httpError(400, 'পণ্যের নাম লিখুন।')
      f.nameBn = input.nameBn.trim()
    }
    if (has('price')) {
      if (!Number.isInteger(input.price) || input.price < 50) throw httpError(400, 'দাম ঠিক নেই। অন্তত ৳৫০।')
      f.price = input.price
    }
    if (has('stock')) {
      const min = create && !admin ? 1 : 0
      if (!Number.isInteger(input.stock) || input.stock < min || input.stock > 100000) throw httpError(400, 'কয়টা আছে, লিখুন।')
      f.stock = input.stock
    }
    if (has('description')) {
      if (!isStr(input.description, 10, 1500)) throw httpError(400, 'পণ্যটা নিয়ে এক লাইন লিখুন।')
      f.description = input.description.trim()
    }
    if (has('story')) {
      if (typeof input.story !== 'string' || input.story.length > 1500) throw httpError(400, 'গল্প বেশি বড়।')
      f.story = input.story.trim()
    }
    if (has('category')) {
      const ok = admin ? isStr(input.category, 1, 40) : settings().categories.includes(input.category)
      if (!ok) throw httpError(400, 'ধরন বেছে নিন।')
      f.category = input.category
    }
    if (has('photo')) {
      if (!PHOTO_OK(input.photo)) throw httpError(400, 'ছবিটা ঠিক নেই।')
      f.photo = input.photo
    }
    if (has('hidden')) f.hidden = input.hidden === true
    if (admin) {
      if (has('oldPrice')) {
        if (input.oldPrice === null || input.oldPrice === '' || input.oldPrice === 0) f.oldPrice = undefined
        else if (!Number.isInteger(input.oldPrice) || input.oldPrice < 50) throw httpError(400, 'আগের দাম ঠিক নেই।')
        else f.oldPrice = input.oldPrice
      }
      if (has('badge')) {
        if (typeof input.badge !== 'string' || input.badge.length > 20) throw httpError(400, 'ব্যাজ ছোট করুন।')
        f.badge = input.badge.trim() || undefined
      }
      if (has('rating')) {
        if (typeof input.rating !== 'number' || input.rating < 0 || input.rating > 5) throw httpError(400, 'রেটিং ০ থেকে ৫ হবে।')
        f.rating = input.rating
      }
      if (has('art')) {
        if (!ART_KINDS.includes(input.art)) throw httpError(400, 'নকশা ঠিক নেই।')
        f.art = input.art
      }
      if (has('palette')) {
        if (!Array.isArray(input.palette) || input.palette.length !== 3 || !input.palette.every((c) => typeof c === 'string' && c.length <= 20)) throw httpError(400, 'রং ঠিক নেই।')
        f.palette = input.palette
      }
      for (const k of ['artisan', 'district']) {
        if (has(k)) {
          if (!isStr(input[k], 1, 60)) throw httpError(400, 'সব ঘর পূরণ করুন।')
          f[k] = input[k].trim()
        }
      }
      if (has('sellerId')) {
        if (!store.get('sellers', input.sellerId)) throw httpError(400, 'বিক্রেতা পাওয়া যায়নি।')
        f.sellerId = input.sellerId
      }
    }
    return f
  }

  // ফিল্ড মিলিয়ে নতুন পণ্য বানায়। বিক্রেতা বদলালে নাম আর জেলা নতুন করে নেয়।
  const mergeProduct = (base, f) => {
    const p = { ...base, ...f }
    if (f.sellerId && f.sellerId !== base.sellerId) {
      const s = store.get('sellers', f.sellerId)
      if (f.artisan === undefined) p.artisan = s.ownerName
      if (f.district === undefined) p.district = s.district
    }
    if (f.category && f.art === undefined && f.category !== base.category && ART_FOR[f.category]) Object.assign(p, ART_FOR[f.category])
    for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k]
    return p
  }
  const artFor = (category) => ART_FOR[category] ?? ART_FOR['লোকশিল্প']

  const lowStockLine = (p, stock) => `"${p.nameBn}" আর ${toBn(stock)}টি আছে।`

  return { settings, safeUser, sellerOfUser, me, publicSeller, isPublic, publicProducts, buyerOrder, newestFirst, settle, restoreOps, money, readProduct, mergeProduct, artFor, lowStockLine }
}
