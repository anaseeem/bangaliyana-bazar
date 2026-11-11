import { useState } from 'react'
import { bn } from '../../data/products'
import { api } from '../../lib/api'
import { asciiDigits } from '../../lib/local'
import { useApi } from '../../lib/useApi'
import { useMarket, type User } from '../../store/market'
import { INPUT, Panel } from '../../components/Form'
import { dateBn, useAction } from './kit'
import { Alert, Chip, Load, SmallBtn } from './shared'

type Customer = User & { orderCount: number }

export default function Customers() {
  const { user: me } = useMarket()
  const users = useApi<Customer[]>('/admin/users')
  const act = useAction()
  const [q, setQ] = useState('')
  // নতুন পাসওয়ার্ড একবারই দেখানো হয়
  const [fresh, setFresh] = useState<{ id: string; password: string } | null>(null)

  const term = asciiDigits(q).trim().toLowerCase()
  const shown = (users.data ?? []).filter((u) => !term || u.name.toLowerCase().includes(term) || u.phone.includes(term))

  const patch = (u: Customer, body: object) => void act.run(async () => { await api.patch(`/admin/users/${u.id}`, body); users.reload() })
  const makeAdmin = (u: Customer) => {
    const to = u.role === 'admin' ? 'customer' : 'admin'
    if (window.confirm(to === 'admin' ? `${u.name}-কে অ্যাডমিন করবেন? তিনি পুরো খাতা দেখতে পাবেন।` : `${u.name}-কে অ্যাডমিন থেকে সরাবেন?`)) patch(u, { role: to })
  }
  const reset = (u: Customer) => {
    if (!window.confirm(`${u.name}-এর জন্য নতুন পাসওয়ার্ড বানাবেন? আগেরটা আর চলবে না।`)) return
    void act.run(async () => {
      const r = await api.post<{ password: string }>(`/admin/users/${u.id}/reset-password`)
      setFresh({ id: u.id, password: r.password })
    })
  }

  return (
    <div className="space-y-4">
      <input aria-label="নাম বা ফোন" placeholder="নাম বা ফোন খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} className={INPUT} />
      <Alert text={act.error} />
      <Load q={users}>
        {shown.length === 0 ? <p className="text-stone-600">কেউ নেই।</p> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {shown.map((u) => (
              <li key={u.id}>
                <Panel className="!p-4 sm:!p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-lg">{u.name}</p>
                      <p className="text-stone-600">{bn(u.phone)}</p>
                      <p className="text-sm text-stone-600">{dateBn(u.createdAt)} থেকে · {bn(u.orderCount)}টি অর্ডার</p>
                    </div>
                    <span className="flex gap-2">
                      {u.role === 'admin' && <Chip tone="green">অ্যাডমিন</Chip>}
                      {u.blocked && <Chip tone="red">বন্ধ</Chip>}
                    </span>
                  </div>
                  {u.id !== me?.id && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <SmallBtn disabled={act.busy} onClick={() => patch(u, { blocked: !u.blocked })}>{u.blocked ? 'চালু করুন' : 'বন্ধ করুন'}</SmallBtn>
                      <SmallBtn disabled={act.busy} onClick={() => makeAdmin(u)}>{u.role === 'admin' ? 'অ্যাডমিন বাদ দিন' : 'অ্যাডমিন করুন'}</SmallBtn>
                      <SmallBtn disabled={act.busy} onClick={() => reset(u)}>নতুন পাসওয়ার্ড</SmallBtn>
                    </div>
                  )}
                  {fresh?.id === u.id && (
                    <div role="status" className="mt-3 rounded-md bg-holud-soft px-4 py-3">
                      <p className="text-2xl text-rickshaw">{bn(fresh.password)} <span className="text-base text-stone-600">({fresh.password})</span></p>
                      <p className="mt-1">এই পাসওয়ার্ডটা ক্রেতাকে জানিয়ে দিন। আর দেখানো হবে না।</p>
                    </div>
                  )}
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </Load>
    </div>
  )
}
