// src/data/products.ts থেকে data/products.json বানায়, যাতে সার্ভার আর দোকানের তালিকা এক থাকে।
import { writeFileSync } from 'node:fs'
import { PRODUCTS } from '../src/data/products.ts'

const sortKeys = (o: object) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(new URL('../data/products.json', import.meta.url), JSON.stringify(PRODUCTS.map(sortKeys), null, 2) + '\n')
console.log(`data/products.json: ${PRODUCTS.length}টি পণ্য`)
