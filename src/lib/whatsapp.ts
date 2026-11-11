import { normalizePhone } from '../data/districts'

/**
 * WhatsApp-এ লেখা তৈরি করে খোলে। phone না থাকলে দোকানের নম্বরে যায়।
 * দোকানের নম্বর সেটিংস থেকে (shopPhone) আসে।
 */
export function whatsappLink(text: string, phone: string | undefined, shopPhone: string) {
  return `https://wa.me/88${normalizePhone(phone || shopPhone)}?text=${encodeURIComponent(text)}`
}
