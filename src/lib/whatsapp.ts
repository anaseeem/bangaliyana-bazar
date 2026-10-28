import { normalizePhone } from '../data/districts'

/** WhatsApp-এ লেখা তৈরি করে খোলে। নম্বর না থাকলে কাকে পাঠাবেন সেটা নিজে বাছাই করেন। */
export function whatsappLink(text: string, phone?: string) {
  const n = phone ? normalizePhone(phone) : ''
  return `https://wa.me/${n ? `88${n}` : ''}?text=${encodeURIComponent(text)}`
}
