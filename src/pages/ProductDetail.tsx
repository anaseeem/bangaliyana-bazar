import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PRODUCTS, bn, formatBDT } from '../data/products'
import { useCart } from '../store/cart'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => p.id === id)
  const { add, wishlist, toggleWish } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">পণ্যটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-stone-600">হয়তো ঠিকানাটা ভুল, নয়তো পণ্যটি আর নেই।</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">বাজারে ফিরুন →</Link>
      </div>
    )
  }

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const wished = wishlist.includes(product.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm text-stone-500">
        <Link to="/" className="hover:underline">হোম</Link> / <Link to="/shop" className="hover:underline">বাজার</Link> / {product.nameBn}
      </p>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="animate-fade-up overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-sm">
          <ProductArt art={product.art} palette={product.palette} label={product.nameBn} className="h-80 w-full sm:h-96" />
        </div>
        <div className="animate-fade-up">
          {product.badge && <span className="rounded-full bg-rickshaw px-3 py-1 text-xs text-white">{product.badge}</span>}
          <h1 className="mt-3 text-4xl">{product.nameBn}</h1>
          <p className="mt-2 text-sm">★ {bn(product.rating.toFixed(1))} রেটিং • {product.category} • {product.district}</p>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl text-rickshaw">{formatBDT(product.price)}</span>
            {product.oldPrice && <s className="text-stone-400">{formatBDT(product.oldPrice)}</s>}
          </p>
          <p className="mt-4 text-stone-700">{product.description}</p>
          <div className="mt-5 rounded-3xl bg-cream-deep p-4">
            <p className="font-display text-lg">কারিগরের গল্প</p>
            <p className="mt-1 text-sm text-stone-700">{product.story}</p>
            <p className="mt-2 text-sm"> {product.artisan}, {product.district}</p>
          </div>
          <p className="mt-4 text-sm">{product.stock > 0 ? `স্টকে আছে ${bn(product.stock)}টি` : 'স্টক শেষ। শীঘ্রই আসছে'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm" htmlFor="qty">
              পরিমাণ
              <input
                id="qty"
                type="number"
                min={1}
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                className="w-20 rounded-full border-2 border-amber-300 px-3 py-2 text-center"
              />
            </label>
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => { add(product.id, qty); setAdded(true); window.setTimeout(() => setAdded(false), 2000) }}
              className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark disabled:opacity-40"
            >
              {added ? '✓ ঝুড়িতে গেছে' : 'ঝুড়িতে নিন'}
            </button>
            <button
              type="button"
              onClick={() => toggleWish(product.id)}
              aria-pressed={wished}
              className={`rounded-full border-2 px-5 py-3 ${wished ? 'border-rickshaw bg-rickshaw text-white' : 'border-amber-300 text-rickshaw'}`}
            >
              {wished ? '♥ পছন্দে আছে' : '♡ পছন্দে রাখুন'}
            </button>
          </div>
          <div className="mt-5 space-y-1 text-sm text-stone-600">
            <p>• পেমেন্ট: ক্যাশ অন ডেলিভারি (ডেমো)। পণ্য হাতে পেয়ে টাকা দিন। কোনো অনলাইন পেমেন্ট নেই।</p>
            <p>• ডেলিভারি: ঢাকায় ৳৬০, ঢাকার বাইরে ৳১২০। সময় ২ থেকে ৪ দিন।</p>
            <p>• হাতে তৈরি পণ্য বলে রং আর নকশায় সামান্য পার্থক্য থাকতে পারে। সেটাই এর আসল সৌন্দর্য।</p>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl">একই ধরনের আরও পণ্য</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
