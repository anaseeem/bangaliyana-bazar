import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS, bn, formatBDT, type ArtKind } from '../data/products'
import { AlpanaCorner } from '../components/Alpana'
import { AlpanaBorder, BoishakhSun, Marquee } from '../components/Decor'
import { StitchFrame, StitchLine } from '../components/Stitch'
import ProductCard from '../components/ProductCard'
import ProductPicture from '../components/ProductPicture'
import Stall from '../components/Stall'
import { PotBanner, SellerBanner } from '../components/Banners'
import { useMarket } from '../store/market'

const STALLS: { name: string; art: ArtKind; palette: [string, string, string]; awning: [string, string]; photo: string }[] = [
  { name: 'শাড়ি', art: 'jamdani', palette: ['#7f1d1d', '#f59e0b', '#fff7e6'], awning: ['#b91c1c', '#f59e0b'], photo: '/products/jamdani-shari.webp' },
  { name: 'কাঁথা', art: 'kantha', palette: ['#b91c1c', '#2f6b3a', '#fde68a'], awning: ['#2f6b3a', '#fff7e6'], photo: '/products/nakshi-kantha.webp' },
  { name: 'মাটির কাজ', art: 'terracotta', palette: ['#c2410c', '#fff7e6', '#fde68a'], awning: ['#c2410c', '#fde68a'], photo: '/products/matir-ghora.webp' },
  { name: 'কাঠের কাজ', art: 'pitha', palette: ['#92400e', '#f59e0b', '#fff7e6'], awning: ['#7f1d1d', '#fff7e6'], photo: '/products/kather-ghora.webp' },
  { name: 'কাঁসা-পিতল', art: 'kansa', palette: ['#b45309', '#f59e0b', '#fff7e6'], awning: ['#b45309', '#fde68a'], photo: '/products/dhokra-pecha.webp' },
  { name: 'গয়না', art: 'diya', palette: ['#b45309', '#be185d', '#fff7e6'], awning: ['#be185d', '#fff7e6'], photo: '/products/jhumka.webp' },
  { name: 'বাঁশ-বেত', art: 'bamboo', palette: ['#a0702a', '#2f6b3a', '#fff7e6'], awning: ['#1f3b73', '#fff7e6'], photo: '/products/bet-tray.webp' },
  { name: 'পাট', art: 'jute', palette: ['#8a5a1a', '#2f6b3a', '#fde68a'], awning: ['#2f6b3a', '#f59e0b'], photo: '/products/jute-bag.webp' },
  { name: 'লোকশিল্প', art: 'jhapi', palette: ['#be185d', '#f59e0b', '#fff7e6'], awning: ['#1f3b73', '#f59e0b'], photo: '/products/shola-mala.webp' },
]

// নতুন বিক্রেতার পণ্য না থাকলে এগুলো "নতুন এসেছে"-তে থাকে
const NEW_IDS = ['dhokra-lonthon', 'hans-nouka', 'shola-mala', 'pot-thala']
// ঘর সাজানোর ছবি: প্রথমটা বড়
const ROOM_IDS = ['pitoler-tob', 'matir-pakhi', 'alor-kulungi', 'bet-tray', 'kather-hati']
const GIFT_BANDS: { label: string; fits: (price: number) => boolean }[] = [
  { label: '৳১,০০০-এর নিচে', fits: (p) => p < 1000 },
  { label: '৳১,০০০ থেকে ৳৩,০০০', fits: (p) => p >= 1000 && p <= 3000 },
  { label: '৳৩,০০০-এর বেশি', fits: (p) => p > 3000 },
]

export default function Home() {
  const { catalog } = useMarket()
  const [band, setBand] = useState(0)
  const byId = (id: string) => catalog.find((p) => p.id === id)
  const fresh = [...catalog.filter((p) => p.sellerId).reverse(), ...NEW_IDS.map(byId).filter((p) => p !== undefined)].slice(0, 4)
  const gifts = catalog.filter((p) => GIFT_BANDS[band].fits(p.price)).sort((a, b) => b.rating - a.rating).slice(0, 4)
  const room = ROOM_IDS.map(byId).filter((p) => p !== undefined)
  const best = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4)
  // একজন কারিগরের গল্প, তাঁর নিজের একটা কাজসহ
  const artisan = ARTISANS[0]
  const work = PRODUCTS.find((p) => p.artisan === artisan.name)
  const hero = PRODUCTS.find((p) => p.id === 'kather-ghora') ?? PRODUCTS[0]

  return (
    <div>
      {/* Hero। Pohela Boishakh morning */}
      <section className="jamdani-bg relative overflow-hidden text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="inline-block rounded-full bg-holud px-4 py-1 text-sm text-stone-900">শুভ নববর্ষ • পহেলা বৈশাখের মেলা</p>
            <h1 className="mt-4 font-sans-bn text-4xl leading-tight sm:text-6xl">
              হাতের কাজ,<br />বাংলার গল্প।
            </h1>
            <p className="mt-4 max-w-lg text-lg text-amber-100">
              জামদানি, নকশি কাঁথা, পোড়ামাটি, কাঠ আর পিতলের কাজ। বাংলাদেশের কারিগরদের হাতে
              বোনা, গড়া আর আঁকা জিনিস, সরাসরি আপনার ঘরে।
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
            <div className="animate-sway mt-[-30px] overflow-hidden rounded-3xl border-4 border-holud bg-white shadow-2xl">
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
            </div>
          </div>
        </div>
        <StitchLine colors={['var(--color-holud)', 'var(--color-alpana)']} />
      </section>
      <Marquee />

      {/* মেলার দোকান */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10">
        <h2 className="text-3xl">কোন দোকানে যাবেন?</h2>
        <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-9 lg:gap-4">
          {STALLS.map((s) => <Stall key={s.name} {...s} />)}
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
      {work && (
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
              <h2 className="text-4xl">{artisan.name}</h2>
              <p className="mt-1 text-amber-200">{artisan.craft}, {artisan.district}। {bn(artisan.years)} বছর ধরে এই কাজ করছেন।</p>
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
