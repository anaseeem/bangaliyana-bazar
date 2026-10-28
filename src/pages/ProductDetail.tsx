import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { useMarket } from '../store/market'
import { sellerIdOf } from '../data/sellers'
import { whatsappLink } from '../lib/whatsapp'
import { flyToJhuri } from '../lib/flyToJhuri'
import { useCart } from '../store/cart'
import ProductPicture from '../components/ProductPicture'
import ProductCard from '../components/ProductCard'
import QtyStepper from '../components/QtyStepper'
import { AlpanaCorner } from '../components/Alpana'
import { StitchFrame } from '../components/Stitch'

// পণ্য বদলালে পাতা নতুন করে শুরু হয়, যাতে আগের পণ্যের পরিমাণ থেকে না যায়
export default function ProductDetailRoute() {
  const { id } = useParams()
  return <ProductDetail key={id} id={id} />
}

function ProductDetail({ id }: { id?: string }) {
  const { catalog, sellers } = useMarket()
  const product = catalog.find((p) => p.id === id)
  const { add, wishlist, toggleWish } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">পণ্যটি পাওয়া যায়নি</h1>
        <p className="mt-2 text-stone-600">হয়তো ঠিকানাটা ভুল, নয়তো পণ্যটি আর নেই।</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">বাজারে ফিরুন</Link>
      </div>
    )
  }

  const seller = sellers.find((s) => s.id === sellerIdOf(product))
  const related = catalog.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const wished = wishlist.includes(product.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm text-stone-500">
        <Link to="/" className="hover:underline">হোম</Link> / <Link to="/shop" className="hover:underline">বাজার</Link> / {product.nameBn}
      </p>
      <div className="mt-4 grid items-start gap-10 lg:grid-cols-2">
        <div className="group relative rounded-[10px] bg-paper p-4">
          <StitchFrame />
          <div className="relative overflow-hidden rounded-md">
            <ProductPicture product={product} className="hang-swing block h-80 w-full sm:h-[26rem]" />
            <AlpanaCorner corner="tl" className="absolute top-2 left-2 w-16" />
            <AlpanaCorner corner="br" className="absolute right-2 bottom-2 w-16" />
          </div>
        </div>
        <div>
          {product.badge && <span className="badge-flag inline-block bg-rickshaw py-0.5 pr-3 pl-4 text-sm text-white">{product.badge}</span>}
          <h1 className="mt-3 text-4xl sm:text-5xl">{product.nameBn}</h1>
          <p className="mt-2 text-stone-600">
            <Link to={`/dokan/${seller?.id ?? ''}`} className="underline decoration-holud underline-offset-4 hover:text-rickshaw">{product.artisan}</Link>, {product.district}
            {product.rating > 0 && <span className="ml-4" aria-label={`রেটিং ${bn(product.rating.toFixed(1))}`}><span className="text-holud">★</span> {bn(product.rating.toFixed(1))}</span>}
          </p>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl text-rickshaw">{formatBDT(product.price)}</span>
            {product.oldPrice && <s className="text-stone-400">{formatBDT(product.oldPrice)}</s>}
          </p>
          <p className="mt-4 max-w-xl text-lg text-stone-700">{product.description}</p>
          <figure className="mt-6 max-w-xl border-l-4 border-holud pl-4">
            <blockquote className="text-stone-800">“{product.story}”</blockquote>
            <figcaption className="mt-1 text-sm text-stone-500">{product.artisan}</figcaption>
          </figure>
          {product.stock > 0 ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} onChange={setQty} max={product.stock} label="পরিমাণ" />
              <button
                type="button"
                onClick={(e) => { add(product.id, qty); flyToJhuri(e.currentTarget, product.palette[1]); setAdded(true); window.setTimeout(() => setAdded(false), 2000) }}
                className="rounded-full bg-rickshaw px-8 py-3 text-lg text-white hover:bg-rickshaw-dark"
              >
                {added ? 'ঝুড়িতে গেছে' : 'ঝুড়িতে নিন'}
              </button>
              <button
                type="button"
                onClick={() => toggleWish(product.id)}
                aria-pressed={wished}
                aria-label={wished ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl ${wished ? 'border-shapla bg-shapla text-white' : 'border-amber-300 text-shapla hover:bg-holud-soft'}`}
              >
                {wished ? '♥' : '♡'}
              </button>
            </div>
          ) : (
            <p className="mt-7 text-lg text-stone-600">স্টক শেষ। শিগগিরই আসছে।</p>
          )}
          {product.stock > 0 && product.stock <= 5 && <p className="mt-3 text-sm text-terra">আর মাত্র {bn(product.stock)}টি আছে</p>}
          <a
            href={whatsappLink(`আসসালামু আলাইকুম। বাঙালিয়ানা বাজারে আপনার "${product.nameBn}" (${formatBDT(product.price)}) দেখলাম। এটা নিয়ে জানতে চাই।`, seller?.phone)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white"
          >
            WhatsApp-এ বিক্রেতাকে জিজ্ঞেস করুন
          </a>
          <p className="mt-6 text-sm text-stone-600">ঢাকায় ডেলিভারি ৳৬০, বাইরে ৳১২০। হাতে পেয়ে টাকা দিন।</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-3xl">একই ধরনের আরও</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
