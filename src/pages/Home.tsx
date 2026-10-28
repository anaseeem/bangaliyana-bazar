import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS, bn, formatBDT } from '../data/products'
import { AlpanaBorder, BoishakhSun, Marquee } from '../components/Decor'
import { StitchLine } from '../components/Stitch'
import ProductCard from '../components/ProductCard'
import ProductArt from '../components/ProductArt'

const COLLECTIONS = [
  { name: 'শাড়ি', art: 'jamdani' as const, note: 'জামদানি, মণিপুরি। তাঁতের গল্প' },
  { name: 'কাঁথা', art: 'kantha' as const, note: 'সেলাইয়ে সেলাইয়ে গল্প' },
  { name: 'মাটির কাজ', art: 'terracotta' as const, note: 'কুমোরের চাকার মাটি' },
  { name: 'লোকশিল্প', art: 'rickshaw' as const, note: 'হাতে আঁকা ছবি আর কাঁসা' },
]

export default function Home() {
  const best = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const featured = PRODUCTS.filter((p) => p.badge).slice(0, 4)

  return (
    <div>
      {/* Hero। Pohela Boishakh morning */}
      <section className="jamdani-bg relative overflow-hidden text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="inline-block rounded-full bg-holud px-4 py-1 text-sm text-stone-900">শুভ নববর্ষ • পহেলা বৈশাখের মেলা</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-6xl">
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

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div>
          <h2 className="text-3xl">মেলার মতো করে সাজানো বাজার</h2>
          <p className="mt-2 max-w-2xl text-stone-600">যেমন বৈশাখী মেলায় এক দোকান থেকে আরেক দোকানে ঘোরা যায়, তেমনই এখানে প্রতিটি সংগ্রহ একেকটা গল্প।</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Link key={c.name} to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <ProductArt art={c.art} palette={['#b91c1c', '#f59e0b', '#fff7e6']} label={c.name} className="h-40 w-full transition group-hover:scale-105" />
              <div className="p-4">
                <h3 className="font-display text-xl">{c.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{c.note}</p>
                <p className="mt-2 text-sm text-rickshaw">দেখুন</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <AlpanaBorder />

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl">সবাই যা পছন্দ করছে</h2>
          </div>
          <Link to="/shop" className="rounded-full border-2 border-rickshaw px-4 py-2 text-sm text-rickshaw hover:bg-holud-soft">সব পণ্য দেখুন</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Featured / festival */}
      <section className="bg-leaf-soft">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl">বৈশাখ মানেই নতুন কিছু</h2>
            <p className="mt-3 text-stone-700">
              পহেলা বৈশাখে নতুন শাড়ি, নতুন কাঁথা, ঘরে নতুন মাটির বাটি। এই অভ্যাসটা
              আমাদের দাদা-নানাদের আমলের। বাঙালিয়ানা বাজার সেই অভ্যাসটাই ধরে রাখতে চায়,
              কারিগরদের ন্যায্য দাম দিয়ে।
            </p>
            <ul className="mt-4 space-y-2 text-stone-700">
              <li>✦ প্রতিটি পণ্যে কারিগরের নাম আর জেলা লেখা থাকে।</li>
              <li>✦ পণ্য হাতে পেয়ে দেখে, তারপর ক্যাশে টাকা দিন।</li>
              <li>✦ ঢাকায় ২ দিন, ঢাকার বাইরে ৪ দিনের মধ্যে ডেলিভারি।</li>
            </ul>
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-leaf px-6 py-3 text-white hover:bg-green-800">বৈশাখের সংগ্রহ দেখুন</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {featured.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="overflow-hidden rounded-3xl border-2 border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <ProductArt art={p.art} palette={p.palette} label={p.nameBn} className="h-36 w-full" />
                <div className="p-3">
                  <p className="font-display">{p.nameBn}</p>
                  <p className="text-sm text-rickshaw">{formatBDT(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan strip */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div>
          <h2 className="text-3xl">যাদের হাতে এই বাজার</h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTISANS.slice(0, 3).map((a) => (
            <article key={a.name} className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
              <p className="font-display text-xl">{a.name}</p>
              <p className="text-sm text-rickshaw">{a.craft} • {a.district} • {bn(a.years)} বছরের অভিজ্ঞতা</p>
              <p className="mt-2 text-sm text-stone-600">{a.note}</p>
            </article>
          ))}
        </div>
        <Link to="/artisans" className="mt-6 inline-block text-rickshaw underline">সব কারিগরের গল্প পড়ুন</Link>
      </section>

    </div>
  )
}
