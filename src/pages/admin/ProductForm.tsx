import { useState } from 'react'
import { bn, type Product } from '../../data/products'
import type { Seller } from '../../data/sellers'
import { api, errorText, uploadImage } from '../../lib/api'
import { shrinkImage } from '../../lib/local'
import { useMarket } from '../../store/market'
import { BTN, Field, INPUT, Panel } from '../../components/Form'
import { toInt, useAction } from './kit'
import { Alert, Note } from './shared'

const empty = (category: string, sellerId: string) => ({
  nameBn: '', price: '', stock: '', category, description: '', story: '', photo: '', sellerId, oldPrice: '', badge: '', hidden: false,
})
const fromProduct = (p: Product) => ({
  nameBn: p.nameBn, price: bn(p.price), stock: bn(p.stock), category: p.category, description: p.description, story: p.story,
  photo: p.photo ?? '', sellerId: p.sellerId ?? '', oldPrice: p.oldPrice ? bn(p.oldPrice) : '', badge: p.badge ?? '', hidden: !!p.hidden,
})

/** পণ্য তোলা বা বদলানোর ফর্ম, বিক্রেতার ফর্মের মতো, সঙ্গে বিক্রেতা, আগের দাম, ব্যাজ আর লুকানো */
export default function ProductForm({ product, sellers, onDone, onCancel }: { product: Product | null; sellers: Seller[]; onDone: () => void; onCancel: () => void }) {
  const { settings } = useMarket()
  const act = useAction()
  const approved = sellers.filter((s) => s.status === 'approved')
  const [form, setForm] = useState(() => (product ? fromProduct(product) : empty(settings.categories[0] ?? 'লোকশিল্প', approved[0]?.id ?? '')))
  const [uploading, setUploading] = useState(false)
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))
  const categories = settings.categories.includes(form.category) ? settings.categories : [form.category, ...settings.categories]
  // বিক্রেতা অনুমোদিত না হলেও এখনকার বিক্রেতা তালিকায় থাকে
  const owners = form.sellerId && !approved.some((s) => s.id === form.sellerId) ? [...approved, ...sellers.filter((s) => s.id === form.sellerId)] : approved

  const pickPhoto = async (file?: File) => {
    if (!file) return
    act.setError('')
    setUploading(true)
    try {
      set('photo', await uploadImage(await shrinkImage(file, 1000)))
    } catch (e) {
      act.setError(e instanceof Error && e.message === 'image' ? 'ছবিটা খোলা গেল না। অন্য ছবি দিন।' : errorText(e))
    }
    setUploading(false)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = toInt(form.price)
    const stock = toInt(form.stock)
    const old = form.oldPrice.trim() === '' ? null : toInt(form.oldPrice)
    if (form.nameBn.trim().length < 3) return act.setError('পণ্যের নাম লিখুন।')
    if (!Number.isInteger(price) || price < 50) return act.setError('দাম ঠিক নেই। অন্তত ৳৫০।')
    if (!Number.isInteger(stock)) return act.setError('কয়টা আছে, লিখুন।')
    if (old !== null && (!Number.isInteger(old) || old < 50)) return act.setError('আগের দাম ঠিক নেই।')
    if (form.description.trim().length < 10) return act.setError('পণ্যটা নিয়ে এক লাইন লিখুন।')
    if (!form.sellerId) return act.setError('বিক্রেতা বেছে নিন।')
    const data = {
      nameBn: form.nameBn.trim(), price, stock, category: form.category, description: form.description.trim(),
      story: form.story.trim() || form.description.trim(), photo: form.photo, sellerId: form.sellerId,
      oldPrice: old, badge: form.badge.trim(), hidden: form.hidden,
    }
    void act.run(async () => {
      if (product) await api.patch(`/admin/products/${product.id}`, data)
      else await api.post('/admin/products', data)
      onDone()
    })
  }

  return (
    <Panel>
      <h2 className="text-2xl">{product ? 'পণ্য বদলান' : 'নতুন পণ্য'}</h2>
      <form className="mt-4 grid gap-4" noValidate onSubmit={submit}>
        <Field id="ap-owner" label="কার পণ্য">
          <select id="ap-owner" value={form.sellerId} onChange={(e) => set('sellerId', e.target.value)} className={INPUT}>
            {owners.map((s) => <option key={s.id} value={s.id}>{s.shopName}</option>)}
          </select>
        </Field>
        <Field id="ap-name" label="পণ্যের নাম">
          <input id="ap-name" value={form.nameBn} onChange={(e) => set('nameBn', e.target.value)} className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="ap-price" label="দাম (টাকা)">
            <input id="ap-price" inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value)} className={INPUT} />
          </Field>
          <Field id="ap-old" label="আগের দাম">
            <input id="ap-old" inputMode="numeric" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} className={INPUT} />
          </Field>
          <Field id="ap-stock" label="কয়টা আছে">
            <input id="ap-stock" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={INPUT} />
          </Field>
          <Field id="ap-badge" label="ব্যাজ">
            <input id="ap-badge" maxLength={20} placeholder="যেমন নতুন" value={form.badge} onChange={(e) => set('badge', e.target.value)} className={INPUT} />
          </Field>
        </div>
        <Field id="ap-cat" label="ধরন">
          <select id="ap-cat" value={form.category} onChange={(e) => set('category', e.target.value)} className={INPUT}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="ap-desc" label="পণ্যটা কেমন">
          <textarea id="ap-desc" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${INPUT} rounded-2xl`} />
        </Field>
        <Field id="ap-story" label="বানানোর গল্প">
          <textarea id="ap-story" rows={2} value={form.story} onChange={(e) => set('story', e.target.value)} className={`${INPUT} rounded-2xl`} />
        </Field>
        <div>
          <p>ছবি</p>
          <label htmlFor="ap-photo" className="mt-1 inline-block cursor-pointer rounded-full bg-holud px-5 py-2 hover:bg-amber-400">{form.photo ? 'অন্য ছবি দিন' : 'ছবি বাছাই করুন'}</label>
          <input id="ap-photo" type="file" accept="image/*" onChange={(e) => { void pickPhoto(e.target.files?.[0]); e.target.value = '' }} className="sr-only" />
          {uploading && <p role="status" className="mt-2 text-stone-600">ছবি উঠছে…</p>}
          {form.photo && !uploading && <img src={form.photo} alt="" className="mt-3 h-32 w-full rounded object-cover" />}
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={form.hidden} onChange={(e) => set('hidden', e.target.checked)} className="h-5 w-5 accent-rickshaw" />
          দোকানে লুকিয়ে রাখুন
        </label>
        <Alert text={act.error} />
        <Note text={act.done} />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={act.busy || uploading} className={BTN}>{product ? 'বদল রাখুন' : 'পণ্য তুলুন'}</button>
          <button type="button" onClick={onCancel} className="text-stone-600 underline hover:text-rickshaw">থাক</button>
        </div>
      </form>
    </Panel>
  )
}
