import { useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { BD_DISTRICTS, deliveryFor, normalizePhone } from '../data/districts'
import { useCart } from '../store/cart'
import { jhuriFill, type MascotMood } from '../libs/mascot'
import MascotRoad from '../components/MascotRoad'
import ProductArt from '../components/ProductArt'
import QtyStepper from '../components/QtyStepper'
import { StitchFrame, StitchLine } from '../components/Stitch'

/** ঝুড়ি থেকে অর্ডার পর্যন্ত এক পাতায় চার ধাপ। ধাপটা ঠিকানায় থাকে, তাই ফোনের পেছনের বোতাম কাজ করে। */
const STEPS = [
  { id: 'jhuri', label: 'ঝুড়ি' },
  { id: 'thikana', label: 'ঠিকানা' },
  { id: 'hisab', label: 'হিসাব' },
  { id: 'hoye-gelo', label: 'হয়ে গেল' },
] as const

interface Address { name: string; phone: string; district: string; address: string }
interface PlacedOrder { id: string; total: number; days: string }
type Errors = Partial<Record<keyof Address, string>>

const LAST_ORDER = 'bb-last-order'

function validate(a: Address): Errors {
  const e: Errors = {}
  if (a.name.trim().length < 3) e.name = 'নাম লিখুন, অন্তত তিন অক্ষর।'
  if (!/^01[3-9]\d{8}$/.test(normalizePhone(a.phone))) e.phone = 'মোবাইল নম্বর ঠিক নেই। যেমন ০১৭১২৩৪৫৬৭৮।'
  if (a.address.trim().length < 8) e.address = 'পুরো ঠিকানা লিখুন: বাসা, রাস্তা, এলাকা।'
  return e
}

/** সার্ভার না চললে ডেমো অর্ডার ব্রাউজারেই রাখা হয়, যাতে পুরো পথটা দেখা যায়। */
function saveLocalOrder(payload: object, total: number): string {
  const id = `BB${Date.now().toString().slice(-6)}`
  try {
    const prev = JSON.parse(localStorage.getItem('bb-local-orders') ?? '[]') as unknown[]
    localStorage.setItem('bb-local-orders', JSON.stringify([...prev, { id, ...payload, total, createdAt: new Date().toISOString() }]))
  } catch { /* ব্রাউজারে জায়গা না পেলেও অর্ডার দেখাই */ }
  return id
}

function readLastOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER)
    return raw ? (JSON.parse(raw) as PlacedOrder) : null
  } catch {
    return null
  }
}

export default function Jhuri() {
  const [params, setParams] = useSearchParams()
  const { detailed, setQty, remove, clear, total, count } = useCart()
  const [address, setAddress] = useState<Address>({ name: '', phone: '', district: 'ঢাকা', address: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [order, setOrder] = useState<PlacedOrder | null>(readLastOrder)
  const [placing, setPlacing] = useState(false)
  const [serverError, setServerError] = useState('')

  // মামার মেজাজ: কিছু সরালে বা কমালে একটু মন খারাপ, যোগ করলে একটু খুশি
  const [mood, setMood] = useState<MascotMood>('neutral')
  const moodTimer = useRef<number | undefined>(undefined)
  const flash = (m: MascotMood) => {
    setMood(m)
    window.clearTimeout(moodTimer.current)
    moodTimer.current = window.setTimeout(() => setMood('neutral'), m === 'sad' ? 2200 : 1200)
  }

  const requested = Math.max(0, STEPS.findIndex((s) => s.id === params.get('dhap')))
  const formOk = Object.keys(validate(address)).length === 0
  // যতদূর যাওয়া যায়: অর্ডার হলে শেষ ধাপ, ঝুড়ি খালি হলে প্রথম ধাপ
  const reachable = order && detailed.length === 0 ? 3 : detailed.length === 0 ? 0 : formOk ? 2 : 1
  const go = (i: number) => setParams(i === 0 ? {} : { dhap: STEPS[i].id })

  if (requested > reachable && !(requested === 3 && order)) {
    return <Navigate to={reachable === 0 ? '/jhuri' : `/jhuri?dhap=${STEPS[reachable].id}`} replace />
  }
  const step = requested
  const delivery = deliveryFor(address.district)
  const fill = jhuriFill(step === 3 ? 6 : count)

  const toAddress = () => {
    const e = validate(address)
    setErrors(e)
    if (Object.keys(e).length === 0) go(2)
  }

  const placeOrder = async () => {
    setServerError('')
    setPlacing(true)
    const grand = total + delivery.fee
    const payload = {
      name: address.name.trim(),
      phone: normalizePhone(address.phone),
      district: address.district,
      address: address.address.trim(),
      delivery: delivery.key,
      paymentMethod: 'ক্যাশ অন ডেলিভারি',
      items: detailed.map((d) => ({ id: d.product.id, qty: d.qty })),
    }
    let placed: PlacedOrder | null = null
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.status === 400) {
        // সার্ভার চলছে কিন্তু কিছু ভুল আছে। সেটা দেখাই, অর্ডার হয়নি।
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setServerError(body.error ?? 'অর্ডারে কিছু ভুল আছে। ঠিকানা আবার দেখুন।')
      } else if (res.ok) {
        const data = (await res.json()) as { id: string; total: number }
        placed = { id: data.id, total: data.total, days: delivery.days }
      } else {
        throw new Error(`HTTP ${res.status}`)
      }
    } catch {
      placed = { id: saveLocalOrder(payload, grand), total: grand, days: delivery.days }
    }
    setPlacing(false)
    if (placed) {
      try { sessionStorage.setItem(LAST_ORDER, JSON.stringify(placed)) } catch { /* শুধু রিফ্রেশে কাজে লাগে */ }
      setOrder(placed)
      clear()
      go(3)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Tabs step={step} reachable={order && detailed.length === 0 ? -1 : reachable} onGo={go} />

        {step === 0 && (
          detailed.length === 0 ? (
            <Panel>
              <h1 className="text-3xl">ঝুড়ি খালি</h1>
              <p className="mt-2 text-stone-600">বাজার থেকে কিছু নিলে মামা মাথায় করে বাড়ি পৌঁছে দেবেন।</p>
              <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
            </Panel>
          ) : (
            <Panel>
              <h1 className="sr-only">ঝুড়ি</h1>
              <ul>
                {detailed.map(({ product, qty }) => (
                  <li key={product.id} className="flex gap-4 py-4 first:pt-0">
                    <Link to={`/product/${product.id}`} className="shrink-0">
                      <ProductArt plain art={product.art} palette={product.palette} label={product.nameBn} className="block h-20 w-24 rounded sm:h-24 sm:w-32" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link to={`/product/${product.id}`} className="text-lg leading-snug hover:text-rickshaw">{product.nameBn}</Link>
                        <span className="shrink-0 text-lg text-rickshaw">{formatBDT(product.price * qty)}</span>
                      </div>
                      <p className="text-sm text-stone-600">{product.artisan}, {product.district}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <QtyStepper
                          value={qty}
                          max={Math.min(99, product.stock)}
                          label={`${product.nameBn}, পরিমাণ`}
                          onChange={(n) => { flash(n < qty ? 'sad' : 'happy'); setQty(product.id, n) }}
                        />
                        <button type="button" onClick={() => { flash('sad'); remove(product.id) }} className="text-sm text-stone-500 underline hover:text-rickshaw">
                          সরান
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <StitchLine className="my-4" />
              <div className="flex items-baseline justify-between text-lg">
                <span>পণ্যের দাম</span>
                <span className="text-2xl text-rickshaw">{formatBDT(total)}</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => go(1)} className="rounded-full bg-rickshaw px-8 py-3 text-lg text-white hover:bg-rickshaw-dark">ঠিকানা দিন</button>
                <Link to="/shop" className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">আরও কিনুন</Link>
                <button type="button" onClick={() => { flash('sad'); clear() }} className="ml-auto text-sm text-stone-500 underline hover:text-rickshaw">ঝুড়ি খালি করুন</button>
              </div>
            </Panel>
          )
        )}

        {step === 1 && (
          <Panel>
            <h1 className="text-3xl">কোথায় পাঠাব?</h1>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); toAddress() }}>
              <Field id="name" label="নাম" error={errors.name}>
                <input id="name" autoComplete="name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className={INPUT} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} />
              </Field>
              <Field id="phone" label="মোবাইল নম্বর" error={errors.phone}>
                <input id="phone" inputMode="tel" autoComplete="tel" placeholder="০১৭১২৩৪৫৬৭৮" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className={INPUT} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-err' : undefined} />
              </Field>
              <Field id="district" label="জেলা">
                <select id="district" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} className={INPUT}>
                  {BD_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <div className="self-end pb-3 text-stone-600">ডেলিভারি {formatBDT(delivery.fee)}, {delivery.days}</div>
              <div className="sm:col-span-2">
                <Field id="address" label="ঠিকানা" error={errors.address}>
                  <textarea id="address" rows={2} autoComplete="street-address" placeholder="বাসা, রাস্তা, এলাকা" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className={`${INPUT} rounded-2xl`} aria-invalid={!!errors.address} aria-describedby={errors.address ? 'address-err' : undefined} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button type="submit" className="rounded-full bg-rickshaw px-8 py-3 text-lg text-white hover:bg-rickshaw-dark">হিসাব দেখুন</button>
                <button type="button" onClick={() => go(0)} className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">ঝুড়িতে ফিরুন</button>
              </div>
            </form>
          </Panel>
        )}

        {step === 2 && (
          <Panel>
            <h1 className="text-3xl">একবার মিলিয়ে নিন</h1>
            <ul className="mt-5 space-y-2">
              {detailed.map(({ product, qty }) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <span>{product.nameBn} <span className="text-stone-500">× {bn(qty)}</span></span>
                  <span>{formatBDT(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <StitchLine className="my-4" />
            <dl className="space-y-2">
              <div className="flex justify-between"><dt>পণ্যের দাম</dt><dd>{formatBDT(total)}</dd></div>
              <div className="flex justify-between"><dt>ডেলিভারি, {address.district}</dt><dd>{formatBDT(delivery.fee)}</dd></div>
              <div className="flex items-baseline justify-between pt-2 text-xl"><dt>সব মিলিয়ে</dt><dd className="text-3xl text-rickshaw">{formatBDT(total + delivery.fee)}</dd></div>
            </dl>
            <div className="mt-5 rounded-md bg-holud-soft/60 p-4">
              <p>{address.name}, {bn(normalizePhone(address.phone))}</p>
              <p className="text-stone-700">{address.address.trim()}, {address.district}</p>
              <p className="mt-2 text-stone-700">পণ্য হাতে পেয়ে টাকা দেবেন। অনলাইনে কিছু দিতে হবে না।</p>
            </div>
            {serverError && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-rickshaw">{serverError}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" disabled={placing} onClick={placeOrder} className="rounded-full bg-rickshaw px-8 py-3 text-lg text-white hover:bg-rickshaw-dark disabled:opacity-60">
                {placing ? 'পাকা হচ্ছে…' : 'অর্ডার পাকা করুন'}
              </button>
              <button type="button" onClick={() => go(1)} className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">ঠিকানা বদলান</button>
            </div>
          </Panel>
        )}

        {step === 3 && order && (
          <Panel>
            <h1 className="text-4xl">অর্ডার হয়ে গেল</h1>
            <p className="mt-3 text-lg">অর্ডার নম্বর <span className="text-rickshaw">{bn(order.id)}</span></p>
            <p className="mt-1 text-stone-700">{order.days} পৌঁছাবে। হাতে পেয়ে {formatBDT(order.total)} দেবেন।</p>
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">আরও কিনুন</Link>
          </Panel>
        )}
      </div>
      <MascotRoad step={step} steps={STEPS.length} mood={mood} fill={fill} />
    </div>
  )
}

const INPUT = 'mt-1 w-full rounded-full border-2 border-amber-300 bg-paper px-4 py-2.5 focus:border-rickshaw focus:outline-none aria-[invalid=true]:border-rickshaw'

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="relative mt-6 rounded-[10px] bg-paper p-6 sm:p-8">
      <StitchFrame />
      {children}
    </section>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-rickshaw">{error}</p>}
    </div>
  )
}

/** চার ধাপের ট্যাব। যে ধাপে যাওয়া যায় শুধু সেগুলোতে চাপা যায়। */
function Tabs({ step, reachable, onGo }: { step: number; reachable: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="অর্ডারের ধাপ">
      <ol className="flex items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const current = i === step
          const enabled = !current && i <= reachable
          return (
            <li key={s.id} className="flex flex-1 items-center gap-1 last:flex-none sm:gap-2">
              <button
                type="button"
                disabled={!enabled}
                aria-current={current ? 'step' : undefined}
                onClick={() => onGo(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1.5 sm:px-3 ${current ? 'bg-rickshaw text-white' : i < step ? 'text-rickshaw hover:bg-holud-soft' : 'text-stone-400'}`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${current ? 'bg-holud text-stone-900' : i < step ? 'bg-holud-soft' : 'border border-stone-300'}`}>{bn(i + 1)}</span>
                <span className={current ? '' : 'hidden sm:inline'}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <StitchLine className="min-w-3 flex-1" colors={i < step ? ['var(--color-rickshaw)', 'var(--color-holud)'] : ['#d6d3d1', '#e7e5e4']} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
