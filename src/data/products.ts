export type ArtKind =
  | 'jamdani'
  | 'kantha'
  | 'monipuri'
  | 'terracotta'
  | 'jhapi'
  | 'bamboo'
  | 'jute'
  | 'rickshaw'
  | 'gamchha'
  | 'cushion'
  | 'kansa'
  | 'pitha'
  | 'pati'
  | 'diya'

export interface Product {
  id: string
  nameBn: string
  price: number
  oldPrice?: number
  category: string
  district: string
  artisan: string
  story: string
  description: string
  stock: number
  rating: number
  badge?: string
  art: ArtKind
  palette: [string, string, string]
}

export const CATEGORIES = [
  'সব',
  'শাড়ি',
  'কাঁথা',
  'মাটির কাজ',
  'বাঁশ-বেত',
  'পাট',
  'লোকশিল্প',
] as const

export const DISTRICTS = [
  'সব জেলা',
  'ঢাকা',
  'টাঙ্গাইল',
  'যশোর',
  'সিলেট',
  'দিনাজপুর',
  'বগুড়া',
  'রংপুর',
  'ফরিদপুর',
  'পাবনা',
  'কুষ্টিয়া',
  'জামালপুর',
  'বরিশাল',
  'কুমিল্লা',
] as const

export const PRODUCTS: Product[] = [
  {
    id: 'jamdani-shari',
    nameBn: 'জামদানি শাড়ি',
    price: 8500,
    oldPrice: 9800,
    category: 'শাড়ি',
    district: 'ঢাকা',
    artisan: 'রহিমা খাতুন',
    story: 'রূপগঞ্জের তাঁতে তিন সপ্তাহ ধরে বোনা। প্রতিটি ফুলের নকশা তাঁতির আঙুলের হিসেবে ওঠে, কোনো ছাপ নয়।',
    description: 'হাতে বোনা আসল জামদানি। হালকা, নরম আর বৈশাখের সকালে পরার মতো উজ্জ্বল। ব্লাউজ পিসসহ।',
    stock: 6,
    rating: 4.9,
    badge: 'সেরা বিক্রি',
    art: 'jamdani',
    palette: ['#7f1d1d', '#f59e0b', '#fff7e6'],
  },
  {
    id: 'nakshi-kantha',
    nameBn: 'নকশি কাঁথা',
    price: 4200,
    category: 'কাঁথা',
    district: 'যশোর',
    artisan: 'ফাতেমা বেগম',
    story: 'দাদির আমলের পুরনো শাড়ি ছিঁড়ে নয়, নতুন কাপড়ে সেলাই। মাঝখানের পদ্মফুলটা ফাতেমা আপা নিজের হাতে এঁকেছেন।',
    description: 'হাতে সেলাই করা নকশি কাঁথা। গরমে হালকা, শীতে উষ্ণ। প্রতিটি সেলাইয়ে একেকটা গল্প।',
    stock: 9,
    rating: 4.8,
    badge: 'হাতে সেলাই',
    art: 'kantha',
    palette: ['#b91c1c', '#166534', '#fde68a'],
  },
  {
    id: 'monipuri-shari',
    nameBn: 'মণিপুরি শাড়ি',
    price: 3800,
    oldPrice: 4300,
    category: 'শাড়ি',
    district: 'সিলেট',
    artisan: 'সনাতন সিংহ',
    story: 'সিলেটের মণিপুরি পাড়ার তাঁতঘর থেকে। পাড়ের জ্যামিতিক নকশা মণিপুরি ঐতিহ্যের চেনা ছাপ।',
    description: 'মণিপুরি তাঁতের শাড়ি, টেম্পল পাড় আর রঙিন বুটি। অফিস, উৎসব। সবখানে মানায়।',
    stock: 12,
    rating: 4.7,
    art: 'monipuri',
    palette: ['#166534', '#f59e0b', '#b91c1c'],
  },
  {
    id: 'terracotta-set',
    nameBn: 'টেরাকোটা থালা-বাটি সেট',
    price: 1850,
    category: 'মাটির কাজ',
    district: 'দিনাজপুর',
    artisan: 'কার্তিক পাল',
    story: 'দিনাজপুরের কান্তজিউ মন্দিরের টেরাকোটা থেকে অনুপ্রেরণা। কুমোরের চাকায় গড়া, খড়ির আগুনে পোড়ানো।',
    description: '৪ জনের সেট। থালা, বাটি আর গ্লাস। মাটির নিজের রং, কোনো কৃত্রিম চকচকে ভাব নেই।',
    stock: 15,
    rating: 4.8,
    art: 'terracotta',
    palette: ['#c2410c', '#7c2d12', '#fde68a'],
  },
  {
    id: 'lakshmir-jhapi',
    nameBn: 'লক্ষ্মীর ঝাঁপি',
    price: 650,
    category: 'মাটির কাজ',
    district: 'বগুড়া',
    artisan: 'কার্তিক পাল',
    story: 'ছোটবেলায় যার ঝাঁপিতে জমানো হতো ঈদের সালামি। একই মাটি, একই ছাঁচ, একই আদর।',
    description: 'হাতে গড়া মাটির লক্ষ্মীর ঝাঁপি। সঞ্চয়ের অভ্যাস শেখানোর সবচেয়ে সুন্দর উপহার।',
    stock: 30,
    rating: 4.9,
    badge: 'উপহারের জন্য',
    art: 'jhapi',
    palette: ['#c2410c', '#b91c1c', '#f59e0b'],
  },
  {
    id: 'bamboo-basket',
    nameBn: 'বাঁশের ঝুড়ি',
    price: 750,
    category: 'বাঁশ-বেত',
    district: 'রংপুর',
    artisan: 'আনোয়ার হোসেন',
    story: 'রংপুরের বাঁশঝাড় থেকে কাটা বাঁশ, রোদে শুকিয়ে, হাতে বোনা। মজবুত, হালকা, আর ঘরের সাজে মানানসই।',
    description: 'বহুমুখী বাঁশের ঝুড়ি। বাজার, ফল, কাপড়, গাছের টব, যেখানে খুশি।',
    stock: 20,
    rating: 4.6,
    art: 'bamboo',
    palette: ['#a16207', '#166534', '#fef3c7'],
  },
  {
    id: 'jute-bag',
    nameBn: 'পাটের ব্যাগ',
    price: 950,
    category: 'পাট',
    district: 'ফরিদপুর',
    artisan: 'নাসরিন আক্তার',
    story: 'সোনালি আঁশের দেশের ব্যাগ। পাটের সুতা বুনে, ভেতরে সুতির আস্তর। প্লাস্টিকের বদলে একটা ভালো অভ্যাস।',
    description: 'টেকসই পাটের টোট ব্যাগ। বাজার, বই, ল্যাপটপ। সব ধরে। ভেতরে ছোট পকেট আছে।',
    stock: 25,
    rating: 4.7,
    badge: 'পরিবেশবান্ধব',
    art: 'jute',
    palette: ['#92400e', '#166534', '#fff7e6'],
  },
  {
    id: 'rickshaw-art',
    nameBn: 'রিকশা আর্ট পেইন্টিং',
    price: 2800,
    category: 'লোকশিল্প',
    district: 'ঢাকা',
    artisan: 'সৈয়দ আহমেদ',
    story: 'পুরান ঢাকার রিকশা আর্টের শিল্পী সৈয়দ ভাইয়ের হাতে আঁকা। টিনের ওপর রং, যেমনটা রিকশার পেছনে দেখা যায়।',
    description: 'হাতে আঁকা রিকশা আর্ট। পাখি, ফুল আর ঢাকার রাস্তার রং। দেয়ালে ঝুললেই ঘর বদলে যায়।',
    stock: 8,
    rating: 5.0,
    badge: 'একটাই আছে এমন',
    art: 'rickshaw',
    palette: ['#b91c1c', '#f59e0b', '#0ea5e9'],
  },
  {
    id: 'gamchha',
    nameBn: 'হাতে বোনা গামছা (জোড়া)',
    price: 350,
    category: 'শাড়ি',
    district: 'পাবনা',
    artisan: 'সনাতন সিংহ',
    story: 'পাবনার তাঁতে বোনা লাল-সবুজ চেকের গামছা। গরমে ঘাম মোছা থেকে শুরু করে বৈশাখের সাজ। সবকিছুর সঙ্গী।',
    description: 'নরম সুতির গামছা, জোড়া প্যাক। রং পাকা, ধুলেও নরম থাকে।',
    stock: 40,
    rating: 4.6,
    art: 'gamchha',
    palette: ['#b91c1c', '#166534', '#fff7e6'],
  },
  {
    id: 'kantha-cushion',
    nameBn: 'নকশি কাঁথা কুশন কভার',
    price: 1100,
    category: 'কাঁথা',
    district: 'কুষ্টিয়া',
    artisan: 'ফাতেমা বেগম',
    story: 'কাঁথার সেলাই এবার কুশনে। লাল সুতোর ফোঁড়ে ফোঁড়ে মাছ, ফুল আর লতার নকশা।',
    description: '১৬×১৬ ইঞ্চি কুশন কভার, পেছনে জিপার। সোফা বা বিছানা। যেখানেই বসুক, চোখে পড়বে।',
    stock: 18,
    rating: 4.8,
    art: 'cushion',
    palette: ['#7f1d1d', '#f59e0b', '#166534'],
  },
  {
    id: 'kansa-set',
    nameBn: 'কাঁসার থালা-গ্লাস সেট',
    price: 2400,
    category: 'লোকশিল্প',
    district: 'জামালপুর',
    artisan: 'অনিল কর্মকার',
    story: 'জামালপুরের কাঁসারিদের হাতের কাজ। পিতল গলিয়ে, হাতুড়ির টোকায় টোকায় গড়া। দাদা-নানার বাড়ির স্মৃতির মতো।',
    description: 'থালা, গ্লাস আর ছোট বাটির সেট। পুজো, বিয়ে কিংবা রোজকার ভাত। সবেতেই জৌলুস।',
    stock: 10,
    rating: 4.7,
    art: 'kansa',
    palette: ['#b45309', '#fde68a', '#78350f'],
  },
  {
    id: 'pitha-mould',
    nameBn: 'নকশি পিঠা ছাঁচ',
    price: 550,
    category: 'মাটির কাজ',
    district: 'বরিশাল',
    artisan: 'মরিয়ম বিবি',
    story: 'শীতের পিঠা-পুলির উৎসবের ছাঁচ। কাঠে খোদাই করা নকশা। ফুল, পাতা, চাঁদ।',
    description: 'কাঠের নকশি পিঠা ছাঁচ। পিঠায় নকশা তুলতে আর পিঠা বানানো শেখাতে। দুটোতেই কাজে লাগে।',
    stock: 22,
    rating: 4.5,
    art: 'pitha',
    palette: ['#92400e', '#b91c1c', '#fde68a'],
  },
  {
    id: 'shital-pati',
    nameBn: 'শীতল পাটি',
    price: 1600,
    category: 'বাঁশ-বেত',
    district: 'সিলেট',
    artisan: 'আনোয়ার হোসেন',
    story: 'সিলেটের শীতল পাটি। গরম দুপুরে যার ওপর শুলে শরীর জুড়িয়ে যায়। মুর্তা ঘাস বুনে বোনা।',
    description: 'হাতে বোনা শীতল পাটি, বসা আর শোয়া দুটোতেই আরাম। গরমের দিনের সেরা সঙ্গী।',
    stock: 14,
    rating: 4.8,
    art: 'pati',
    palette: ['#166534', '#f59e0b', '#fef3c7'],
  },
  {
    id: 'clay-diya',
    nameBn: 'মাটির প্রদীপ সেট (৬টি)',
    price: 480,
    category: 'মাটির কাজ',
    district: 'কুমিল্লা',
    artisan: 'কার্তিক পাল',
    story: 'দীপাবলি আর বৈশাখের সন্ধ্যায় মাটির প্রদীপের আলো। এই আলোতেই বাংলার উৎসব জ্বলে।',
    description: '৬টি হাতে গড়া মাটির প্রদীপ। তেল আর সলতে দিয়ে জ্বালান, ঘর ভরে যাক নরম আলোয়।',
    stock: 35,
    rating: 4.7,
    art: 'diya',
    palette: ['#c2410c', '#f59e0b', '#7f1d1d'],
  },
]

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

/** যেকোনো সংখ্যা বা লেখার ইংরেজি অঙ্ক বাংলা অঙ্কে বদলায়। যেমন 4.9 → ৪.৯ */
export const bn = (v: number | string) => String(v).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])

export const formatBDT = (n: number) => `৳${n.toLocaleString('bn-BD')}`

export const ARTISANS = [
  {
    name: 'রহিমা খাতুন',
    craft: 'জামদানি তাঁত',
    district: 'ঢাকা',
    years: 22,
    note: 'মায়ের কাছ থেকে তাঁত শিখেছেন ১৪ বছর বয়সে। এখন নিজের তাঁতঘরে তিনজন শিক্ষানবিশকে শেখান।',
  },
  {
    name: 'ফাতেমা বেগম',
    craft: 'নকশি কাঁথা',
    district: 'যশোর',
    years: 18,
    note: 'একেকটা কাঁথায় সময় লাগে দুই মাস। সেলাইয়ের ফাঁকে ফাঁকে মেয়েদের গল্প শোনান, গান গান।',
  },
  {
    name: 'কার্তিক পাল',
    craft: 'মৃৎশিল্প',
    district: 'দিনাজপুর',
    years: 30,
    note: 'তিন পুরুষের কুমোর। চাকার ঘূর্ণনে মাটি যেভাবে আকার নেয়, সেটাই তাঁর কাছে উৎসব।',
  },
  {
    name: 'সৈয়দ আহমেদ',
    craft: 'রিকশা আর্ট',
    district: 'ঢাকা',
    years: 25,
    note: 'পুরান ঢাকার রিকশা সাজানো থেকে শুরু। এখন তাঁর আঁকা রিকশা আর্ট দেয়ালে দেয়ালে।',
  },
  {
    name: 'আনোয়ার হোসেন',
    craft: 'বাঁশ-বেত',
    district: 'রংপুর',
    years: 15,
    note: 'বাঁশ কাটা থেকে বোনা। পুরো কাজটা নিজের হাতে। তাঁর ঝুড়ি যায় ঢাকার মেলাতেও।',
  },
  {
    name: 'নাসরিন আক্তার',
    craft: 'পাটের কাজ',
    district: 'ফরিদপুর',
    years: 12,
    note: 'পাটের সুতোয় ব্যাগ বুনে সংসার চালান। চান পাটের কাজ আবার ফিরুক প্রতিটি ঘরে।',
  },
]
