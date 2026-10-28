import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS, bn, formatBDT, type ArtKind } from '../data/products'
import { AlpanaCorner } from '../components/Alpana'
import { AlpanaBorder, BoishakhSun, Marquee } from '../components/Decor'
import { StitchFrame, StitchLine } from '../components/Stitch'
import ProductCard from '../components/ProductCard'
import ProductArt from '../components/ProductArt'
import Stall from '../components/Stall'

const STALLS: { name: string; art: ArtKind; palette: [string, string, string]; awning: [string, string] }[] = [
  { name: 'শাড়ি', art: 'jamdani', palette: ['#7f1d1d', '#f59e0b', '#fff7e6'], awning: ['#b91c1c', '#f59e0b'] },
  { name: 'কাঁথা', art: 'kantha', palette: ['#b91c1c', '#2f6b3a', '#fde68a'], awning: ['#2f6b3a', '#fff7e6'] },
  { name: 'মাটির কাজ', art: 'terracotta', palette: ['#c2410c', '#fff7e6', '#fde68a'], awning: ['#c2410c', '#fde68a'] },
  { name: 'বাঁশ-বেত', art: 'bamboo', palette: ['#a0702a', '#2f6b3a', '#fff7e6'], awning: ['#1f3b73', '#fff7e6'] },
  { name: 'পাট', art: 'jute', palette: ['#8a5a1a', '#2f6b3a', '#fde68a'], awning: ['#2f6b3a', '#f59e0b'] },
  { name: 'লোকশিল্প', art: 'kansa', palette: ['#b45309', '#f59e0b', '#fff7e6'], awning: ['#be185d', '#fff7e6'] },
]

export default function Home() {
  const best = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4)
  // একজন কারিগরের গল্প, তাঁর নিজের একটা কাজসহ
  const artisan = ARTISANS[0]
  const work = PRODUCTS.find((p) => p.artisan === artisan.name)

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
              জামদানি, নকশি কাঁথা, মাটির বাটি আর হাতে আঁকা ছবি। বাংলাদেশের কারিগরদের হাতে
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
              <ProductArt art="rickshaw" palette={['#b91c1c', '#f59e0b', '#0ea5e9']} label="রিকশা আর্ট পেইন্টিং" className="h-56 w-full" />
              <div className="flex items-center justify-between px-4 py-3 text-stone-800">
                <div>
                  <p className="font-display">রিকশা আর্ট পেইন্টিং</p>
                  <p className="text-xs text-stone-500">সৈয়দ আহমেদ • ঢাকা</p>
                </div>
                <p className=" text-rickshaw">{formatBDT(2800)}</p>
              </div>
            </div>
          </div>
        </div>
        <StitchLine colors={['var(--color-holud)', 'var(--color-alpana)']} />
      </section>
      <Marquee />

      {/* মেলার দোকান */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10">
        <h2 className="text-3xl">কোন দোকানে যাবেন?</h2>
        <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-6">
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

      {/* একজন কারিগরের গল্প */}
      {work && (
        <section className="relative bg-nil text-cream">
          <StitchLine colors={['var(--color-holud)', 'var(--color-alpana)']} />
          <AlpanaCorner corner="tl" className="absolute top-5 left-3 w-20 sm:w-28" />
          <AlpanaCorner corner="br" className="absolute right-3 bottom-3 w-20 sm:w-28" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-[5fr_6fr]">
            <Link to={`/product/${work.id}`} className="group relative block rounded-lg bg-cream p-4">
              <StitchFrame color="var(--color-nil)" />
              <ProductArt plain art={work.art} palette={work.palette} label={work.nameBn} className="hang-swing block h-64 w-full rounded" />
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
    </div>
  )
}
