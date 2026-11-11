import type { ReactNode } from 'react'
import { MamaLoader } from '../../components/MamaScenes'
import { ERR } from './kit'

export const Alert = ({ text }: { text: string }) => (text ? <p role="alert" className={ERR}>{text}</p> : null)
export const Note = ({ text }: { text: string }) => (text ? <p role="status" className="rounded-md bg-holud-soft px-4 py-3">{text}</p> : null)

/** আনা হচ্ছে বা ভুল হলে সেটা দেখায়, নইলে ভেতরের অংশ */
export function Load({ q, children }: { q: { loading: boolean; error: string }; children: ReactNode }) {
  if (q.loading) return <MamaLoader />
  if (q.error) return <Alert text={q.error} />
  return <>{children}</>
}

export const Chip = ({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'green' | 'red' | 'grey' }) => {
  const c = { soft: 'bg-holud-soft', green: 'bg-kolapata text-white', red: 'bg-rickshaw text-white', grey: 'bg-cream-deep text-stone-500' }[tone]
  return <span className={`inline-block rounded-full px-3 py-0.5 text-sm ${c}`}>{children}</span>
}

/** ছোট লিংক-বোতাম */
export const LinkBtn = ({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="text-rickshaw underline hover:text-rickshaw-dark disabled:opacity-60">{children}</button>
)

/** গোল বোতাম (ছোট) */
export const SmallBtn = ({ children, onClick, disabled, solid }: { children: ReactNode; onClick: () => void; disabled?: boolean; solid?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={`rounded-full px-4 py-1.5 disabled:opacity-60 ${solid ? 'bg-holud hover:bg-amber-400' : 'border-2 border-rickshaw text-rickshaw hover:bg-holud-soft'}`}>{children}</button>
)

/** বাছাইয়ের গোল বোতাম সারি */
export function Pills<T extends string>({ items, value, onPick }: { items: [T, string, number?][]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto">
      {items.map(([k, label, n]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onPick(k)} className={`shrink-0 rounded-full px-4 py-1.5 ${value === k ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}>
          {label}{n !== undefined && ` (${n.toLocaleString('bn-BD')})`}
        </button>
      ))}
    </div>
  )
}
