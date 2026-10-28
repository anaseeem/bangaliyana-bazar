import { normalizePhone } from '../data/districts'

/** দোকানের WhatsApp। যে কারিগরের নিজের নম্বর নেই, তাঁর প্রশ্ন আর ঝুড়ির অর্ডার এখানে আসে। */
export const SHOP_WHATSAPP = '01608332564'

/** WhatsApp-এ লেখা তৈরি করে খোলে। বিক্রেতার নম্বর না থাকলে দোকানের নম্বরে যায়। */
export function whatsappLink(text: string, phone?: string) {
  return `https://wa.me/88${normalizePhone(phone || SHOP_WHATSAPP)}?text=${encodeURIComponent(text)}`
}
