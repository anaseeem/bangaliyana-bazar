/** বাঁশের ঝুড়ি। মাথায় নেওয়ার মতো, হাতল নেই। */
export default function JhuriIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" aria-hidden="true" className={className}>
      <path d="M3,9 L37,9 L31,29 Q20,32 9,29 Z" fill="#c8902e" />
      {/* বুনন */}
      <g stroke="#8a5a1a" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M5,15 Q20,17.5 35,15" />
        <path d="M7,21 Q20,23.5 33,21" />
        <path d="M13,10 L14,30" />
        <path d="M20,10 L20,31" />
        <path d="M27,10 L26,30" />
      </g>
      <ellipse cx="20" cy="9" rx="17.5" ry="3.2" fill="#e0a83a" stroke="#8a5a1a" strokeWidth="1.4" />
    </svg>
  )
}
