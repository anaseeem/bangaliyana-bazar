import { useRef, useState } from 'react'
import { errorText, uploadImage } from '../../lib/api'
import { shrinkImage } from '../../lib/local'
import type { ArtTheme } from '../../components/art'
import GolpoBody from '../../components/GolpoBody'
import { Alert } from './shared'

const CHEAT: [string, string][] = [['ফাঁকা লাইন', 'নতুন অনুচ্ছেদ'], ['# ', 'শিরোনাম'], ['> ', 'বড় উক্তি'], ['---', 'নকশার বিরতি']]

/** লেখার ঘর আর পাশে (ফোনে নিচে) সাথে সাথে দেখা, আর ছবি বসানোর বোতাম */
export default function BodyEditor({ id, value, onChange, art, lang = 'bn', images = false, dropCap = false }: {
  id: string; value: string; onChange: (v: string) => void; art?: ArtTheme; lang?: 'bn' | 'en'; images?: boolean; dropCap?: boolean
}) {
  const box = useRef<HTMLTextAreaElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const insertImage = async (file?: File) => {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const url = await uploadImage(await shrinkImage(file, 1000))
      const at = box.current?.selectionStart ?? value.length
      const piece = `${at > 0 ? '\n\n' : ''}![ছবির কথা](${url})\n\n`
      onChange(value.slice(0, at) + piece + value.slice(box.current?.selectionEnd ?? at))
    } catch (e) {
      setError(e instanceof Error && e.message === 'image' ? 'ছবিটা খোলা গেল না। অন্য ছবি দিন।' : errorText(e))
    }
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id}>লেখা</label>
        {images && (
          <>
            <label htmlFor={`${id}-img`} className="cursor-pointer rounded-full bg-holud px-4 py-1.5 hover:bg-amber-400">{busy ? 'ছবি উঠছে…' : 'ছবি বসান'}</label>
            <input id={`${id}-img`} type="file" accept="image/*" disabled={busy} onChange={(e) => { void insertImage(e.target.files?.[0]); e.target.value = '' }} className="sr-only" />
          </>
        )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
        {CHEAT.map(([k, v]) => <li key={k}><code className="rounded bg-cream-deep px-1.5">{k}</code> {v}</li>)}
      </ul>
      <div className="mt-3 grid items-start gap-5 lg:grid-cols-2">
        <textarea id={id} ref={box} rows={18} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border-2 border-amber-300 bg-paper px-4 py-3 focus:border-rickshaw focus:outline-none" />
        <div className="rounded-[10px] bg-cream-deep/50 p-4">
          <p className="mb-3 text-sm text-stone-600">এমন দেখাবে</p>
          {value.trim() ? <GolpoBody body={value} art={art} dropCap={dropCap} lang={lang} /> : <p className="text-stone-500">কিছু লিখলে এখানে দেখা যাবে।</p>}
        </div>
      </div>
      <div className="mt-3"><Alert text={error} /></div>
    </div>
  )
}
