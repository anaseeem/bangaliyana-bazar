import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS, formatBDT } from '../data/products'
import { useReveal } from '../hooks/useReveal'
import { AlpanaBorder, BoishakhSun, Marquee } from '../components/Decor'
import ProductCard from '../components/ProductCard'
import ProductArt from '../components/ProductArt'

const COLLECTIONS = [
  { name: 'শাড়ি', art: 'jamdani' as const, note: 'জামদানি, মণিপুরি। তাঁতের গল্প' },
  { name: 'কাঁথা', art: 'kantha' as const, note: 'সেলাইয়ে সেলাইয়ে গল্প' },
  { name: 'মাটির কাজ', art: 'terracotta' as const, note: 'কুমোরের চাকার মাটি' },
  { name: 'লোকশিল্প', art: 'rickshaw' as const, note: 'রিকশা আর্ট আর কাঁসা' },
]

export default function Home() {
  const [apiProducts, setApiProducts] = useState<typeof PRODUCTS | null>(null)
  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setApiProducts(d as typeof PRODUCTS)
      })
      .catch(() => undefined)
  }, [])
  useReveal([apiProducts])
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
              জামদানি, নকশি কাঁথা, মাটির বাটি আর রিকশা আর্ট। বাংলাদেশের কারিগরদের হাতে
              বোনা, গড়া আর আঁকা জিনিস, সরাসরি আপনার ঘরে।
            </p>
            <p className="mt-2 text-sm text-amber-200">সব কাজ হাতে করা। কোনো ছাপ নয়। প্রতিটি জিনিসের পেছনে একজন কারিগর আছেন।</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="rounded-full bg-holud px-6 py-3 text-stone-900 shadow hover:bg-amber-400">
                বাজার ঘুরে দেখুন →
              </Link>
              <Link to="/artisans" className="rounded-full border-2 border-cream px-6 py-3 text-cream hover:bg-white/10">
                কারিগরদের গল্প
              </Link>
            </div>
            <dl className="mt-8 flex flex-wrap gap-6 text-sm">
              <div><dt className="font-display text-2xl text-holud">১৪+</dt><dd>হাতে তৈরি পণ্য</dd></div>
              <div><dt className="font-display text-2xl text-holud">৬</dt><dd>জেলার কারিগর</dd></div>
              <div><dt className="font-display text-2xl text-holud">১০০%</dt><dd>হাতের কাজ</dd></div>
            </dl>
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
        <div className="kantha-border" aria-hidden="true" />
      </section>
      <Marquee />

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="reveal">
          <p className="text-sm tracking-widest text-rickshaw">সংগ্রহ</p>
          <h2 className="mt-1 text-3xl">মেলার মতো করে সাজানো বাজার</h2>
          <p className="mt-2 max-w-2xl text-stone-600">যেমন বৈশাখী মেলায় এক দোকান থেকে আরেক দোকানে ঘোরা যায়, তেমনই এখানে প্রতিটি সংগ্রহ একেকটা গল্প।</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => (
            <Link key={c.name} to={`/shop?cat=${encodeURIComponent(c.name)}`} className="reveal group overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" style={{ transitionDelay: `${i * 60}ms` }}>
              <ProductArt art={c.art} palette={['#b91c1c', '#f59e0b', '#fff7e6']} label={c.name} className="h-40 w-full transition group-hover:scale-105" />
              <div className="p-4">
                <h3 className="font-display text-xl">{c.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{c.note}</p>
                <p className="mt-2 text-sm text-rickshaw">দেখুন →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <AlpanaBorder />

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="reveal flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm tracking-widest text-rickshaw">সেরা বিক্রি</p>
            <h2 className="mt-1 text-3xl">সবাই যা পছন্দ করছে</h2>
          </div>
          <Link to="/shop" className="rounded-full border-2 border-rickshaw px-4 py-2 text-sm text-rickshaw hover:bg-holud-soft">সব পণ্য দেখুন →</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Featured / festival */}
      <section className="bg-leaf-soft">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div className="reveal">
            <p className="text-sm tracking-widest text-leaf">উৎসব</p>
            <h2 className="mt-1 text-3xl">বৈশাখ মানেই নতুন কিছু</h2>
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
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-leaf px-6 py-3 text-white hover:bg-green-800">বৈশাখের সংগ্রহ দেখুন →</Link>
          </div>
          <div className="reveal grid grid-cols-2 gap-4">
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
        <div className="reveal">
          <p className="text-sm tracking-widest text-rickshaw">কারিগর</p>
          <h2 className="mt-1 text-3xl">যাদের হাতে এই বাজার</h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARTISANS.slice(0, 3).map((a) => (
            <article key={a.name} className="reveal rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
              <p className="font-display text-xl">{a.name}</p>
              <p className="text-sm text-rickshaw">{a.craft} • {a.district} • {a.years} বছরের অভিজ্ঞতা</p>
              <p className="mt-2 text-sm text-stone-600">{a.note}</p>
            </article>
          ))}
        </div>
        <Link to="/artisans" className="mt-6 inline-block text-rickshaw underline">সব কারিগরের গল্প পড়ুন →</Link>
      </section>

      {/* Why handmade */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="reveal rounded-3xl bg-cream-deep p-8">
          <h2 className="text-3xl">কেন হাতে তৈরি?</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <div><p className="font-display text-xl text-rickshaw">একটাই, আরেকটা নয়</p><p className="mt-1 text-sm text-stone-600">হাতে বোনা প্রতিটি শাড়ি, প্রতিটি কাঁথা একটু একটু আলাদা। সেই আলাদা ভাবটাই আসল।</p></div>
            <div><p className="font-display text-xl text-rickshaw">কারিগর পায় ন্যায্য দাম</p><p className="mt-1 text-sm text-stone-600">মাঝখানে দালাল নেই। আপনার দেওয়া টাকার বড় অংশ যায় সরাসরি কারিগরের হাতে।</p></div>
            <div><p className="font-display text-xl text-rickshaw">ঐতিহ্য বেঁচে থাকে</p><p className="mt-1 text-sm text-stone-600">জামদানি, কাঁথা, মৃৎশিল্প। কিনলেই এই কাজগুলো আরেক প্রজন্ম বাঁচিয়ে রাখতে পারে।</p></div>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            {apiProducts ? `সার্ভার থেকে ${apiProducts.length}টি পণ্য লোড হয়েছে।` : 'সার্ভার না চললে সাইটটি বান্ডল করা পণ্য দিয়েই চলে। ডেমো হিসেবে সবকিছু দেখা যায়।'}
          </p>
        </div>
      </section>
    </div>
  )
}
