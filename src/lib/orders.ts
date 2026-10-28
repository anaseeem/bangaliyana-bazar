import type { Order } from '../store/market'

export type OrderStatus = 'নেওয়া হয়েছে' | 'পাঠানো হয়েছে' | 'পৌঁছেছে'

/** অর্ডার এখন কোথায়। সব বিক্রেতা পাঠালে তবেই পাঠানো। */
export function orderStatus(o: Order): OrderStatus {
  if (o.received) return 'পৌঁছেছে'
  const sellers = new Set(o.items.map((it) => it.sellerId))
  return sellers.size > 0 && [...sellers].every((id) => o.sentBy?.includes(id)) ? 'পাঠানো হয়েছে' : 'নেওয়া হয়েছে'
}
