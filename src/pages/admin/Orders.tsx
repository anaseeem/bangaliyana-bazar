import { useState } from 'react'
import { bn, formatBDT } from '../../data/products'
import { api } from '../../lib/api'
import { asciiDigits } from '../../lib/local'
import { useApi } from '../../lib/useApi'
import { whatsappLink } from '../../lib/whatsapp'
import { useMarket, type Order } from '../../store/market'
import { BTN, INPUT, Panel } from '../../components/Form'
import { StitchLine } from '../../components/Stitch'
import type { Seller } from '../../data/sellers'
import { dateBn, useAction, useAdmin } from './kit'
import { Alert, Chip, Load, Pills, SmallBtn } from './shared'

type AdminOrder = Order & { note?: string }
type Filter = 'all' | 'new' | 'ok' | 'sent' | 'done' | 'off'

const kindOf = (o: AdminOrder): Filter =>
  o.status === 'cancelled' ? 'off' : o.status === 'delivered' ? 'done' : o.status === 'sent' ? 'sent' : o.confirmed ? 'ok' : 'new'
const LABEL: Record<Filter, string> = { all: 'সব', new: 'নতুন', ok: 'নিশ্চিত', sent: 'পাঠানো', done: 'পৌঁছেছে', off: 'বাতিল' }

export default function Orders() {
  const orders = useApi<AdminOrder[]>('/admin/orders')
  const sellers = useApi<Seller[]>('/admin/sellers')
  const { reloadSummary } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState('')

  const changed = () => { orders.reload(); reloadSummary() }
  const list = orders.data ?? []
  const count = (f: Filter) => (f === 'all' ? list.length : list.filter((o) => kindOf(o) === f).length)
  const term = asciiDigits(q).trim().toLowerCase()
  const shown = list.filter((o) => (filter === 'all' || kindOf(o) === filter) && (!term || o.id.toLowerCase().includes(term) || o.phone.includes(term)))

  return (
    <div className="space-y-4">
      <Pills value={filter} onPick={setFilter} items={(Object.keys(LABEL) as Filter[]).map((k) => [k, LABEL[k], count(k)])} />
      <input aria-label="অর্ডার নম্বর বা ফোন" placeholder="অর্ডার নম্বর বা ফোন খুঁজুন" inputMode="search" value={q} onChange={(e) => setQ(e.target.value)} className={INPUT} />
      <Load q={orders}>
        {shown.length === 0 ? (
          <p className="text-stone-600">কোনো অর্ডার নেই।</p>
        ) : (
          <ul className="space-y-4">
            {shown.map((o) => (
              <li key={o.id}>
                <OrderCard o={o} sellers={sellers.data ?? []} open={open === o.id} toggle={() => setOpen(open === o.id ? '' : o.id)} changed={changed} />
              </li>
            ))}
          </ul>
        )}
      </Load>
    </div>
  )
}

function OrderCard({ o, sellers, open, toggle, changed }: { o: AdminOrder; sellers: Seller[]; open: boolean; toggle: () => void; changed: () => void }) {
  const { settings } = useMarket()
  const act = useAction()
  const [courier, setCourier] = useState(o.courier ?? '')
  const [note, setNote] = useState(o.note ?? '')
  const kind = kindOf(o)
  const patch = (body: object, ok = '') => act.run(async () => { await api.patch(`/admin/orders/${o.id}`, body); changed() }, ok)
  const shop = (id: string) => sellers.find((s) => s.id === id)?.shopName ?? 'দোকান'
  const groups = [...new Set(o.items.map((i) => i.sellerId))]
  const live = o.status === 'placed' || o.status === 'sent'

  const cancel = () => { if (window.confirm(`অর্ডার ${bn(o.id)} বাতিল করবেন? স্টক ফিরে যাবে।`)) void patch({ status: 'cancelled' }) }

  return (
    <Panel className="!p-4 sm:!p-6">
      <button type="button" onClick={toggle} aria-expanded={open} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
        <span>
          <span className="text-lg text-rickshaw">{bn(o.id)}</span>
          <span className="ml-3 text-stone-600">{dateBn(o.createdAt)}</span>
        </span>
        <span className="flex items-center gap-3">
          <span>{formatBDT(o.total)}</span>
          <Chip tone={kind === 'off' ? 'grey' : kind === 'done' ? 'green' : kind === 'new' ? 'red' : 'soft'}>{LABEL[kind]}</Chip>
        </span>
      </button>
      <p className="mt-1 text-stone-600">{o.name}, {o.district}</p>

      {open && (
        <div className="mt-4">
          <StitchLine className="mb-4" />
          <p>{o.name}</p>
          <p className="flex flex-wrap gap-x-4">
            <a href={`tel:${o.phone}`} className="text-rickshaw underline">{bn(o.phone)}</a>
            <a href={whatsappLink(`আসসালামু আলাইকুম ${o.name}। আপনার অর্ডার ${bn(o.id)} নিয়ে লিখছি।`, o.phone, settings.whatsapp)} target="_blank" rel="noreferrer" className="text-rickshaw underline">WhatsApp</a>
          </p>
          <p className="text-stone-600">{o.district}, {o.address}</p>

          <div className="mt-4 space-y-4">
            {groups.map((sid) => (
              <div key={sid} className="rounded-[10px] bg-cream-deep/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-rickshaw">{shop(sid)}</p>
                  {o.sentBy.includes(sid) ? <Chip tone="green">পাঠানো হয়েছে</Chip> : live && <SmallBtn solid disabled={act.busy} onClick={() => void patch({ sent: sid })}>পাঠানো হলো</SmallBtn>}
                </div>
                <ul className="mt-2 space-y-1">
                  {o.items.filter((i) => i.sellerId === sid).map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span>{i.nameBn} <span className="text-stone-500">× {bn(i.qty)}</span></span>
                      <span>{formatBDT(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-1 text-right">
            <div><dt className="inline text-stone-600">জিনিসের দাম </dt><dd className="inline">{formatBDT(o.subtotal)}</dd></div>
            <div><dt className="inline text-stone-600">ডেলিভারি </dt><dd className="inline">{formatBDT(o.deliveryFee)}</dd></div>
            <div className="text-lg text-rickshaw"><dt className="inline">মোট </dt><dd className="inline">{formatBDT(o.total)}</dd></div>
          </dl>

          {kind !== 'off' && (
            <label className="mt-4 flex items-center gap-3">
              <input type="checkbox" checked={!!o.confirmed} disabled={act.busy} onChange={(e) => void patch({ confirmed: e.target.checked })} className="h-5 w-5 accent-rickshaw" />
              ফোনে কথা হয়েছে
            </label>
          )}

          <div className="mt-4 grid gap-3">
            <label>কুরিয়ার
              <input value={courier} onChange={(e) => setCourier(e.target.value)} className={INPUT} />
            </label>
            <label>নিজের জন্য নোট (ক্রেতা দেখেন না)
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={`${INPUT} rounded-2xl`} />
            </label>
            <div><button type="button" disabled={act.busy} onClick={() => void patch({ courier, note }, 'রাখা হলো।')} className={BTN}>রাখুন</button></div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {live && <SmallBtn solid disabled={act.busy} onClick={() => void patch({ status: 'delivered' })}>পৌঁছে গেছে</SmallBtn>}
            {kind !== 'off' && kind !== 'done' && <SmallBtn disabled={act.busy} onClick={cancel}>বাতিল করুন</SmallBtn>}
            {kind === 'off' && <SmallBtn solid disabled={act.busy} onClick={() => void patch({ status: 'placed' })}>আবার চালু করুন</SmallBtn>}
          </div>
          <div className="mt-3 space-y-2">
            <Alert text={act.error} />
            {act.done && <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{act.done}</p>}
          </div>
        </div>
      )}
    </Panel>
  )
}
