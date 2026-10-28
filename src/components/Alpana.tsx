/**
 * আলপনা। চালের গুঁড়ির সাদা নকশা, রঙিন মেঝেতে যেমন আঁকা হয়।
 */

type Corner = 'tl' | 'tr' | 'bl' | 'br'
const ROTATE: Record<Corner, number> = { tl: 0, tr: 90, br: 180, bl: 270 }

/** কোণের আলপনা। রঙিন জমিনের ওপর বসে। */
export function AlpanaCorner({ corner = 'tl', className = '', color = '#fffaf0' }: { corner?: Corner; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true" className={`pointer-events-none ${className}`} style={{ transform: `rotate(${ROTATE[corner]}deg)` }}>
      <g fill={color} opacity="0.85">
        {/* কোণ থেকে তিনটা পাপড়ি */}
        <path d="M6,6 C20,8 28,16 26,26 C16,28 8,20 6,6 Z" />
        <path d="M30,8 C38,10 42,16 40,22 C34,22 30,16 30,8 Z" opacity="0.75" />
        <path d="M8,30 C10,38 16,42 22,40 C22,34 16,30 8,30 Z" opacity="0.75" />
        {/* বিন্দুর সারি */}
        <circle cx="48" cy="8" r="2" />
        <circle cx="54" cy="16" r="1.4" />
        <circle cx="8" cy="48" r="2" />
        <circle cx="16" cy="54" r="1.4" />
        <circle cx="36" cy="36" r="2.2" />
      </g>
    </svg>
  )
}

/** গোল আলপনা ফুল। ভাগের মাঝখানে বসে। */
export function AlpanaFlower({ className = '', petal = 'var(--color-rickshaw)' }: { className?: string; petal?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <g transform="translate(24 24)">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d="M0,-4 C5,-9 4,-17 0,-21 C-4,-17 -5,-9 0,-4 Z" fill={petal} transform={`rotate(${i * 45})`} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx="0" cy="-14" r="1.6" fill="var(--color-alpana)" transform={`rotate(${i * 45 + 22.5})`} />
        ))}
        <circle r="5" fill="var(--color-holud)" />
        <circle r="2" fill="var(--color-alpana)" />
      </g>
    </svg>
  )
}
