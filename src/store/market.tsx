/**
 * বাজারের ডেমো তথ্য: অ্যাকাউন্ট, বিক্রেতা, বিক্রেতার পণ্য আর অর্ডার।
 * সব ব্রাউজারের localStorage-এ থাকে, কোনো সার্ভার বা ডাটাবেস নেই। তাই অন্য ব্রাউজারে দেখা যায় না।
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS, type Product } from '../data/products'
import { ART_FOR, SEED_SELLERS, type Seller } from '../data/sellers'
import { newOrderId, readLS, writeLS } from '../lib/local'

export interface User {
  id: string
  name: string
  phone: string
  passHash: string
  createdAt: string
  /** শেষ অর্ডারের ঠিকানা, ঝুড়িতে আগে থেকে বসে যায় */
  district?: string
  address?: string
}

export interface OrderItem { id: string; nameBn: string; price: number; qty: number; sellerId: string }

export interface Order {
  id: string
  userId: string | null
  name: string
  phone: string
  district: string
  address: string
  items: OrderItem[]
  deliveryFee: number
  total: number
  createdAt: string
  /** যেসব বিক্রেতা নিজের অংশ পাঠিয়ে দিয়েছেন */
  sentBy?: string[]
  /** ক্রেতা হাতে পেয়েছেন */
  received?: boolean
}

type ShopInfo = Pick<Seller, 'shopName' | 'craft' | 'district' | 'story' | 'phone'>
type NewProduct = Omit<Product, 'id' | 'sellerId' | 'artisan' | 'district' | 'rating' | 'art' | 'palette'>

/** ডেমো পাসওয়ার্ড হ্যাশ। আসল সাইটে এটা সার্ভারে হবে। */
async function hash(text: string) {
  const data = new TextEncoder().encode(`bb:${text}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

interface MarketCtx {
  user: User | null
  signup: (name: string, phone: string, password: string) => Promise<string | null>
  login: (phone: string, password: string) => Promise<string | null>
  logout: () => void
  updateProfile: (p: Partial<Pick<User, 'name' | 'district' | 'address'>>) => void
  changePassword: (oldPass: string, newPass: string) => Promise<string | null>
  sellers: Seller[]
  mySeller: Seller | null
  registerSeller: (s: ShopInfo) => void
  updateShop: (s: ShopInfo) => void
  approveSeller: (id: string) => void
  /** সব পণ্য: আগের পণ্য আর অনুমোদিত বিক্রেতাদের নতুন পণ্য */
  catalog: Product[]
  sellerProducts: Product[]
  addProduct: (p: NewProduct) => void
  updateProduct: (id: string, p: NewProduct) => void
  removeProduct: (id: string) => void
  orders: Order[]
  saveOrder: (o: Omit<Order, 'id' | 'createdAt' | 'userId'>, id?: string) => Order
  /** বিক্রেতা নিজের অংশ পাঠালেন */
  markSent: (orderId: string) => void
  markReceived: (orderId: string) => void
}

const Ctx = createContext<MarketCtx | null>(null)

export function MarketProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => readLS('bb-users', []))
  const [sessionId, setSessionId] = useState<string | null>(() => readLS('bb-session', null))
  const [newSellers, setNewSellers] = useState<Seller[]>(() => readLS('bb-sellers', []))
  const [sellerProducts, setSellerProducts] = useState<Product[]>(() => readLS('bb-seller-products', []))
  const [orders, setOrders] = useState<Order[]>(() => readLS('bb-orders', []))
  useEffect(() => writeLS('bb-users', users), [users])
  useEffect(() => writeLS('bb-session', sessionId), [sessionId])
  useEffect(() => writeLS('bb-sellers', newSellers), [newSellers])
  useEffect(() => writeLS('bb-seller-products', sellerProducts), [sellerProducts])
  useEffect(() => writeLS('bb-orders', orders), [orders])

  const value = useMemo<MarketCtx>(() => {
    const user = users.find((u) => u.id === sessionId) ?? null
    const sellers = [...SEED_SELLERS, ...newSellers]
    const mySeller = user ? newSellers.find((s) => s.userId === user.id) ?? null : null
    const approved = new Set(sellers.filter((s) => s.status === 'approved').map((s) => s.id))
    return {
      user,
      signup: async (name, phone, password) => {
        if (users.some((u) => u.phone === phone)) return 'এই নম্বরে আগেই অ্যাকাউন্ট আছে। ঢুকুন।'
        const u: User = { id: newId('u'), name, phone, passHash: await hash(password), createdAt: new Date().toISOString() }
        setUsers((prev) => [...prev, u])
        setSessionId(u.id)
        return null
      },
      login: async (phone, password) => {
        const u = users.find((x) => x.phone === phone)
        if (!u || u.passHash !== (await hash(password))) return 'নম্বর বা পাসওয়ার্ড মিলছে না।'
        setSessionId(u.id)
        return null
      },
      logout: () => setSessionId(null),
      updateProfile: (p) => setUsers((prev) => prev.map((u) => (u.id === sessionId ? { ...u, ...p } : u))),
      changePassword: async (oldPass, newPass) => {
        if (!user || user.passHash !== (await hash(oldPass))) return 'আগের পাসওয়ার্ড মিলছে না।'
        const passHash = await hash(newPass)
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, passHash } : u)))
        return null
      },
      sellers,
      mySeller,
      registerSeller: (s) => {
        if (!user || mySeller) return
        setNewSellers((prev) => [...prev, { ...s, id: newId('s'), userId: user.id, ownerName: user.name, status: 'pending', createdAt: new Date().toISOString() }])
      },
      updateShop: (s) => {
        if (!mySeller) return
        setNewSellers((prev) => prev.map((x) => (x.id === mySeller.id ? { ...x, ...s } : x)))
        // পণ্যের পাতায় জেলা দোকানের সাথে মেলে
        setSellerProducts((prev) => prev.map((p) => (p.sellerId === mySeller.id ? { ...p, district: s.district } : p)))
      },
      approveSeller: (id) => setNewSellers((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))),
      catalog: [...PRODUCTS, ...sellerProducts.filter((p) => p.sellerId && approved.has(p.sellerId))],
      sellerProducts,
      addProduct: (p) => {
        if (!mySeller || mySeller.status !== 'approved') return
        const look = ART_FOR[p.category] ?? ART_FOR['লোকশিল্প']
        setSellerProducts((prev) => [
          ...prev,
          { ...p, ...look, id: newId('p'), sellerId: mySeller.id, artisan: mySeller.ownerName, district: mySeller.district, rating: 0 },
        ])
      },
      updateProduct: (id, p) => {
        const look = ART_FOR[p.category] ?? ART_FOR['লোকশিল্প']
        setSellerProducts((prev) => prev.map((x) => (x.id === id && x.sellerId === mySeller?.id ? { ...x, ...p, ...look } : x)))
      },
      removeProduct: (id) => setSellerProducts((prev) => prev.filter((p) => !(p.id === id && p.sellerId === mySeller?.id))),
      orders,
      saveOrder: (o, id) => {
        const order: Order = { ...o, id: id ?? newOrderId(), userId: user?.id ?? null, createdAt: new Date().toISOString() }
        setOrders((prev) => [...prev, order])
        return order
      },
      markSent: (orderId) => {
        if (!mySeller) return
        setOrders((prev) => prev.map((o) => (o.id === orderId && !o.sentBy?.includes(mySeller.id) ? { ...o, sentBy: [...(o.sentBy ?? []), mySeller.id] } : o)))
      },
      markReceived: (orderId) => setOrders((prev) => prev.map((o) => (o.id === orderId && o.userId === user?.id ? { ...o, received: true } : o))),
    }
  }, [users, sessionId, newSellers, sellerProducts, orders])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMarket() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider')
  return ctx
}
