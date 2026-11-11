import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bn } from '../data/products'
import { normalizePhone } from '../data/districts'
import { api, errorText } from '../lib/api'
import { useTitle } from '../lib/useTitle'
import { whatsappLink } from '../lib/whatsapp'
import { useMarket } from '../store/market'
import { BTN, Field, INPUT, Panel } from '../components/Form'
import { MamaScene } from '../components/MamaScenes'
import { Mascot } from '../libs/mascot'

/** যোগাযোগ: ছোট একটা ফর্ম, বার্তা অ্যাডমিনের কাছে যায়। পাশে WhatsApp। */
export default function Jogajog() {
  useTitle('যোগাযোগ')
  const { user, settings } = useMarket()
  const [form, setForm] = useState({ name: user?.name ?? '', phone: user ? bn(user.phone) : '', text: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const phone = normalizePhone(form.phone)
    if (form.name.trim().length < 2) return setError('নাম লিখুন।')
    if (!/^01[3-9]\d{8}$/.test(phone)) return setError('মোবাইল নম্বর ঠিক নেই। যেমন ০১৭১২৩৪৫৬৭৮।')
    if (form.text.trim().length < 5) return setError('কী জানতে চান, লিখুন।')
    setError('')
    setBusy(true)
    try {
      await api.post('/messages', { name: form.name.trim(), phone, text: form.text.trim() })
      setSent(true)
    } catch (err) {
      setError(errorText(err))
    }
    setBusy(false)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <MamaScene kind="swagoto" as="h1" title="বার্তা পেয়েছি" text="আমরা আপনার নম্বরে ফোন বা WhatsApp-এ উত্তর দেব।">
          <Link to="/shop" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
        </MamaScene>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl">যোগাযোগ</h1>
      <p className="mt-2 text-lg text-stone-700">অর্ডার, পণ্য বা দোকান খোলা নিয়ে যা জানতে চান, লিখুন।</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <Panel>
          <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit}>
            <Field id="j-name" label="নাম">
              <input id="j-name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT} />
            </Field>
            <Field id="j-phone" label="মোবাইল নম্বর">
              <input id="j-phone" inputMode="tel" autoComplete="tel" placeholder="০১৭১২৩৪৫৬৭৮" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="j-text" label="আপনার কথা">
                <textarea id="j-text" rows={5} maxLength={1000} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className={`${INPUT} rounded-2xl`} />
              </Field>
            </div>
            {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2"><button type="submit" disabled={busy} className={BTN}>{busy ? 'পাঠানো হচ্ছে…' : 'পাঠিয়ে দিন'}</button></div>
          </form>
        </Panel>

        <Panel className="text-center">
          <Mascot pose="haat-nara" mood="happy" className="mx-auto h-48 w-auto" />
          <h2 className="mt-3 text-2xl">তাড়া আছে?</h2>
          <p className="mt-1 text-stone-700">WhatsApp-এ লিখলে তাড়াতাড়ি উত্তর পাবেন।</p>
          <a
            href={whatsappLink('আসসালামু আলাইকুম। বাঙালিয়ানা বাজার নিয়ে একটা কথা জানতে চাই।', undefined, settings.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full border-2 border-kolapata px-6 py-2.5 text-kolapata hover:bg-kolapata hover:text-white"
          >
            WhatsApp-এ লিখুন
          </a>
          <p className="mt-4 text-stone-600">{bn(settings.whatsapp)}</p>
          <p className="mt-3 text-sm text-stone-600">সাধারণ প্রশ্নের উত্তর <Link to="/sahajjo" className="text-rickshaw underline">সাহায্য পাতায়</Link> আছে।</p>
        </Panel>
      </div>
    </div>
  )
}
