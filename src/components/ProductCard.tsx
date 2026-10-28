import { Link } from 'react-router-dom'
import { bn, formatBDT, type Product } from '../data/products'
import { flyToJhuri } from '../lib/flyToJhuri'
import { useCart } from '../store/cart'
import { AlpanaCorner } from './Alpana'
import ProductPicture from './ProductPicture'
import { StitchFrame } from './Stitch'

export default function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useCart()
  const wished = wishlist.includes(product.id)
  return (
    <article className="group relative flex flex-col rounded-[10px] border border-amber-200/70 bg-paper">
      <StitchFrame />
      <Link to={`/product/${product.id}`} className="hang-swing relative mx-3.5 mt-3.5 block overflow-hidden rounded-md" aria-label={product.nameBn}>
        <ProductPicture product={product} className="block h-48 w-full" />
        <AlpanaCorner corner="tl" className="absolute top-1 left-1 w-11" />
        <AlpanaCorner corner="br" className="absolute right-1 bottom-1 w-11" />
        {product.badge && (
          <span className="badge-flag absolute top-3 right-0 bg-rickshaw py-0.5 pr-3 pl-4 text-xs text-white">{product.badge}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-5 pt-3 pb-5">
        <h3 className="text-lg leading-snug">
          <Link to={`/product/${product.id}`} className="hover:text-rickshaw">{product.nameBn}</Link>
        </h3>
        <p className="text-sm text-stone-600">{product.artisan}, {product.district}</p>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="flex items-baseline gap-2">
            <span className="text-xl text-rickshaw">{formatBDT(product.price)}</span>
            {product.oldPrice && <s className="text-sm text-stone-400">{formatBDT(product.oldPrice)}</s>}
          </p>
          {product.rating > 0 ? (
            <span className="text-sm text-stone-600" aria-label={`রেটিং ${bn(product.rating.toFixed(1))}`}>
              <span className="text-holud">★</span> {bn(product.rating.toFixed(1))}
            </span>
          ) : (
            <span className="rounded-full bg-holud-soft px-2 text-xs text-stone-700">নতুন</span>
          )}
        </div>
        {product.stock <= 0 && <p className="text-xs text-stone-500">স্টক শেষ</p>}
        <div className="mt-auto flex gap-2 pt-3">
          <button
            type="button"
            onClick={(e) => { add(product.id); flyToJhuri(e.currentTarget, product.palette[1]) }}
            disabled={product.stock <= 0}
            className="flex-1 rounded-full bg-rickshaw px-3 py-2 text-white hover:bg-rickshaw-dark disabled:opacity-40"
          >
            ঝুড়িতে নিন
          </button>
          <button
            type="button"
            onClick={() => toggleWish(product.id)}
            aria-pressed={wished}
            aria-label={wished ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${wished ? 'border-shapla bg-shapla text-white' : 'border-amber-300 text-shapla hover:bg-holud-soft'}`}
          >
            {wished ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </article>
  )
}
