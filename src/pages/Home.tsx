import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { ART_FOR, sellerIdOf } from '../data/sellers'
import { AlpanaCorner } from '../components/Alpana'
import { AlpanaBorder, BoishakhSun, Marquee } from '../components/Decor'
import { StitchFrame, StitchLine } from '../components/Stitch'
import ProductCard from '../components/ProductCard'
import ProductPicture from '../components/ProductPicture'
import Stall from '../components/Stall'
import { PotBanner, SellerBanner } from '../components/Banners'
import { useMarket } from '../store/market'

// শামিয়ানার রং, ধরন ধরে। নতুন ধরন হলে পাশের ছয় জোড়া থেকে ঘুরে ঘুরে নেয়।
const AWNING: Record<string, [string, string]> = {
  'শাড়ি': ['#b91c1c', '#f59e0b'],
  'কাঁথা': ['#2f6b3a', '#fff7e6'],
  'মাটির কাজ': ['#c2410c', '#fde68a'],
  'কাঠের কাজ': ['#7f1d1d', '#fff7e6'],
  'কাঁসা-পিতল': ['#b45309', '#fde68a'],
  'গয়না': ['#be185d', '#fff7e6'],
  'বাঁশ-বেত': ['#1f3b73', '#fff7e6'],
  'পাট': ['#2f6b3a', '#f59e0b'],
  'লোকশিল্প': ['#1f3b73', '#f59e0b'],
}
const AWNING_SPARE: [string, string][] = [['#b91c1c', '#fff7e6'], ['#2f6b3a', '#f59e0b'], ['#1f3b73', '#fde68a'], ['#c2410c', '#fff7e6'], ['#be185d', '#fde68a'], ['#7f1d1d', '#f59e0b']]
const GIFT_BANDS: { label: string; fits: (price: number) => boolean }[] = [
  { label: '৳১,০০০-এর নিচে', fits: (p) => p < 1000 },
  { label: '৳১,০০০ থেকে ৳৩,০০০', fits: (p) => p >= 1000 && p <= 3000 },
  { label: '৳৩,০০০-এর বেশি', fits: (p) => p > 3000 },
]

export default function Home() {
  const { catalog, sellers, settings } = useMarket()
  const [band, setBand] = useState(0)
  const byId = (id: string) => catalog.find((p) => p.id === id)
  const fresh = settings.newIds.map(byId).filter((p) => p !== undefined).slice(0, 4)
  const gifts = catalog.filter((p) => GIFT_BANDS[band].fits(p.price)).sort((a, b) => b.rating - a.rating).slice(0, 4)
  const room = settings.roomIds.map(byId).filter((p) => p !== undefined)
  const best = [...catalog].sort((a, b) => b.rating - a.rating).slice(0, 4)
  // একজন কারিগরের গল্প, তাঁর নিজের একটা কাজসহ
  const artisan = sellers.find((s) => s.id === settings.featuredSellerId) ?? sellers[0]
  const work = artisan ? catalog.find((p) => sellerIdOf(p) === artisan.id) : undefined
  const hero = byId(settings.heroProductId) ?? catalog[0]
  const titleLines = settings.heroTitle.split('\n')
  // ধরন ধরে একটা করে দোকান; ছবি সেই ধরনের প্রথম পণ্যের
  const stalls = settings.categories.map((name, i) => {
    const look = ART_FOR[name] ?? ART_FOR['লোকশিল্প']
    return { name, ...look, awning: AWNING[name] ?? AWNING_SPARE[i % AWNING_SPARE.length], photo: catalog.find((p) => p.category === name && p.photo)?.photo }
  })

  return (
    <div>
      {/* Hero। Pohela Boishakh morning */}
      <section className="jamdani-bg relative overflow-hidden text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="inline-block rounded-full bg-holud px-4 py-1 text-sm text-stone-900">{settings.heroBadge}</p>
            <h1 className="mt-4 font-sans-bn text-4xl leading-tight sm:text-6xl">
              {titleLines.map((line, i) => (i === 0 ? line : <span key={i}><br />{line}</span>))}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-amber-100">
              {settings.heroText}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-holud px-6 py-3 text-stone-900 shadow hover:bg-amber-400">
                বাজার ঘুরে দেখুন
              </Link>
              <Link to="/artisans" className="rounded-full border-2 border-cream px-6 py-3 text-cream hover:bg-white/10">
                কারিগরদের গল্প
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <BoishakhSun className="animate-float mx-auto w-64 sm:w-80" />
            {hero && <div className="animate-sway mt-[-30px] overflow-hidden rounded-3xl border-4 border-holud bg-white shadow-2xl">
              <Link to={`/product/${hero.id}`} className="block">
                <ProductPicture product={hero} className="h-56 w-full" />
                <div className="flex items-center justify-between px-4 py-3 text-stone-800">
                  <div>
                    <p className="font-display">{hero.nameBn}</p>
                    <p className="text-xs text-stone-500">{hero.artisan} • {hero.district}</p>
                  </div>
                  <p className="text-rickshaw">{formatBDT(hero.price)}</p>
                </div>
              </Link>
            </div>}
          </div>
        </div>
        <StitchLine colors={['var(--color-holud)', 'var(--color-alpana)']} />
      </section>
      <Marquee />

      {/* মেলার দোকান */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10">
        <h2 className="text-3xl">কোন দোকানে যাবেন?</h2>
        <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-9 lg:gap-4">
          {stalls.map((s) => <Stall key={s.name} {...s} />)}
        </div>
      </section>
      <AlpanaBorder />

      {/* সবাই যা নিচ্ছে */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl">সবাই যা নিচ্ছে</h2>
          <Link to="/shop" className="rounded-full border-2 border-rickshaw px-4 py-2 text-sm text-rickshaw hover:bg-holud-soft">সব পণ্য দেখুন</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* নতুন এসেছে */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-3xl">নতুন এসেছে</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fresh.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <PotBanner />
      </section>

      {/* উপহার খুঁজছেন */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl">উপহার খুঁজছেন?</h2>
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border-2 border-amber-300 p-1">
            {GIFT_BANDS.map((b, i) => (
              <button key={b.label} type="button" onClick={() => setBand(i)} aria-pressed={band === i} className={`shrink-0 rounded-full px-4 py-1.5 ${band === i ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gifts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
      <AlpanaBorder />

      {/* ঘর সাজান */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-3xl">ঘর সাজান</h2>
        <p className="mt-2 text-stone-600">বসার ঘর, বারান্দা আর পড়ার টেবিলের জন্য।</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
          {room.map((p, i) => (
            <Link key={p.id} to={`/product/${p.id}`} className={`group relative block overflow-hidden rounded-[10px] bg-paper ${i === 0 ? 'sm:col-span-2 md:row-span-2' : ''}`}>
              <ProductPicture product={p} className={`block w-full transition-transform duration-500 group-hover:scale-105 ${i === 0 ? 'h-72 md:h-full' : 'h-56'}`} />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-4 pt-10 pb-3 text-cream">
                <p className={i === 0 ? 'font-display text-2xl' : 'text-lg'}>{p.nameBn}</p>
                <p className="text-amber-200">{formatBDT(p.price)}</p>
              </div>
              <StitchFrame color="var(--color-holud)" />
            </Link>
          ))}
        </div>
      </section>

      {/* একজন কারিগরের গল্প */}
      {artisan && work && (
        <section className="relative bg-nil text-cream">
          <StitchLine colors={['var(--color-holud)', 'var(--color-alpana)']} />
          <AlpanaCorner corner="tl" className="absolute top-5 left-3 w-20 sm:w-28" />
          <AlpanaCorner corner="br" className="absolute right-3 bottom-3 w-20 sm:w-28" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-[5fr_6fr]">
            <Link to={`/product/${work.id}`} className="group relative block rounded-lg bg-cream p-4">
              <StitchFrame color="var(--color-nil)" />
              <ProductPicture product={work} className="hang-swing block h-64 w-full rounded" />
            </Link>
            <div>
              <h2 className="text-4xl">{artisan.shopName}</h2>
              <p className="mt-1 text-amber-200">{artisan.craft}, {artisan.district}।{artisan.years ? ` ${bn(artisan.years)} বছর ধরে এই কাজ করছেন।` : ''}</p>
              <blockquote className="mt-5 max-w-xl border-l-4 border-holud pl-4 text-xl leading-relaxed">“{work.story}”</blockquote>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={`/product/${work.id}`} className="rounded-full bg-holud px-6 py-3 text-stone-900 hover:bg-amber-400">
                  {work.nameBn}, {formatBDT(work.price)}
                </Link>
                <Link to="/artisans" className="rounded-full border-2 border-cream px-6 py-3 hover:bg-white/10">সব কারিগর</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SellerBanner />
      </section>
    </div>
  )
}
