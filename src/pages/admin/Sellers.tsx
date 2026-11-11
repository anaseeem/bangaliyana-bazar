import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BD_DISTRICTS, normalizePhone } from '../../data/districts'
import { bn, type Product } from '../../data/products'
import type { Seller } from '../../data/sellers'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { useMarket } from '../../store/market'
import { BTN, Field, INPUT, Panel } from '../../components/Form'
import { toInt, useAction, useAdmin } from './kit'
import { Alert, Chip, LinkBtn, Load, SmallBtn } from './shared'

type Status = Seller['status']
const STATUS: Record<Status, [string, 'soft' | 'green' | 'red' | 'grey']> = {
  pending: ['অপেক্ষায়', 'red'], approved: ['চালু', 'green'], rejected: ['ফিরিয়ে দেওয়া', 'grey'], paused: ['বন্ধ', 'grey'],
}

export default function Sellers() {
  const { refresh } = useMarket()
  const { reloadSummary } = useAdmin()
  const sellers = useApi<Seller[]>('/admin/sellers')
  const products = useApi<Product[]>('/admin/products')
  const act = useAction()
  // 'new' = নতুন কারিগর, নইলে বদলানো বিক্রেতার আইডি
  const [editing, setEditing] = useState<string | null>(null)

  const list = sellers.data ?? []
  const countOf = (id: string) => (products.data ?? []).filter((p) => p.sellerId === id).length
  const changed = () => { sellers.reload(); reloadSummary(); void refresh() }
  const setStatus = (s: Seller, status: Status) => void act.run(async () => { await api.patch(`/admin/sellers/${s.id}`, { status }); changed() })
  const waiting = list.filter((s) => s.status === 'pending')
  const rest = list.filter((s) => s.status !== 'pending')
  const target = editing && editing !== 'new' ? list.find((s) => s.id === editing) : undefined

  const row = (s: Seller) => (
    <li key={s.id}>
      <Panel className="!p-4 sm:!p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg">{s.shopName}</p>
            <p className="text-stone-600">{s.ownerName} · {s.craft} · {s.district}</p>
            <p className="text-stone-600">{bn(s.phone)} · {bn(countOf(s.id))}টি পণ্য</p>
          </div>
          <Chip tone={STATUS[s.status][1]}>{STATUS[s.status][0]}</Chip>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {(s.status === 'pending' || s.status === 'rejected') && <SmallBtn solid disabled={act.busy} onClick={() => setStatus(s, 'approved')}>অনুমোদন দিন</SmallBtn>}
          {s.status === 'pending' && <SmallBtn disabled={act.busy} onClick={() => setStatus(s, 'rejected')}>ফিরিয়ে দিন</SmallBtn>}
          {s.status === 'approved' && <SmallBtn disabled={act.busy} onClick={() => setStatus(s, 'paused')}>বন্ধ রাখুন</SmallBtn>}
          {s.status === 'paused' && <SmallBtn solid disabled={act.busy} onClick={() => setStatus(s, 'approved')}>চালু করুন</SmallBtn>}
          <LinkBtn onClick={() => { setEditing(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>বদলান</LinkBtn>
          <Link to={`/dokan/${s.id}`} className="text-rickshaw underline">দোকান দেখুন</Link>
        </div>
      </Panel>
    </li>
  )

  return (
    <div className="space-y-6">
      {editing && (editing === 'new' || target) && (
        <ShopForm key={editing} seller={target ?? null} onDone={() => { setEditing(null); changed() }} onCancel={() => setEditing(null)} />
      )}
      {!editing && <button type="button" onClick={() => setEditing('new')} className={BTN}>নতুন কারিগর যোগ করুন</button>}
      <Alert text={act.error} />
      <Load q={sellers}>
        <section>
          <h2 className="text-2xl">অপেক্ষায়</h2>
          {waiting.length === 0 ? <p className="mt-2 text-stone-600">কেউ অপেক্ষায় নেই।</p> : <ul className="mt-3 grid gap-3 lg:grid-cols-2">{waiting.map(row)}</ul>}
        </section>
        <section>
          <h2 className="text-2xl">সব বিক্রেতা</h2>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">{rest.map(row)}</ul>
        </section>
      </Load>
    </div>
  )
}

/** দোকানের তথ্য বদলানো, বা অ্যাকাউন্ট ছাড়া কারিগর যোগ করা */
function ShopForm({ seller, onDone, onCancel }: { seller: Seller | null; onDone: () => void; onCancel: () => void }) {
  const act = useAction()
  const [f, setF] = useState({
    shopName: seller?.shopName ?? '', ownerName: seller?.ownerName ?? '', craft: seller?.craft ?? '', district: seller?.district ?? 'ঢাকা',
    story: seller?.story ?? '', phone: bn(seller?.phone ?? ''), years: seller?.years !== undefined ? bn(seller.years) : '',
  })
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const phone = normalizePhone(f.phone)
    const years = f.years.trim() === '' ? undefined : toInt(f.years)
    if (f.shopName.trim().length < 3) return act.setError('দোকানের নাম লিখুন।')
    if (f.ownerName.trim().length < 2) return act.setError('মালিকের নাম লিখুন।')
    if (f.craft.trim().length < 2) return act.setError('কী বানান, লিখুন।')
    if (f.story.trim().length < 20) return act.setError('কাজের কথা দুই-এক লাইনে লিখুন।')
    if (!/^01[3-9]\d{8}$/.test(phone)) return act.setError('WhatsApp নম্বর ঠিক নেই।')
    if (years !== undefined && !(years >= 0 && years <= 100)) return act.setError('বছরের সংখ্যা ঠিক নেই।')
    const data = { shopName: f.shopName.trim(), ownerName: f.ownerName.trim(), craft: f.craft.trim(), district: f.district, story: f.story.trim(), phone, ...(years !== undefined && { years }) }
    void act.run(async () => {
      if (seller) await api.patch(`/admin/sellers/${seller.id}`, data)
      else await api.post('/admin/sellers', data)
      onDone()
    })
  }

  return (
    <Panel>
      <h2 className="text-2xl">{seller ? 'দোকানের তথ্য বদলান' : 'নতুন কারিগর যোগ করুন'}</h2>
      {!seller && <p className="mt-1 text-stone-600">যাঁর অ্যাকাউন্ট নেই, তাঁর দোকান এখান থেকে খোলা যায়।</p>}
      <form className="mt-4 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit}>
        <Field id="as-shop" label="দোকানের নাম"><input id="as-shop" value={f.shopName} onChange={(e) => set('shopName', e.target.value)} className={INPUT} /></Field>
        <Field id="as-owner" label="মালিকের নাম"><input id="as-owner" value={f.ownerName} onChange={(e) => set('ownerName', e.target.value)} className={INPUT} /></Field>
        <Field id="as-craft" label="কী বানান"><input id="as-craft" value={f.craft} onChange={(e) => set('craft', e.target.value)} className={INPUT} /></Field>
        <Field id="as-district" label="জেলা">
          <select id="as-district" value={f.district} onChange={(e) => set('district', e.target.value)} className={INPUT}>
            {BD_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field id="as-phone" label="WhatsApp নম্বর"><input id="as-phone" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} className={INPUT} /></Field>
        <Field id="as-years" label="কত বছর ধরে কাজ করছেন"><input id="as-years" inputMode="numeric" value={f.years} onChange={(e) => set('years', e.target.value)} className={INPUT} /></Field>
        <div className="sm:col-span-2">
          <Field id="as-story" label="কাজের গল্প"><textarea id="as-story" rows={3} value={f.story} onChange={(e) => set('story', e.target.value)} className={`${INPUT} rounded-2xl`} /></Field>
        </div>
        <div className="sm:col-span-2"><Alert text={act.error} /></div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" disabled={act.busy} className={BTN}>{seller ? 'বদল রাখুন' : 'যোগ করুন'}</button>
          <button type="button" onClick={onCancel} className="text-stone-600 underline hover:text-rickshaw">থাক</button>
        </div>
      </form>
    </Panel>
  )
}
