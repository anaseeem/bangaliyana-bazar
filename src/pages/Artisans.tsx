import { Link } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { useMarket } from '../store/market'
import { sellerIdOf } from '../data/sellers'
import ProductPicture from '../components/ProductPicture'
import { StitchFrame } from '../components/Stitch'

export default function Artisans() {
  const { sellers, catalog } = useMarket()
  const approved = sellers.filter((s) => s.status === 'approved')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl">যাদের হাতে এই বাজার</h1>
      <p className="mt-3 max-w-3xl text-stone-700">কাজটা তাঁদের। আমরা শুধু আপনার ঘরে পৌঁছে দিই।</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {approved.map((a) => {
          const works = catalog.filter((p) => sellerIdOf(p) === a.id)
          const emblem = works[0]
          return (
            <article key={a.id} className="relative flex flex-col rounded-[10px] bg-paper p-6">
              <StitchFrame />
              <div className="flex items-center gap-4">
                {emblem && (
                  // কারিগরের নিজের কাজের নকশা দিয়ে গোল প্রতীক, চারপাশে সেলাই
                  <div className="relative h-20 w-20 shrink-0 rounded-full p-1 ring-2 ring-holud ring-offset-2 ring-offset-paper" aria-hidden="true">
                    <ProductPicture product={emblem} label="" className="h-full w-full rounded-full" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl"><Link to={`/dokan/${a.id}`} className="hover:text-rickshaw">{a.shopName}</Link></h2>
                  <p className="text-rickshaw">{a.craft}, {a.district}</p>
                  {a.years && <p className="text-sm text-stone-500">{bn(a.years)} বছর ধরে</p>}
                </div>
              </div>
              <p className="mt-4 text-stone-700">{a.story}</p>
              {works.length > 0 && (
                <ul className="mt-auto grid grid-cols-2 gap-3 pt-5">
                  {works.slice(0, 4).map((w) => (
                    <li key={w.id}>
                      <Link to={`/product/${w.id}`} className="group block">
                        <ProductPicture product={w} className="hang-swing block h-20 w-full rounded" />
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

      <div className="relative mt-10 rounded-[10px] bg-holud-soft p-6 text-center">
        <StitchFrame />
        <p className="font-display text-2xl">আপনিও হাতের কাজ করেন?</p>
        <Link to="/bikreta" className="mt-4 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বিক্রেতা হোন</Link>
      </div>
    </div>
  )
}
