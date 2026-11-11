import { Link, useParams } from 'react-router-dom'
import { bn } from '../data/products'
import { dateBn, readingMinutes, type Post, type PostCard } from '../lib/golpo'
import { useApi } from '../lib/useApi'
import { useTitle } from '../lib/useTitle'
import { useMarket } from '../store/market'
import { ART_TONE, Art, Jhuli } from '../components/art'
import GolpoBody from '../components/GolpoBody'
import Share from '../components/Share'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { Mascot } from '../libs/mascot'
import { StitchLine } from '../components/Stitch'

/** একটা গল্প পড়ার পাতা। নকশা থাকে ওপরে, দুই পাশে আর বিরতিতে; লেখা থাকে মাঝের কাগজে। */
export default function GolpoPost() {
  const { slug } = useParams()
  const { data: post, error, loading } = useApi<Post>(slug ? `/posts/${slug}` : null)
  const { data: all } = useApi<PostCard[]>('/posts')
  const { sellers } = useMarket()
  useTitle(post?.title)

  if (loading) return <MamaLoader full label="গল্প আনছি…" />
  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <MamaScene kind="khoj" as="h1" title="গল্পটা পাওয়া গেল না" text={error || undefined}>
          <Link to="/golpo" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">সব গল্প</Link>
        </MamaScene>
      </div>
    )
  }

  const tone = ART_TONE[post.art]
  const seller = sellers.find((s) => s.id === post.sellerId)
  const more = (all ?? []).filter((p) => p.id !== post.id).slice(0, 2)
  const tall = post.art === 'moyur'

  return (
    <article>
      {/* মাথার অংশ: শিরোনাম ওপরে, নকশা তার নিচে। একটার ওপর আরেকটা নয়। */}
      <header className="overflow-hidden" style={{ background: tone.bg, color: tone.ink }}>
        <div className={`mx-auto max-w-7xl ${tall ? 'grid items-end gap-6 px-4 md:grid-cols-[1fr_auto]' : ''}`}>
          <div className={`px-4 pt-10 ${tall ? 'pb-8 md:pb-14' : 'mx-auto max-w-4xl pb-6 text-center'}`}>
            <p style={{ color: tone.soft }}>
              <Link to="/golpo" className="underline underline-offset-4">গল্প</Link> · {post.kind}
            </p>
            <h1 lang={post.lang} className="mt-3 text-4xl leading-tight sm:text-6xl">{post.title}</h1>
            <p className="mt-4" style={{ color: tone.soft }}>{dateBn(post.publishedAt)} · {bn(readingMinutes(post.body))} মিনিটের পড়া</p>
          </div>
          <Art theme={post.art} className={tall ? 'mx-auto h-64 w-auto sm:h-80' : 'h-44 w-full sm:h-72'} />
        </div>
      </header>
      <StitchLine />

      <div className="relative py-10">
        {/* চওড়া পর্দায় দুই পাশের ফাঁকা জায়গায় সাজ: বাঁয়ে কাগজের ঝালর, ডানে মামা */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-10 left-0 hidden w-[calc((100%-46rem)/2)] justify-center xl:flex">
          <Jhuli className="sticky top-36 h-[30rem] w-auto" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-10 right-0 hidden w-[calc((100%-46rem)/2)] items-end justify-center xl:flex">
          <Mascot pose="dekhano" facing="left" mood="happy" className="sticky bottom-8 h-72 w-auto" />
        </div>

        {post.excerpt && (
          <p lang={post.lang} className="mx-auto mb-8 max-w-[46rem] px-4 text-center font-display text-2xl leading-relaxed text-rickshaw-dark">{post.excerpt}</p>
        )}
        <GolpoBody body={post.body} art={post.art} dropCap lang={post.lang} />

        <div className="mx-auto mt-10 max-w-[46rem] px-4">
          {seller && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-holud-soft px-6 py-5">
              <p className="text-lg">{seller.ownerName}, {seller.craft}, {seller.district}</p>
              <Link to={`/dokan/${seller.id}`} className="rounded-full bg-rickshaw px-6 py-2.5 text-white hover:bg-rickshaw-dark">তাঁর দোকানে যান</Link>
            </div>
          )}
          <Share text={post.title} />
        </div>
      </div>

      {more.length > 0 && (
        <section className="bg-cream-deep">
          <StitchLine />
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-3xl">আরও গল্প</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {more.map((p) => (
                <Link key={p.id} to={`/golpo/${p.slug}`} className="group overflow-hidden rounded-[10px] bg-paper">
                  <div aria-hidden="true" style={{ background: ART_TONE[p.art].bg }}><Art theme={p.art} className="mx-auto h-36 w-full" /></div>
                  <div className="px-6 py-5">
                    <p className="text-sm text-rickshaw">{p.kind} · {dateBn(p.publishedAt)}</p>
                    <h3 lang={p.lang} className="mt-1 font-display text-2xl leading-snug group-hover:text-rickshaw">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
