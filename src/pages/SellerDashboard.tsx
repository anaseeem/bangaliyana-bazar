import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { bn, formatBDT, type Product } from '../data/products'
import { BD_DISTRICTS, normalizePhone } from '../data/districts'
import { asciiDigits, shrinkImage } from '../lib/local'
import { api, errorText, uploadImage } from '../lib/api'
import { useApi } from '../lib/useApi'
import { whatsappLink } from '../lib/whatsapp'
import { useMarket, type OrderItem } from '../store/market'
import { BTN, Field, INPUT, Panel } from '../components/Form'
import { MamaLoader } from '../components/MamaScenes'
import ProductPicture from '../components/ProductPicture'
import { StitchLine } from '../components/Stitch'

const dateBn = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })

/** শুধু এই বিক্রেতার অংশ, সার্ভার যেভাবে দেয় */
interface SellerOrder {
  id: string
  name: string
  phone: string
  district: string
  address: string
  items: OrderItem[]
  total: number
  status: 'placed' | 'sent' | 'delivered' | 'cancelled'
  sent: boolean
  createdAt: string
}
interface Payouts {
  earned: number
  commission: number
  paid: number
  due: number
  payouts: { id: string; amount: number; note: string; createdAt: string }[]
}

const emptyForm = (category: string) => ({ nameBn: '', price: '', stock: '', category, description: '', story: '', photo: '' })

const toForm = (p: Product) => ({
  nameBn: p.nameBn, price: bn(p.price), stock: bn(p.stock), category: p.category,
  description: p.description, story: p.story, photo: p.photo ?? '',
})

const ERR = 'rounded-md bg-red-50 px-4 py-3 text-rickshaw'

export default function SellerDashboard() {
  const { user, mySeller, ready, settings } = useMarket()

  if (!ready) return <MamaLoader full />
  if (!user) return <Navigate to="/login?next=/bikreta/dokan" replace />
  if (!mySeller) return <Navigate to="/bikreta" replace />

  if (mySeller.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Panel>
          <h1 className="text-3xl">যাচাই চলছে</h1>
          <p className="mt-3 text-lg">{mySeller.shopName} দোকানের তথ্য আমরা পেয়েছি। দেখে অনুমোদন দিলে আপনি পণ্য তুলতে পারবেন।</p>
          <p className="mt-2 text-stone-600">সাধারণত এক দিনের মধ্যে হয়ে যায়।</p>
        </Panel>
      </div>
    )
  }
  if (mySeller.status === 'rejected') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Panel>
          <h1 className="text-3xl">{mySeller.shopName}</h1>
          <p className="mt-3 text-lg">আপনার দোকান অনুমোদন পায়নি। জানতে দোকানে যোগাযোগ করুন।</p>
          <a
            href={whatsappLink(`আসসালামু আলাইকুম। বাঙালিয়ানা বাজারে আমার দোকান "${mySeller.shopName}" অনুমোদন পায়নি। কারণটা জানতে চাই।`, undefined, settings.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-full border-2 border-kolapata px-5 py-2 text-kolapata hover:bg-kolapata hover:text-white"
          >
            WhatsApp-এ লিখুন
          </a>
        </Panel>
      </div>
    )
  }
  if (mySeller.status === 'paused') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Panel>
          <h1 className="text-3xl">{mySeller.shopName}</h1>
          <p className="mt-3 text-lg">দোকান আপাতত বন্ধ রাখা হয়েছে।</p>
        </Panel>
      </div>
    )
  }
  return <Dashboard />
}

type Tab = 'ponno' | 'order' | 'paona' | 'tottho'

function Dashboard() {
  const { mySeller, settings, refresh } = useMarket()
  const [tab, setTab] = useState<Tab>('ponno')
  const first = settings.categories[0] ?? 'লোকশিল্প'
  const [form, setForm] = useState(() => emptyForm(first))
  // কোন পণ্য বদলানো হচ্ছে; না থাকলে নতুন পণ্য
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const products = useApi<Product[]>('/seller/products')
  const orders = useApi<SellerOrder[]>('/seller/orders')
  const payouts = useApi<Payouts>(tab === 'paona' ? '/seller/payouts' : null)

  if (!mySeller) return null
  if (products.loading || orders.loading) return <MamaLoader full />
  const mine = products.data ?? []
  const myOrders = orders.data ?? []
  const live = myOrders.filter((o) => o.status !== 'cancelled')
  const sales = live.reduce((s, o) => s + o.total, 0)

  const fail = (e: unknown) => setError(errorText(e))

  const pickPhoto = async (file?: File) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(await shrinkImage(file, 1000))
      setForm((f) => ({ ...f, photo: url }))
    } catch (e) {
      // shrinkImage ছবি খুলতে না পারলে Error('image') ছোড়ে
      setError(e instanceof Error && e.message === 'image' ? 'ছবিটা খোলা গেল না। অন্য ছবি দিন।' : errorText(e))
    }
    setUploading(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(asciiDigits(form.price))
    const stock = Number(asciiDigits(form.stock))
    if (form.nameBn.trim().length < 3) return setError('পণ্যের নাম লিখুন।')
    if (!Number.isInteger(price) || price < 50) return setError('দাম ঠিক নেই। অন্তত ৳৫০।')
    if (form.stock.trim() === '' || !Number.isInteger(stock) || stock < (editing ? 0 : 1)) return setError('কয়টা আছে, লিখুন।')
    if (form.description.trim().length < 10) return setError('পণ্যটা নিয়ে এক লাইন লিখুন।')
    const data = {
      nameBn: form.nameBn.trim(), price, stock, category: form.category,
      description: form.description.trim(), story: form.story.trim() || form.description.trim(),
      photo: form.photo,
    }
    setBusy(true)
    try {
      if (editing) await api.patch(`/seller/products/${editing}`, data)
      else await api.post('/seller/products', data)
    } catch (err) {
      setBusy(false)
      return fail(err)
    }
    setBusy(false)
    setForm(emptyForm(first))
    setEditing(null)
    setError('')
    setSaved(editing ? 'বদল রাখা হলো।' : 'পণ্য উঠে গেছে। এখন বাজারে দেখা যাচ্ছে।')
    window.setTimeout(() => setSaved(''), 2500)
    products.reload()
    void refresh()
  }

  const startEdit = (p: Product) => {
    setEditing(p.id)
    setForm(toForm(p))
    setError('')
    setSaved('')
    document.getElementById('pname')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm(first)); setError('') }

  const toggleHidden = async (p: Product) => {
    setError('')
    try { await api.patch(`/seller/products/${p.id}`, { hidden: !p.hidden }) } catch (e) { return fail(e) }
    products.reload()
    void refresh()
  }

  const removeProduct = async (p: Product) => {
    if (!window.confirm(`"${p.nameBn}" সরিয়ে দেবেন?`)) return
    setError('')
    try { await api.del(`/seller/products/${p.id}`) } catch (e) { return fail(e) }
    if (editing === p.id) cancelEdit()
    products.reload()
    void refresh()
  }

  const markSent = async (id: string) => {
    setError('')
    try { await api.post(`/seller/orders/${id}/sent`) } catch (e) { return fail(e) }
    orders.reload()
  }

  const tabBtn = (t: Tab, label: string) => (
    <button type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`shrink-0 rounded-full px-5 py-2 ${tab === t ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>{label}</button>
  )
  const categories = settings.categories.includes(form.category) ? settings.categories : [form.category, ...settings.categories]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">{mySeller.shopName}</h1>
          <p className="mt-1 text-stone-600">{mySeller.craft}, {mySeller.district}</p>
        </div>
        <Link to={`/dokan/${mySeller.id}`} className="text-rickshaw underline">ক্রেতারা যেমন দেখেন</Link>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[['পণ্য', bn(mine.length)], ['অর্ডার', bn(live.length)], ['বিক্রি', formatBDT(sales)]].map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse rounded-[10px] bg-paper p-4 text-center">
            <dt className="text-sm text-stone-600">{k}</dt>
            <dd className="font-display text-2xl text-rickshaw sm:text-3xl">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="no-scrollbar mt-6 flex max-w-full gap-1 overflow-x-auto rounded-full border-2 border-amber-300 p-1 sm:inline-flex">
        {tabBtn('ponno', 'পণ্য')}
        {tabBtn('order', 'অর্ডার')}
        {tabBtn('paona', 'পাওনা')}
        {tabBtn('tottho', 'দোকানের তথ্য')}
      </div>

      {error && tab !== 'ponno' && <p role="alert" className={`mt-4 ${ERR}`}>{error}</p>}

      {tab === 'ponno' && (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Panel>
            <h2 className="text-2xl">{editing ? 'পণ্য বদলান' : 'নতুন পণ্য তুলুন'}</h2>
            <form className="mt-4 grid gap-4" noValidate onSubmit={submit}>
              <Field id="pname" label="পণ্যের নাম">
                <input id="pname" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className={INPUT} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id="price" label="দাম (টাকা)">
                  <input id="price" inputMode="numeric" placeholder="১২০০" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={INPUT} />
                </Field>
                <Field id="stock" label="কয়টা আছে">
                  <input id="stock" inputMode="numeric" placeholder="৫" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={INPUT} />
                </Field>
              </div>
              <Field id="cat" label="ধরন">
                <select id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={INPUT}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field id="desc" label="পণ্যটা কেমন">
                <textarea id="desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${INPUT} rounded-2xl`} />
              </Field>
              <Field id="pstory" label="বানানোর গল্প">
                <textarea id="pstory" rows={2} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} placeholder="কত দিন লাগল, কী দিয়ে বানালেন" className={`${INPUT} rounded-2xl`} />
              </Field>
              <div>
                <p>ছবি</p>
                {/* ব্রাউজারের নিজের বোতামে ইংরেজি লেখা থাকে, তাই নিজের বোতাম */}
                <label htmlFor="photo" className="mt-1 inline-block cursor-pointer rounded-full bg-holud px-5 py-2 hover:bg-amber-400">
                  {form.photo ? 'অন্য ছবি দিন' : 'ছবি বাছাই করুন'}
                </label>
                <input id="photo" type="file" accept="image/*" onChange={(e) => { void pickPhoto(e.target.files?.[0]); e.target.value = '' }} className="sr-only" />
                {uploading && <p role="status" className="mt-2 text-stone-600">ছবি উঠছে…</p>}
                {form.photo && !uploading && <img src={form.photo} alt="" className="mt-3 h-32 w-full rounded object-cover" />}
              </div>
              {error && <p role="alert" className={ERR}>{error}</p>}
              {saved && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{saved}</p>}
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={busy || uploading} className={BTN}>{editing ? 'বদল রাখুন' : 'পণ্য তুলুন'}</button>
                {editing && <button type="button" onClick={cancelEdit} className="text-stone-600 underline hover:text-rickshaw">থাক</button>}
              </div>
            </form>
          </Panel>

          <div>
            <h2 className="text-2xl">আমার পণ্য</h2>
            {mine.length === 0 ? (
              <p className="mt-3 text-stone-600">এখনো কোনো পণ্য তোলেননি।</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {mine.map((p) => (
                  <li key={p.id} className={`flex items-center gap-4 rounded-[10px] bg-paper p-3 ${editing === p.id ? 'ring-2 ring-holud' : ''}`}>
                    <ProductPicture product={p} className={`h-16 w-20 shrink-0 rounded ${p.hidden ? 'opacity-50' : ''}`} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${p.id}`} className="hover:text-rickshaw">{p.nameBn}</Link>
                      <p className="text-sm text-stone-600">
                        {formatBDT(p.price)} · {p.stock > 0 ? `${bn(p.stock)}টি আছে` : 'স্টক শেষ'}{p.hidden ? ' · লুকানো' : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button type="button" onClick={() => startEdit(p)} className="text-sm text-rickshaw underline">বদলান</button>
                      <button type="button" onClick={() => toggleHidden(p)} className="text-sm text-stone-500 underline hover:text-rickshaw">{p.hidden ? 'দেখান' : 'লুকান'}</button>
                      <button type="button" onClick={() => removeProduct(p)} className="text-sm text-stone-500 underline hover:text-rickshaw">সরান</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'order' && (
        <div className="mt-6">
          {myOrders.length === 0 ? (
            <p className="text-stone-600">এখনো কোনো অর্ডার আসেনি।</p>
          ) : (
            <ul className="space-y-4">
              {myOrders.map((o) => (
                <li key={o.id}>
                  <Panel>
                    <div className="flex flex-wrap justify-between gap-2">
                      <p className="text-lg">অর্ডার <span className="text-rickshaw">{bn(o.id)}</span></p>
                      <p className="text-stone-600">{o.name}, {bn(o.phone)}, {o.district}</p>
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
                    <p className="mt-2 text-sm text-stone-600">{o.address}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {o.status === 'cancelled' ? (
                        <span className="rounded-full bg-cream-deep px-4 py-1.5 text-stone-500">বাতিল হয়েছে</span>
                      ) : o.status === 'delivered' ? (
                        <span className="rounded-full bg-kolapata px-4 py-1.5 text-white">ক্রেতা পেয়েছেন</span>
                      ) : o.sent ? (
                        <span className="rounded-full bg-kolapata px-4 py-1.5 text-white">পাঠিয়েছেন</span>
                      ) : (
                        <button type="button" onClick={() => markSent(o.id)} className="rounded-full bg-holud px-5 py-2 hover:bg-amber-400">পাঠিয়ে দিয়েছি</button>
                      )}
                    </div>
                  </Panel>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'paona' && (
        <div className="mt-6">
          {payouts.loading ? <MamaLoader /> : payouts.error ? <p role="alert" className={ERR}>{payouts.error}</p> : payouts.data && (
            <>
              <dl className="grid grid-cols-3 gap-3">
                {[['মোট বিক্রি', payouts.data.earned], ['পেয়েছেন', payouts.data.paid], ['পাওনা', payouts.data.due]].map(([k, v]) => (
                  <div key={k} className="flex flex-col-reverse rounded-[10px] bg-paper p-4 text-center">
                    <dt className="text-sm text-stone-600">{k}</dt>
                    <dd className="font-display text-2xl text-rickshaw sm:text-3xl">{formatBDT(Number(v))}</dd>
                  </div>
                ))}
              </dl>
              {payouts.data.commission > 0 && <p className="mt-3 text-stone-600">বাজারের অংশ {formatBDT(payouts.data.commission)}</p>}
              {payouts.data.payouts.length === 0 ? (
                <p className="mt-6 text-stone-600">এখনো কোনো টাকা দেওয়া হয়নি।</p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {payouts.data.payouts.map((x) => (
                    <li key={x.id} className="flex items-baseline justify-between gap-3 rounded-[10px] bg-paper p-3">
                      <span>
                        {dateBn(x.createdAt)}
                        {x.note && <span className="block text-sm text-stone-600">{x.note}</span>}
                      </span>
                      <span className="shrink-0 text-rickshaw">{formatBDT(x.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'tottho' && <ShopForm key={mySeller.id} />}
    </div>
  )
}

/** দোকানের নাম, গল্প, জেলা আর WhatsApp বদলানো */
function ShopForm() {
  const { mySeller, updateShop } = useMarket()
  const [form, setForm] = useState({
    shopName: mySeller?.shopName ?? '', craft: mySeller?.craft ?? '', district: mySeller?.district ?? 'ঢাকা',
    story: mySeller?.story ?? '', phone: bn(mySeller?.phone ?? ''),
  })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    if (form.shopName.trim().length < 3) return setError('দোকানের নাম লিখুন।')
    if (form.craft.trim().length < 2) return setError('কী বানান, লিখুন।')
    if (form.story.trim().length < 20) return setError('নিজের কাজের কথা দুই-এক লাইনে লিখুন।')
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(form.phone))) return setError('WhatsApp নম্বর ঠিক নেই।')
    setBusy(true)
    const err = await updateShop({ shopName: form.shopName.trim(), craft: form.craft.trim(), district: form.district, story: form.story.trim(), phone: normalizePhone(form.phone) })
    setBusy(false)
    if (err) return setError(err)
    setError('')
    setSaved(true)
  }

  return (
    <Panel className="mt-6 max-w-3xl">
      <h2 className="text-2xl">দোকানের তথ্য</h2>
      <p className="mt-1 text-stone-600">ক্রেতারা আপনার দোকানের পাতায় এগুলো দেখেন।</p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit}>
        <Field id="s-shop" label="দোকানের নাম">
          <input id="s-shop" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className={INPUT} />
        </Field>
        <Field id="s-craft" label="কী বানান">
          <input id="s-craft" value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} className={INPUT} />
        </Field>
        <Field id="s-district" label="জেলা">
          <select id="s-district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={INPUT}>
            {BD_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field id="s-wa" label="WhatsApp নম্বর">
          <input id="s-wa" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={INPUT} />
        </Field>
        <div className="sm:col-span-2">
          <Field id="s-story" label="আপনার কাজের গল্প">
            <textarea id="s-story" rows={3} value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} className={`${INPUT} rounded-2xl`} />
          </Field>
        </div>
        {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw sm:col-span-2">{error}</p>}
        {saved && <p role="status" className="rounded-md bg-holud-soft px-4 py-3 sm:col-span-2">তথ্য বদলে গেছে।</p>}
        <div className="sm:col-span-2"><button type="submit" disabled={busy} className={BTN}>তথ্য রাখুন</button></div>
      </form>
    </Panel>
  )
}
