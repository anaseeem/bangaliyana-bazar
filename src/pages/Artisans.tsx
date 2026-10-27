import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS } from '../data/products'
import { useReveal } from '../hooks/useReveal'

export default function Artisans() {
  useReveal([])
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-sm tracking-widest text-rickshaw">কারিগর</p>
      <h1 className="mt-1 text-4xl">যাদের হাতে এই বাজার</h1>
      <p className="mt-3 max-w-3xl text-stone-700">
        বাঙালিয়ানা বাজার কোনো কারখানা নয়। এটা ছয় জেলার কারিগরদের একটা মেলা।
        তাঁতঘর, কুমোরপাড়া, কাঁথা সেলাইয়ের উঠোন আর রিকশা আর্টের দোকান থেকে
        সরাসরি আপনার ঘরে। প্রতিটি পণ্যের পাশে কারিগরের নাম লেখা থাকে। কাজটা তাঁদের।
        আমরাই শুধু পৌঁছে দিই।
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTISANS.map((a) => {
          const works = PRODUCTS.filter((p) => p.artisan === a.name)
          return (
            <article key={a.name} className="reveal rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rickshaw font-display text-2xl text-white" aria-hidden="true">
                {a.name.charAt(0)}
              </div>
              <h2 className="mt-3 font-display text-2xl">{a.name}</h2>
              <p className="text-sm text-rickshaw">{a.craft} • {a.district}</p>
              <p className="text-sm text-stone-500">{a.years} বছরের অভিজ্ঞতা</p>
              <p className="mt-3 text-sm text-stone-700">{a.note}</p>
              {works.length > 0 && (
                <p className="mt-3 text-sm">
                  তাঁর কাজ:{' '}
                  {works.map((w, i) => (
                    <span key={w.id}>
                      <Link to={`/product/${w.id}`} className=" text-rickshaw underline">{w.nameBn}</Link>
                      {i < works.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </article>
          )
        })}
      </div>

      <section className="reveal mt-10 rounded-3xl bg-leaf-soft p-8">
        <h2 className="text-2xl">কারিগর কীভাবে যুক্ত হন?</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-stone-700">
          <li>কারিগর তাঁর কাজের নমুনা আর দাম জানান।</li>
          <li>আমরা কাজ দেখে, দাম মিলিয়ে পণ্য তালিকায় তুলি।</li>
          <li>অর্ডার এলে কারিগরকে জানানো হয়, তিনি নিজের হাতে তৈরি করে পাঠান।</li>
          <li>পণ্য পৌঁছে গেলে, টাকার বড় অংশ সরাসরি কারিগরের হাতে যায়।</li>
        </ol>
        <p className="mt-4 text-sm text-stone-600">
          আপনি যদি কারিগর হন, বা আপনার গ্রামে এমন কেউ থাকে, বাজারের ফেসবুক পাতায়
          লিখুন। আমরা নিজে গিয়ে কাজ দেখে আসব।
        </p>
      </section>
    </div>
  )
}
