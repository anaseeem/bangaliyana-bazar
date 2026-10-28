import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { bn } from '../data/products'
import JhuriIcon from './JhuriIcon'
import { StitchLine } from './Stitch'
import { useCart } from '../store/cart'
import { useMarket } from '../store/market'
import { SunMark } from './Decor'

const LINKS = [
  { to: '/', label: 'হোম' },
  { to: '/shop', label: 'বাজার' },
  { to: '/artisans', label: 'কারিগর' },
]

export default function Header() {
  const { count } = useCart()
  const { user } = useMarket()
  const account = user ? { to: '/amar', label: user.name.split(' ')[0] } : { to: '/login', label: 'ঢুকুন' }
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  // ঝুড়িতে কিছু পড়লে ঝুড়ি একটু লাফায়
  const [bounce, setBounce] = useState(0)
  useEffect(() => {
    const onAdd = () => setBounce((n) => n + 1)
    window.addEventListener('jhuri:add', onAdd)
    return () => window.removeEventListener('jhuri:add', onAdd)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop')
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-cream/95 shadow-sm backdrop-blur">
      <div className="bg-rickshaw text-cream">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs sm:text-sm">
          সারা দেশে ডেলিভারি • পণ্য হাতে পেয়ে টাকা দিন
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5" aria-label="বাঙালিয়ানা বাজার। হোম">
          <SunMark className="h-11 w-11" />
          <span className="font-display text-xl leading-tight text-rickshaw sm:text-2xl">বাঙালিয়ানা বাজার</span>
        </Link>
        <form onSubmit={submit} className="order-3 flex w-full min-w-0 flex-1 sm:order-none sm:w-auto" role="search">
          <label htmlFor="site-search" className="sr-only">পণ্য খুঁজুন</label>
          <input
            id="site-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="জামদানি, কাঁথা, মাটির বাটি… খুঁজুন"
            className="min-w-0 flex-1 rounded-l-full border-2 border-r-0 border-rickshaw bg-paper px-4 py-2 text-sm focus:outline-none"
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
          <NavLink
            to={account.to}
            className={({ isActive }) => `rounded-full border-2 border-rickshaw px-3 py-1.5 text-sm ${isActive ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}
          >
            {account.label}
          </NavLink>
        </nav>
        <Link to="/jhuri" className="relative ml-auto flex items-center gap-2 rounded-full bg-holud py-1.5 pr-4 pl-3 text-sm text-stone-900 hover:bg-amber-500 md:ml-0" aria-label={`ঝুড়ি, ${bn(count)}টি পণ্য`}>
          <span id="jhuri-target" key={bounce} className={bounce ? 'animate-jhuri' : ''}>
            <JhuriIcon className="h-6 w-7" />
          </span>
          ঝুড়ি
          {count > 0 && (
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rickshaw text-xs text-white">
              {bn(count)}
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
          {[...LINKS, account, { to: '/bikreta', label: 'বিক্রেতা হোন' }].map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-stone-700 hover:bg-holud-soft">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
      <StitchLine />
    </header>
  )
}
