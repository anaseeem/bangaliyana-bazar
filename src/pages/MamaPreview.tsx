import { Mascot, type MascotPose } from '../libs/mascot'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { ART_THEMES, ART_TONE, Art } from '../components/art'

const POSES: MascotPose[] = ['jhuri', 'haat', 'machi', 'khoj', 'dekhano', 'haat-nara']

/** শুধু ডেভেলপমেন্টে: মামার সব ভঙ্গি এক পাতায়, আঁকা মেলানোর জন্য। */
export default function MamaPreview() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl">মামার ভঙ্গি</h1>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
        {POSES.map((p) => (
          <figure key={p} className="rounded-[10px] bg-paper p-4 text-center">
            <Mascot pose={p} walking={p === 'haat'} mood={p === 'haat-nara' ? 'happy' : 'neutral'} jhuri={p === 'machi' ? 'ground' : undefined} fill={2} className="mx-auto h-72" />
            <figcaption>{p}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[10px] bg-paper"><MamaLoader patience={600000} /></div>
        <div className="rounded-[10px] bg-paper"><MamaLoader patience={0} /></div>
        <div className="rounded-[10px] bg-paper p-6"><MamaScene kind="khoj" title="এই পাতাটা নেই" text="মেলায় পথ হারালেন? বাজারে ফিরে আবার খুঁজুন।" /></div>
        <div className="rounded-[10px] bg-paper p-6"><MamaScene kind="khali" title="ঝুড়ি খালি" text="মামা বসে বসে মাছি তাড়াচ্ছেন।" /></div>
      </div>
      <div className="mt-8 grid gap-6">
        {ART_THEMES.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-[10px]" style={{ background: ART_TONE[t.id].bg }}>
            <Art theme={t.id} className={t.id === 'moyur' ? 'mx-auto h-96 w-auto' : 'h-48 w-full sm:aspect-[4/1] sm:h-auto'} />
          </div>
        ))}
      </div>
    </div>
  )
}
