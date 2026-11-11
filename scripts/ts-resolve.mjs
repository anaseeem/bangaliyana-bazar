// src/ এর ফাইলগুলো './products' লেখে, .ts ছাড়া। Node এ চালাতে .ts জুড়ে দেয়।
import { register } from 'node:module'
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx) } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND' && spec.startsWith('.')) return next(spec + '.ts', ctx)
    throw e
  }
}`))
