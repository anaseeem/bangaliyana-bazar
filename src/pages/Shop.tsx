import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES, DISTRICTS, PRODUCTS, bn, type Product } from '../data/products'
import { useCart } from '../store/cart'
import ProductCard from '../components/ProductCard'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'rating'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [cat, setCat] = useState(params.get('cat') ?? 'সব')
  const [district, setDistrict] = useState('সব জেলা')
  const [sort, setSort] = useState<Sort>('featured')
  const [onlyWish, setOnlyWish] = useState(false)
  const { wishlist } = useCart()

  const filtered = useMemo(() => {
    let list: Product[] = [...PRODUCTS]
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
  }, [q, cat, district, sort, onlyWish, wishlist])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm tracking-widest text-rickshaw">বাজার</p>
      <h1 className="mt-1 text-4xl">সব পণ্য, এক মেলায়</h1>

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border-2 border-amber-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="shop-search" className="text-sm">খুঁজুন</label>
          <input
            id="shop-search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setParams(e.target.value ? { q: e.target.value } : {}, { replace: true }) }}
            placeholder="যেমন: জামদানি, কাঁথা, মাটি…"
            className="mt-1 w-full rounded-full border-2 border-amber-300 px-4 py-2 text-sm focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="shop-cat" className="text-sm">ধরন</label>
          <select id="shop-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 block w-full rounded-full border-2 border-amber-300 bg-white px-4 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="shop-district" className="text-sm">জেলা</label>
          <select id="shop-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 block w-full rounded-full border-2 border-amber-300 bg-white px-4 py-2 text-sm">
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="shop-sort" className="text-sm">সাজান</label>
          <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="mt-1 block w-full rounded-full border-2 border-amber-300 bg-white px-4 py-2 text-sm">
            <option value="featured">সাজানো ক্রম</option>
            <option value="price-asc">দাম: কম থেকে বেশি</option>
            <option value="price-desc">দাম: বেশি থেকে কম</option>
            <option value="rating">রেটিং</option>
          </select>
        </div>
        <button type="button" onClick={() => setOnlyWish((v) => !v)} aria-pressed={onlyWish} className={`rounded-full border-2 px-4 py-2 text-sm ${onlyWish ? 'border-rickshaw bg-rickshaw text-white' : 'border-amber-300 text-rickshaw'}`}>
          ♥ পছন্দেরগুলো
        </button>
      </div>

      <p className="mt-5 text-sm text-stone-600" role="status">{bn(filtered.length)}টি পণ্য পাওয়া গেছে।</p>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-amber-300 bg-white p-10 text-center">
          <p className="font-display text-2xl">কিছু মিলল না</p>
          <p className="mt-2 text-stone-600">অন্য নামে খুঁজে দেখুন, বা ছাঁকনি বদলে নিন। যেমন। “কাঁথা” বা “মাটি”।</p>
          <button type="button" onClick={() => { setQ(''); setCat('সব'); setDistrict('সব জেলা'); setOnlyWish(false) }} className="mt-4 rounded-full bg-rickshaw px-5 py-2 text-white">
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
