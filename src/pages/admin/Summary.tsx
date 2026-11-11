import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bn, formatBDT } from '../../data/products'
import { Panel } from '../../components/Form'
import { MamaLoader } from '../../components/MamaScenes'
import { useAdmin } from './kit'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse rounded-[10px] bg-paper p-4 text-center">
      <dt className="text-sm text-stone-600">{label}</dt>
      <dd className="font-display text-2xl text-rickshaw sm:text-3xl">{value}</dd>
    </div>
  )
}

export default function Summary() {
  const { summary: s, reloadSummary } = useAdmin()
  useEffect(() => { reloadSummary() }, [reloadSummary])
  if (!s) return <MamaLoader />

  const todo: [number, string, string][] = [
    [s.toConfirm, 'ফোনে নিশ্চিত করা বাকি', '/admin/order'],
    [s.toSend, 'পাঠানো বাকি', '/admin/order'],
    [s.pendingSellers, 'যাচাইয়ের অপেক্ষায় বিক্রেতা', '/admin/bikreta'],
    [s.unreadMessages, 'না পড়া বার্তা', '/admin/barta'],
  ]
  const open = todo.filter(([n]) => n > 0)

  return (
    <div className="space-y-8">
      {s.store === 'file' && (
        <p role="status" className="rounded-md bg-holud-soft px-4 py-3">ডাটাবেস যুক্ত নেই। সার্ভার নতুন করে চালু হলে অর্ডার আর অ্যাকাউন্ট মুছে যেতে পারে।</p>
      )}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="আজকের অর্ডার" value={bn(s.today.orders)} />
        <Stat label="আজকের বিক্রি" value={formatBDT(s.today.sales)} />
        <Stat label="এই মাসের অর্ডার" value={bn(s.month.orders)} />
        <Stat label="এই মাসের বিক্রি" value={formatBDT(s.month.sales)} />
        <Stat label="পণ্য" value={bn(s.totals.products)} />
        <Stat label="বিক্রেতা" value={bn(s.totals.sellers)} />
        <Stat label="ক্রেতা" value={bn(s.totals.users)} />
        <Stat label="মোট অর্ডার" value={bn(s.totals.orders)} />
      </dl>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-2xl">এখন যা করার</h2>
          {open.length === 0 ? (
            <p className="mt-3">সব ঠিক আছে।</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {open.map(([n, label, to]) => (
                <li key={label}>
                  <Link to={to} className="flex items-center justify-between gap-3 rounded-full px-4 py-2 hover:bg-holud-soft">
                    <span>{label}</span>
                    <span className="text-rickshaw">{bn(n)}টি</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <h2 className="text-2xl">স্টক কমে আসছে</h2>
          {s.lowStock.length === 0 ? (
            <p className="mt-3 text-stone-600">সব পণ্যের স্টক আছে।</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {s.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">{p.nameBn}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-stone-600">{p.stock > 0 ? `আর ${bn(p.stock)}টি` : 'শেষ'}</span>
                    <Link to={`/admin/ponno?edit=${p.id}`} className="text-rickshaw underline">বদলান</Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
