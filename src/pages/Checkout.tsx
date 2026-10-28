import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DISTRICTS, bn, formatBDT } from '../data/products'
import { useCart } from '../store/cart'

type Delivery = 'dhaka' | 'outside'
const DELIVERY_FEE: Record<Delivery, number> = { dhaka: 60, outside: 120 }

interface OrderResponse { id: string; total: number }

export default function Checkout() {
  const { detailed, total, clear, count } = useCart()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('ঢাকা')
  const [address, setAddress] = useState('')
  const [delivery, setDelivery] = useState<Delivery>('dhaka')
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<OrderResponse | null>(null)

  if (detailed.length === 0 && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl">অর্ডার করার মতো কিছু নেই</h1>
        <p className="mt-2 text-stone-600">আগে ঝুড়িতে কিছু নিন, তারপর অর্ডার করুন।</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">বাজারে যান →</Link>
      </div>
    )
  }

  const fee = DELIVERY_FEE[delivery]
  const grand = total + fee

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 3) return setError('আপনার নাম লিখুন (কমপক্ষে ৩ অক্ষর)।')
    if (!/^01[3-9]\d{8}$/.test(phone.trim())) return setError('সঠিক মোবাইল নম্বর দিন। যেমন 01XXXXXXXXX।')
    if (address.trim().length < 8) return setError('পুরো ঠিকানা লিখুন (কমপক্ষে ৮ অক্ষর)।')
    setPlacing(true)
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      district,
      address: address.trim(),
      delivery: delivery === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
      paymentMethod: 'ক্যাশ অন ডেলিভারি',
      items: detailed.map((d) => ({ id: d.product.id, nameBn: d.product.nameBn, price: d.product.price, qty: d.qty })),
      total: grand,
    }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('API error')
      const data = (await res.json()) as OrderResponse
      setOrder(data)
    } catch {
      // Static demo fallback: keep the order locally so the flow still works.
      const localId = `BB${Date.now().toString().slice(-6)}`
      try {
        const prev = JSON.parse(localStorage.getItem('bb-local-orders') ?? '[]') as unknown[]
        localStorage.setItem('bb-local-orders', JSON.stringify([...prev, { id: localId, ...payload, createdAt: new Date().toISOString() }]))
      } catch { /* ignore */ }
      setOrder({ id: localId, total: grand })
    } finally {
      setPlacing(false)
      clear()
    }
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center">
        <div className="animate-pop rounded-3xl border-2 border-amber-200 bg-white p-8 shadow-lg">
          <svg viewBox="0 0 120 120" className="animate-spin-slow mx-auto h-24 w-24" aria-hidden="true">
            <circle cx="60" cy="60" r="46" fill="#f59e0b" />
            <circle cx="60" cy="60" r="32" fill="#fff7e6" />
            <path d="M48,60 L56,68 L74,50" fill="none" stroke="#166534" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="mt-4 font-display text-3xl text-leaf">ধন্যবাদ! অর্ডার হয়েছে।</h1>
          <p className="mt-2 text-stone-600">আপনার অর্ডার নম্বরটি যত্নে রাখুন। আমরা ফোনে নিশ্চিত করব।</p>
          <p className="mt-4 inline-block rounded-full bg-cream-deep px-5 py-2 text-xl text-rickshaw">অর্ডার নম্বর: {bn(order.id)}</p>
          <p className="mt-3 text-lg">মোট দিতে হবে: <span className="text-rickshaw">{formatBDT(order.total)}</span></p>
          <p className="mt-2 text-sm text-stone-600">
            পেমেন্ট: <span>ক্যাশ অন ডেলিভারি</span>। পণ্য হাতে পেয়ে টাকা দিন। এটা ডেমো অর্ডার, কোনো অনলাইন পেমেন্ট নেওয়া হয়নি।
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="rounded-full bg-rickshaw px-6 py-3 text-white">আরও কিনুন →</Link>
            <Link to="/" className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw">হোমে ফিরুন</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl">অর্ডার করুন</h1>
      <p className="mt-1 text-stone-600">ডেমো চেকআউট। পেমেন্ট শুধু ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে টাকা দিন।</p>
      <form onSubmit={placeOrder} className="mt-6 grid gap-8 lg:grid-cols-3" noValidate>
        <div className="space-y-4 lg:col-span-2">
          <fieldset className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
            <legend className="px-2 font-display text-xl">আপনার তথ্য</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="text-sm">নাম *</label>
                <input id="co-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" autoComplete="name" className="mt-1 w-full rounded-full border-2 border-amber-300 px-4 py-2.5" />
              </div>
              <div>
                <label htmlFor="co-phone" className="text-sm">মোবাইল নম্বর *</label>
                <input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" className="mt-1 w-full rounded-full border-2 border-amber-300 px-4 py-2.5" />
              </div>
              <div>
                <label htmlFor="co-district" className="text-sm">জেলা *</label>
                <select id="co-district" value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded-full border-2 border-amber-300 bg-white px-4 py-2.5">
                  {DISTRICTS.filter((d) => d !== 'সব জেলা').map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="co-address" className="text-sm">ঠিকানা *</label>
                <input id="co-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="বাসা/রোড, এলাকা" autoComplete="street-address" className="mt-1 w-full rounded-full border-2 border-amber-300 px-4 py-2.5" />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
            <legend className="px-2 font-display text-xl">ডেলিভারি</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['dhaka', 'ঢাকার ভেতরে', '৳৬০ • ২ দিন'],
                ['outside', 'ঢাকার বাইরে', '৳১২০ • ২ থেকে ৪ দিন'],
              ] as [Delivery, string, string][]).map(([v, label, note]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${delivery === v ? 'border-rickshaw bg-holud-soft' : 'border-amber-200'}`}>
                  <input type="radio" name="delivery" value={v} checked={delivery === v} onChange={() => setDelivery(v)} className="h-5 w-5 accent-red-700" />
                  <span><span className="block">{label}</span><span className="text-sm text-stone-500">{note}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm">
            <legend className="px-2 font-display text-xl">পেমেন্ট</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-rickshaw bg-holud-soft p-4">
              <input type="radio" name="payment" checked readOnly className="h-5 w-5 accent-red-700" />
              <span>
                <span className="block">ক্যাশ অন ডেলিভারি</span>
                <span className="text-sm text-stone-600">পণ্য হাতে পেয়ে টাকা দিন। এটাই একমাত্র পেমেন্ট পদ্ধতি। কোনো অনলাইন পেমেন্ট নেই।</span>
              </span>
            </label>
          </fieldset>

          {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={placing} className="rounded-full bg-rickshaw px-8 py-3 text-white hover:bg-rickshaw-dark disabled:opacity-50">
              {placing ? 'অর্ডার হচ্ছে…' : `অর্ডার নিশ্চিত করুন। ${formatBDT(grand)}`}
            </button>
            <button type="button" onClick={() => navigate('/cart')} className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw">ঝুড়িতে ফিরুন</button>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <h2 className="font-display text-xl">অর্ডারের হিসাব ({bn(count)}টি পণ্য)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {detailed.map((d) => (
              <li key={d.product.id} className="flex justify-between gap-2">
                <span>{d.product.nameBn} × {bn(d.qty)}</span><span className="">{formatBDT(d.product.price * d.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-amber-200 pt-3 text-sm">
            <div className="flex justify-between"><dt>পণ্যের দাম</dt><dd className="">{formatBDT(total)}</dd></div>
            <div className="flex justify-between"><dt>ডেলিভারি</dt><dd className="">{formatBDT(fee)}</dd></div>
            <div className="flex justify-between text-base"><dt className="">সর্বমোট</dt><dd className=" text-rickshaw">{formatBDT(grand)}</dd></div>
          </dl>
        </aside>
      </form>
    </div>
  )
}
