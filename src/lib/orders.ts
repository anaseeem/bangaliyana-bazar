import type { Order } from '../store/market'

export type OrderStatus = 'নেওয়া হয়েছে' | 'পাঠানো হয়েছে' | 'পৌঁছেছে' | 'বাতিল হয়েছে'

/** সার্ভারের অবস্থা থেকে ক্রেতাকে দেখানোর নাম */
export function orderStatus(o: Pick<Order, 'status'>): OrderStatus {
  if (o.status === 'delivered') return 'পৌঁছেছে'
  if (o.status === 'sent') return 'পাঠানো হয়েছে'
  if (o.status === 'cancelled') return 'বাতিল হয়েছে'
  return 'নেওয়া হয়েছে'
}
