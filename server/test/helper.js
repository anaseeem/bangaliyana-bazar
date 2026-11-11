import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildApp } from '../index.js'

// প্রতি টেস্ট ফাইলে নতুন অস্থায়ী ফোল্ডার আর নতুন অ্যাপ
export async function start() {
  const dataDir = await mkdtemp(join(tmpdir(), 'bb-test-'))
  const app = await buildApp({ dataDir, databaseUrl: '', logger: false })
  // call(method, url, { body, as }) — as হলো ঢোকা ব্যক্তির কুকি
  const call = async (method, url, { body, as } = {}) => {
    const res = await app.inject({
      method, url,
      headers: { ...(as ? { cookie: as } : {}), ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
      payload: body !== undefined ? JSON.stringify(body) : undefined,
    })
    let json = null
    try { json = res.json() } catch { /* জেসন নয় */ }
    return { status: res.statusCode, json, res }
  }
  const cookieOf = (r) => String(r.res.headers['set-cookie']).split(';')[0]
  let n = 0
  const signup = async (name = 'রহিম উদ্দিন') => {
    const phone = `0171${String(1000000 + ++n * 7)}`
    const r = await call('POST', '/api/auth/signup', { body: { name, phone, password: 'secret1' } })
    return { phone, as: cookieOf(r), user: r.json.user }
  }
  const login = async (phone, password) => cookieOf(await call('POST', '/api/auth/login', { body: { phone, password } }))
  const admin = async () => login('01700000000', 'admin123')
  const order = (as, items, extra = {}) => call('POST', '/api/orders', {
    as, body: { name: 'রহিম উদ্দিন', phone: '01712345678', district: 'ঢাকা', address: 'বাড়ি ১, রোড ২, ধানমন্ডি', items, ...extra },
  })
  return { app, call, cookieOf, signup, login, admin, order }
}
