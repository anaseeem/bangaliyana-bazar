import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, bn, type Product } from '../data/products'
import { BD_DISTRICTS } from '../data/districts'
import { useMarket } from '../store/market'
import { useCart } from '../store/cart'
import ProductCard from '../components/ProductCard'
import { StitchFrame, StitchLine } from '../components/Stitch'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'rating'

const SELECT = 'shrink-0 rounded-full border-2 border-amber-300 bg-paper px-4 py-2 focus:border-rickshaw focus:outline-none'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  // খোঁজ আর ধরন ঠিকানায় থাকে, তাই হেডারের খোঁজ আর দোকানের লিংক সরাসরি কাজ করে
  const q = params.get('q') ?? ''
  const cat = params.get('cat') ?? 'সব'
  const setParam = (key: 'q' | 'cat', value: string, empty: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === empty) next.delete(key)
      else next.set(key, value)
      return next
    }, { replace: true })
  const setQ = (v: string) => setParam('q', v, '')
  const setCat = (v: string) => setParam('cat', v, 'সব')
  const [district, setDistrict] = useState('সব জেলা')
  const [sort, setSort] = useState<Sort>('featured')
  const [onlyWish, setOnlyWish] = useState(false)
  const { wishlist } = useCart()
  const { catalog } = useMarket()
  // যেসব জেলার পণ্য আছে শুধু সেগুলো, দেশের জেলার ক্রমে
  const districts = useMemo(() => ['সব জেলা', ...BD_DISTRICTS.filter((d) => catalog.some((p) => p.district === d))], [catalog])

  const filtered = useMemo(() => {
    let list: Product[] = [...catalog]
    if (onlyWish) list = list.filter((p) => wishlist.includes(p.id))
    if (cat !== 'সব') list = list.filter((p) => p.category === cat)
    if (district !== 'সব জেলা') list = list.filter((p) => p.district === district)
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter((p) =>
        [p.nameBn, p.artisan, p.district, p.category, p.description].join(' ').toLowerCase().includes(needle),
      )
    }
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [q, cat, district, sort, onlyWish, wishlist, catalog])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl">সব পণ্য, এক মেলায়</h1>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label htmlFor="shop-search" className="sr-only">খুঁজুন</label>
        <input
          id="shop-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="খুঁজুন, যেমন: জামদানি, কাঁথা, মাটি"
          className="w-full rounded-full border-2 border-amber-300 bg-paper px-5 py-2.5 focus:border-rickshaw focus:outline-none lg:flex-1"
        />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <label htmlFor="shop-cat" className="sr-only">ধরন</label>
          <select id="shop-cat" value={cat} onChange={(e) => setCat(e.target.value)} className={SELECT}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'সব' ? 'সব ধরন' : c}</option>)}
          </select>
          <label htmlFor="shop-district" className="sr-only">জেলা</label>
          <select id="shop-district" value={district} onChange={(e) => setDistrict(e.target.value)} className={SELECT}>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <label htmlFor="shop-sort" className="sr-only">সাজান</label>
          <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={SELECT}>
            <option value="featured">সাজানো ক্রম</option>
            <option value="price-asc">দাম কম থেকে বেশি</option>
            <option value="price-desc">দাম বেশি থেকে কম</option>
            <option value="rating">রেটিং বেশি আগে</option>
          </select>
          <button type="button" onClick={() => setOnlyWish((v) => !v)} aria-pressed={onlyWish} className={`shrink-0 rounded-full border-2 px-4 py-2 ${onlyWish ? 'border-shapla bg-shapla text-white' : 'border-amber-300 bg-paper text-shapla'}`}>
            ♥ পছন্দেরগুলো
          </button>
        </div>
      </div>
      <StitchLine className="mt-5" />

      <p className="mt-4 text-sm text-stone-600" role="status">{bn(filtered.length)}টি পণ্য পাওয়া গেছে।</p>

      {filtered.length === 0 ? (
        <div className="relative mt-8 rounded-[10px] bg-paper p-10 text-center">
          <StitchFrame />
          <p className="font-display text-2xl">কিছু মিলল না</p>
          <p className="mt-2 text-stone-600">অন্য নামে খুঁজুন, যেমন কাঁথা বা মাটি।</p>
          <button type="button" onClick={() => { setParams({}, { replace: true }); setDistrict('সব জেলা'); setOnlyWish(false) }} className="mt-4 rounded-full bg-rickshaw px-5 py-2 text-white">
            ছাঁকনি মুছে ফেলুন
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
