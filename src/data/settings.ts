/** দোকানের সাজানো আর হিসাবের সেটিংস। সার্ভার থেকে আসে, আসার আগে এই ডিফল্ট দেখায় (server/seed.js এর মতো)। */
export interface Settings {
  announcement: string
  heroBadge: string
  heroTitle: string
  heroText: string
  heroProductId: string
  whatsapp: string
  feeDhaka: number
  feeOutside: number
  daysDhaka: string
  daysOutside: string
  commissionPercent: number
  categories: string[]
  newIds: string[]
  roomIds: string[]
  featuredSellerId: string
  footerLine: string
}

export const DEFAULT_SETTINGS: Settings = {
  announcement: 'সারা দেশে ডেলিভারি • পণ্য হাতে পেয়ে টাকা দিন',
  heroBadge: 'শুভ নববর্ষ • পহেলা বৈশাখের মেলা',
  heroTitle: 'হাতের কাজ,\nবাংলার গল্প।',
  heroText: 'জামদানি, নকশি কাঁথা, পোড়ামাটি, কাঠ আর পিতলের কাজ। বাংলাদেশের কারিগরদের হাতে বোনা, গড়া আর আঁকা জিনিস, সরাসরি আপনার ঘরে।',
  heroProductId: 'kather-ghora',
  whatsapp: '01608332564',
  feeDhaka: 60,
  feeOutside: 120,
  daysDhaka: 'দুই দিনে',
  daysOutside: 'দুই থেকে চার দিনে',
  commissionPercent: 0,
  categories: ['শাড়ি', 'কাঁথা', 'মাটির কাজ', 'কাঠের কাজ', 'কাঁসা-পিতল', 'গয়না', 'বাঁশ-বেত', 'পাট', 'লোকশিল্প'],
  newIds: ['dhokra-lonthon', 'hans-nouka', 'shola-mala', 'pot-thala'],
  roomIds: ['pitoler-tob', 'matir-pakhi', 'alor-kulungi', 'bet-tray', 'kather-hati'],
  featuredSellerId: 'k1',
  footerLine: 'হাতে বোনা, হাতে গড়া, হাতে সেলাই করা।',
}
