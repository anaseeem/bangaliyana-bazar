import { bn } from '../../data/products'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { whatsappLink } from '../../lib/whatsapp'
import { useMarket } from '../../store/market'
import { Panel } from '../../components/Form'
import { dateBn, useAction, useAdmin } from './kit'
import { Alert, Chip, LinkBtn, Load } from './shared'

interface Msg { id: string; name: string; phone: string; text: string; read: boolean; createdAt: string }

export default function Messages() {
  const { settings } = useMarket()
  const { reloadSummary } = useAdmin()
  const msgs = useApi<Msg[]>('/admin/messages')
  const act = useAction()
  const done = () => { msgs.reload(); reloadSummary() }
  const mark = (m: Msg) => void act.run(async () => { await api.patch(`/admin/messages/${m.id}`, { read: !m.read }); done() })
  const remove = (m: Msg) => {
    if (window.confirm(`${m.name}-এর বার্তা সরিয়ে দেবেন?`)) void act.run(async () => { await api.del(`/admin/messages/${m.id}`); done() })
  }

  return (
    <div className="space-y-4">
      <Alert text={act.error} />
      <Load q={msgs}>
        {(msgs.data ?? []).length === 0 ? <p className="text-stone-600">কোনো বার্তা নেই।</p> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {(msgs.data ?? []).map((m) => (
              <li key={m.id}>
                <Panel className="!p-4 sm:!p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg">{m.name}</p>
                      <a href={whatsappLink(`আসসালামু আলাইকুম ${m.name}।`, m.phone, settings.whatsapp)} target="_blank" rel="noreferrer" className="text-rickshaw underline">{bn(m.phone)}</a>
                    </div>
                    {!m.read && <Chip tone="red">না পড়া</Chip>}
                  </div>
                  <p className="mt-2 whitespace-pre-line">{m.text}</p>
                  <p className="mt-1 text-sm text-stone-600">{dateBn(m.createdAt)}</p>
                  <div className="mt-3 flex gap-5">
                    <LinkBtn disabled={act.busy} onClick={() => mark(m)}>{m.read ? 'না পড়া' : 'পড়া হয়েছে'}</LinkBtn>
                    <LinkBtn disabled={act.busy} onClick={() => remove(m)}>সরান</LinkBtn>
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
