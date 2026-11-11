import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { bn, formatBDT, type Product } from '../../data/products'
import type { Seller } from '../../data/sellers'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { useMarket } from '../../store/market'
import { BTN, INPUT, Panel } from '../../components/Form'
import ProductPicture from '../../components/ProductPicture'
import { useAction } from './kit'
import { Alert, Chip, LinkBtn, Load } from './shared'
import ProductForm from './ProductForm'

export default function Products() {
  const { refresh } = useMarket()
  const products = useApi<Product[]>('/admin/products')
  const sellers = useApi<Seller[]>('/admin/sellers')
  const act = useAction()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [owner, setOwner] = useState('')
  const [quick, setQuick] = useState<'' | 'hidden' | 'out'>('')
  // 'new' = নতুন পণ্য, নইলে বদলানো পণ্যের আইডি
  const [editing, setEditing] = useState<string | null>(params.get('edit'))

  const list = products.data ?? []
  const all = sellers.data ?? []
  const shopOf = (id?: string) => all.find((s) => s.id === id)?.shopName ?? ''
  const term = q.trim().toLowerCase()
  const shown = list.filter((p) =>
    (!term || p.nameBn.toLowerCase().includes(term)) && (!owner || p.sellerId === owner) &&
    (quick === '' || (quick === 'hidden' ? !!p.hidden : p.stock <= 0)))

  const changed = () => { products.reload(); void refresh() }
  const close = () => { setEditing(null); if (params.has('edit')) setParams({}) }
  const toggle = (p: Product) => void act.run(async () => { await api.patch(`/admin/products/${p.id}`, { hidden: !p.hidden }); changed() })
  const remove = (p: Product) => {
    if (!window.confirm(`"${p.nameBn}" সরিয়ে দেবেন?`)) return
    void act.run(async () => { await api.del(`/admin/products/${p.id}`); if (editing === p.id) close(); changed() })
  }
  const target = editing && editing !== 'new' ? list.find((p) => p.id === editing) : undefined

  return (
    <div className="space-y-5">
      {editing && !products.loading && !sellers.loading && (editing === 'new' || target) && (
        <ProductForm key={editing} product={target ?? null} sellers={all} onDone={() => { close(); changed() }} onCancel={close} />
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input aria-label="পণ্য খুঁজুন" placeholder="পণ্যের নাম খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} className={`${INPUT} !mt-0`} />
        <select aria-label="বিক্রেতা" value={owner} onChange={(e) => setOwner(e.target.value)} className={`${INPUT} !mt-0`}>
          <option value="">সব বিক্রেতা</option>
          {all.map((s) => <option key={s.id} value={s.id}>{s.shopName}</option>)}
        </select>
        <select aria-label="কোন পণ্য" value={quick} onChange={(e) => setQuick(e.target.value as typeof quick)} className={`${INPUT} !mt-0`}>
          <option value="">সব পণ্য</option>
          <option value="hidden">লুকানো</option>
          <option value="out">স্টক শেষ</option>
        </select>
        <button type="button" onClick={() => setEditing('new')} className={BTN}>নতুন পণ্য</button>
      </div>
      <Alert text={act.error} />
      <Load q={products}>
        {shown.length === 0 ? (
          <p className="text-stone-600">কোনো পণ্য নেই।</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {shown.map((p) => (
              <li key={p.id}>
                <Panel className="!p-4">
                  <div className="flex gap-4">
                    <ProductPicture product={p} className={`h-20 w-24 shrink-0 rounded ${p.hidden ? 'opacity-50' : ''}`} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${p.id}`} className="hover:text-rickshaw">{p.nameBn}</Link>
                      <p className="text-sm text-stone-600">{shopOf(p.sellerId) || p.artisan}</p>
                      <p className="text-sm text-stone-600">{formatBDT(p.price)} · {p.stock > 0 ? `${bn(p.stock)}টি আছে` : 'স্টক শেষ'}</p>
                      <p className="mt-1 flex flex-wrap gap-2">
                        {p.hidden && <Chip tone="grey">লুকানো</Chip>}
                        {p.stock <= 0 && <Chip tone="red">স্টক শেষ</Chip>}
                        {p.badge && <Chip>{p.badge}</Chip>}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-5">
                    <LinkBtn onClick={() => { setEditing(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>বদলান</LinkBtn>
                    <LinkBtn disabled={act.busy} onClick={() => toggle(p)}>{p.hidden ? 'দেখান' : 'লুকান'}</LinkBtn>
                    <LinkBtn disabled={act.busy} onClick={() => remove(p)}>সরান</LinkBtn>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </Load>
    </div>
  )
}
