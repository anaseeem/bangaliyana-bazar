import { useState } from 'react'

/** WhatsApp, Facebook আর লিংক তুলে নেওয়া। পাতার এখনকার ঠিকানাই ভাগ হয়। */
export default function Share({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window === 'undefined' ? '' : window.location.href
  const pill = 'rounded-full border-2 px-4 py-1.5 text-base'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { /* পুরোনো ব্রাউজারে লিংক তোলা যায় না, বাকি দুটো বোতাম আছে */ }
  }
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-stone-600">অন্যকে দেখান</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer" className={`${pill} border-kolapata text-kolapata hover:bg-kolapata hover:text-white`}>WhatsApp</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className={`${pill} border-nil text-nil hover:bg-nil hover:text-white`}>Facebook</a>
      <button type="button" onClick={copy} className={`${pill} border-rickshaw text-rickshaw hover:bg-holud-soft`}>{copied ? 'লিংক তোলা হলো' : 'লিংক তুলুন'}</button>
    </div>
  )
}
