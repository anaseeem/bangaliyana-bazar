import { useId, type ReactNode } from 'react'
import './mascot.css'
import type { JhuriFill, MascotMood } from './types'
import torso from './parts/torso.webp'
import lungi from './parts/lungi.webp'
import gamchha from './parts/gamchha.webp'
import sleeveL from './parts/sleeve_l.webp'
import sleeveR from './parts/sleeve_r.webp'
import forearmL from './parts/forearm_l.webp'
import forearmR from './parts/forearm_r.webp'
import handL from './parts/hand_l.webp'
import handR from './parts/hand_r.webp'
import shinL from './parts/shin_l.webp'
import shinR from './parts/shin_r.webp'
import foot from './parts/foot_r.webp'
import headNeutral from './parts/head_neutral.webp'
import headHappy from './parts/head_happy.webp'
import headSad from './parts/head_sad.webp'

export interface MascotProps {
  mood?: MascotMood
  fill?: JhuriFill
  walking?: boolean
  facing?: 'right' | 'left'
  className?: string
  /** স্ক্রিন রিডারের জন্য। না দিলে ছবিটা সাজ হিসেবে লুকানো থাকে। */
  label?: string
}

/*
 * মামার অংশগুলো চরিত্রের নকশার পাতা (design/uncle-inspiration.png) থেকে কেটে নেওয়া।
 * সব মাপ পাতার পিক্সেলে, ধড়ের ওপরের বাঁ কোণ (০,০)। হাত-পা সোজা ঝোলানো অবস্থায় কাটা,
 * জোড়াটা ওপরে, তাই এখানে শুধু কোণ বদলে ভঙ্গি তৈরি হয়।
 */
const SHOULDER_L = { x: 30, y: 42 }
const SHOULDER_R = { x: 143, y: 42 }
const NECK = { x: 88, y: 22 }
const KNEE_BACK = { x: 72, y: 296 }
const KNEE_FRONT = { x: 104, y: 296 }

/** মেজাজ অনুযায়ী মাথা। নোঙর = গলার নিচের মাঝখান, ছবির ভেতরে। */
const HEADS: Record<MascotMood, { src: string; w: number; h: number; ax: number; ay: number; scale: number }> = {
  neutral: { src: headNeutral, w: 105, h: 147, ax: 48, ay: 139, scale: 1 },
  happy: { src: headHappy, w: 133, h: 182, ax: 67, ay: 172, scale: 0.8 },
  sad: { src: headSad, w: 177, h: 182, ax: 80, ay: 172, scale: 0.8 },
}

/** একটা অংশ: জোড়ার বিন্দু (px, py) বসে (x, y) তে, সেখান থেকে angle ডিগ্রি ঘোরে। ভেতরের children পরের জোড়া। */
function Limb({ src, w, h, px, py, x, y, angle, children }: { src: string; w: number; h: number; px: number; py: number; x: number; y: number; angle: number; children?: ReactNode }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <image href={src} x={x - px} y={y - py} width={w} height={h} />
      {children}
    </g>
  )
}

/** একটা হাত: কাঁধ থেকে ওপরে উঠে ঝুড়ির কিনারা ধরে আছে। side = -1 বাঁ, 1 ডান। */
function Arm({ side }: { side: -1 | 1 }) {
  const s = side === 1 ? SHOULDER_R : SHOULDER_L
  const sleeve = side === 1 ? { src: sleeveR, w: 43, h: 84, reach: 49 } : { src: sleeveL, w: 45, h: 88, reach: 53 }
  const fore = side === 1 ? { src: forearmR, w: 36, h: 96, reach: 76 } : { src: forearmL, w: 34, h: 91, reach: 71 }
  const hand = side === 1 ? { src: handR, w: 42, h: 78 } : { src: handL, w: 41, h: 73 }
  const elbow = { x: s.x, y: s.y + sleeve.reach }
  const wrist = { x: s.x, y: elbow.y + fore.reach }
  return (
    <Limb src={sleeve.src} w={sleeve.w} h={sleeve.h} px={sleeve.w / 2} py={13} x={s.x} y={s.y} angle={-150 * side}>
      <Limb src={fore.src} w={fore.w} h={fore.h} px={fore.w / 2} py={12} x={elbow.x} y={elbow.y} angle={-48 * side}>
        <Limb src={hand.src} w={hand.w} h={hand.h} px={hand.w / 2} py={5} x={wrist.x} y={wrist.y} angle={14 * side} />
      </Limb>
    </Limb>
  )
}

/** একটা পা: হাঁটু লুঙ্গির নিচে লুকানো, নিচে নলা আর চপ্পল। */
function Leg({ knee, src, className }: { knee: { x: number; y: number }; src: string; className: string }) {
  const ankle = { x: knee.x, y: knee.y + 70 }
  return (
    <g className={`m-leg ${className}`} style={{ transformOrigin: `${knee.x}px ${knee.y}px` }}>
      <image href={src} x={knee.x - 19} y={knee.y - 12} width={38} height={92} />
      <image href={foot} x={ankle.x - 24} y={ankle.y - 12} width={75} height={54} />
    </g>
  )
}

/**
 * মামা: শার্ট, লুঙ্গি, কাঁধে গামছা, মাথায় ঝুড়ি। ডান দিকে মুখ করে হাঁটেন।
 * মেজাজ বদলালে মাথা বদলায়: নকশার পাতার খুশি আর মন খারাপের মুখ।
 */
export default function Mascot({ mood = 'neutral', fill = 0, walking = false, facing = 'right', className = '', label }: MascotProps) {
  const head = HEADS[mood]

  return (
    <svg
      viewBox="-62 -205 300 625"
      className={`mascot ${className}`}
      data-mood={mood}
      data-walking={walking}
      data-facing={facing}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx="88" cy="414" rx="78" ry="9" fill="#000" opacity="0.12" />
      <g className="m-flip" style={{ transformOrigin: '88px 100px' }}>
        <g className="m-body">
          <Leg knee={KNEE_BACK} src={shinL} className="m-leg-back" />
          <Leg knee={KNEE_FRONT} src={shinR} className="m-leg-front" />

          {/* লুঙ্গি: শার্টের নিচ থেকে, পাতার চেয়ে একটু চওড়া করে */}
          <g className="m-lungi" style={{ transformOrigin: '88px 150px' }}>
            <image href={lungi} x={88 - 61} y={150} width={122} height={189} preserveAspectRatio="none" />
          </g>

          {/* মাথা: গলা কলারের পেছনে ঢোকে */}
          <g className="m-head" style={{ transformOrigin: `${NECK.x}px ${NECK.y}px` }}>
            <image href={head.src} x={NECK.x - head.ax * head.scale} y={NECK.y - head.ay * head.scale} width={head.w * head.scale} height={head.h * head.scale} />
          </g>

          <g className="m-jhuri" style={{ transformOrigin: '92px -100px' }}>
            <Jhuri fill={fill} />
          </g>

          <image href={torso} x={0} y={0} width={172} height={179} />
          {/* গামছা ডান কাঁধে, বুকের ওপর ঝুলে */}
          <image href={gamchha} x={22} y={8} width={46} height={132} />

          <Arm side={-1} />
          <Arm side={1} />
        </g>
      </g>
    </svg>
  )
}

/**
 * বাঁশের ঝুড়ি, নকশার পাতার মতো নরম রঙে আঁকা। কিনারার ওপরে যা উঁকি দেয় তা ভরা অনুযায়ী।
 * মাথার তালুর ওপর বসে, তাই নিচের দিকটা চুল একটু ঢাকে।
 */
function Jhuri({ fill }: { fill: JhuriFill }) {
  const uid = useId().replace(/:/g, '')
  const body = `jb-${uid}`
  const rim = `jr-${uid}`
  const grain = `jg-${uid}`
  const cx = 92
  const top = -150
  return (
    <g>
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9a556" />
          <stop offset="1" stopColor="#a8722f" />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9bd6e" />
          <stop offset="1" stopColor="#b98236" />
        </linearGradient>
        {/* কাগজের মতো দানা, নকশার পাতার রঙের সাথে মেলাতে */}
        <filter id={grain} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 0.35 0" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="g" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="g" /></feMerge>
        </filter>
      </defs>
      <Load fill={fill} cx={cx} top={top} />
      <g filter={`url(#${grain})`}>
        <path d={`M${cx - 74},${top} L${cx + 74},${top} L${cx + 56},${top + 46} Q${cx},${top + 58} ${cx - 56},${top + 46} Z`} fill={`url(#${body})`} />
        <g stroke="#7d5220" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7">
          <path d={`M${cx - 70},${top + 14} Q${cx},${top + 24} ${cx + 70},${top + 14}`} />
          <path d={`M${cx - 64},${top + 30} Q${cx},${top + 41} ${cx + 64},${top + 30}`} />
          {[-48, -24, 0, 24, 48].map((d) => (
            <path key={d} d={`M${cx + d * 1.4},${top + 4} L${cx + d},${top + 52}`} />
          ))}
        </g>
        <ellipse cx={cx} cy={top} rx="76" ry="11" fill={`url(#${rim})`} stroke="#7d5220" strokeWidth="2.5" />
        <ellipse cx={cx} cy={top} rx="66" ry="6.5" fill="#6b4318" opacity="0.55" />
      </g>
    </g>
  )
}

/** ঝুড়ির জিনিস: ১ শাড়ি, ২ সাথে মাটির হাঁড়ি, ৩ সাথে কাঁথার রোল আর ঝুলন্ত গামছা। */
function Load({ fill, cx, top }: { fill: JhuriFill; cx: number; top: number }) {
  if (fill === 0) return null
  return (
    <g>
      {fill >= 3 && (
        <g>
          <rect x={cx - 20} y={top - 44} width="44" height="24" rx="12" fill="#2f6b3a" transform={`rotate(-10 ${cx} ${top - 32})`} />
          <path d={`M${cx - 14},${top - 36} L${cx + 18},${top - 42}`} stroke="#f2d38a" strokeWidth="2" strokeDasharray="5 4" />
          <path d={`M${cx + 62},${top - 6} Q${cx + 80},${top - 2} ${cx + 82},${top + 30} L${cx + 72},${top + 32} Q${cx + 70},${top + 10} ${cx + 56},${top}`} fill="#c0283a" />
        </g>
      )}
      {fill >= 2 && (
        <g>
          <ellipse cx={cx + 30} cy={top - 18} rx="22" ry="19" fill="#c2532a" />
          <ellipse cx={cx + 24} cy={top - 24} rx="7" ry="5" fill="#e58a5a" opacity="0.6" />
          <rect x={cx + 20} y={top - 42} width="20" height="8" rx="3" fill="#9a3a18" />
        </g>
      )}
      <path d={`M${cx - 58},${top + 2} Q${cx - 44},${top - 26} ${cx - 8},${top - 22} L${cx + 4},${top + 2} Z`} fill="#b3262c" />
      <path d={`M${cx - 50},${top - 10} Q${cx - 30},${top - 20} ${cx - 4},${top - 16}`} stroke="#e8a83a" strokeWidth="4" fill="none" />
    </g>
  )
}
