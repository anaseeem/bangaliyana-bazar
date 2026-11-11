/**
 * বাজারের তথ্য: দোকানের সেটিংস, পণ্য, বিক্রেতা আর ঢোকা মানুষ। সব সার্ভার (/api/boot) থেকে আসে।
 * প্রথমবার দেখানোর জন্য শেষ বারের তথ্য localStorage-এ থাকে, সার্ভার ঘুমিয়ে থাকলেও দোকান খোলে।
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS, type Product } from '../data/products'
import { SEED_SELLERS, type Seller } from '../data/sellers'
import { DEFAULT_SETTINGS, type Settings } from '../data/settings'
import { api, errorText } from '../lib/api'
import { readLS, writeLS } from '../lib/local'

export interface User {
  id: string
  name: string
  phone: string
  role: 'customer' | 'admin'
  createdAt: string
  /** শেষ অর্ডারের ঠিকানা, ঝুড়িতে আগে থেকে বসে যায় */
  district?: string
  address?: string
  blocked?: boolean
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
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: string
  status: 'placed' | 'sent' | 'delivered' | 'cancelled'
  /** যেসব বিক্রেতা নিজের অংশ পাঠিয়ে দিয়েছেন */
  sentBy: string[]
  confirmed?: boolean
  courier?: string
  cancelReason?: string
  createdAt: string
  deliveredAt?: string
}

export type ShopInfo = Pick<Seller, 'shopName' | 'craft' | 'district' | 'story' | 'phone'>
type Me = { user: User; seller: Seller | null }
interface Boot { settings: Settings; products: Product[]; sellers: Seller[]; me: Me | null }

const BOOT_KEY = 'bb-boot'
const OLD_KEYS = ['bb-users', 'bb-session', 'bb-sellers', 'bb-seller-products', 'bb-orders']

interface MarketCtx {
  /** সার্ভার অন্তত একবার উত্তর দিয়েছে। তার আগে user আর mySeller অজানা। */
  ready: boolean
  settings: Settings
  /** সবার জন্য দেখানো পণ্য */
  catalog: Product[]
  /** অনুমোদিত বিক্রেতা */
  sellers: Seller[]
  user: User | null
  mySeller: Seller | null
  refresh: () => Promise<void>
  signup: (name: string, phone: string, password: string) => Promise<string | null>
  login: (phone: string, password: string) => Promise<string | null>
  logout: () => Promise<string | null>
  updateProfile: (p: Partial<Pick<User, 'name' | 'district' | 'address'>>) => Promise<string | null>
  changePassword: (oldPass: string, newPass: string) => Promise<string | null>
  registerSeller: (s: ShopInfo) => Promise<string | null>
  updateShop: (s: ShopInfo) => Promise<string | null>
}

const Ctx = createContext<MarketCtx | null>(null)

function firstPaint(): Pick<Boot, 'settings' | 'products' | 'sellers'> {
  const saved = readLS<Partial<Boot> | null>(BOOT_KEY, null)
  if (saved?.settings && saved.products && saved.sellers) {
    return { settings: { ...DEFAULT_SETTINGS, ...saved.settings }, products: saved.products, sellers: saved.sellers }
  }
  return { settings: DEFAULT_SETTINGS, products: PRODUCTS, sellers: SEED_SELLERS }
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [shop, setShop] = useState(firstPaint)
  const [me, setMe] = useState<Me | null>(null)
  const [ready, setReady] = useState(false)

  const apply = useCallback((b: Boot) => {
    setShop({ settings: { ...DEFAULT_SETTINGS, ...b.settings }, products: b.products, sellers: b.sellers })
    setMe(b.me)
    writeLS(BOOT_KEY, { settings: b.settings, products: b.products, sellers: b.sellers })
  }, [])

  // সার্ভার না পেলে যা দেখানো হচ্ছে তাই থাকে
  const refresh = useCallback(async () => {
    await api.get<Boot>('/boot').then(apply, () => {})
    setReady(true)
  }, [apply])

  useEffect(() => {
    try { for (const k of OLD_KEYS) localStorage.removeItem(k) } catch { /* ঠিক আছে */ }
    api.get<Boot>('/boot').then(apply, () => {}).finally(() => setReady(true))
  }, [apply])

  const value = useMemo<MarketCtx>(() => {
    /** কাজ চালিয়ে ভুল হলে বাংলা বাক্য ফেরায় */
    const act = async (fn: () => Promise<void>) => {
      try { await fn(); return null } catch (e) { return errorText(e) }
    }
    return {
      ready,
      settings: shop.settings,
      catalog: shop.products,
      sellers: shop.sellers,
      user: me?.user ?? null,
      mySeller: me?.seller ?? null,
      refresh,
      signup: (name, phone, password) => act(async () => { setMe(await api.post<Me>('/auth/signup', { name, phone, password })) }),
      login: (phone, password) => act(async () => { setMe(await api.post<Me>('/auth/login', { phone, password })) }),
      logout: () => act(async () => { await api.post('/auth/logout'); setMe(null) }),
      updateProfile: (p) => act(async () => { setMe(await api.patch<Me>('/me', p)) }),
      changePassword: (current, password) => act(async () => { await api.post('/me/password', { current, password }) }),
      registerSeller: (s) => act(async () => {
        const seller = await api.post<Seller>('/seller', s)
        setMe((m) => (m ? { ...m, seller } : m))
        await refresh()
      }),
      updateShop: (s) => act(async () => {
        const seller = await api.patch<Seller>('/seller', s)
        setMe((m) => (m ? { ...m, seller } : m))
        await refresh()
      }),
    }
  }, [ready, shop, me, refresh])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useMarket() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider')
  return ctx
}
