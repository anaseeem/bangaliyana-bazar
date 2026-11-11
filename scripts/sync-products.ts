// src/data/products.ts থেকে data/products.json বানায়, যাতে সার্ভার আর দোকানের তালিকা এক থাকে।
import { writeFileSync } from 'node:fs'
import { PRODUCTS } from '../src/data/products.ts'
import { SEED_SELLERS } from '../src/data/sellers.ts'

const sortKeys = (o: object) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(new URL('../data/products.json', import.meta.url), JSON.stringify(PRODUCTS.map(sortKeys), null, 2) + '\n')
console.log(`data/products.json: ${PRODUCTS.length}টি পণ্য`)

// সার্ভারের প্রথম বুটের জন্য কারিগর-বিক্রেতাদের তালিকা (src/data/sellers.ts এর SEED_SELLERS)
writeFileSync(new URL('../data/seed.json', import.meta.url), JSON.stringify({ sellers: SEED_SELLERS.map(sortKeys) }, null, 2) + '\n')
console.log(`data/seed.json: ${SEED_SELLERS.length}জন বিক্রেতা`)
