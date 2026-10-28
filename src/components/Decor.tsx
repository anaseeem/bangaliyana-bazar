/** আলপনা ভাগ, চলমান লেখা আর বৈশাখের সূর্য। */
import { AlpanaFlower } from './Alpana'
import { StitchLine } from './Stitch'

/** দুই সারি সেলাই, মাঝখানে একটা আলপনা ফুল। গাঢ় জমিনে হলুদ আর সাদা সুতো। */
export function AlpanaBorder({ onDark = false }: { onDark?: boolean }) {
  const colors: [string, string] = onDark ? ['var(--color-holud)', 'var(--color-alpana)'] : ['var(--color-rickshaw)', 'var(--color-holud)']
  return (
    <div aria-hidden="true" className="flex items-center gap-3 py-1">
      <StitchLine colors={colors} className="flex-1" />
      <AlpanaFlower petal={onDark ? 'var(--color-holud)' : undefined} className="h-10 w-10 shrink-0" />
      <StitchLine colors={colors} className="flex-1" />
    </div>
  )
}

const MARQUEE_ITEMS = [
  'হাতে বোনা',
  'মাটির গন্ধ',
  'বাংলার ঐতিহ্য',
  'নকশি কাঁথা',
  'জামদানি',
  'পহেলা বৈশাখ',
  'কারিগরের হাতের ছোঁয়া',
]

export function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden bg-rickshaw-dark py-2.5 text-cream" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {[0, 1].map((half) => (
          <span key={half} className="flex gap-8">
            {row.map((t, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-8 text-sm tracking-wide">
                {t} <span className="text-holud">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

export function BoishakhSun({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g className="animate-spin-slow" style={{ transformOrigin: '100px 100px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="6"
            x2="100"
            y2="28"
            stroke="#f59e0b"
            strokeWidth="7"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
      </g>
      <circle cx="100" cy="100" r="52" fill="#f59e0b" className="animate-sun" style={{ transformOrigin: '100px 100px' }} />
      <circle cx="100" cy="100" r="38" fill="#fff7e6" />
      <circle cx="100" cy="100" r="22" fill="#b91c1c" />
      <text x="100" y="108" textAnchor="middle" fontSize="22" fill="#fff7e6" fontFamily="Noto Serif Bengali, serif">১৪৩৩</text>
    </svg>
  )
}

/** লোগো: হোম পাতার বৈশাখের সূর্য, ছোট মাপে, সাল ছাড়া। favicon.svg-ও এই নকশা। */
export function SunMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="100" y1="8" x2="100" y2="34" stroke="#f59e0b" strokeWidth="13" strokeLinecap="round" transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="54" fill="#f59e0b" />
      <circle cx="100" cy="100" r="38" fill="#fff7e6" />
      <circle cx="100" cy="100" r="23" fill="#b91c1c" />
    </svg>
  )
}
