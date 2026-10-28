/**
 * কাঁথার ফোঁড়। হাতে সেলাইয়ের মতো ফোঁড়গুলো একটু অসমান।
 * হোভার করলে সুতো একটু এগোয়, যেন এখনই সেলাই হচ্ছে।
 */
const RUNNING = '13 8 9 7 15 9 10 8'

interface FrameProps {
  /** কিনারা থেকে কত ভেতরে সেলাই */
  inset?: number
  radius?: number
  color?: string
  className?: string
}

/** পুরো বাক্সের চারপাশে সেলাই। বাক্সটা relative হতে হবে। */
export function StitchFrame({ inset = 7, radius = 6, color = 'var(--color-rickshaw)', className = '' }: FrameProps) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute overflow-visible ${className}`}
      style={{ left: inset, top: inset, width: `calc(100% - ${inset * 2}px)`, height: `calc(100% - ${inset * 2}px)` }}
    >
      <rect
        className="stitch-thread"
        width="100%"
        height="100%"
        rx={radius}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.85"
        strokeLinecap="round"
        strokeDasharray={RUNNING}
      />
    </svg>
  )
}

interface LineProps {
  colors?: [string, string]
  className?: string
}

/** দুই রঙের সুতোয় পাশাপাশি দুই সারি ফোঁড়। ভাগ করার রেখা হিসেবে। */
export function StitchLine({ colors = ['var(--color-rickshaw)', 'var(--color-holud)'], className = '' }: LineProps) {
  return (
    <svg aria-hidden="true" className={`block h-2.5 w-full ${className}`}>
      <line x1="0" x2="100%" y1="3" y2="3" stroke={colors[0]} strokeWidth="2" strokeLinecap="round" strokeDasharray={RUNNING} />
      <line x1="0" x2="100%" y1="8" y2="8" stroke={colors[1]} strokeWidth="2" strokeLinecap="round" strokeDasharray={RUNNING} strokeDashoffset="8" />
    </svg>
  )
}
