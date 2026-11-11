import { useState } from 'react'
import { bn, type Product } from '../../data/products'
import { normalizePhone } from '../../data/districts'
import type { Settings as SiteSettings } from '../../data/settings'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { useMarket } from '../../store/market'
import { BTN, Field, INPUT, Panel } from '../../components/Form'
import { toInt, useAction } from './kit'
import { Alert, Note, SmallBtn } from './shared'

/** তালিকা থেকে বেছে নেওয়া জিনিস, ছোট চিপ হয়ে থাকে, সরানো যায় */
function PickList({ label, ids, max, options, onChange }: { label: string; ids: string[]; max: number; options: { id: string; name: string }[]; onChange: (v: string[]) => void }) {
  const name = (id: string) => options.find((o) => o.id === id)?.name ?? id
  return (
    <div>
      <p>{label} <span className="text-sm text-stone-600">(সর্বোচ্চ {bn(max)}টি)</span></p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => (
          <li key={id} className="flex items-center gap-2 rounded-full bg-holud-soft py-1 pr-1 pl-4">
            {name(id)}
            <button type="button" aria-label={`${name(id)} সরান`} onClick={() => onChange(ids.filter((x) => x !== id))} className="h-7 w-7 rounded-full hover:bg-white">×</button>
          </li>
        ))}
      </ul>
      {ids.length < max && (
        <select aria-label={`${label} যোগ করুন`} value="" onChange={(e) => e.target.value && onChange([...ids, e.target.value])} className={INPUT}>
          <option value="">যোগ করুন…</option>
          {options.filter((o) => !ids.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      )}
    </div>
  )
}

export default function Settings() {
  const { settings, catalog, sellers, refresh } = useMarket()
  const all = useApi<Product[]>('/admin/products')
  const act = useAction()
  const [f, setF] = useState(() => ({
    ...settings, whatsapp: bn(settings.whatsapp), feeDhaka: bn(settings.feeDhaka), feeOutside: bn(settings.feeOutside), commissionPercent: bn(settings.commissionPercent),
  }))
  const [cats, setCats] = useState(settings.categories)
  const [newCat, setNewCat] = useState('')
  const [newIds, setNewIds] = useState(settings.newIds)
  const [roomIds, setRoomIds] = useState(settings.roomIds)
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }))
  const products = catalog.map((p) => ({ id: p.id, name: p.nameBn }))

  const addCat = () => {
    const c = newCat.trim()
    if (!c) return
    if (cats.includes(c)) return act.setError('এই ধরন আগেই আছে।')
    if (c.length > 40) return act.setError('নাম ছোট করুন।')
    act.setError('')
    setCats([...cats, c])
    setNewCat('')
  }
  const dropCat = (c: string) => {
    if (cats.length <= 1) return act.setError('অন্তত একটা ধরন রাখতে হবে।')
    const n = (all.data ?? catalog).filter((p) => p.category === c).length
    if (n > 0) return act.setError(`"${c}" ধরনে এখনো ${bn(n)}টি পণ্য আছে। আগে পণ্যগুলো অন্য ধরনে নিন।`)
    act.setError('')
    setCats(cats.filter((x) => x !== c))
  }
  const move = (i: number, d: number) => {
    const next = [...cats]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    setCats(next)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const whatsapp = normalizePhone(f.whatsapp)
    const feeDhaka = toInt(f.feeDhaka)
    const feeOutside = toInt(f.feeOutside)
    const commissionPercent = toInt(f.commissionPercent)
    if (!/^01[3-9]\d{8}$/.test(whatsapp)) return act.setError('WhatsApp নম্বর ঠিক নেই।')
    if (!(feeDhaka >= 0 && feeDhaka <= 5000 && feeOutside >= 0 && feeOutside <= 5000)) return act.setError('ডেলিভারির টাকা ঠিক নেই।')
    if (!(commissionPercent >= 0 && commissionPercent <= 50)) return act.setError('কমিশন শূন্য থেকে পঞ্চাশের মধ্যে হবে।')
    const data: SiteSettings = { ...f, whatsapp, feeDhaka, feeOutside, commissionPercent, categories: cats, newIds, roomIds }
    void act.run(async () => { await api.put('/admin/settings', data); await refresh() }, 'রাখা হলো।')
  }

  const txt = (k: keyof typeof f, label: string, area = false) => (
    <Field id={`st-${k}`} label={label}>
      {area
        ? <textarea id={`st-${k}`} rows={3} value={String(f[k])} onChange={(e) => set(k, e.target.value)} className={`${INPUT} rounded-2xl`} />
        : <input id={`st-${k}`} value={String(f[k])} onChange={(e) => set(k, e.target.value)} className={INPUT} />}
    </Field>
  )

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      <Panel>
        <h2 className="text-2xl">দোকানের মুখ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{txt('announcement', 'ওপরের ঘোষণা')}</div>
          {txt('heroBadge', 'বড় ছবির ওপরের ছোট লেখা')}
          <Field id="st-hero" label="বড় ছবির পণ্য">
            <select id="st-hero" value={f.heroProductId} onChange={(e) => set('heroProductId', e.target.value)} className={INPUT}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          {txt('heroTitle', 'বড় শিরোনাম (নতুন লাইন = লাইন ভাঙা)', true)}
          {txt('heroText', 'বড় ছবির নিচের কথা', true)}
          <Field id="st-seller" label="এই সপ্তাহের কারিগর">
            <select id="st-seller" value={f.featuredSellerId} onChange={(e) => set('featuredSellerId', e.target.value)} className={INPUT}>
              {sellers.map((s) => <option key={s.id} value={s.id}>{s.shopName}</option>)}
            </select>
          </Field>
          {txt('footerLine', 'নিচের এক লাইন')}
        </div>
      </Panel>

      <Panel>
        <h2 className="text-2xl">যোগাযোগ, ডেলিভারি আর হিসাব</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="st-wa" label="WhatsApp নম্বর"><input id="st-wa" inputMode="tel" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={INPUT} /></Field>
          <Field id="st-comm" label="বাজারের অংশ (শতকরা)"><input id="st-comm" inputMode="numeric" value={f.commissionPercent} onChange={(e) => set('commissionPercent', e.target.value)} className={INPUT} /></Field>
          <Field id="st-fd" label="ডেলিভারি, ঢাকা (টাকা)"><input id="st-fd" inputMode="numeric" value={f.feeDhaka} onChange={(e) => set('feeDhaka', e.target.value)} className={INPUT} /></Field>
          <Field id="st-fo" label="ডেলিভারি, ঢাকার বাইরে (টাকা)"><input id="st-fo" inputMode="numeric" value={f.feeOutside} onChange={(e) => set('feeOutside', e.target.value)} className={INPUT} /></Field>
          {txt('daysDhaka', 'ঢাকায় কত দিনে')}
          {txt('daysOutside', 'ঢাকার বাইরে কত দিনে')}
        </div>
      </Panel>

      <Panel>
        <h2 className="text-2xl">ধরন</h2>
        <ul className="mt-3 space-y-2">
          {cats.map((c, i) => (
            <li key={c} className="flex items-center justify-between gap-3 rounded-full bg-cream-deep/60 py-1 pr-2 pl-4">
              <span>{c}</span>
              <span className="flex gap-1">
                <button type="button" aria-label={`${c} ওপরে নিন`} disabled={i === 0} onClick={() => move(i, -1)} className="h-9 w-9 rounded-full hover:bg-holud-soft disabled:opacity-30">↑</button>
                <button type="button" aria-label={`${c} নিচে নিন`} disabled={i === cats.length - 1} onClick={() => move(i, 1)} className="h-9 w-9 rounded-full hover:bg-holud-soft disabled:opacity-30">↓</button>
                <button type="button" aria-label={`${c} সরান`} onClick={() => dropCat(c)} className="h-9 w-9 rounded-full hover:bg-holud-soft">×</button>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-3">
          <input aria-label="নতুন ধরন" placeholder="নতুন ধরন" value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCat() } }} className={`${INPUT} !mt-0`} />
          <SmallBtn solid onClick={addCat}>যোগ করুন</SmallBtn>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-2xl">দোকানের তাক</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <PickList label="নতুন এসেছে" ids={newIds} max={4} options={products} onChange={setNewIds} />
          <PickList label="ঘর সাজাতে" ids={roomIds} max={5} options={products} onChange={setRoomIds} />
        </div>
      </Panel>

      <Alert text={act.error} />
      <Note text={act.done} />
      <div><button type="submit" disabled={act.busy} className={BTN}>রাখুন</button></div>
    </form>
  )
}
