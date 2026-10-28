import { Link } from 'react-router-dom'
import { ARTISANS, PRODUCTS, bn, formatBDT } from '../data/products'
import ProductArt from '../components/ProductArt'
import { StitchFrame } from '../components/Stitch'

export default function Artisans() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl">যাদের হাতে এই বাজার</h1>
      <p className="mt-3 max-w-3xl text-stone-700">কাজটা তাঁদের। আমরা শুধু আপনার ঘরে পৌঁছে দিই।</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ARTISANS.map((a) => {
          const works = PRODUCTS.filter((p) => p.artisan === a.name)
          const emblem = works[0]
          return (
            <article key={a.name} className="relative flex flex-col rounded-[10px] bg-paper p-6">
              <StitchFrame />
              <div className="flex items-center gap-4">
                {emblem && (
                  // কারিগরের নিজের কাজের নকশা দিয়ে গোল প্রতীক, চারপাশে সেলাই
                  <div className="relative h-20 w-20 shrink-0 rounded-full p-1 ring-2 ring-holud ring-offset-2 ring-offset-paper" aria-hidden="true">
                    <ProductArt plain art={emblem.art} palette={emblem.palette} label="" className="h-full w-full rounded-full" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl">{a.name}</h2>
                  <p className="text-rickshaw">{a.craft}, {a.district}</p>
                  <p className="text-sm text-stone-500">{bn(a.years)} বছর ধরে</p>
                </div>
              </div>
              <p className="mt-4 text-stone-700">{a.note}</p>
              {works.length > 0 && (
                <ul className="mt-auto grid grid-cols-2 gap-3 pt-5">
                  {works.map((w) => (
                    <li key={w.id}>
                      <Link to={`/product/${w.id}`} className="group block">
                        <ProductArt plain art={w.art} palette={w.palette} label={w.nameBn} className="hang-swing block h-20 w-full rounded" />
                        <p className="mt-1 text-sm leading-snug group-hover:text-rickshaw">{w.nameBn}</p>
                        <p className="text-sm text-rickshaw">{formatBDT(w.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
