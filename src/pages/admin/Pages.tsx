import { useState } from 'react'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { BTN, Field, INPUT, Panel } from '../../components/Form'
import { useAction } from './kit'
import { Alert, Load, Note, Pills } from './shared'
import BodyEditor from './BodyEditor'

const PAGES = [['amader-kotha', 'আমাদের কথা'], ['sahajjo', 'সাহায্য'], ['niyom', 'নিয়ম']] as const
type Id = (typeof PAGES)[number][0]
interface Page { id: string; title: string; body: string }

export default function Pages() {
  const [id, setId] = useState<Id>('amader-kotha')
  return (
    <div className="space-y-5">
      <Pills value={id} onPick={setId} items={PAGES.map(([k, l]) => [k, l])} />
      <PageEditor key={id} id={id} />
    </div>
  )
}

function PageEditor({ id }: { id: Id }) {
  const page = useApi<Page>(`/pages/${id}`)
  return <Load q={page}>{page.data && <Form page={page.data} />}</Load>
}

function Form({ page }: { page: Page }) {
  const act = useAction()
  const [title, setTitle] = useState(page.title)
  const [body, setBody] = useState(page.body)
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return act.setError('শিরোনাম লিখুন।')
    void act.run(() => api.put(`/admin/pages/${page.id}`, { title: title.trim(), body }), 'রাখা হলো।')
  }
  return (
    <Panel>
      <form className="grid gap-4" noValidate onSubmit={save}>
        <Field id="pg-title" label="শিরোনাম"><input id="pg-title" value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} /></Field>
        <BodyEditor id="pg-body" value={body} onChange={setBody} images />
        <Alert text={act.error} />
        <Note text={act.done} />
        <div><button type="submit" disabled={act.busy} className={BTN}>রাখুন</button></div>
      </form>
    </Panel>
  )
}
