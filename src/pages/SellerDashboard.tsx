import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CATEGORIES, bn, formatBDT, type Product } from '../data/products'
import { BD_DISTRICTS, normalizePhone } from '../data/districts'
import { asciiDigits, shrinkImage } from '../lib/local'
import { useMarket } from '../store/market'
import { orderStatus } from '../lib/orders'
import { BTN, Field, INPUT, Panel } from '../components/Form'
import ProductPicture from '../components/ProductPicture'
import { StitchLine } from '../components/Stitch'

const EMPTY = { nameBn: '', price: '', stock: '', category: 'কাঁথা', description: '', story: '', photo: '' }

const toForm = (p: Product) => ({
  nameBn: p.nameBn, price: bn(p.price), stock: bn(p.stock), category: p.category,
  description: p.description, story: p.story, photo: p.photo ?? '',
})

export default function SellerDashboard() {
  const { user, mySeller, sellerProducts, addProduct, updateProduct, removeProduct, orders, markSent } = useMarket()
  const [tab, setTab] = useState<'ponno' | 'order' | 'tottho'>('ponno')
  const [form, setForm] = useState(EMPTY)
  // কোন পণ্য বদলানো হচ্ছে; না থাকলে নতুন পণ্য
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  if (!user) return <Navigate to="/login?next=/bikreta/dokan" replace />
  if (!mySeller) return <Navigate to="/bikreta" replace />

  if (mySeller.status === 'pending') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Panel>
          <h1 className="text-3xl">যাচাই চলছে</h1>
          <p className="mt-3 text-lg">{mySeller.shopName} দোকানের তথ্য আমরা পেয়েছি। দেখে অনুমোদন দিলে আপনি পণ্য তুলতে পারবেন।</p>
          <p className="mt-2 text-stone-600">সাধারণত এক দিনের মধ্যে হয়ে যায়।</p>
          <Link to="/admin" className="mt-6 inline-block text-sm text-stone-500 underline">ডেমো: অনুমোদনের পাতা</Link>
        </Panel>
      </div>
    )
  }

  const mine = sellerProducts.filter((p) => p.sellerId === mySeller.id)
  // শুধু এই দোকানের অংশটুকু
  const myOrders = orders
    .map((o) => ({ ...o, items: o.items.filter((it) => it.sellerId === mySeller.id) }))
    .filter((o) => o.items.length > 0)
    .reverse()
  const sales = myOrders.reduce((s, o) => s + o.items.reduce((t, it) => t + it.price * it.qty, 0), 0)

  const pickPhoto = async (file?: File) => {
    if (!file) return
    try { setForm((f) => ({ ...f, photo: '' })); const photo = await shrinkImage(file); setForm((f) => ({ ...f, photo })) } catch { setError('ছবিটা খোলা গেল না। অন্য ছবি দিন।') }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(asciiDigits(form.price))
    const stock = Number(asciiDigits(form.stock))
    if (form.nameBn.trim().length < 3) return setError('পণ্যের নাম লিখুন।')
    if (!Number.isInteger(price) || price < 50) return setError('দাম ঠিক নেই। অন্তত ৳৫০।')
    if (!Number.isInteger(stock) || stock < 1) return setError('কয়টা আছে, লিখুন।')
    if (form.description.trim().length < 10) return setError('পণ্যটা নিয়ে এক লাইন লিখুন।')
    const data = {
      nameBn: form.nameBn.trim(), price, stock, category: form.category,
      description: form.description.trim(), story: form.story.trim() || form.description.trim(),
      photo: form.photo || undefined,
    }
    if (editing) updateProduct(editing, data)
    else addProduct(data)
    setForm(EMPTY)
    setEditing(null)
    setError('')
    setSaved(editing ? 'বদল রাখা হলো।' : 'পণ্য উঠে গেছে। এখন বাজারে দেখা যাচ্ছে।')
    window.setTimeout(() => setSaved(''), 2500)
  }

  const startEdit = (p: Product) => {
    setEditing(p.id)
    setForm(toForm(p))
    setError('')
    setSaved('')
    document.getElementById('pname')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const cancelEdit = () => { setEditing(null); setForm(EMPTY); setError('') }

  const tabBtn = (t: typeof tab, label: string) => (
    <button type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`rounded-full px-5 py-2 ${tab === t ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>{label}</button>
  )

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
        {[['পণ্য', bn(mine.length)], ['অর্ডার', bn(myOrders.length)], ['বিক্রি', formatBDT(sales)]].map(([k, v]) => (
          <div key={k} className="flex flex-col-reverse rounded-[10px] bg-paper p-4 text-center">
            <dt className="text-sm text-stone-600">{k}</dt>
            <dd className="font-display text-2xl text-rickshaw sm:text-3xl">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 inline-flex gap-1 rounded-full border-2 border-amber-300 p-1">
        {tabBtn('ponno', 'পণ্য')}
        {tabBtn('order', 'অর্ডার')}
        {tabBtn('tottho', 'দোকানের তথ্য')}
      </div>

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
                  {CATEGORIES.filter((c) => c !== 'সব').map((c) => <option key={c}>{c}</option>)}
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
                <input id="photo" type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} className="sr-only" />
                {form.photo && <img src={form.photo} alt="" className="mt-3 h-32 w-full rounded object-cover" />}
              </div>
              {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
              {saved && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{saved}</p>}
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className={BTN}>{editing ? 'বদল রাখুন' : 'পণ্য তুলুন'}</button>
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
                    <ProductPicture product={p} className="h-16 w-20 shrink-0 rounded" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${p.id}`} className="hover:text-rickshaw">{p.nameBn}</Link>
                      <p className="text-sm text-stone-600">{formatBDT(p.price)} · {bn(p.stock)}টি আছে</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button type="button" onClick={() => startEdit(p)} className="text-sm text-rickshaw underline">বদলান</button>
                      <button type="button" onClick={() => { if (editing === p.id) cancelEdit(); removeProduct(p.id) }} className="text-sm text-stone-500 underline hover:text-rickshaw">সরান</button>
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
                      {o.sentBy?.includes(mySeller.id) ? (
                        <span className="rounded-full bg-kolapata px-4 py-1.5 text-white">{orderStatus(o) === 'পৌঁছেছে' ? 'ক্রেতা পেয়েছেন' : 'পাঠিয়েছেন'}</span>
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    if (form.shopName.trim().length < 3) return setError('দোকানের নাম লিখুন।')
    if (form.craft.trim().length < 2) return setError('কী বানান, লিখুন।')
    if (form.story.trim().length < 20) return setError('নিজের কাজের কথা দুই-এক লাইনে লিখুন।')
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(form.phone))) return setError('WhatsApp নম্বর ঠিক নেই।')
    updateShop({ shopName: form.shopName.trim(), craft: form.craft.trim(), district: form.district, story: form.story.trim(), phone: normalizePhone(form.phone) })
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
        <div className="sm:col-span-2"><button type="submit" className={BTN}>তথ্য রাখুন</button></div>
      </form>
    </Panel>
  )
}
