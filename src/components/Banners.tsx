import { Link } from 'react-router-dom'
import { AlpanaCorner } from './Alpana'

/** রিকশার পেছনের টিনের ছবির মতো: কালো এনামেল, ডোরাকাটা কিনারা, জ্বলা-নেভা রিফ্লেক্টর */
export function RickshawBanner() {
  return (
    <Link to={`/shop?cat=${encodeURIComponent('কাঁসা-পিতল')}`} className="group relative block overflow-hidden rounded-[14px] bg-[#141414] text-cream shadow-lg">
      <div className="rickshaw-trim h-3" aria-hidden="true" />
      <div className="grid md:grid-cols-[2fr_3fr]">
        <img src="/art/rickshaw-hood.webp" alt="রিকশার হুডে আঁকা পাখি আর পদ্ম" loading="lazy" className="h-60 w-full object-cover object-[50%_35%] md:h-[24rem]" />
        <div className="relative flex flex-col justify-center gap-3 p-6 sm:p-10">
          <div className="flex gap-2" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="reflector" style={{ animationDelay: `${i * 0.25}s` }} />
            ))}
          </div>
          <p className="text-holud">ধামরাই থেকে</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">পিতলের নতুন চালান এসেছে</h2>
          <p className="max-w-md text-lg text-amber-100">ঢোকরার পেঁচা, হরিণ আর লণ্ঠন। হাতে ঢালা, হাতে খোদাই।</p>
          <span className="mt-2 inline-block w-fit rounded-full bg-holud px-6 py-3 text-stone-900 group-hover:bg-amber-400">পিতলের দোকানে যান</span>
        </div>
      </div>
      <div className="rickshaw-trim h-3" aria-hidden="true" />
    </Link>
  )
}

/** কালীঘাটের পটের মতো কাগজ আর লাল দুই দাগের কিনারা, এক পাশে বাঙালি মেয়ে, অন্য পাশে ময়ূর */
export function PotBanner() {
  return (
    <Link to={`/shop?cat=${encodeURIComponent('শাড়ি')}`} className="group relative block overflow-hidden rounded-[14px] bg-[#f6ecd6] p-3 shadow-lg">
      <div className="pot-border grid items-center gap-6 rounded-[8px] p-5 sm:p-8 md:grid-cols-[1fr_2fr_1fr]">
        <img src="/art/kalighat-bodhu.webp" alt="কালীঘাটের পটে আঁকা শাড়ি পরা এক মেয়ে" loading="lazy" className="mx-auto h-72 w-auto rounded-[4px] object-contain md:h-80" />
        <div className="text-center">
          <p className="text-rickshaw">হাতে বোনা</p>
          <h2 className="mt-2 text-4xl leading-tight text-rickshaw-dark sm:text-5xl">জামদানি আর মণিপুরি, তাঁতির হাত থেকে</h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-stone-700">রূপগঞ্জ আর কমলগঞ্জের তাঁতঘর থেকে সরাসরি আপনার ঘরে।</p>
          <span className="mt-5 inline-block rounded-full bg-rickshaw px-6 py-3 text-white group-hover:bg-rickshaw-dark">শাড়ি দেখুন</span>
        </div>
        <img src="/art/peacock.webp" alt="" loading="lazy" className="mx-auto hidden h-80 w-auto rounded-[4px] object-contain md:block" />
      </div>
    </Link>
  )
}

/** পটুয়া কারিগরের ছবি দিয়ে বিক্রেতা হওয়ার ডাক */
export function SellerBanner() {
  return (
    <Link to="/bikreta" className="group relative block overflow-hidden rounded-[14px] bg-terra text-cream shadow-lg">
      <AlpanaCorner corner="tr" className="absolute top-2 right-2 w-20 opacity-70 sm:w-28" />
      <AlpanaCorner corner="bl" className="absolute bottom-2 left-2 w-20 opacity-70 sm:w-28" />
      <div className="grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[3fr_4fr]">
        <div className="rounded-[10px] bg-cream p-2">
          <img src="/art/potua.webp" alt="মাটির হাঁড়িতে রং করছেন একজন পটুয়া" loading="lazy" className="h-60 w-full rounded-[6px] object-cover sm:h-72" />
        </div>
        <div className="relative">
          <h2 className="text-4xl leading-tight sm:text-5xl">আপনিও হাতের কাজ করেন?</h2>
          <p className="mt-3 max-w-md text-lg text-amber-100">নিজের দোকান খুলুন, সারা দেশে বিক্রি করুন। কোনো খরচ নেই।</p>
          <span className="mt-6 inline-block rounded-full bg-cream px-6 py-3 text-terra group-hover:bg-holud-soft">বিক্রেতা হোন</span>
        </div>
      </div>
    </Link>
  )
}
