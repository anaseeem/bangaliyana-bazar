/**
 * ঝুড়িতে নিলে একটা ছোট্ট জিনিস বোতাম থেকে উড়ে হেডারের ঝুড়িতে পড়ে।
 * তারপর ঝুড়ি একটু লাফায়। হেডার 'jhuri:add' ইভেন্ট শুনে লাফায়।
 */
export function flyToJhuri(from: Element, color = '#f59e0b') {
  const target = document.getElementById('jhuri-target')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!target || reduce) {
    window.dispatchEvent(new Event('jhuri:add'))
    return
  }
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  Object.assign(dot.style, {
    position: 'fixed',
    left: `${a.left + a.width / 2 - 9}px`,
    top: `${a.top + a.height / 2 - 9}px`,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: color,
    border: '2px solid #7f1d1d',
    zIndex: '60',
    pointerEvents: 'none',
  })
  document.body.appendChild(dot)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  // আগে একটু ওপরে ওঠে, তারপর ঝুড়িতে নামে
  const anim = dot.animate(
    [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${dx * 0.5}px, ${Math.min(dy, 0) - 90}px) scale(1.15)`, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.5)` },
    ],
    { duration: 650, easing: 'cubic-bezier(.4,0,.6,1)' },
  )
  anim.onfinish = () => {
    dot.remove()
    window.dispatchEvent(new Event('jhuri:add'))
  }
}
