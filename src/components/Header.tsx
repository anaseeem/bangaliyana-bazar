import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../store/cart'

const LINKS = [
  { to: '/', label: 'হোম' },
  { to: '/shop', label: 'বাজার' },
  { to: '/artisans', label: 'কারিগর' },
  { to: '/cart', label: 'ঝুড়ি' },
]

export default function Header() {
  const { count } = useCart()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 shadow-sm backdrop-blur">
      <div className="bg-rickshaw text-cream">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs sm:text-sm">
          পহেলা বৈশাখের মেলা চলছে। ঢাকায় ডেলিভারি ৳৬০, ঢাকার বাইরে ৳১২০ • ক্যাশ অন ডেলিভারি
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5" aria-label="বাঙালিয়ানা বাজার। হোম">
          <svg width="42" height="42" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#b91c1c" />
            <circle cx="32" cy="32" r="16" fill="#f59e0b" />
            <circle cx="32" cy="32" r="5" fill="#fff7e6" />
          </svg>
          <span className="leading-tight">
            <span className="block font-display text-xl text-rickshaw sm:text-2xl">বাঙালিয়ানা বাজার</span>
            <span className="block text-[11px] tracking-widest text-stone-500">হাতের কাজ, বাংলার গল্প</span>
          </span>
        </Link>
        <form onSubmit={submit} className="order-3 flex w-full min-w-0 flex-1 sm:order-none sm:w-auto" role="search">
          <label htmlFor="site-search" className="sr-only">পণ্য খুঁজুন</label>
          <input
            id="site-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="জামদানি, কাঁথা, মাটির বাটি… খুঁজুন"
            className="min-w-0 flex-1 rounded-l-full border-2 border-r-0 border-rickshaw bg-white px-4 py-2 text-sm focus:outline-none"
          />
          <button type="submit" className="rounded-r-full bg-rickshaw px-4 py-2 text-sm text-white hover:bg-rickshaw-dark">
            খুঁজুন
          </button>
        </form>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="প্রধান নেভিগেশন">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm ${isActive ? 'bg-rickshaw text-white' : 'text-stone-700 hover:bg-holud-soft'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/cart" className="relative ml-auto rounded-full bg-holud px-4 py-2 text-sm text-stone-900 hover:bg-amber-500 md:ml-0" aria-label={`ঝুড়ি, ${count}টি পণ্য`}>
          🧺 ঝুড়ি
          {count > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rickshaw text-xs text-white">
              {count}
            </span>
          )}
        </Link>
        <button
          type="button"
          className="rounded-full border-2 border-rickshaw px-3 py-2 text-sm text-rickshaw md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          মেনু
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-amber-200 px-4 py-2 md:hidden" aria-label="মোবাইল নেভিগেশন">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-stone-700 hover:bg-holud-soft">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
      <div className="kantha-border" aria-hidden="true" />
    </header>
  )
}
