import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { normalizePhone } from '../data/districts'
import { api, errorText } from '../lib/api'
import { orderStatus } from '../lib/orders'
import { useTitle } from '../lib/useTitle'
import { asciiDigits } from '../lib/local'
import { useMarket, type Order } from '../store/market'
import { BTN, Field, INPUT, Panel } from '../components/Form'
import MascotRoad from '../components/MascotRoad'
import { MamaLoader } from '../components/MamaScenes'
import { StitchLine } from '../components/Stitch'

const STOPS = ['নেওয়া হয়েছে', 'পাঠানো হয়েছে', 'পৌঁছেছে']
const dateBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

/** অর্ডার নম্বর আর মোবাইল নম্বর দিয়ে অর্ডার খোঁজা। অ্যাকাউন্ট লাগে না। মামা রাস্তায় দেখান অর্ডার কতদূর। */
export default function Khoj() {
  useTitle('অর্ডার খুঁজুন')
  const { user } = useMarket()
  const [params, setParams] = useSearchParams()
  const [id, setId] = useState(params.get('order') ?? '')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // নম্বর বাংলা অঙ্কে লিখলেও চলে, BB ছাড়া লিখলেও চলে
    const digits = asciiDigits(id).replace(/\D/g, '')
    const p = normalizePhone(phone)
    if (digits.length < 4) return setError('অর্ডার নম্বর লিখুন। যেমন BB৪৮২০১৯।')
    if (!/^01[3-9]\d{8}$/.test(p)) return setError('যে মোবাইল নম্বর দিয়ে অর্ডার করেছিলেন, সেটা লিখুন।')
    setError('')
    setBusy(true)
    setOrder(null)
    try {
      const o = await api.get<Order>(`/orders/track?id=BB${digits}&phone=${p}`)
      setOrder(o)
      setParams({ order: o.id }, { replace: true })
    } catch (err) {
      setError(errorText(err))
    }
    setBusy(false)
  }

  const at = order ? Math.max(0, STOPS.indexOf(orderStatus(order))) : 0
  const cancelled = order?.status === 'cancelled'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">অর্ডার খুঁজুন</h1>
      <p className="mt-2 text-lg text-stone-700">অর্ডার নম্বর আর মোবাইল নম্বর দিন। মামা দেখিয়ে দেবেন জিনিস কতদূর।</p>

      <Panel className="mt-6">
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate onSubmit={submit}>
          <Field id="k-id" label="অর্ডার নম্বর">
            <input id="k-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="BB৪৮২০১৯" className={INPUT} />
          </Field>
          <Field id="k-phone" label="মোবাইল নম্বর">
            <input id="k-phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="০১৭১২৩৪৫৬৭৮" className={INPUT} />
          </Field>
          <button type="submit" disabled={busy} className={BTN}>খুঁজুন</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
        {user && <p className="mt-4 text-stone-600">অ্যাকাউন্ট থেকে করা সব অর্ডার <Link to="/amar" className="text-rickshaw underline">আমার পাতায়</Link> আছে।</p>}
      </Panel>

      {busy && <MamaLoader label="খুঁজে দেখছি…" />}

      {order && (
        <Panel className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl">অর্ডার <span className="text-rickshaw">{bn(order.id)}</span></h2>
            <p className="text-stone-600">{dateBn(order.createdAt)}</p>
          </div>

          {cancelled ? (
            <p className="mt-4 rounded-full bg-cream-deep px-4 py-2 text-center text-stone-600">এই অর্ডার বাতিল হয়েছে</p>
          ) : (
            <>
              <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-sm" aria-label={`অবস্থা: ${STOPS[at]}`}>
                {STOPS.map((s, i) => (
                  <li key={s} className={`rounded-full px-2 py-1.5 ${i <= at ? 'bg-kolapata text-white' : 'bg-cream-deep text-stone-500'}`}>{s}</li>
                ))}
              </ol>
              {/* হাট থেকে বাড়ি: মামা যেখানে, অর্ডার সেখানে */}
              <div className="mt-4">
                <MascotRoad inline step={at} steps={STOPS.length} mood="neutral" fill={2} />
              </div>
            </>
          )}
          {order.courier && <p className="mt-4">কুরিয়ার: {order.courier}</p>}

          <StitchLine className="my-4" />
          <ul className="space-y-2">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span>{it.nameBn} <span className="text-stone-500">× {bn(it.qty)}</span></span>
                <span className="shrink-0">{formatBDT(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between text-sm text-stone-600"><span>ডেলিভারি</span><span>{formatBDT(order.deliveryFee)}</span></p>
          <p className="mt-1 flex justify-between text-lg"><span>হাতে পেয়ে দেবেন</span><span className="text-rickshaw">{formatBDT(order.total)}</span></p>
          <p className="mt-2 text-sm text-stone-600">{order.address}, {order.district}</p>
        </Panel>
      )}
    </div>
  )
}
