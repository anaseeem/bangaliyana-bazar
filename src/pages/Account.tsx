import { Link, Navigate } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { useCart } from '../store/cart'
import { useMarket } from '../store/market'
import { BTN_LINE, Panel } from '../components/Form'
import { StitchFrame, StitchLine } from '../components/Stitch'

const dateBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Account() {
  const { user, logout, orders, mySeller } = useMarket()
  const { wishlist } = useCart()
  if (!user) return <Navigate to="/login?next=/amar" replace />
  const mine = orders.filter((o) => o.userId === user.id).reverse()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">{user.name}</h1>
      <p className="mt-1 text-stone-600">{bn(user.phone)}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/shop" className="relative block rounded-[10px] bg-paper p-5 hover:bg-holud-soft/40">
          <StitchFrame />
          <p className="text-lg text-rickshaw">♥ পছন্দের জিনিস</p>
          <p className="text-stone-600">{bn(wishlist.length)}টি রাখা আছে</p>
        </Link>
        <Link to={mySeller ? '/bikreta/dokan' : '/bikreta'} className="relative block rounded-[10px] bg-paper p-5 hover:bg-holud-soft/40">
          <StitchFrame />
          <p className="text-lg text-kolapata">{mySeller ? 'আমার দোকান' : 'বিক্রেতা হোন'}</p>
          <p className="text-stone-600">{mySeller ? (mySeller.status === 'approved' ? mySeller.shopName : 'যাচাই চলছে') : 'নিজের হাতের কাজ বিক্রি করুন'}</p>
        </Link>
      </div>

      <h2 className="mt-10 text-2xl">আমার অর্ডার</h2>
      {mine.length === 0 ? (
        <Panel className="mt-4">
          <p>এখনো কোনো অর্ডার নেই।</p>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
        </Panel>
      ) : (
        <ul className="mt-4 space-y-4">
          {mine.map((o) => (
            <li key={o.id}>
              <Panel>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg">অর্ডার <span className="text-rickshaw">{bn(o.id)}</span></p>
                  <p className="text-sm text-stone-600">{dateBn(o.createdAt)}</p>
                </div>
                <StitchLine className="my-3" />
                <ul className="space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-3">
                      <span>{it.nameBn} <span className="text-stone-500">× {bn(it.qty)}</span></span>
                      <span>{formatBDT(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between text-lg"><span>সব মিলিয়ে</span><span className="text-rickshaw">{formatBDT(o.total)}</span></p>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={logout} className={`mt-10 ${BTN_LINE}`}>বের হোন</button>
    </div>
  )
}
