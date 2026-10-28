import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { readLS } from '../lib/local'
import { useMarket } from './market'

export interface CartLine { id: string; qty: number }

interface CartCtx {
  lines: CartLine[]
  add: (id: string, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: number
  total: number
  detailed: { product: Product; qty: number }[]
  wishlist: string[]
  toggleWish: (id: string) => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { catalog } = useMarket()
  const [lines, setLines] = useState<CartLine[]>(() => readLS('bb-cart', []))
  const [wishlist, setWishlist] = useState<string[]>(() => readLS('bb-wishlist', []))
  useEffect(() => { localStorage.setItem('bb-cart', JSON.stringify(lines)) }, [lines])
  useEffect(() => { localStorage.setItem('bb-wishlist', JSON.stringify(wishlist)) }, [wishlist])

  const value = useMemo<CartCtx>(() => {
    const detailed = lines
      .map((l) => {
        const product = catalog.find((p) => p.id === l.id)
        return product ? { product, qty: l.qty } : null
      })
      .filter((x): x is { product: Product; qty: number } => x !== null)
    return {
      lines,
      add: (id, qty = 1) =>
        setLines((prev) => {
          const found = prev.find((l) => l.id === id)
          if (found) return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l))
          return [...prev, { id, qty }]
        }),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) => qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 99) } : l))),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: detailed.reduce((s, d) => s + d.product.price * d.qty, 0),
      detailed,
      wishlist,
      toggleWish: (id) => setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id])),
    }
  }, [lines, wishlist, catalog])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
