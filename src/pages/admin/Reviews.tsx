import { bn } from '../../data/products'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { useMarket } from '../../store/market'
import { Panel } from '../../components/Form'
import { dateBn, useAction } from './kit'
import { Alert, Chip, LinkBtn, Load } from './shared'

interface Review { id: string; productId: string; productName: string; stars: number; name: string; text: string; hidden?: boolean; createdAt: string }

export default function Reviews() {
  const { refresh } = useMarket()
  const list = useApi<Review[]>('/admin/reviews')
  const act = useAction()
  const toggle = (r: Review) => void act.run(async () => { await api.patch(`/admin/reviews/${r.id}`, { hidden: !r.hidden }); list.reload(); void refresh() })

  return (
    <div className="space-y-4">
      <Alert text={act.error} />
      <Load q={list}>
        {(list.data ?? []).length === 0 ? <p className="text-stone-600">এখনো কোনো মতামত নেই।</p> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {(list.data ?? []).map((r) => (
              <li key={r.id}>
                <Panel className="!p-4 sm:!p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-lg">{r.productName || 'পণ্য সরানো হয়েছে'}</p>
                    {r.hidden && <Chip tone="grey">লুকানো</Chip>}
                  </div>
                  <p role="img" aria-label={`${bn(r.stars)} তারা`} className="text-holud">{'★'.repeat(r.stars)}</p>
                  <p className="mt-1">{r.text}</p>
                  <p className="mt-1 text-sm text-stone-600">{r.name} · {dateBn(r.createdAt)}</p>
                  <div className="mt-3"><LinkBtn disabled={act.busy} onClick={() => toggle(r)}>{r.hidden ? 'দেখান' : 'লুকান'}</LinkBtn></div>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </Load>
    </div>
  )
}
