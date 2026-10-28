/** আলপনা ভাগ, চলমান লেখা আর বৈশাখের সূর্য। */

export function AlpanaBorder() {
  return (
    <div aria-hidden="true" className="flex items-center gap-2 py-1">
      <div className="kantha-border flex-1" />
      <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0 animate-spin-slow">
        <circle cx="13" cy="13" r="9" fill="#f59e0b" />
        <circle cx="13" cy="13" r="4" fill="#b91c1c" />
      </svg>
      <div className="kantha-border flex-1" />
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
