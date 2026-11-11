import { Link } from 'react-router-dom'
import { dateBn, type PostCard } from '../lib/golpo'
import { useApi } from '../lib/useApi'
import { Mascot } from '../libs/mascot'
import { ART_TONE, Art } from './art'
import { Haat, Home } from './MascotRoad'
import { StitchFrame, StitchLine } from './Stitch'

const STEPS = [
  { title: 'বাছুন', text: 'পছন্দের জিনিস ঝুড়িতে নিন।' },
  { title: 'মামা নিয়ে আসেন', text: 'কারিগর পাঠান, মামা বাড়ি পৌঁছে দেন।' },
  { title: 'হাতে পেয়ে টাকা দিন', text: 'আগে কিছু দিতে হয় না।' },
]

/** কীভাবে আসে: হাট থেকে বাড়ি, মাঝপথে মামা। ঝুড়ির রাস্তারই ছোট রূপ। */
export function KibhabeAshe() {
  return (
    <section className="bg-cream-deep">
      <StitchLine />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-center text-3xl">কীভাবে আসে</h2>
        <div className="relative mt-8">
          {/* তিন ছবির নিচ দিয়ে একটা পথ */}
          <div aria-hidden="true" className="absolute inset-x-[10%] top-[6.6rem] h-3 rounded-full bg-[#dcc08f] sm:top-[8.6rem]">
            <svg className="absolute inset-x-3 top-1 h-1 w-[calc(100%-1.5rem)]"><line x1="0" x2="100%" y1="2" y2="2" stroke="#b8945a" strokeWidth="2" strokeDasharray="10 9" strokeLinecap="round" /></svg>
          </div>
          <ol className="relative grid grid-cols-3 gap-3 text-center">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center">
                <div className="flex h-28 items-end sm:h-36">
                  {i === 0 && <Haat className="h-20 w-20 sm:h-28 sm:w-28" />}
                  {i === 1 && <Mascot fill={2} walking className="h-28 w-auto sm:h-36" />}
                  {i === 2 && <Home className="h-20 w-20 sm:h-28 sm:w-28" />}
                </div>
                <p className="mt-5 font-display text-lg leading-snug sm:text-2xl">{s.title}</p>
                <p className="mt-1 text-sm text-stone-700 sm:text-base">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <StitchLine />
    </section>
  )
}

/** নতুন দুটো গল্প। সার্ভার না পেলে বা গল্প না থাকলে অংশটাই থাকে না। */
export function NotunGolpo() {
  const { data } = useApi<PostCard[]>('/posts')
  const posts = (data ?? []).slice(0, 2)
  if (posts.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl">গল্পের আসর</h2>
        <Link to="/golpo" className="rounded-full border-2 border-rickshaw px-4 py-2 text-sm text-rickshaw hover:bg-holud-soft">সব গল্প</Link>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} to={`/golpo/${p.slug}`} className="group relative grid overflow-hidden rounded-[10px] bg-paper sm:grid-cols-[2fr_3fr]">
            <div aria-hidden="true" className="overflow-hidden" style={{ background: ART_TONE[p.art].bg }}>
              <Art theme={p.art} className="mx-auto h-40 w-full sm:h-full" />
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-rickshaw">{p.kind} · {dateBn(p.publishedAt)}</p>
              <h3 lang={p.lang} className="mt-1 font-display text-2xl leading-snug group-hover:text-rickshaw">{p.title}</h3>
              <p lang={p.lang} className="mt-2 text-stone-700">{p.excerpt}</p>
            </div>
            <StitchFrame />
          </Link>
        ))}
      </div>
    </section>
  )
}
