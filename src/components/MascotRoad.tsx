import { useEffect, useState } from 'react'
import { Mascot, type JhuriFill, type MascotMood } from '../libs/mascot'

interface Props {
  /** কোন ধাপে আছি, ০ থেকে শুরু */
  step: number
  steps: number
  /** বাইরে থেকে আসা মেজাজ, যেমন জিনিস সরালে দুঃখ */
  mood: MascotMood
  fill: JhuriFill
}

const WALK_MS = { forward: 1300, back: 1900 }

/** ধাপ অনুযায়ী রাস্তার কোথায় দাঁড়াবে। হাট আর বাড়ির মাঝের জায়গাটুকুতে, যাতে ছোট ফোনেও দোকানের ওপর না পড়ে। */
const spot = (step: number, steps: number) => `calc(5.5rem + (100% - 11rem) * ${step / (steps - 1)})`

/**
 * হাট থেকে বাড়ির রাস্তা। মামা ঝুড়ি মাথায় হেঁটে যান।
 * সামনে এগোলে খুশি মনে হাঁটেন, পেছনে গেলে ঘুরে মন খারাপ করে ধীরে ফেরেন।
 */
export default function MascotRoad({ step, steps, mood, fill }: Props) {
  // ধাপ বদলালে হাঁটা শুরু। আগের ধাপ মনে রেখে দিক ঠিক হয়।
  const [prev, setPrev] = useState(step)
  const [walk, setWalk] = useState<{ dir: 'forward' | 'back'; n: number; arrived: boolean } | null>(null)
  if (step !== prev) {
    setPrev(step)
    setWalk({ dir: step > prev ? 'forward' : 'back', n: (walk?.n ?? 0) + 1, arrived: false })
  }

  const walkKey = walk ? `${walk.n}` : ''
  const walkDir = walk?.dir
  useEffect(() => {
    if (!walkDir) return
    // পৌঁছে থামেন। পেছনে ফিরলে থামার পরও একটু মন খারাপ থাকে।
    const stop = window.setTimeout(() => setWalk((w) => (w ? { ...w, arrived: true } : w)), WALK_MS[walkDir])
    const clear = window.setTimeout(() => setWalk(null), WALK_MS[walkDir] + (walkDir === 'back' ? 1200 : 0))
    return () => { window.clearTimeout(stop); window.clearTimeout(clear) }
  }, [walkKey, walkDir])

  const done = step === steps - 1
  const goingBack = walk?.dir === 'back'
  const walking = walk !== null && !walk.arrived
  const shownMood: MascotMood = goingBack ? 'sad' : done ? 'happy' : mood

  return (
    <div className="jhuri-road sticky bottom-0 z-30 border-t-2 border-amber-200 bg-cream/95 backdrop-blur">
      <div className="relative mx-auto h-28 max-w-5xl px-4 sm:h-36">
        {/* রাস্তা */}
        <div className="absolute right-4 bottom-4 left-4 h-3 rounded-full bg-[#dcc08f]">
          <svg aria-hidden="true" className="absolute inset-x-3 top-1 h-1 w-[calc(100%-1.5rem)]">
            <line x1="0" x2="100%" y1="2" y2="2" stroke="#b8945a" strokeWidth="2" strokeDasharray="10 9" strokeLinecap="round" />
          </svg>
        </div>
        {/* প্রতিটি ধাপের খুঁটি */}
        {Array.from({ length: steps }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`absolute bottom-[1.35rem] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 ${i <= step ? 'border-rickshaw bg-holud' : 'border-[#b8945a] bg-cream'}`}
            style={{ left: spot(i, steps) }}
          />
        ))}
        <Haat className="absolute bottom-6 left-1 h-14 w-14 sm:h-16 sm:w-16" />
        <Home className="absolute right-1 bottom-6 h-14 w-14 sm:h-16 sm:w-16" />
        {/* মামা */}
        <div
          className="absolute bottom-3 -translate-x-1/2 ease-linear motion-reduce:transition-none"
          style={{ left: spot(step, steps), transitionProperty: 'left', transitionDuration: `${WALK_MS[walk?.dir ?? 'forward']}ms` }}
        >
          <Mascot
            mood={shownMood}
            fill={fill}
            walking={walking}
            facing={goingBack && walking ? 'left' : 'right'}
            className="h-24 w-[52px] sm:h-32 sm:w-[68px]"
          />
        </div>
      </div>
    </div>
  )
}

/** হাটের ছোট্ট দোকান: ডোরাকাটা শামিয়ানা আর মাচা। */
function Haat({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true" className={className}>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={6 + i * 10} y="10" width="10" height="12" fill={i % 2 ? '#fff7e6' : '#b91c1c'} />)}
      <path d="M6,22 Q11,27 16,22 Q21,27 26,22 Q31,27 36,22 Q41,27 46,22 Q51,27 56,22" fill="#b91c1c" />
      <rect x="9" y="22" width="3" height="34" fill="#a0702a" />
      <rect x="50" y="22" width="3" height="34" fill="#a0702a" />
      <rect x="8" y="40" width="46" height="4" fill="#8a5a1a" />
      <circle cx="20" cy="36" r="4" fill="#c2410c" />
      <rect x="28" y="32" width="10" height="8" fill="#2f6b3a" />
      <circle cx="44" cy="37" r="3" fill="#f59e0b" />
    </svg>
  )
}

/** গ্রামের বাড়ি: খড়ের চাল, মাটির দেয়াল। */
function Home({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true" className={className}>
      <rect x="12" y="30" width="36" height="26" fill="#c8835a" />
      <rect x="25" y="38" width="10" height="18" rx="1" fill="#7f1d1d" />
      <path d="M4,32 L30,10 L56,32 Z" fill="#d9a441" />
      <g stroke="#a87a2a" strokeWidth="1.2">
        <path d="M14,28 L30,14" />
        <path d="M22,30 L33,16" />
        <path d="M38,29 L30,16" />
        <path d="M46,29 L33,15" />
      </g>
      <circle cx="18" cy="42" r="1.6" fill="#fff7e6" />
      <circle cx="42" cy="42" r="1.6" fill="#fff7e6" />
    </svg>
  )
}
