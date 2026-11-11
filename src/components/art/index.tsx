/**
 * গল্পের পাতার বড় নকশা: ময়ূর, নৌকা, ঘুড়ি-পাখি, শাপলার পুকুর, কাগজের ঝালর।
 * সব হাতে লেখা SVG, কাটা কাগজের মতো সাজানো। লেখার ওপরে বা পেছনে কখনো বসে না।
 */
import { useId, type ReactNode } from 'react'
import './art.css'

export type ArtTheme = 'moyur' | 'nouka' | 'pakhi' | 'shapla' | 'jhalor'

export const ART_THEMES: { id: ArtTheme; label: string }[] = [
  { id: 'moyur', label: 'ময়ূর' },
  { id: 'nouka', label: 'নৌকা' },
  { id: 'pakhi', label: 'ঘুড়ি আর পাখি' },
  { id: 'shapla', label: 'শাপলার পুকুর' },
  { id: 'jhalor', label: 'কাগজের ঝালর' },
]

/** প্রতিটি নকশার জমিন আর লেখার রং, যাতে ওপরের শিরোনাম পড়া যায় */
export const ART_TONE: Record<ArtTheme, { bg: string; ink: string; soft: string }> = {
  moyur: { bg: '#fdeecb', ink: '#1f3b73', soft: '#1f3b73' },
  nouka: { bg: '#1f3b73', ink: '#fff7e6', soft: '#fde68a' },
  pakhi: { bg: '#fde68a', ink: '#7f1d1d', soft: '#7f1d1d' },
  shapla: { bg: '#2f6b3a', ink: '#fff7e6', soft: '#fde68a' },
  jhalor: { bg: '#7f1d1d', ink: '#fff7e6', soft: '#fde68a' },
}

interface ArtProps { className?: string }

/** কাটা কাগজের ছায়া: নরম নয়, শক্ত কিনারা, একটু নিচে সরানো */
function Paper({ id, depth = 3 }: { id: string; depth?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx={depth * 0.5} dy={depth} stdDeviation="0" floodColor="#1c1917" floodOpacity="0.2" />
    </filter>
  )
}

function Svg({ viewBox, className = '', slice = false, children }: { viewBox: string; className?: string; slice?: boolean; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" className={`art ${className}`} preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMax meet'}>
      {children}
    </svg>
  )
}

/* ---------------- ময়ূর ---------------- */

const FEATHERS = Array.from({ length: 13 }, (_, i) => ({ a: -84 + i * 14, len: i % 2 ? 236 : 262 }))

function Feather({ a, len, i }: { a: number; len: number; i: number }) {
  return (
    <g className="art-feather" style={{ ['--a' as string]: `${a}deg` }}>
      <path d={`M0,0 C-20,${-len * 0.35} -24,${-len * 0.78} 0,${-len} C24,${-len * 0.78} 20,${-len * 0.35} 0,0 Z`} fill={i % 2 ? '#2f6b3a' : '#1d7a6b'} />
      <path d={`M0,-6 L0,${-len + 30}`} stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" />
      <g stroke="#fde68a" strokeWidth="1.6" opacity="0.55" strokeLinecap="round">
        {[0.3, 0.45, 0.6].map((t) => <path key={t} d={`M0,${-len * t} l-11,-12 M0,${-len * t} l11,-12`} />)}
      </g>
      <g className="art-eye" style={{ ['--d' as string]: `${(i % 5) * 0.6}s` }}>
        <ellipse cx="0" cy={-len + 36} rx="19" ry="25" fill="#f59e0b" />
        <ellipse cx="0" cy={-len + 38} rx="13.5" ry="18" fill="#0f766e" />
        <ellipse cx="0" cy={-len + 41} rx="8.5" ry="11.5" fill="#1f3b73" />
        <ellipse cx="0" cy={-len + 45} rx="4" ry="5" fill="#be185d" />
      </g>
    </g>
  )
}

/** ময়ূর। পেখম ধীরে খোলে আর গোটায়। */
export function Moyur({ className }: ArtProps) {
  const f = `mp-${useId().replace(/:/g, '')}`
  return (
    <Svg viewBox="0 0 600 400" className={className}>
      <defs><Paper id={f} /></defs>
      {/* মাটিতে আলপনার বিন্দু */}
      <g fill="#b91c1c" opacity="0.5">
        {Array.from({ length: 15 }).map((_, i) => <circle key={i} cx={90 + i * 30} cy={388 - Math.sin((i / 14) * Math.PI) * 10} r={i % 2 ? 2.4 : 4} />)}
      </g>
      <g transform="translate(300 318)" filter={`url(#${f})`}>
        {FEATHERS.map((x, i) => <Feather key={i} {...x} i={i} />)}
      </g>
      <g filter={`url(#${f})`}>
        {/* পা */}
        <path d="M286,352 L282,380 M282,380 l-10,5 M282,380 l8,6 M314,352 L318,380 M318,380 l-8,6 M318,380 l10,5" stroke="#b45309" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* শরীর */}
        <path d="M300,250 C340,256 356,296 344,328 C334,356 266,356 256,328 C244,296 260,256 300,250 Z" fill="#1f3b73" />
        <path d="M300,282 C324,290 330,318 318,338 C298,338 284,316 300,282 Z" fill="#0f766e" />
        <g fill="#fde68a" opacity="0.85">
          <circle cx="278" cy="300" r="2.6" /><circle cx="286" cy="318" r="2.6" /><circle cx="274" cy="322" r="2" />
        </g>
        <g className="art-neck">
          <path d="M300,272 C296,236 316,214 306,176" stroke="#1f3b73" strokeWidth="26" strokeLinecap="round" fill="none" />
          <path d="M300,262 C297,238 312,216 306,190" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
          <circle cx="308" cy="166" r="19" fill="#1f3b73" />
          <path d="M324,160 L348,168 L324,174 Z" fill="#f59e0b" />
          <circle cx="313" cy="162" r="6" fill="#fff7e6" /><circle cx="314.5" cy="162" r="2.8" fill="#1c1917" />
          {/* ঝুঁটি */}
          <g stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M300,150 L290,118" /><path d="M306,148 L306,112" /><path d="M312,150 L322,118" />
          </g>
          <circle cx="290" cy="116" r="5" fill="#f59e0b" /><circle cx="306" cy="110" r="5" fill="#be185d" /><circle cx="322" cy="116" r="5" fill="#f59e0b" />
        </g>
      </g>
    </Svg>
  )
}

/* ---------------- নৌকা ---------------- */

/** এক সারি ঢেউ। চওড়া করে আঁকা, যাতে সরলেও ফাঁক না পড়ে। */
function Wave({ y, fill, t, amp = 16 }: { y: number; fill: string; t: string; amp?: number }) {
  let d = `M-360,${y}`
  for (let x = -360; x < 1240; x += 80) d += ` q20,${-amp} 40,0 t40,0`
  d += ' V320 H-360 Z'
  return <path className="art-wave" style={{ ['--t' as string]: t }} d={d} fill={fill} />
}

function Bird({ x, y, t, d, s = 1 }: { x: number; y: number; t: string; d: string; s?: number }) {
  return (
    <g className="art-drift" style={{ ['--t' as string]: t, ['--d' as string]: d }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path className="art-flap" d="M-16,0 Q-8,-12 0,0 Q8,-12 16,0" stroke="#fff7e6" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    </g>
  )
}

/** পালতোলা নৌকা, তিন সারি ঢেউয়ের ওপর দোলে। */
export function Nouka({ className }: ArtProps) {
  const f = `np-${useId().replace(/:/g, '')}`
  return (
    <Svg viewBox="-200 0 1200 300" className={className} slice>
      <defs><Paper id={f} depth={4} /></defs>
      {/* সূর্য */}
      <g transform="translate(640 92)">
        <g className="art-rays" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round">
          {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="0" y1="-58" x2="0" y2="-74" transform={`rotate(${i * 30})`} />)}
        </g>
        <circle r="46" fill="#f59e0b" /><circle r="32" fill="#fde68a" />
      </g>
      <Bird x={0} y={70} t="30s" d="0s" />
      <Bird x={-40} y={96} t="30s" d="-0.4s" s={0.8} />
      <Bird x={0} y={50} t="38s" d="-17s" s={0.7} />
      <Wave y={196} fill="#3b62a8" t="14s" amp={12} />
      <g className="art-boat" filter={`url(#${f})`}>
        {/* পাল: জোড়া দেওয়া কাপড় */}
        <path d="M352,58 L352,196" stroke="#6b4318" strokeWidth="6" strokeLinecap="round" />
        <path d="M358,64 Q452,90 462,180 L358,188 Z" fill="#fff7e6" />
        <path d="M358,64 Q410,78 438,112 L358,118 Z" fill="#b91c1c" />
        <path d="M358,150 L460,160 L462,180 L358,188 Z" fill="#f59e0b" />
        <path d="M346,76 Q286,110 282,184 L346,188 Z" fill="#fde68a" />
        <path d="M346,132 L284,150 L282,184 L346,188 Z" fill="#be185d" />
        {/* খোল আর ছই */}
        <path d="M210,196 Q372,262 560,186 Q520,236 380,240 Q250,240 210,196 Z" fill="#7f1d1d" />
        <path d="M232,206 Q372,252 530,202" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="12 8" strokeLinecap="round" />
        <path d="M390,214 Q396,170 444,170 Q492,170 498,206 Z" fill="#a0702a" />
        <g stroke="#6b4318" strokeWidth="2" fill="none" opacity="0.7">
          <path d="M410,208 Q414,180 444,178" /><path d="M430,210 Q434,186 462,184" /><path d="M452,210 Q458,192 482,192" />
        </g>
      </g>
      <Wave y={226} fill="#2a4d8f" t="10s" />
      <Wave y={258} fill="#16305f" t="7s" amp={20} />
    </Svg>
  )
}

/* ---------------- ঘুড়ি আর পাখি ---------------- */

function Kite({ x, y, c, c2, t, d, s = 1 }: { x: number; y: number; c: string; c2: string; t: string; d: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,58 Q30,170 -20,300" stroke="#7f1d1d" strokeWidth="1.6" fill="none" opacity="0.6" />
      <g className="art-kite" style={{ ['--t' as string]: t, ['--d' as string]: d }}>
        <path d="M0,-62 L46,0 L0,58 L-46,0 Z" fill={c} />
        <path d="M0,-62 L46,0 L0,0 Z" fill={c2} />
        <path d="M0,-62 L0,58 M-46,0 L46,0" stroke="#7f1d1d" strokeWidth="2" opacity="0.5" />
        <g className="art-tail">
          <path d="M0,58 l-9,16 l18,0 Z M0,82 l-8,14 l16,0 Z M0,104 l-7,12 l14,0 Z" fill={c2} />
        </g>
      </g>
    </g>
  )
}

/** ভাঁজ করা কাগজের পাখি */
function PaperBird({ x, y, c, t, d, s = 1 }: { x: number; y: number; c: string; t: string; d: string; s?: number }) {
  return (
    <g className="art-drift" style={{ ['--t' as string]: t, ['--d' as string]: d }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-34,6 L10,-4 L40,-18 L22,6 L0,16 Z" fill={c} />
        <path className="art-flap" d="M-6,2 L8,-36 L18,-2 Z" fill="#fff7e6" />
        <path d="M-34,6 L-52,-4 L-40,12 Z" fill={c} opacity="0.8" />
      </g>
    </g>
  )
}

/** আকাশে ঘুড়ি আর কাগজের পাখি। */
export function Pakhi({ className }: ArtProps) {
  const f = `pp-${useId().replace(/:/g, '')}`
  return (
    <Svg viewBox="-200 0 1200 300" className={className} slice>
      <defs><Paper id={f} /></defs>
      {/* মেঘ */}
      <g fill="#fff7e6" opacity="0.75">
        <path d="M90,90 q14,-30 44,-16 q22,-26 50,-2 q30,-4 30,22 q0,16 -20,16 h-124 q-20,0 -20,-16 q0,-18 40,-4 Z" />
        <path d="M560,60 q12,-24 36,-12 q18,-20 40,-2 q24,-2 24,18 q0,12 -16,12 h-100 q-16,0 -16,-12 q0,-14 32,-4 Z" />
      </g>
      <g filter={`url(#${f})`}>
        <Kite x={170} y={150} c="#b91c1c" c2="#f59e0b" t="5s" d="0s" s={1.15} />
        <Kite x={420} y={104} c="#1f3b73" c2="#fff7e6" t="6.2s" d="-2s" s={0.9} />
        <Kite x={650} y={170} c="#2f6b3a" c2="#be185d" t="4.6s" d="-1s" s={1.05} />
        <Kite x={-90} y={120} c="#be185d" c2="#fff7e6" t="5.6s" d="-3s" s={0.85} />
        <Kite x={900} y={110} c="#f59e0b" c2="#b91c1c" t="5.2s" d="-2.4s" s={0.95} />
        <PaperBird x={0} y={70} c="#be185d" t="24s" d="0s" />
        <PaperBird x={0} y={210} c="#1f3b73" t="31s" d="-12s" s={0.8} />
        <PaperBird x={0} y={130} c="#b91c1c" t="36s" d="-25s" s={0.65} />
      </g>
    </Svg>
  )
}

/* ---------------- শাপলার পুকুর ---------------- */

function Pad({ x, y, r, d }: { x: number; y: number; r: number; d: string }) {
  return (
    <g className="art-bob" style={{ ['--d' as string]: d, ['--t' as string]: '5s' }}>
      <path d={`M${x},${y} L${x + r},${y - r * 0.12} A${r},${r * 0.42} 0 1 1 ${x + r * 0.86},${y - r * 0.26} Z`} fill="#3f8a4c" />
      <path d={`M${x},${y} L${x - r * 0.8},${y + r * 0.1} M${x},${y} L${x - r * 0.3},${y + r * 0.34} M${x},${y} L${x + r * 0.4},${y + r * 0.32}`} stroke="#2f6b3a" strokeWidth="2" opacity="0.7" />
    </g>
  )
}

function Lily({ x, y, s = 1, d, c = '#be185d' }: { x: number; y: number; s?: number; d: string; c?: string }) {
  return (
    <g className="art-bob" style={{ ['--d' as string]: d }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0,0 L0,60" stroke="#2f6b3a" strokeWidth="5" />
        {[-58, -34, 34, 58].map((a) => <path key={a} d="M0,0 C-13,-22 -11,-48 0,-64 C11,-48 13,-22 0,0 Z" fill={c} opacity="0.85" transform={`rotate(${a})`} />)}
        {[-16, 16].map((a) => <path key={a} d="M0,0 C-13,-24 -11,-54 0,-72 C11,-54 13,-24 0,0 Z" fill="#f472b6" transform={`rotate(${a})`} />)}
        <path d="M0,0 C-11,-24 -9,-52 0,-70 C9,-52 11,-24 0,0 Z" fill="#fff7e6" />
        <circle cx="0" cy="-8" r="7" fill="#f59e0b" />
      </g>
    </g>
  )
}

/** শাপলা ফোটা পুকুর। মাঝে মাঝে একটা মাছ লাফায়। */
export function Shapla({ className }: ArtProps) {
  const f = `sp-${useId().replace(/:/g, '')}`
  return (
    <Svg viewBox="-200 0 1200 300" className={className} slice>
      <defs><Paper id={f} /></defs>
      <Wave y={190} fill="#1d5a4a" t="16s" amp={8} />
      <Wave y={232} fill="#17493c" t="11s" amp={10} />
      {/* মাছ লাফালে পানিতে ঢেউ */}
      <ellipse className="art-ring" cx="470" cy="250" rx="34" ry="8" fill="none" stroke="#fde68a" strokeWidth="2.5" />
      <ellipse className="art-ring" cx="630" cy="250" rx="34" ry="8" fill="none" stroke="#fde68a" strokeWidth="2.5" style={{ ['--d' as string]: '2.1s' }} />
      <g className="art-fish">
        <path d="M-26,0 C-10,-14 14,-12 26,0 C14,12 -10,14 -26,0 Z" fill="#f59e0b" />
        <path d="M-26,0 L-44,-12 L-40,0 L-44,12 Z" fill="#c2410c" />
        <circle cx="14" cy="-3" r="2.6" fill="#1c1917" />
        <path d="M-6,-8 Q0,0 -6,8" stroke="#c2410c" strokeWidth="2" fill="none" />
      </g>
      <g filter={`url(#${f})`}>
        <Pad x={120} y={236} r={62} d="0s" />
        <Pad x={330} y={262} r={50} d="-1.5s" />
        <Pad x={700} y={240} r={58} d="-3s" />
        <Pad x={-110} y={250} r={54} d="-2s" />
        <Pad x={900} y={262} r={50} d="-0.8s" />
        <Lily x={-60} y={226} s={0.9} d="-1.8s" c="#9d174d" />
        <Lily x={930} y={236} s={0.85} d="-3s" />
        <Lily x={190} y={214} s={1.15} d="-1s" />
        <Lily x={292} y={238} s={0.8} d="-2.4s" c="#9d174d" />
        <Lily x={690} y={212} s={1} d="-0.4s" />
      </g>
      {/* ফড়িং */}
      <g className="art-hover">
        <g transform="translate(520 110) rotate(-18)">
          <path d="M-30,0 L22,0" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="26" cy="0" r="5" fill="#f59e0b" />
          <g className="art-flap" fill="#fff7e6" opacity="0.7">
            <ellipse cx="6" cy="-13" rx="7" ry="15" /><ellipse cx="-8" cy="-12" rx="6" ry="13" />
            <ellipse cx="6" cy="13" rx="7" ry="15" /><ellipse cx="-8" cy="12" rx="6" ry="13" />
          </g>
        </g>
      </g>
    </Svg>
  )
}

/* ---------------- কাগজের ঝালর ---------------- */

const FLAG_COLORS = ['#f59e0b', '#fff7e6', '#be185d', '#2f6b3a', '#fde68a', '#1f3b73']

/** এক টুকরো কাটা কাগজ: নিচে ঢেউ, ভেতরে কেটে বানানো ফুল */
function Flag({ x, y, c, i }: { x: number; y: number; c: string; i: number }) {
  const hole = c === '#fff7e6' || c === '#fde68a' || c === '#f59e0b' ? '#7f1d1d' : '#fde68a'
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="art-flag" style={{ ['--d' as string]: `${-(i % 5) * 0.5}s`, ['--t' as string]: `${2.8 + (i % 3) * 0.5}s` }}>
        <path d="M-30,0 H30 V58 q-7.5,12 -15,0 q-7.5,12 -15,0 q-7.5,12 -15,0 q-7.5,12 -15,0 Z" fill={c} />
        <g fill={hole} opacity="0.8">
          {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="0" cy="-10" rx="4" ry="8.5" transform={`translate(0 30) rotate(${a})`} />)}
          <circle cx="-20" cy="10" r="2.6" /><circle cx="20" cy="10" r="2.6" /><circle cx="-20" cy="50" r="2.6" /><circle cx="20" cy="50" r="2.6" />
        </g>
      </g>
    </g>
  )
}

/** মেলার দড়িতে টাঙানো কাগজের ঝালর, দুই সারি। */
export function Jhalor({ className }: ArtProps) {
  const f = `jp-${useId().replace(/:/g, '')}`
  // দড়ি মাঝখানে একটু ঝুলে থাকে
  const sag = (x: number, base: number, depth: number) => base + depth * (1 - ((x - 400) / 600) ** 2)
  const row = (n: number, base: number, depth: number, shift: number) =>
    Array.from({ length: n }, (_, i) => {
      const x = -170 + shift + i * (1140 / (n - 1))
      return { x, y: sag(x, base, depth), c: FLAG_COLORS[(i + (shift ? 3 : 0)) % FLAG_COLORS.length], i }
    })
  return (
    <Svg viewBox="-200 0 1200 300" className={className} slice>
      <defs><Paper id={f} /></defs>
      <path d="M-210,30 Q400,112 1010,30" stroke="#fde68a" strokeWidth="2.5" fill="none" />
      <g filter={`url(#${f})`}>{row(16, 30, 41, 0).map((p) => <Flag key={p.i} {...p} />)}</g>
      <path d="M-210,128 Q400,222 1010,128" stroke="#fde68a" strokeWidth="2.5" fill="none" />
      <g filter={`url(#${f})`}>{row(15, 128, 47, 38).map((p) => <Flag key={p.i} {...p} i={p.i + 2} />)}</g>
    </Svg>
  )
}

/** নাম ধরে নকশা */
export function Art({ theme, className }: { theme: ArtTheme; className?: string }) {
  if (theme === 'nouka') return <Nouka className={className} />
  if (theme === 'pakhi') return <Pakhi className={className} />
  if (theme === 'shapla') return <Shapla className={className} />
  if (theme === 'jhalor') return <Jhalor className={className} />
  return <Moyur className={className} />
}
