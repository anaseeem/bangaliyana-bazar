import type { ReactNode } from 'react'
import { StitchFrame } from './Stitch'

export const INPUT = 'mt-1 w-full rounded-full border-2 border-amber-300 bg-paper px-4 py-2.5 focus:border-rickshaw focus:outline-none aria-[invalid=true]:border-rickshaw'
export const BTN = 'rounded-full bg-rickshaw px-8 py-3 text-lg text-white hover:bg-rickshaw-dark disabled:opacity-60'
export const BTN_LINE = 'rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft'

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative rounded-[10px] bg-paper p-6 sm:p-8 ${className}`}>
      <StitchFrame />
      {children}
    </section>
  )
}

export function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-rickshaw">{error}</p>}
    </div>
  )
}
