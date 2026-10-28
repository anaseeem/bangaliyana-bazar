import { Link, useParams } from 'react-router-dom'
import { bn } from '../data/products'
import { useMarket } from '../store/market'
import { sellerIdOf } from '../data/sellers'
import { whatsappLink } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'
import { Panel } from '../components/Form'

/** একজন বিক্রেতার দোকান: পরিচয়, গল্প আর সব পণ্য */
export default function SellerShop() {
  const { id } = useParams()
  const { sellers, catalog } = useMarket()
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Panel>
        <h1 className="text-4xl">{seller.shopName}</h1>
        <p className="mt-1 text-lg text-rickshaw">
          {seller.craft}, {seller.district}{seller.years ? ` · ${bn(seller.years)} বছর ধরে` : ''}
        </p>
        <p className="mt-4 max-w-3xl text-stone-700">{seller.story}</p>
        {seller.phone && (
          <a href={whatsappLink(`আসসালামু আলাইকুম। বাঙালিয়ানা বাজারে আপনার দোকান দেখলাম।`, seller.phone)} target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white">
            WhatsApp-এ কথা বলুন
          </a>
        )}
      </Panel>
      <h2 className="mt-10 text-3xl">{bn(works.length)}টি পণ্য</h2>
      {works.length === 0 ? (
        <p className="mt-3 text-stone-600">শিগগিরই পণ্য আসছে।</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {works.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
