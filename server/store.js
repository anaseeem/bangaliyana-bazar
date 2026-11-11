import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

export const COLS = ['users', 'sellers', 'products', 'orders', 'reviews', 'posts', 'pages', 'messages', 'payouts', 'settings']
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MIME = Object.fromEntries(Object.entries(EXT).map(([m, e]) => [e, m]))

// ফাইলে রাখা: data/db.json (সব তালিকা + meta) আর data/uploads/
async function fileDriver(dir) {
  const dbFile = join(dir, 'db.json')
  const upDir = join(dir, 'uploads')
  await mkdir(upDir, { recursive: true })
  let snap = {}
  try { snap = JSON.parse(await readFile(dbFile, 'utf-8')) } catch { /* প্রথমবার */ }
  const meta = snap.meta ?? {}
  let getSnapshot = () => snap
  let dirty = false
  let running = null
  // একসাথে অনেক লেখা এলে একবারে লেখে। আগে অস্থায়ী ফাইলে লেখে, তারপর নাম বদলায়।
  const flush = () => {
    dirty = true
    if (!running) {
      running = (async () => {
        try {
          while (dirty) {
            dirty = false
            const tmp = `${dbFile}.${process.pid}.tmp`
            await writeFile(tmp, JSON.stringify(getSnapshot()))
            await rename(tmp, dbFile)
          }
        } finally { running = null }
      })()
    }
    return running
  }
  return {
    kind: 'file',
    snap,
    meta,
    bind(fn) { getSnapshot = fn },
    persist: flush,
    async putFile(id, mime, bytes) { await writeFile(join(upDir, `${id}.${EXT[mime]}`), bytes) },
    async getFile(id) {
      for (const [ext, mime] of Object.entries(MIME)) {
        try { return { mime, bytes: await readFile(join(upDir, `${id}.${ext}`)) } } catch { /* পরেরটা */ }
      }
      return null
    },
    async close() { await running },
  }
}

// Postgres: docs আর files টেবিল
async function pgDriver(url) {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url)
  const pool = new pg.Pool({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } })
  await pool.query('create table if not exists docs (col text, id text, data jsonb, primary key (col, id))')
  await pool.query('create table if not exists files (id text primary key, mime text, bytes bytea, created_at timestamptz default now())')
  const { rows } = await pool.query('select col, id, data from docs')
  return {
    kind: 'pg',
    rows,
    async write(puts, dels) {
      const c = await pool.connect()
      try {
        await c.query('begin')
        for (const [col, doc] of puts) {
          await c.query('insert into docs (col, id, data) values ($1, $2, $3) on conflict (col, id) do update set data = excluded.data', [col, doc.id, JSON.stringify(doc)])
        }
        for (const [col, id] of dels) await c.query('delete from docs where col = $1 and id = $2', [col, id])
        await c.query('commit')
      } catch (e) { await c.query('rollback'); throw e } finally { c.release() }
    },
    async putFile(id, mime, bytes) { await pool.query('insert into files (id, mime, bytes) values ($1, $2, $3)', [id, mime, bytes]) },
    async getFile(id) {
      const r = await pool.query('select mime, bytes from files where id = $1', [id])
      return r.rows[0] ?? null
    },
    close: () => pool.end(),
  }
}

// store.all / get / put / putMany / del / putFile / getFile / getMeta / setMeta / kind
export async function openStore({ dataDir, databaseUrl }) {
  const mem = Object.fromEntries(COLS.map((c) => [c, new Map()]))
  let drv, metaGet, metaSet
  if (databaseUrl) {
    drv = await pgDriver(databaseUrl)
    for (const r of drv.rows) if (r.col !== 'meta') mem[r.col]?.set(r.id, r.data)
    metaGet = (k) => drv.rows.find((r) => r.col === 'meta' && r.id === k)?.data.v
    metaSet = async (k, v) => { drv.rows.push({ col: 'meta', id: k, data: { v } }); await drv.write([['meta', { id: k, v }]], []) }
  } else {
    drv = await fileDriver(dataDir)
    for (const c of COLS) for (const d of drv.snap[c] ?? []) mem[c].set(d.id, d)
    drv.bind(() => ({ meta: drv.meta, ...Object.fromEntries(COLS.map((c) => [c, [...mem[c].values()]])) }))
    metaGet = (k) => drv.meta[k]
    metaSet = async (k, v) => { drv.meta[k] = v; await drv.persist() }
  }
  // আগে মেমরিতে (এক টিকে), তারপর ড্রাইভারে। তাই স্টক গোনা নিরাপদ।
  const commit = (puts, dels) => {
    for (const [c, d] of puts) mem[c].set(d.id, d)
    for (const [c, id] of dels) mem[c].delete(id)
    return drv.kind === 'pg' ? drv.write(puts, dels) : drv.persist()
  }
  return {
    kind: drv.kind,
    all: (col) => [...mem[col].values()],
    get: (col, id) => mem[col].get(id),
    put: (col, doc) => commit([[col, doc]], []),
    putMany: (pairs) => commit(pairs, []),
    del: (col, id) => commit([], [[col, id]]),
    commit,
    putFile: (id, mime, bytes) => drv.putFile(id, mime, bytes),
    getFile: (id) => drv.getFile(id),
    getMeta: metaGet,
    setMeta: metaSet,
    close: () => drv.close(),
  }
}
