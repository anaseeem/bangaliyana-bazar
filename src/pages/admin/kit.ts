// অ্যাডমিন পাতার ছোট সরঞ্জাম: সারাংশের তথ্য, কাজ চালানো, সংখ্যা পড়া
import { createContext, useContext, useState } from 'react'
import { errorText } from '../../lib/api'
import { asciiDigits } from '../../lib/local'

export interface Summary {
  store: string
  today: { orders: number; sales: number }
  month: { orders: number; sales: number }
  toConfirm: number
  toSend: number
  pendingSellers: number
  lowStock: { id: string; nameBn: string; stock: number }[]
  unreadMessages: number
  totals: { products: number; sellers: number; users: number; orders: number }
}

export const AdminCtx = createContext<{ summary: Summary | null; reloadSummary: () => void }>({ summary: null, reloadSummary: () => {} })
export const useAdmin = () => useContext(AdminCtx)

export const ERR = 'rounded-md bg-red-50 px-4 py-3 text-rickshaw'
export const dateBn = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

/** বাংলা বা ইংরেজি অঙ্কের লেখা থেকে পুরো সংখ্যা; ঠিক না হলে NaN */
export const toInt = (v: string) => {
  const s = asciiDigits(v).trim()
  return /^\d+$/.test(s) ? Number(s) : NaN
}

/** একটা কাজ চালায়: চলার সময় busy, ভুল হলে error, ঠিক হলে done */
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const run = async (fn: () => Promise<unknown>, ok = '') => {
    setBusy(true)
    setError('')
    setDone('')
    try {
      await fn()
      setDone(ok)
      return true
    } catch (e) {
      setError(errorText(e))
      return false
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, done, run, setError, setDone }
}
