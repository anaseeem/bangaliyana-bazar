import type { ArtTheme } from '../components/art'

export const GOLPO_KINDS = ['মানুষ', 'সংস্কৃতি', 'অন্য কথা'] as const

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover?: string
  kind: (typeof GOLPO_KINDS)[number]
  lang: 'bn' | 'en'
  art: ArtTheme
  status: 'draft' | 'published'
  sellerId?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
/** তালিকায় লেখার মূল অংশ আসে না */
export type PostCard = Omit<Post, 'body'>

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'img'; src: string; caption: string }
  | { type: 'break' }

const IMG = /^!\[(.*?)\]\((\S+?)\)$/
/** শুধু নিজের সার্ভারের ছবি, বাইরের ঠিকানা নয় */
const OWN_IMAGE = /^\/(api\/files|products|art)\//

/**
 * গল্প লেখার ছোট্ট নিয়ম: ফাঁকা লাইনে নতুন অনুচ্ছেদ, "# " দিয়ে শিরোনাম, "> " দিয়ে বড় উক্তি,
 * ![ছবির কথা](ঠিকানা) দিয়ে ছবি, "---" দিয়ে নকশার বিরতি।
 */
export function parseGolpo(body: string): Block[] {
  const blocks: Block[] = []
  for (const raw of body.replace(/\r/g, '').split(/\n\s*\n/)) {
    const part = raw.trim()
    if (!part) continue
    const img = IMG.exec(part)
    if (part === '---') blocks.push({ type: 'break' })
    else if (img) { if (OWN_IMAGE.test(img[2])) blocks.push({ type: 'img', caption: img[1], src: img[2] }) }
    else if (part.startsWith('# ')) blocks.push({ type: 'h', text: part.slice(2).trim() })
    else if (part.startsWith('> ')) blocks.push({ type: 'quote', text: part.replace(/^> ?/gm, '').trim() })
    else blocks.push({ type: 'p', text: part.replace(/\n/g, ' ') })
  }
  return blocks
}

/** বিরতি ধরে ভাগ, প্রতিটি ভাগ একটা কাগজের পাতায় বসে */
export function splitAtBreaks(blocks: Block[]): Block[][] {
  const parts: Block[][] = [[]]
  for (const b of blocks) {
    if (b.type === 'break') parts.push([])
    else parts[parts.length - 1].push(b)
  }
  return parts.filter((p) => p.length > 0)
}

/** পড়তে কত মিনিট লাগবে, মোটামুটি */
export function readingMinutes(body: string) {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 170))
}

export const dateBn = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

/** প্রথম অক্ষর আলাদা করে, যুক্তাক্ষর আর কার-চিহ্নসহ */
export function firstLetter(text: string): [string, string] {
  const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? [...new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(text)][0]?.segment : undefined
  const first = seg ?? Array.from(text)[0] ?? ''
  return [first, text.slice(first.length)]
}
