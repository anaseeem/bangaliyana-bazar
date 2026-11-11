import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorText, uploadImage } from '../../lib/api'
import { GOLPO_KINDS, type Post } from '../../lib/golpo'
import { shrinkImage } from '../../lib/local'
import { useApi } from '../../lib/useApi'
import type { Seller } from '../../data/sellers'
import { Art, ART_THEMES, ART_TONE, type ArtTheme } from '../../components/art'
import { BTN, BTN_LINE, Field, INPUT, Panel } from '../../components/Form'
import { dateBn, useAction } from './kit'
import { Alert, Chip, LinkBtn, Load, Note } from './shared'
import BodyEditor from './BodyEditor'

export default function Stories() {
  const posts = useApi<Post[]>('/admin/posts')
  const sellers = useApi<Seller[]>('/admin/sellers')
  const act = useAction()
  // 'new' = নতুন গল্প, নইলে বদলানো গল্পের আইডি
  const [editing, setEditing] = useState<string | null>(null)
  const target = editing && editing !== 'new' ? posts.data?.find((p) => p.id === editing) : undefined

  const remove = (p: Post) => {
    if (!window.confirm(`"${p.title}" সরিয়ে দেবেন?`)) return
    void act.run(async () => { await api.del(`/admin/posts/${p.id}`); posts.reload() })
  }

  if (editing && (editing === 'new' || target)) {
    return <Editor key={editing} post={target ?? null} sellers={sellers.data ?? []} onBack={() => { setEditing(null); posts.reload() }} />
  }
  return (
    <div className="space-y-5">
      <button type="button" onClick={() => setEditing('new')} className={BTN}>নতুন গল্প</button>
      <Alert text={act.error} />
      <Load q={posts}>
        {(posts.data ?? []).length === 0 ? <p className="text-stone-600">এখনো কোনো গল্প নেই।</p> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {(posts.data ?? []).map((p) => (
              <li key={p.id}>
                <Panel className="!p-4 sm:!p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 text-lg">{p.title}</p>
                    <Chip tone={p.status === 'published' ? 'green' : 'soft'}>{p.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}</Chip>
                  </div>
                  <p className="text-stone-600">{p.kind} · {dateBn(p.publishedAt ?? p.updatedAt)}</p>
                  <div className="mt-3 flex flex-wrap gap-5">
                    <LinkBtn onClick={() => setEditing(p.id)}>বদলান</LinkBtn>
                    <LinkBtn disabled={act.busy} onClick={() => remove(p)}>সরান</LinkBtn>
                    {p.status === 'published' && <Link to={`/golpo/${p.slug}`} className="text-rickshaw underline">পাতাটা দেখুন</Link>}
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

function Editor({ post, sellers, onBack }: { post: Post | null; sellers: Seller[]; onBack: () => void }) {
  const act = useAction()
  // নতুন গল্প প্রথম রাখার পর এখানে বসে, যাতে পরেরবার বদল হয়
  const [saved, setSaved] = useState<Post | null>(post)
  const [f, setF] = useState({
    title: post?.title ?? '', slug: post?.slug ?? '', kind: post?.kind ?? GOLPO_KINDS[0], lang: post?.lang ?? 'bn',
    art: (post?.art ?? 'moyur') as ArtTheme, cover: post?.cover ?? '', sellerId: post?.sellerId ?? '', excerpt: post?.excerpt ?? '', body: post?.body ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  const pickCover = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { set('cover', await uploadImage(await shrinkImage(file, 1000))) } catch (e) { act.setError(e instanceof Error && e.message === 'image' ? 'ছবিটা খোলা গেল না। অন্য ছবি দিন।' : errorText(e)) }
    setUploading(false)
  }

  const save = (status: 'draft' | 'published') => {
    if (f.title.trim().length < 3) return act.setError('শিরোনাম লিখুন।')
    if (f.slug && !/^[a-z0-9-]{3,80}$/.test(f.slug)) return act.setError('লিংকের নাম ইংরেজি ছোট হাতের অক্ষর, সংখ্যা আর দাগ দিয়ে লিখুন, কমপক্ষে তিন অক্ষর।')
    const data = { ...f, title: f.title.trim(), status, ...(f.slug ? {} : { slug: undefined }) }
    void act.run(async () => {
      const next = saved ? await api.patch<Post>(`/admin/posts/${saved.id}`, data) : await api.post<Post>('/admin/posts', data)
      setSaved(next)
      setF((x) => ({ ...x, slug: next.slug }))
    }, status === 'published' ? 'প্রকাশ হলো।' : 'খসড়া রাখা হলো।')
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="text-rickshaw underline">← সব গল্প</button>
      <Panel>
        <h2 className="text-2xl">{saved ? 'গল্প বদলান' : 'নতুন গল্প'}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="g-title" label="শিরোনাম"><input id="g-title" value={f.title} onChange={(e) => set('title', e.target.value)} className={INPUT} /></Field>
          <div>
            <Field id="g-slug" label="লিংকের নাম"><input id="g-slug" value={f.slug} onChange={(e) => set('slug', e.target.value)} className={INPUT} /></Field>
            <p className="mt-1 text-sm text-stone-600">শুধু a-z, 0-9 আর দাগ (-)। ফাঁকা রাখলে নিজে বানাবে।</p>
          </div>
          <Field id="g-kind" label="ধরন">
            <select id="g-kind" value={f.kind} onChange={(e) => set('kind', e.target.value as Post['kind'])} className={INPUT}>{GOLPO_KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          </Field>
          <Field id="g-lang" label="ভাষা">
            <select id="g-lang" value={f.lang} onChange={(e) => set('lang', e.target.value as Post['lang'])} className={INPUT}><option value="bn">বাংলা</option><option value="en">English</option></select>
          </Field>
          <Field id="g-seller" label="কাকে নিয়ে গল্প">
            <select id="g-seller" value={f.sellerId} onChange={(e) => set('sellerId', e.target.value)} className={INPUT}>
              <option value="">কাউকে নয়</option>
              {sellers.map((s) => <option key={s.id} value={s.id}>{s.shopName}</option>)}
            </select>
          </Field>
          <div>
            <p>কাভারের ছবি</p>
            <label htmlFor="g-cover" className="mt-1 inline-block cursor-pointer rounded-full bg-holud px-5 py-2 hover:bg-amber-400">{uploading ? 'ছবি উঠছে…' : f.cover ? 'অন্য ছবি দিন' : 'ছবি বাছাই করুন'}</label>
            <input id="g-cover" type="file" accept="image/*" disabled={uploading} onChange={(e) => { void pickCover(e.target.files?.[0]); e.target.value = '' }} className="sr-only" />
            {f.cover && <img src={f.cover} alt="" className="mt-3 h-24 w-40 rounded object-cover" />}
          </div>
          <div className="sm:col-span-2">
            <p>নকশা</p>
            <div role="radiogroup" aria-label="নকশা" className="mt-2 flex flex-wrap gap-3">
              {ART_THEMES.map((t) => (
                <button
                  key={t.id} type="button" role="radio" aria-checked={f.art === t.id} onClick={() => set('art', t.id)}
                  className={`w-20 text-center text-sm ${f.art === t.id ? 'text-rickshaw' : 'text-stone-600'}`}
                >
                  <span className={`block h-16 w-20 overflow-hidden rounded-[10px] ${f.art === t.id ? 'ring-2 ring-rickshaw ring-offset-2 ring-offset-paper' : ''}`} style={{ background: ART_TONE[t.id].bg }}>
                    <Art theme={t.id} className="h-full w-full" />
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Field id="g-excerpt" label="ছোট বিবরণ"><textarea id="g-excerpt" rows={2} value={f.excerpt} onChange={(e) => set('excerpt', e.target.value)} className={`${INPUT} rounded-2xl`} /></Field>
          </div>
        </div>
      </Panel>
      <Panel>
        <BodyEditor id="g-body" value={f.body} onChange={(v) => set('body', v)} art={f.art} lang={f.lang} images dropCap />
      </Panel>
      <Alert text={act.error} />
      <Note text={act.done} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" disabled={act.busy || uploading} onClick={() => save('draft')} className={BTN_LINE}>খসড়া রাখুন</button>
        <button type="button" disabled={act.busy || uploading} onClick={() => save('published')} className={BTN}>প্রকাশ করুন</button>
        {saved?.status === 'published' && <Link to={`/golpo/${saved.slug}`} className="text-rickshaw underline">পাতাটা দেখুন</Link>}
      </div>
    </div>
  )
}
