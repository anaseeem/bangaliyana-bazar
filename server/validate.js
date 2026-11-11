// সবার কাজে লাগা ছোট যাচাই
const BN = '০১২৩৪৫৬৭৮৯'
export const toBn = (n) => String(n).replace(/\d/g, (d) => BN[d])

// বাংলা অঙ্ক ইংরেজিতে, ফাঁকা আর দাগ বাদ, শুরুর +৮৮ বাদ
export const normPhone = (v) => {
  if (typeof v !== 'string') return ''
  return v.replace(/[০-৯]/g, (d) => BN.indexOf(d)).replace(/[\s\-()]/g, '').replace(/^\+?88(?=01)/, '')
}
export const isPhone = (v) => /^01[3-9]\d{8}$/.test(v)
export const isStr = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max

// কোড দিয়ে থামানো ত্রুটি। index.js এর error handler এটা বাংলা বাক্য হিসেবে পাঠায়।
export const httpError = (code, message) => Object.assign(new Error(message), { statusCode: code, expose: true })

export const newId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// জেসন বডি অবজেক্ট না হলে খালি অবজেক্ট
export const bodyOf = (req) => (req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {})

export const PHOTO_OK = (v) => v === '' || (typeof v === 'string' && v.length <= 200 && (v.startsWith('/api/files/') || v.startsWith('/products/')))
