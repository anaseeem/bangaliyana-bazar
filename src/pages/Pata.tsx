import { Link } from 'react-router-dom'
import { useApi } from '../lib/useApi'
import { useTitle } from '../lib/useTitle'
import GolpoBody from '../components/GolpoBody'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { Mascot } from '../libs/mascot'
import { StitchLine } from '../components/Stitch'

interface Page { id: string; title: string; body: string }

/** সাধারণ লেখার পাতা: আমাদের কথা, সাহায্য, নিয়ম। লেখা অ্যাডমিন থেকে বদলানো যায়। */
export default function Pata({ id }: { id: 'amader-kotha' | 'sahajjo' | 'niyom' }) {
  const { data, error, loading } = useApi<Page>(`/pages/${id}`)
  useTitle(data?.title)

  if (loading) return <MamaLoader full />
  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <MamaScene kind="khoj" as="h1" title="পাতাটা খোলা গেল না" text={error || undefined}>
          <Link to="/" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">হোমে ফিরুন</Link>
        </MamaScene>
      </div>
    )
  }
  return (
    <div>
      <section className="bg-cream-deep">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-6 px-4 pt-10">
          <h1 className="pb-10 text-5xl sm:text-6xl">{data.title}</h1>
          {/* আমাদের কথায় মামা হাত নেড়ে ডাকেন, বাকি পাতায় হাত বাড়িয়ে দেখান */}
          <Mascot pose={id === 'amader-kotha' ? 'haat-nara' : 'dekhano'} facing="left" mood="happy" className="h-44 w-auto shrink-0 sm:h-56" />
        </div>
        <StitchLine />
      </section>
      <div className="py-10">
        <GolpoBody body={data.body} art="jhalor" />
        {id === 'sahajjo' && (
          <p className="mx-auto mt-8 max-w-[46rem] px-4 text-center text-lg">
            উত্তর পাননি? <Link to="/jogajog" className="text-rickshaw underline decoration-holud underline-offset-4">আমাদের লিখুন</Link>
          </p>
        )}
      </div>
    </div>
  )
}
