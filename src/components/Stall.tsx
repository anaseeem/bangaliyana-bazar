import { Link } from 'react-router-dom'
import type { ArtKind } from '../data/products'
import ProductArt from './ProductArt'

/** মেলার দোকানের শামিয়ানা: ডোরাকাটা কাপড়, নিচে ঢেউ খেলানো কিনারা। */
function Awning({ colors }: { colors: [string, string] }) {
  const stripes = 8
  const w = 200 / stripes
  // নিচের কিনারায় প্রতিটি ডোরার জন্য একটা করে ঢেউ
  let edge = 'M0,0 H200 V26'
  for (let i = stripes; i > 0; i--) edge += ` A${w / 2},9 0 0 1 ${(i - 1) * w},26`
  edge += ' Z'
  const id = `awning-${colors.join('').replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg viewBox="0 0 200 36" aria-hidden="true" className="block w-full drop-shadow-sm">
      <clipPath id={id}><path d={edge} /></clipPath>
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: stripes }).map((_, i) => (
          <rect key={i} x={i * w} y="0" width={w} height="36" fill={colors[i % 2]} />
        ))}
      </g>
    </svg>
  )
}

interface Props {
  name: string
  art: ArtKind
  palette: [string, string, string]
  awning: [string, string]
  /** দোকানের সামনে রাখা একটা পণ্যের ছবি */
  photo?: string
}

/** একটা দোকান: ওপরে শামিয়ানা, দুই পাশে বাঁশের খুঁটি, মাঝে জিনিস। */
export default function Stall({ name, art, palette, awning, photo }: Props) {
  return (
    <Link to={`/shop?cat=${encodeURIComponent(name)}`} className="group block w-40 shrink-0 snap-start sm:w-auto">
      {/* হোভারে পুরো দোকানটা একসাথে দোলে, ছবি ফ্রেমের ভেতরেই থাকে */}
      <div className="hang-swing">
        <div className="relative z-10"><Awning colors={awning} /></div>
        <div className="mx-2 -mt-1 border-x-[5px] border-[#a0702a]">
          {photo
            ? <img src={photo} alt="" loading="lazy" className="block h-28 w-full object-cover sm:h-32" />
            : <ProductArt plain art={art} palette={palette} label={name} className="block h-28 w-full sm:h-32" />}
        </div>
        <p className="mx-2 bg-[#a0702a] py-1 text-center text-cream group-hover:bg-rickshaw-dark">{name}</p>
      </div>
    </Link>
  )
}
