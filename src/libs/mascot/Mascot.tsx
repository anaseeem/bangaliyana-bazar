import { useId } from 'react'
import './mascot.css'

import type { JhuriFill, MascotMood } from './types'

export interface MascotProps {
  mood?: MascotMood
  fill?: JhuriFill
  walking?: boolean
  facing?: 'right' | 'left'
  className?: string
  /** স্ক্রিন রিডারের জন্য। না দিলে ছবিটা সাজ হিসেবে লুকানো থাকে। */
  label?: string
}

const SKIN = '#c98a5a'
const SKIN_SHADE = '#a86a40'
const HAIR = '#211b19'
const SHIRT = '#efe9dc'
const SHIRT_SHADE = '#d8cfbb'
const LUNGI = '#1f5f7a'
const GAMCHHA = '#c0283a'
const SANDAL = '#2a2422'
const BAMBOO = '#c8902e'
const BAMBOO_DARK = '#8a5a1a'

/**
 * মামা: মাঝবয়সী বাঙালি, শার্ট আর লুঙ্গি, কাঁধে গামছা, মাথায় ঝুড়ি।
 * ডান দিকে মুখ করে হাঁটে। শুধু যতটুকু নড়াচড়া দরকার ততটুকুই রিগ করা:
 * পা, লুঙ্গির দোলা, শরীরের ওঠানামা, মাথা ঝোঁকা।
 */
export default function Mascot({ mood = 'neutral', fill = 0, walking = false, facing = 'right', className = '', label }: MascotProps) {
  const uid = useId().replace(/:/g, '')
  const plaid = `lungi-${uid}`
  const check = `gamchha-${uid}`

  return (
    <svg
      viewBox="0 -26 120 226"
      className={`mascot ${className}`}
      data-mood={mood}
      data-walking={walking}
      data-facing={facing}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        {/* লুঙ্গির চেক */}
        <pattern id={plaid} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill={LUNGI} />
          <rect x="0" width="4" height="14" fill="#2f6b3a" opacity="0.7" />
          <rect y="0" width="14" height="4" fill="#2f6b3a" opacity="0.55" />
          <rect x="9" width="1" height="14" fill="#e8d9b5" opacity="0.6" />
          <rect y="9" width="14" height="1" fill="#e8d9b5" opacity="0.6" />
          <rect x="6" width="0.8" height="14" fill="#b91c1c" opacity="0.8" />
        </pattern>
        {/* গামছার চেক */}
        <pattern id={check} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={GAMCHHA} />
          <rect x="5" width="1.4" height="8" fill="#f4c2c2" opacity="0.8" />
          <rect y="5" width="8" height="1.4" fill="#f4c2c2" opacity="0.8" />
          <rect x="1" width="1" height="8" fill="#7f1d1d" opacity="0.6" />
        </pattern>
      </defs>

      <ellipse cx="60" cy="196" rx="30" ry="3.5" fill="#000" opacity="0.12" />

      <g className="m-flip">
        <g className="m-body">
          {/* পেছনের পা */}
          <g className="m-leg m-leg-back">
            <path d="M54,152 L52,186 L61,186 L63,152 Z" fill={SKIN_SHADE} />
            <path d="M46,185 Q56,181.5 66,185 L66,190 L46,190 Z" fill={SANDAL} />
          </g>
          {/* সামনের পা */}
          <g className="m-leg m-leg-front">
            <path d="M61,152 L61,186 L70,186 L71,152 Z" fill={SKIN} />
            <path d="M57,185 Q67,181.5 79,185 L79,190 L57,190 Z" fill={SANDAL} />
          </g>

          {/* লুঙ্গি: কোমর থেকে পায়ের নলা পর্যন্ত, হাঁটার সাথে একটু দোলে */}
          <g className="m-lungi">
            <path d="M40,100 L82,100 L87,160 Q62,165 35,160 Z" fill={`url(#${plaid})`} />
            <path d="M40,100 L82,100 L82.6,107 L39.4,107 Z" fill="#163f52" opacity="0.6" />
            {/* কোমরের গিঁট */}
            <path d="M64,101 Q70,99 73,104 Q69,108 64,106 Z" fill="#163f52" />
            <path d="M70,107 L77,159" stroke="#163f52" strokeWidth="1.4" opacity="0.5" />
          </g>

          {/* শার্ট */}
          <path d="M40,62 Q61,54 82,62 L84,104 L38,104 Z" fill={SHIRT} />
          <path d="M40,62 L38,104 L47,104 L46,66 Z" fill={SHIRT_SHADE} />
          <rect x="66" y="74" width="9" height="9" rx="1" fill="none" stroke={SHIRT_SHADE} strokeWidth="1.2" />
          {[70, 80, 90].map((y) => <circle key={y} cx="61" cy={y} r="0.9" fill="#b8ad96" />)}
          {/* কলার */}
          <path d="M54,58 L60,66 L66,58" fill="none" stroke={SHIRT_SHADE} strokeWidth="2" strokeLinejoin="round" />

          {/* গামছা: কাঁধ থেকে বুকের ওপর ঝুলে আছে */}
          <path d="M46,60 Q52,56 58,59 L56,98 Q51,100 47,97 Z" fill={`url(#${check})`} />
          <path d="M47,97 Q51,100 56,98 L56.4,101 Q51,103 46.6,100 Z" fill="#7f1d1d" opacity="0.7" />

          {/* গলা */}
          <path d="M56,48 L65,48 L65,60 L56,60 Z" fill={SKIN_SHADE} />

          {/* হাত দুটো ওপরে, ঝুড়ি ধরে আছে */}
          <g className="m-arms">
            {/* পেছনের হাত */}
            <path d="M44,66 L30,42 L34,8" fill="none" stroke={SKIN_SHADE} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M44,65 L38,53" stroke={SHIRT_SHADE} strokeWidth="12" strokeLinecap="round" />
            {/* সামনের হাত */}
            <path d="M79,66 L94,44 L90,8" fill="none" stroke={SKIN} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M79,65 L86,53" stroke={SHIRT} strokeWidth="12" strokeLinecap="round" />
          </g>

          {/* মাথা: দুঃখ পেলে ঝুঁকে পড়ে */}
          <g className="m-head">
            <ellipse cx="62" cy="35" rx="16" ry="17.5" fill={SKIN} />
            {/* কান */}
            <ellipse cx="48.5" cy="37" rx="3.4" ry="5" fill={SKIN_SHADE} />
            {/* নাক */}
            <path d="M75,31 Q81.5,38 75,41" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1.1" />
            {/* চুল: ঝুড়ির নিচে চাপা, পাশে জুলফি */}
            <path d="M46,32 Q45,17 60,16 Q75,16 79,26 Q68,22 56,25 L51,40 Q47,38 46,32 Z" fill={HAIR} />
            <path d="M51,33 L52,45 L54.5,45 L54.5,32 Z" fill={HAIR} />
            <Face mood={mood} />
          </g>

          {/* ঝুড়ি আর ভেতরের জিনিস */}
          <g className="m-jhuri">
            <g transform="translate(62 4) scale(1.25) translate(-62 -14)">
              <JhuriLoad fill={fill} />
            </g>
            <path d="M28,4 L96,4 L86,23 Q62,28 38,23 Z" fill={BAMBOO} />
            <g stroke={BAMBOO_DARK} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85">
              <path d="M31,10 Q62,14 93,10" />
              <path d="M34,16.5 Q62,20.5 90,16.5" />
              {[40, 50, 62, 74, 84].map((x) => <path key={x} d={`M${x},4.5 L${x + (x < 62 ? 2 : x > 62 ? -2 : 0)},25`} />)}
            </g>
            <ellipse cx="62" cy="4" rx="34.5" ry="5" fill="#e0a83a" stroke={BAMBOO_DARK} strokeWidth="1.3" />
            {/* হাতের মুঠো ঝুড়ির কিনারায় */}
            <circle cx="33" cy="6.5" r="4.6" fill={SKIN_SHADE} />
            <circle cx="91" cy="6.5" r="4.6" fill={SKIN} />
          </g>
        </g>
      </g>
    </svg>
  )
}

function Face({ mood }: { mood: MascotMood }) {
  return (
    <g>
      {/* ভুরু: দুঃখে ভেতরের দিক ওঠে */}
      {mood === 'sad' ? (
        <path d="M64,26 Q68,23.5 72,27" fill="none" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M64,27 Q68,25 72,26.5" fill="none" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      )}
      {/* চোখ */}
      {mood === 'happy' ? (
        <path d="M66,33 Q68.5,30.5 71,33" fill="none" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <ellipse cx="68.5" cy={mood === 'sad' ? 33.5 : 32.5} rx="1.7" ry="2.1" fill={HAIR} />
      )}
      {/* দুঃখে এক ফোঁটা চোখের জল */}
      {mood === 'sad' && <path className="m-tear" d="M70,37 Q72,41 70,43 Q68,41 70,37 Z" fill="#7cc4e8" />}
      {/* গাল */}
      <circle cx="66" cy="40" r="2.6" fill="#d9694a" opacity={mood === 'happy' ? 0.45 : 0.2} />
      {/* গোঁফ */}
      <path d="M66,43 Q71,40.5 76,43 Q73,45.5 70,44.5 Q68,46 66,43 Z" fill={HAIR} />
      {/* মুখ */}
      {mood === 'happy' && <path d="M68,47 Q72,51 75,46.5 Z" fill="#7a2e22" />}
      {mood === 'neutral' && <path d="M68.5,47.5 Q72,49 74.5,47" fill="none" stroke="#7a2e22" strokeWidth="1.3" strokeLinecap="round" />}
      {mood === 'sad' && <path d="M68.5,49 Q72,46.5 74.5,48.8" fill="none" stroke="#7a2e22" strokeWidth="1.3" strokeLinecap="round" />}
    </g>
  )
}

/** ঝুড়ির কিনারার ওপরে যা উঁকি দেয়: শাড়ি, মাটির হাঁড়ি, কাঁথার রোল, গামছা। */
function JhuriLoad({ fill }: { fill: JhuriFill }) {
  if (fill === 0) return null
  return (
    <g className="m-load">
      {/* ভাঁজ করা লাল শাড়ি */}
      <path d="M44,14 Q48,6 58,7 L62,14 Z" fill="#b91c1c" />
      <path d="M47,11 L59,10" stroke="#f59e0b" strokeWidth="1.2" />
      {fill >= 2 && (
        // মাটির হাঁড়ি
        <g>
          <ellipse cx="72" cy="8" rx="8" ry="7" fill="#c2410c" />
          <rect x="68" y="-1" width="8" height="3" rx="1" fill="#9a3412" />
          <path d="M66,8 Q72,10 78,8" stroke="#fde68a" strokeWidth="1" fill="none" />
        </g>
      )}
      {fill >= 3 && (
        <g>
          {/* কাঁথার রোল */}
          <rect x="52" y="-4" width="16" height="9" rx="4.5" fill="#2f6b3a" transform="rotate(-12 60 0)" />
          <path d="M54,-2 L66,-5" stroke="#fde68a" strokeWidth="0.9" strokeDasharray="2 1.6" />
          {/* গামছার কোণা বাইরে ঝুলছে */}
          <path d="M82,11 Q88,12 89,21 L85,22 Q84,15 80,13 Z" fill="#b91c1c" />
          {/* পাটের ব্যাগের হাতল */}
          <path d="M38,13 Q38,4 45,5" stroke="#8a5a1a" strokeWidth="1.8" fill="none" />
        </g>
      )}
    </g>
  )
}
