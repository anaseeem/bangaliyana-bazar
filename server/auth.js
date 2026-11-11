import { scrypt, randomBytes, timingSafeEqual, createHmac } from 'node:crypto'
import { httpError } from './validate.js'

const COOKIE = 'bb_s'
const MAX_AGE = 2592000 // ৩০ দিন
const b64 = (b) => Buffer.from(b).toString('base64url')
const scryptAsync = (pw, salt) => new Promise((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))))

export async function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt$${salt}$${(await scryptAsync(pw, salt)).toString('hex')}`
}
export async function checkPassword(pw, stored) {
  const [kind, salt, hex] = String(stored).split('$')
  if (kind !== 'scrypt' || !salt || !hex) return false
  const h = await scryptAsync(pw, salt)
  const b = Buffer.from(hex, 'hex')
  return b.length === h.length && timingSafeEqual(h, b)
}

export function makeAuth(store, secret) {
  const mac = (data) => createHmac('sha256', secret).update(data).digest('base64url')
  const sign = (uid) => {
    const head = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + MAX_AGE }))}`
    return `${head}.${mac(head)}`
  }
  const verify = (token) => {
    const [h, p, s] = String(token).split('.')
    if (!h || !p || !s) return null
    const want = Buffer.from(mac(`${h}.${p}`))
    const got = Buffer.from(s)
    if (want.length !== got.length || !timingSafeEqual(want, got)) return null
    try {
      const pay = JSON.parse(Buffer.from(p, 'base64url').toString())
      return pay.exp > Date.now() / 1000 ? pay : null
    } catch { return null }
  }
  const cookies = (req) => Object.fromEntries(String(req.headers.cookie ?? '').split(';').map((c) => c.trim().split(/=(.*)/s)).filter((c) => c[0]))
  // কুকি ঠিক, ব্যবহারকারী আছে আর বন্ধ নয়, তবেই ঢোকা
  const userFrom = (req) => {
    const pay = verify(cookies(req)[COOKIE])
    const u = pay && store.get('users', pay.uid)
    return u && !u.blocked ? u : null
  }
  const attrs = `HttpOnly; Path=/; SameSite=Lax${process.env.RENDER || process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  const setCookie = (reply, uid) => reply.header('Set-Cookie', `${COOKIE}=${sign(uid)}; ${attrs}; Max-Age=${MAX_AGE}`)
  const clearCookie = (reply) => reply.header('Set-Cookie', `${COOKIE}=; ${attrs}; Max-Age=0`)

  const requireUser = async (req) => {
    const u = userFrom(req)
    if (!u) throw httpError(401, 'আগে ঢুকুন।')
    req.user = u
  }
  const requireAdmin = async (req) => {
    await requireUser(req)
    if (req.user.role !== 'admin') throw httpError(403, 'এই পাতা আপনার জন্য নয়।')
  }

  // ভুল পাসওয়ার্ড: নম্বর পিছু ১৫ মিনিটে ৮ বার
  const tries = new Map()
  const limiter = {
    blocked(phone) {
      const t = (tries.get(phone) ?? []).filter((x) => x > Date.now() - 900000)
      tries.set(phone, t)
      return t.length >= 8
    },
    fail(phone) { tries.set(phone, [...(tries.get(phone) ?? []), Date.now()]) },
    reset(phone) { tries.delete(phone) },
  }
  return { userFrom, setCookie, clearCookie, requireUser, requireAdmin, limiter }
}
