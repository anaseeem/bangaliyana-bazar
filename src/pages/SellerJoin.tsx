import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { bn } from '../data/products'
import { BD_DISTRICTS, normalizePhone } from '../data/districts'
import { useMarket } from '../store/market'
import { BTN, Field, INPUT, Panel } from '../components/Form'

const STEPS = ['নিবন্ধন', 'অনুমোদন', 'পণ্য তোলা', 'অর্ডার পাওয়া']

/** বিক্রেতা হওয়ার পাতা। আগে অ্যাকাউন্ট লাগে, তারপর দোকানের তথ্য। */
export default function SellerJoin() {
  const { user, mySeller, registerSeller } = useMarket()
  const navigate = useNavigate()
  const [form, setForm] = useState({ shopName: '', craft: '', district: 'ঢাকা', story: '', phone: user ? bn(user.phone) : '' })
  const [error, setError] = useState('')

  if (mySeller) return <Navigate to="/bikreta/dokan" replace />

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.shopName.trim().length < 3) return setError('দোকানের নাম লিখুন।')
    if (form.craft.trim().length < 2) return setError('কী বানান, লিখুন। যেমন নকশি কাঁথা।')
    if (form.story.trim().length < 20) return setError('নিজের কাজের কথা দুই-এক লাইনে লিখুন।')
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(form.phone))) return setError('WhatsApp নম্বর ঠিক নেই।')
    registerSeller({ shopName: form.shopName.trim(), craft: form.craft.trim(), district: form.district, story: form.story.trim(), phone: normalizePhone(form.phone) })
    navigate('/bikreta/dokan')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">বিক্রেতা হোন</h1>
      <p className="mt-2 text-lg text-stone-700">নিজের হাতের কাজ সারা দেশে বিক্রি করুন। কোনো খরচ নেই।</p>

      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 rounded-full bg-paper px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-holud text-sm">{bn(i + 1)}</span>
            {s}
          </li>
        ))}
      </ol>

      {!user ? (
        <Panel className="mt-8">
          <p className="text-lg">শুরু করতে আগে একটা অ্যাকাউন্ট খুলুন বা ঢুকুন।</p>
          <Link to="/login?next=/bikreta" className="mt-4 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">ঢুকুন</Link>
        </Panel>
      ) : (
        <Panel className="mt-8">
          <h2 className="text-2xl">আপনার দোকান</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit}>
            <Field id="shop" label="দোকানের নাম">
              <input id="shop" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="যেমন: ফাতেমার কাঁথাঘর" className={INPUT} />
            </Field>
            <Field id="craft" label="কী বানান">
              <input id="craft" value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} placeholder="যেমন: নকশি কাঁথা" className={INPUT} />
            </Field>
            <Field id="district" label="জেলা">
              <select id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={INPUT}>
                {BD_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field id="wa" label="WhatsApp নম্বর">
              <input id="wa" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="story" label="আপনার কাজের গল্প">
                <textarea id="story" rows={3} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="কবে থেকে কাজ করছেন, কার কাছে শিখেছেন" className={`${INPUT} rounded-2xl`} />
              </Field>
            </div>
            {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2">
              <button type="submit" className={BTN}>নিবন্ধন করুন</button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  )
}
