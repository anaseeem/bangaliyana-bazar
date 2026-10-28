import { Link } from 'react-router-dom'
import { useMarket } from '../store/market'
import { Panel } from '../components/Form'

/** ডেমোর জন্য অনুমোদনের পাতা। আসল সাইটে এটা শুধু অ্যাডমিন দেখবেন। */
export default function Admin() {
  const { sellers, approveSeller } = useMarket()
  const pending = sellers.filter((s) => s.status === 'pending')
  const fresh = sellers.filter((s) => s.status === 'approved' && s.userId)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">নতুন বিক্রেতা যাচাই</h1>
      {pending.length === 0 ? (
        <p className="mt-4 text-stone-600">যাচাইয়ের জন্য কেউ অপেক্ষায় নেই।</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {pending.map((s) => (
            <li key={s.id}>
              <Panel>
                <h2 className="text-2xl">{s.shopName}</h2>
                <p className="text-rickshaw">{s.ownerName} · {s.craft}, {s.district}</p>
                <p className="mt-2 text-stone-700">{s.story}</p>
                <button type="button" onClick={() => approveSeller(s.id)} className="mt-4 rounded-full bg-kolapata px-6 py-2 text-white hover:opacity-90">অনুমোদন দিন</button>
              </Panel>
            </li>
          ))}
        </ul>
      )}
      {fresh.length > 0 && (
        <>
          <h2 className="mt-10 text-2xl">অনুমোদিত নতুন দোকান</h2>
          <ul className="mt-3 space-y-1">
            {fresh.map((s) => <li key={s.id}><Link to={`/dokan/${s.id}`} className="text-rickshaw underline">{s.shopName}</Link>, {s.district}</li>)}
          </ul>
        </>
      )}
    </div>
  )
}
