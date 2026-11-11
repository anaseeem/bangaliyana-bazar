import { useState } from 'react'
import { Link } from 'react-router-dom'
import { bn } from '../data/products'
import { api, errorText } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useMarket } from '../store/market'
import { BTN, INPUT, Panel } from './Form'

interface Review { id: string; name: string; stars: number; text: string; createdAt: string }

const dateBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

export function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${bn(n)} তারা`} className="text-lg tracking-wide">
      <span aria-hidden="true" className="text-holud">{'★'.repeat(n)}</span>
      <span aria-hidden="true" className="text-stone-300">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

/** পণ্যের মতামত। যিনি পণ্যটা হাতে পেয়েছেন, তিনিই লিখতে পারেন; সার্ভার সেটা মিলিয়ে দেখে। */
export default function Reviews({ productId }: { productId: string }) {
  const { user, refresh } = useMarket()
  const { data, reload } = useApi<Review[]>(`/products/${productId}/reviews`)
  const [stars, setStars] = useState(5)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const list = data ?? []

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post(`/products/${productId}/reviews`, { stars, text: text.trim() })
      setDone(true)
      reload()
      void refresh()
    } catch (err) {
      setError(errorText(err))
    }
    setBusy(false)
  }

  return (
    <section className="mt-14">
      <h2 className="text-3xl">ক্রেতারা যা বলছেন</h2>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        {list.length === 0 ? (
          <p className="text-stone-600">এখনো কেউ মতামত দেননি।</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id} className="rounded-[10px] bg-paper px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>{r.name} <Stars n={r.stars} /></p>
                  <p className="text-sm text-stone-500">{dateBn(r.createdAt)}</p>
                </div>
                {r.text && <p className="mt-1 text-stone-700">{r.text}</p>}
              </li>
            ))}
          </ul>
        )}

        <Panel>
          <h3 className="font-display text-2xl">আপনার মতামত</h3>
          {done ? (
            <p role="status" className="mt-3 rounded-md bg-holud-soft px-4 py-3">ধন্যবাদ। আপনার মতামত উঠে গেছে।</p>
          ) : !user ? (
            <p className="mt-2 text-stone-700">পণ্যটা হাতে পেয়ে থাকলে <Link to={`/login?next=/product/${productId}`} className="text-rickshaw underline">ঢুকে</Link> মতামত দিন।</p>
          ) : (
            <form className="mt-3 grid gap-3" onSubmit={submit}>
              <div role="radiogroup" aria-label="কয় তারা" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${bn(n)} তারা`} onClick={() => setStars(n)} className={`text-3xl leading-none ${n <= stars ? 'text-holud' : 'text-stone-300'}`}>★</button>
                ))}
              </div>
              <label htmlFor="r-text" className="sr-only">মতামত</label>
              <textarea id="r-text" rows={3} maxLength={400} value={text} onChange={(e) => setText(e.target.value)} placeholder="জিনিসটা কেমন লাগল" className={`${INPUT} rounded-2xl`} />
              {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
              <div><button type="submit" disabled={busy} className={BTN}>মতামত দিন</button></div>
            </form>
          )}
        </Panel>
      </div>
    </section>
  )
}
