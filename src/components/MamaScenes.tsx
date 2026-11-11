import { useEffect, useState, type ReactNode } from 'react'
import { Mascot } from '../libs/mascot'
import { Haat, Home } from './MascotRoad'

/** খেজুর গাছ, পথের ধারে */
function Gachh({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" aria-hidden="true" className={className}>
      <path d="M28,88 Q26,56 31,30 L35,30 Q33,58 36,88 Z" fill="#8a5a1a" />
      <g stroke="#6b4318" strokeWidth="1.2" opacity="0.6">
        {[40, 50, 60, 70, 80].map((y) => <path key={y} d={`M28,${y} l7,-3`} />)}
      </g>
      <g fill="#2f6b3a">
        <path d="M33,30 Q14,14 2,24 Q16,22 33,34 Z" />
        <path d="M33,30 Q52,14 58,26 Q46,22 33,34 Z" />
        <path d="M33,30 Q22,2 8,6 Q22,10 31,32 Z" />
        <path d="M33,30 Q42,2 54,8 Q42,10 35,32 Z" />
        <path d="M33,30 Q32,6 34,0 Q38,10 35,32 Z" fill="#3f8a4c" />
      </g>
    </svg>
  )
}

/** কলাগাছ */
function Kola({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" aria-hidden="true" className={className}>
      <path d="M27,78 Q26,50 29,34 L33,34 Q33,52 35,78 Z" fill="#7a9a4a" />
      <g fill="#2f6b3a">
        <path d="M30,36 Q6,30 4,10 Q22,14 32,34 Z" />
        <path d="M31,36 Q54,28 56,8 Q38,14 30,34 Z" />
        <path d="M30,36 Q24,10 32,2 Q40,12 33,36 Z" fill="#3f8a4c" />
      </g>
    </svg>
  )
}

/** পথের ধারের জিনিস, এক সারিতে। দুবার বসে, যাতে ঘুরে ঘুরে চলতে পারে। */
function Scenery() {
  return (
    <span className="flex shrink-0 items-end gap-24 pr-24 sm:gap-36 sm:pr-36">
      <Gachh className="h-24 w-16" />
      <Haat className="h-16 w-16" />
      <Kola className="h-20 w-14" />
      <Home className="h-16 w-16" />
      <Gachh className="h-20 w-14" />
      <Kola className="h-16 w-12" />
    </span>
  )
}

interface LoaderProps {
  /** প্রথম কয়েক সেকেন্ডের কথা */
  label?: string
  /** দেরি হলে যে কথা দেখায় */
  slowLabel?: string
  /** কত মিলিসেকেন্ড পরে মামা বসে পড়েন */
  patience?: number
  /** পুরো পাতা জুড়ে, নাকি ছোট জায়গায় */
  full?: boolean
  className?: string
}

/**
 * অপেক্ষার ছবি। মামা গ্রামের পথে হাঁটেন, পাশ দিয়ে গাছ, দোকান, বাড়ি সরে যায়।
 * দেরি হলে মোড়ায় বসে গামছা দিয়ে মাছি তাড়ান।
 */
export function MamaLoader({ label = 'আসছি…', slowLabel = 'একটু জিরিয়ে নিচ্ছি, এখনই আসছি।', patience = 4000, full = false, className = '' }: LoaderProps) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), patience)
    return () => window.clearTimeout(t)
  }, [patience])

  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center px-4 ${full ? 'min-h-[60vh] py-10' : 'py-8'} ${className}`}>
      <div className="relative h-52 w-full max-w-xl overflow-hidden">
        {/* সরে যাওয়া পথের ধার */}
        <div aria-hidden="true" className={`mama-scenery absolute bottom-7 left-0 flex w-max items-end ${slow ? 'is-paused' : ''}`}>
          <Scenery />
          <Scenery />
        </div>
        {/* পথ */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-4 h-3 rounded-full bg-[#dcc08f]">
          <svg className="absolute inset-x-3 top-1 h-1 w-[calc(100%-1.5rem)]">
            <line x1="0" x2="100%" y1="2" y2="2" stroke="#b8945a" strokeWidth="2" strokeLinecap="round" className={slow ? '' : 'mama-road-dash'} strokeDasharray="10 9" />
          </svg>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          {slow
            ? <Mascot pose="machi" className="h-40 w-auto" />
            : <Mascot pose="haat" walking className="h-44 w-auto" />}
        </div>
      </div>
      <p className="mt-3 text-center text-lg text-stone-700">{slow ? slowLabel : label}</p>
    </div>
  )
}

interface SceneProps {
  /** khoj: পথ হারানো বা কিছু না পাওয়া। khali: ঝুড়ি বা তালিকা খালি, মামা বসে মাছি তাড়ান। swagoto: হাত নেড়ে ডাকা। */
  kind: 'khoj' | 'khali' | 'swagoto'
  title: string
  text?: string
  /** শিরোনাম h1 না h2 */
  as?: 'h1' | 'h2'
  children?: ReactNode
  className?: string
}

/** মামাসহ একটা ছোট দৃশ্য: ছবি, শিরোনাম, এক লাইন কথা আর নিচে বোতাম। খালি পাতা আর ভুল ঠিকানার জন্য। */
export function MamaScene({ kind, title, text, as: Tag = 'h2', children, className = '' }: SceneProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {kind === 'khoj' && <Mascot pose="khoj" className="h-52 w-auto" />}
      {kind === 'khali' && <Mascot pose="machi" jhuri="ground" fill={0} className="h-44 w-auto" />}
      {kind === 'swagoto' && <Mascot pose="haat-nara" mood="happy" className="h-52 w-auto" />}
      <Tag className="mt-4 font-display text-3xl">{title}</Tag>
      {text && <p className="mt-2 max-w-md text-stone-600">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}
