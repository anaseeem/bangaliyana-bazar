import { bn } from '../data/products'

interface Props {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  label: string
}

/** পরিমাণ বাড়ানো-কমানো। সংখ্যা বাংলায় দেখায়, তাই number ইনপুট নয়। */
export default function QtyStepper({ value, onChange, min = 1, max = 99, label }: Props) {
  const btn = 'flex h-10 w-10 items-center justify-center rounded-full text-xl text-rickshaw hover:bg-holud-soft disabled:opacity-30'
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border-2 border-amber-300 bg-paper">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="একটা কমান">−</button>
      <output aria-live="polite" className="min-w-8 text-center text-lg">{bn(value)}</output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="একটা বাড়ান">+</button>
    </div>
  )
}
