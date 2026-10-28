import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bn } from '../data/products'
import { useMarket } from '../store/market'
import { sellerIdOf } from '../data/sellers'
import { whatsappLink } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
import ProductPicture from '../components/ProductPicture'
import { StitchFrame } from '../components/Stitch'

const monthBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })

/** একজন বিক্রেতার দোকান: পরিচয়, গল্প আর সব পণ্য */
export default function SellerShop() {
  const { id } = useParams()
  const { sellers, catalog, orders, mySeller } = useMarket()
  const [cat, setCat] = useState('সব')
  const seller = sellers.find((s) => s.id === id && s.status === 'approved')

  if (!seller) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">দোকানটা পাওয়া যায়নি</h1>
        <Link to="/artisans" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">সব কারিগর</Link>
      </div>
    )
  }
  const works = catalog.filter((p) => sellerIdOf(p) === seller.id)
  const cats = ['সব', ...new Set(works.map((p) => p.category))]
  const shown = cat === 'সব' ? works : works.filter((p) => p.category === cat)
  const orderCount = orders.filter((o) => o.items.some((it) => it.sellerId === seller.id)).length
  const emblem = works[0]
  const own = mySeller?.id === seller.id

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <section className="relative overflow-hidden rounded-[10px] bg-paper">
        <StitchFrame />
        <div className="jamdani-bg h-28 sm:h-36" aria-hidden="true" />
        <div className="px-6 pb-7 sm:px-8">
          {/* শুধু গোল প্রতীকটা নকশার ওপর ওঠে, নাম নিচে থাকে যাতে পড়া যায় */}
          <div className="-mt-12">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-paper ring-4 ring-holud ring-offset-4 ring-offset-paper" aria-hidden="true">
              {emblem
                ? <ProductPicture product={emblem} label="" className="h-full w-full" />
                : <span className="flex h-full w-full items-center justify-center bg-rickshaw font-display text-4xl text-cream">{Array.from(seller.shopName)[0]}</span>}
            </div>
            <div className="mt-4 min-w-0">
              <h1 className="text-4xl">{seller.shopName}</h1>
              <p className="mt-1 text-lg text-rickshaw">
                {seller.ownerName !== seller.shopName && `${seller.ownerName} · `}{seller.craft}, {seller.district}{seller.years ? ` · ${bn(seller.years)} বছর ধরে` : ''}
              </p>
            </div>
          </div>

          <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3">
            {[['পণ্য', `${bn(works.length)}টি`], ['অর্ডার', `${bn(orderCount)}টি`], ['যোগ দিয়েছেন', monthBn(seller.createdAt)]].map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse rounded-[10px] bg-cream-deep/60 p-3 text-center">
                <dt className="text-sm text-stone-600">{k}</dt>
                <dd className="font-display text-lg text-rickshaw sm:text-xl">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 max-w-3xl text-lg text-stone-700">{seller.story}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={whatsappLink(`আসসালামু আলাইকুম। বাঙালিয়ানা বাজারে ${seller.shopName} দোকান দেখলাম।`, seller.phone)} target="_blank" rel="noreferrer" className="inline-block rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white">
              WhatsApp-এ কথা বলুন
            </a>
            {own && <Link to="/bikreta/dokan" className="inline-block rounded-full border-2 border-rickshaw px-5 py-2 text-rickshaw hover:bg-holud-soft">দোকান সামলান</Link>}
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl">{bn(shown.length)}টি পণ্য</h2>
        {cats.length > 2 && (
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={`shrink-0 rounded-full px-4 py-1.5 ${cat === c ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>{c}</button>
            ))}
          </div>
        )}
      </div>
      {works.length === 0 ? (
        <p className="mt-3 text-stone-600">শিগগিরই পণ্য আসছে।</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
