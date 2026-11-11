import { Link, useSearchParams } from 'react-router-dom'
import { bn } from '../data/products'
import { GOLPO_KINDS, dateBn, type PostCard } from '../lib/golpo'
import { useApi } from '../lib/useApi'
import { useTitle } from '../lib/useTitle'
import { ART_TONE, Art, Moyur } from '../components/art'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { StitchFrame, StitchLine } from '../components/Stitch'

/** ছোট কার্ড: ওপরে গল্পের নিজের নকশা, নিচে লেখা। নকশা আর লেখা আলাদা ঘরে। */
function Card({ post }: { post: PostCard }) {
  const tone = ART_TONE[post.art]
  return (
    <Link to={`/golpo/${post.slug}`} className="group relative flex flex-col overflow-hidden rounded-[10px] bg-paper">
      <div aria-hidden="true" className="overflow-hidden" style={{ background: tone.bg }}>
        <Art theme={post.art} className="mx-auto h-40 w-full" />
      </div>
      <div className="relative flex flex-1 flex-col px-6 pt-5 pb-6">
        <p className="text-sm text-rickshaw">{post.kind} · {dateBn(post.publishedAt)}</p>
        <h2 lang={post.lang} className="mt-1 text-2xl leading-snug group-hover:text-rickshaw">{post.title}</h2>
        <p lang={post.lang} className="mt-2 text-stone-700">{post.excerpt}</p>
        <span className="mt-auto pt-4 text-rickshaw underline decoration-holud underline-offset-4">পুরোটা পড়ুন</span>
      </div>
      <StitchFrame />
    </Link>
  )
}

/** গল্পের তালিকা: মানুষ, সংস্কৃতি আর অন্য কথা। */
export default function Golpo() {
  useTitle('গল্প')
  const [params, setParams] = useSearchParams()
  const kind = params.get('dhoron') ?? 'সব'
  const { data, error, loading } = useApi<PostCard[]>('/posts')
  const shown = (data ?? []).filter((p) => kind === 'সব' || p.kind === kind)
  const [lead, ...rest] = shown

  return (
    <div>
      {/* মাথার অংশ: এক পাশে লেখা, অন্য পাশে ময়ূর */}
      <section className="bg-cream-deep">
        <div className="mx-auto grid max-w-7xl items-end gap-4 px-4 pt-10 md:grid-cols-[1fr_auto]">
          <div className="pb-8 md:pb-14">
            <h1 className="text-5xl sm:text-6xl">গল্পের আসর</h1>
            <p className="mt-3 max-w-xl text-lg text-stone-700">কারিগরের কথা, হাটের কথা, বাংলার হাতের কাজের কথা।</p>
            <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto">
              {['সব', ...GOLPO_KINDS].map((k) => (
                <button key={k} type="button" onClick={() => setParams(k === 'সব' ? {} : { dhoron: k }, { replace: true })} aria-pressed={kind === k} className={`shrink-0 rounded-full px-5 py-2 ${kind === k ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <Moyur className="mx-auto h-56 w-auto sm:h-72 md:h-80" />
        </div>
        <StitchLine />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading && <MamaLoader label="গল্প আনছি…" />}
        {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-rickshaw">{error}</p>}
        {data && shown.length === 0 && <MamaScene kind="khoj" title="এই ধরনের গল্প এখনো নেই" text="শিগগিরই আসছে।" />}

        {lead && (
          <Link to={`/golpo/${lead.slug}`} className="group relative grid overflow-hidden rounded-[10px] bg-paper md:grid-cols-2">
            {lead.cover
              ? <img src={lead.cover} alt="" className="h-64 w-full object-cover md:h-full md:min-h-[22rem]" />
              : <div aria-hidden="true" style={{ background: ART_TONE[lead.art].bg }}><Art theme={lead.art} className="h-64 w-full md:h-full" /></div>}
            <div className="relative flex flex-col justify-center px-7 py-9 sm:px-12">
              <p className="text-rickshaw">{lead.kind} · {dateBn(lead.publishedAt)}</p>
              <h2 lang={lead.lang} className="mt-2 text-4xl leading-tight group-hover:text-rickshaw sm:text-5xl">{lead.title}</h2>
              <p lang={lead.lang} className="mt-4 text-lg text-stone-700">{lead.excerpt}</p>
              <span className="mt-6 self-start rounded-full bg-rickshaw px-6 py-3 text-white group-hover:bg-rickshaw-dark">পুরোটা পড়ুন</span>
            </div>
            <StitchFrame />
          </Link>
        )}

        {rest.length > 0 && (
          <>
            <p className="mt-10 text-stone-600">আরও {bn(rest.length)}টি গল্প</p>
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => <Card key={p.id} post={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
