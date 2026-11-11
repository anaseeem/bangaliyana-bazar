import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { normalizePhone } from '../data/districts'
import { useMarket } from '../store/market'
import { whatsappLink } from '../lib/whatsapp'
import { useTitle } from '../lib/useTitle'
import { BTN, Field, INPUT, Panel } from '../components/Form'

/** ঢোকা আর নতুন অ্যাকাউন্ট এক পাতায়। ?next= থাকলে কাজ শেষে সেখানে ফেরে। */
export default function Login() {
  useTitle('ঢুকুন')
  const [params] = useSearchParams()
  const next = params.get('next') ?? '/amar'
  const { user, settings, login, signup } = useMarket()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)

  if (user) return <Navigate to={next} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = normalizePhone(phone)
    if (mode === 'signup' && name.trim().length < 3) return setError('নাম লিখুন, অন্তত তিন অক্ষর।')
    if (!/^01[3-9]\d{8}$/.test(p)) return setError('মোবাইল নম্বর ঠিক নেই। যেমন ০১৭১২৩৪৫৬৭৮।')
    if (password.length < 6) return setError('পাসওয়ার্ড অন্তত ছয় অক্ষরের দিন।')
    setBusy(true)
    const err = mode === 'login' ? await login(p, password) : await signup(name.trim(), p, password)
    setBusy(false)
    setError(err ?? '')
  }

  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      onClick={() => { setMode(m); setError('') }}
      aria-pressed={mode === m}
      className={`flex-1 rounded-full px-4 py-2 ${mode === m ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Panel>
        <div className="flex gap-2 rounded-full border-2 border-amber-300 p-1">
          {tab('login', 'ঢুকুন')}
          {tab('signup', 'নতুন অ্যাকাউন্ট')}
        </div>
        <h1 className="mt-6 text-3xl">{mode === 'login' ? 'আবার স্বাগতম' : 'অ্যাকাউন্ট খুলুন'}</h1>
        <form className="mt-5 grid gap-4" noValidate onSubmit={submit}>
          {mode === 'signup' && (
            <Field id="name" label="নাম">
              <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
            </Field>
          )}
          <Field id="phone" label="মোবাইল নম্বর">
            <input id="phone" inputMode="tel" autoComplete="tel" placeholder="০১৭১২৩৪৫৬৭৮" value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} />
          </Field>
          <Field id="password" label="পাসওয়ার্ড">
            <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
          </Field>
          {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
          <button type="submit" disabled={busy} className={BTN}>{mode === 'login' ? 'ঢুকুন' : 'অ্যাকাউন্ট খুলুন'}</button>
        </form>
        {mode === 'login' && (
          <div className="mt-5">
            <button type="button" onClick={() => setForgot((v) => !v)} aria-expanded={forgot} className="text-sm text-stone-600 underline hover:text-rickshaw">
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
            {forgot && (
              <div className="mt-3 rounded-md bg-holud-soft/60 p-4">
                <p>আপনার অ্যাকাউন্টের নম্বর থেকে দোকানকে WhatsApp-এ লিখুন। দোকান একটা নতুন পাসওয়ার্ড দেবে।</p>
                <a
                  href={whatsappLink('আসসালামু আলাইকুম। আমি বাঙালিয়ানা বাজারে আমার পাসওয়ার্ড ভুলে গেছি। একটা নতুন পাসওয়ার্ড দিন।', undefined, settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white"
                >
                  WhatsApp-এ লিখুন
                </a>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}
