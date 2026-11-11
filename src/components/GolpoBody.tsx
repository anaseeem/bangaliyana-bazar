import { Fragment } from 'react'
import { firstLetter, parseGolpo, splitAtBreaks, type Block } from '../lib/golpo'
import { ART_THEMES, ART_TONE, Art, type ArtTheme } from './art'
import { AlpanaCorner, AlpanaFlower } from './Alpana'
import { StitchFrame } from './Stitch'

function BlockView({ block, drop }: { block: Block; drop: boolean }) {
  if (block.type === 'h') {
    return (
      <h2 className="mt-10 flex items-center gap-3 text-3xl first:mt-0">
        <AlpanaFlower className="h-8 w-8 shrink-0" />
        {block.text}
      </h2>
    )
  }
  if (block.type === 'quote') {
    return (
      <blockquote className="relative my-8 overflow-hidden rounded-[10px] bg-nil px-8 py-9 text-center font-display text-2xl leading-relaxed text-cream sm:px-14 sm:text-3xl">
        <AlpanaCorner corner="tl" className="absolute top-2 left-2 w-12 sm:w-16" />
        <AlpanaCorner corner="br" className="absolute right-2 bottom-2 w-12 sm:w-16" />
        {block.text}
      </blockquote>
    )
  }
  if (block.type === 'img') {
    return (
      <figure className="relative my-8 rounded-[10px] bg-cream-deep p-3">
        <StitchFrame inset={5} color="var(--color-holud)" />
        <img src={block.src} alt={block.caption} loading="lazy" className="max-h-[32rem] w-full rounded-md object-cover" />
        {block.caption && <figcaption className="px-2 pt-2 pb-1 text-center text-base text-stone-600">{block.caption}</figcaption>}
      </figure>
    )
  }
  if (block.type === 'break') return null
  if (drop) {
    const [first, rest] = firstLetter(block.text)
    return (
      <p className="mt-5 first:mt-0">
        <span aria-hidden="true" className="float-left mt-1 mr-4 mb-1 flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full bg-rickshaw font-display text-5xl leading-none text-cream ring-4 ring-holud ring-offset-4 ring-offset-paper">
          {first}
        </span>
        <span className="sr-only">{first}</span>{rest}
      </p>
    )
  }
  return <p className="mt-5 first:mt-0">{block.text}</p>
}

interface Props {
  body: string
  /** গল্পের নিজের নকশা। বিরতিতে বাকি নকশাগুলো পালা করে আসে। */
  art?: ArtTheme
  /** প্রথম অনুচ্ছেদের প্রথম অক্ষর বড় করে */
  dropCap?: boolean
  lang?: 'bn' | 'en'
}

/**
 * গল্প বা সাধারণ পাতার লেখা। লেখা থাকে কাগজের পাতায়, নকশা শুধু দুই পাতার মাঝের বিরতিতে,
 * তাই নকশা কখনো লেখার ওপরে পড়ে না।
 */
export default function GolpoBody({ body, art = 'moyur', dropCap = false, lang = 'bn' }: Props) {
  const parts = splitAtBreaks(parseGolpo(body))
  const others = ART_THEMES.map((t) => t.id).filter((t) => t !== art && t !== 'moyur')
  return (
    <div lang={lang}>
      {parts.map((blocks, i) => {
        const band = others[(i - 1) % others.length]
        const firstP = blocks.findIndex((b) => b.type === 'p')
        return (
          <Fragment key={i}>
            {i > 0 && (
              <div aria-hidden="true" className="my-8 overflow-hidden" style={{ background: ART_TONE[band].bg }}>
                <Art theme={band} className="mx-auto h-40 w-full max-w-7xl sm:h-56" />
              </div>
            )}
            <div className="mx-auto max-w-[46rem] px-4">
              <div className="relative rounded-[10px] bg-paper px-6 py-9 text-[1.2rem] leading-[1.9] text-stone-800 sm:px-12 sm:py-12">
                <StitchFrame />
                {blocks.map((b, j) => <BlockView key={j} block={b} drop={dropCap && i === 0 && j === firstP} />)}
                <div className="clear-both" />
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
