import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { BD_DISTRICTS } from '../data/districts'
import { useCart } from '../store/cart'
import { useMarket, type Order } from '../store/market'
import { orderStatus, type OrderStatus } from '../lib/orders'
import { api, errorText } from '../lib/api'
import { useApi } from '../lib/useApi'
import { BTN, BTN_LINE, Field, INPUT, Panel } from '../components/Form'
import ProductCard from '../components/ProductCard'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { useTitle } from '../lib/useTitle'
import { StitchLine } from '../components/Stitch'

const dateBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
const monthBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })

const TABS = [['order', 'অর্ডার'], ['pochhondo', 'পছন্দের'], ['thikana', 'ঠিকানা'], ['tottho', 'তথ্য বদল']] as const
type Tab = (typeof TABS)[number][0]

const STATUSES: OrderStatus[] = ['নেওয়া হয়েছে', 'পাঠানো হয়েছে', 'পৌঁছেছে']

/** ক্রেতার নিজের পাতা: অর্ডার, পছন্দের জিনিস, ঠিকানা আর নিজের তথ্য */
export default function Account() {
  useTitle('আমার পাতা')
  const { user, ready, logout, mySeller } = useMarket()
  const { wishlist } = useCart()
  const [params, setParams] = useSearchParams()
  // কোন ভাগ খোলা, ঠিকানায় থাকে, তাই ব্যাক বাটনে আগের ভাগে ফেরা যায়
  const raw = params.get('bhag')
  const tab: Tab = TABS.some(([k]) => k === raw) ? (raw as Tab) : 'order'
  const orders = useApi<Order[]>(user ? '/me/orders' : null)

  if (!ready) return <MamaLoader full />
  if (!user) return <Navigate to="/login?next=/amar" replace />
  const initial = Array.from(user.name.trim())[0] ?? '?'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Panel>
        <div className="flex flex-wrap items-center gap-5">
          <span aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-rickshaw font-display text-4xl text-cream ring-4 ring-holud ring-offset-4 ring-offset-paper">
            {initial}
          </span>
          <div className="min-w-0">
            <h1 className="text-4xl">{user.name}</h1>
            <p className="mt-1 text-stone-600">{bn(user.phone)} · সদস্য {monthBn(user.createdAt)} থেকে</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="অর্ডার" value={orders.data ? `${bn(orders.data.length)}টি` : '…'} />
          <Stat label="পছন্দের" value={`${bn(wishlist.length)}টি`} />
          <Link to={mySeller ? '/bikreta/dokan' : '/bikreta'} className="flex flex-col-reverse rounded-[10px] bg-holud-soft/50 p-3 text-center hover:bg-holud-soft">
            <span className="text-sm text-stone-600">{mySeller ? (mySeller.status === 'approved' ? 'আমার দোকান' : 'যাচাই চলছে') : 'নিজের কাজ বেচুন'}</span>
            <span className="font-display text-lg leading-snug break-words text-kolapata sm:text-2xl">{mySeller ? mySeller.shopName : 'বিক্রেতা হোন'}</span>
          </Link>
        </dl>
      </Panel>

      <div role="tablist" className="no-scrollbar mt-8 flex gap-1 overflow-x-auto">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setParams(k === 'order' ? {} : { bhag: k })}
            className={`shrink-0 rounded-full px-5 py-2 ${tab === k ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'order' && (orders.loading ? <MamaLoader /> : orders.error ? <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{orders.error}</p> : <Orders list={orders.data ?? []} reload={orders.reload} />)}
        {tab === 'pochhondo' && <Wishlist />}
        {tab === 'thikana' && <AddressForm key={user.id} />}
        {tab === 'tottho' && <InfoForm key={user.id} />}
      </div>

      <button type="button" onClick={() => void logout()} className={`mt-12 ${BTN_LINE}`}>বের হোন</button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse rounded-[10px] bg-cream-deep/60 p-3 text-center">
      <dt className="text-sm text-stone-600">{label}</dt>
      <dd className="font-display text-xl text-rickshaw sm:text-2xl">{value}</dd>
    </div>
  )
}

function Orders({ list, reload }: { list: Order[]; reload: () => void }) {
  const { sellers } = useMarket()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  // হাতে পেয়েছি বা বাতিল। শেষে তালিকা নতুন করে আনে।
  const act = async (id: string, what: 'received' | 'cancel') => {
    if (what === 'cancel' && !window.confirm('এই অর্ডার বাতিল করবেন?')) return
    setError('')
    setBusy(id)
    try {
      await api.post(`/orders/${id}/${what}`)
      reload()
    } catch (e) {
      setError(errorText(e))
    }
    setBusy('')
  }
  if (list.length === 0) {
    return (
      <Panel>
        <MamaScene kind="khali" title="এখনো কোনো অর্ডার নেই" text="মামা ঝুড়ি নিয়ে বসে আছেন।">
          <Link to="/shop" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
        </MamaScene>
      </Panel>
    )
  }
  const shopOf = (id: string) => sellers.find((s) => s.id === id)?.shopName ?? 'বিক্রেতা'

  return (
    <div>
    {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
    <ul className="space-y-5">
      {list.map((o) => {
        const status = orderStatus(o)
        const cancelled = o.status === 'cancelled'
        const at = STATUSES.indexOf(status)
        return (
          <li key={o.id}>
            <Panel>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg">অর্ডার <span className="text-rickshaw">{bn(o.id)}</span></p>
                <p className="text-sm text-stone-600">{dateBn(o.createdAt)}</p>
              </div>

              {/* অর্ডার কোথায় আছে */}
              {cancelled ? (
                <p className="mt-4 rounded-full bg-cream-deep px-2 py-1.5 text-center text-sm text-stone-500">বাতিল হয়েছে</p>
              ) : (
                <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-sm" aria-label={`অবস্থা: ${status}`}>
                  {STATUSES.map((s, i) => (
                    <li key={s} className={`rounded-full px-2 py-1.5 ${i <= at ? 'bg-kolapata text-white' : 'bg-cream-deep text-stone-500'}`}>{s}</li>
                  ))}
                </ol>
              )}

              <StitchLine className="my-4" />
              <ul className="space-y-2">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span>
                      {it.nameBn} <span className="text-stone-500">× {bn(it.qty)}</span>
                      <span className="block text-sm text-stone-500">
                        {shopOf(it.sellerId)}{o.sentBy.includes(it.sellerId) ? ' · পাঠিয়েছেন' : ''}
                      </span>
                    </span>
                    <span className="shrink-0">{formatBDT(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 flex justify-between text-sm text-stone-600"><span>ডেলিভারি</span><span>{formatBDT(o.deliveryFee)}</span></p>
              <p className="mt-1 flex justify-between text-lg"><span>সব মিলিয়ে</span><span className="text-rickshaw">{formatBDT(o.total)}</span></p>
              <p className="mt-2 text-sm text-stone-600">{o.address}, {o.district}</p>
              {o.courier && <p className="mt-1 text-sm text-stone-600">কুরিয়ার: {o.courier}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {o.status === 'sent' && (
                  <button type="button" disabled={busy === o.id} onClick={() => act(o.id, 'received')} className="rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white disabled:opacity-60">
                    হাতে পেয়েছি
                  </button>
                )}
                {o.status === 'placed' && o.sentBy.length === 0 && (
                  <button type="button" disabled={busy === o.id} onClick={() => act(o.id, 'cancel')} className="text-sm text-stone-500 underline hover:text-rickshaw disabled:opacity-60">
                    অর্ডার বাতিল করুন
                  </button>
                )}
              </div>
            </Panel>
          </li>
        )
      })}
    </ul>
    </div>
  )
}

function Wishlist() {
  const { wishlist } = useCart()
  const { catalog } = useMarket()
  const items = catalog.filter((p) => wishlist.includes(p.id))
  if (items.length === 0) {
    return (
      <Panel>
        <p>পছন্দের তালিকা খালি। পণ্যের পাশে ♥ চাপলে এখানে জমা হবে।</p>
        <Link to="/shop" className="mt-4 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
      </Panel>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

function AddressForm() {
  const { user, updateProfile } = useMarket()
  const [district, setDistrict] = useState(user?.district ?? 'ঢাকা')
  const [address, setAddress] = useState(user?.address ?? '')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim().length < 8) { setMsg(''); return setError('পুরো ঠিকানা লিখুন: বাসা, রাস্তা, এলাকা।') }
    const err = await updateProfile({ district, address: address.trim() })
    if (err) { setMsg(''); return setError(err) }
    setError('')
    setMsg('ঠিকানা রাখা হলো। ঝুড়িতে এটাই বসে যাবে।')
  }

  return (
    <Panel className="max-w-2xl">
      <h2 className="text-2xl">ডেলিভারির ঠিকানা</h2>
      <form className="mt-4 grid gap-4" noValidate onSubmit={submit}>
        <Field id="a-district" label="জেলা">
          <select id="a-district" value={district} onChange={(e) => setDistrict(e.target.value)} className={INPUT}>
            {BD_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field id="a-address" label="ঠিকানা">
          <textarea id="a-address" rows={2} placeholder="বাসা, রাস্তা, এলাকা" value={address} onChange={(e) => setAddress(e.target.value)} className={`${INPUT} rounded-2xl`} />
        </Field>
        {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
        {msg && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{msg}</p>}
        <div><button type="submit" className={BTN}>ঠিকানা রাখুন</button></div>
      </form>
    </Panel>
  )
}

function InfoForm() {
  const { user, updateProfile, changePassword } = useMarket()
  const [name, setName] = useState(user?.name ?? '')
  const [nameMsg, setNameMsg] = useState('')
  const [pass, setPass] = useState({ old: '', next: '' })
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 3) return setNameMsg('নাম লিখুন, অন্তত তিন অক্ষর।')
    const err = await updateProfile({ name: name.trim() })
    setNameMsg(err ?? 'নাম বদলে গেছে।')
  }

  const savePass = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg('')
    if (pass.next.length < 6) return setPassError('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের দিন।')
    const err = await changePassword(pass.old, pass.next)
    if (err) return setPassError(err)
    setPassError('')
    setPass({ old: '', next: '' })
    setPassMsg('পাসওয়ার্ড বদলে গেছে।')
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel>
        <h2 className="text-2xl">নাম</h2>
        <form className="mt-4 grid gap-4" noValidate onSubmit={saveName}>
          <Field id="i-name" label="আপনার নাম">
            <input id="i-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          </Field>
          <p className="text-sm text-stone-600">মোবাইল নম্বর {bn(user?.phone ?? '')} দিয়ে ঢোকেন, তাই এটা বদলানো যায় না।</p>
          {nameMsg && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{nameMsg}</p>}
          <div><button type="submit" className={BTN}>নাম রাখুন</button></div>
        </form>
      </Panel>
      <Panel>
        <h2 className="text-2xl">পাসওয়ার্ড</h2>
        <form className="mt-4 grid gap-4" noValidate onSubmit={savePass}>
          <Field id="i-old" label="আগের পাসওয়ার্ড">
            <input id="i-old" type="password" autoComplete="current-password" value={pass.old} onChange={(e) => setPass({ ...pass, old: e.target.value })} className={INPUT} />
          </Field>
          <Field id="i-new" label="নতুন পাসওয়ার্ড">
            <input id="i-new" type="password" autoComplete="new-password" value={pass.next} onChange={(e) => setPass({ ...pass, next: e.target.value })} className={INPUT} />
          </Field>
          {passError && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{passError}</p>}
          {passMsg && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{passMsg}</p>}
          <div><button type="submit" className={BTN}>পাসওয়ার্ড বদলান</button></div>
        </form>
      </Panel>
    </div>
  )
}

