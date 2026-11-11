import { useState } from 'react'
import { bn, formatBDT } from '../../data/products'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { BTN, INPUT, Panel } from '../../components/Form'
import { toInt, useAction } from './kit'
import { Alert, Load, Note } from './shared'

interface Row {
  seller: { id: string; shopName: string; ownerName: string; phone: string }
  earned: number
  commission: number
  paid: number
  due: number
}

export default function Money() {
  const rows = useApi<Row[]>('/admin/payouts')
  return (
    <Load q={rows}>
      {(rows.data ?? []).length === 0 ? <p className="text-stone-600">এখনো কোনো বিক্রি পৌঁছায়নি।</p> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {(rows.data ?? []).map((r) => <li key={r.seller.id}><SellerMoney row={r} reload={rows.reload} /></li>)}
        </ul>
      )}
    </Load>
  )
}

function SellerMoney({ row: r, reload }: { row: Row; reload: () => void }) {
  const act = useAction()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = toInt(amount)
    if (!Number.isInteger(n) || n <= 0) return act.setError('টাকার অঙ্ক ঠিক নেই।')
    void act.run(async () => {
      await api.post('/admin/payouts', { sellerId: r.seller.id, amount: n, note: note.trim() })
      setAmount('')
      setNote('')
      reload()
    }, 'রাখা হলো।')
  }

  const lines: [string, number][] = [['মোট বিক্রি', r.earned], ...(r.commission > 0 ? [['বাজারের অংশ', r.commission] as [string, number]] : []), ['দেওয়া হয়েছে', r.paid]]
  return (
    <Panel className="!p-4 sm:!p-5">
      <p className="text-lg">{r.seller.shopName}</p>
      <p className="text-stone-600">{r.seller.ownerName} · {bn(r.seller.phone)}</p>
      <dl className="mt-3 space-y-1">
        {lines.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-stone-600">{k}</dt><dd>{formatBDT(v)}</dd></div>)}
        <div className="flex justify-between gap-3 text-xl text-rickshaw"><dt>পাওনা</dt><dd>{formatBDT(r.due)}</dd></div>
      </dl>
      <form className="mt-4 grid gap-3" noValidate onSubmit={submit}>
        <div className="grid grid-cols-[8rem_1fr] gap-3">
          <input aria-label="কত টাকা দিলেন" placeholder="কত টাকা" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${INPUT} !mt-0`} />
          <input aria-label="নোট" placeholder="নোট (না লিখলেও চলে)" value={note} onChange={(e) => setNote(e.target.value)} className={`${INPUT} !mt-0`} />
        </div>
        <Alert text={act.error} />
        <Note text={act.done} />
        <div><button type="submit" disabled={act.busy} className={BTN}>টাকা দিলাম</button></div>
      </form>
    </Panel>
  )
}
