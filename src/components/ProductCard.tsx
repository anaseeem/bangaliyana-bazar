import { Link } from 'react-router-dom'
import { formatBDT, type Product } from '../data/products'
import { useCart } from '../store/cart'
import ProductArt from './ProductArt'

export default function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useCart()
  const wished = wishlist.includes(product.id)
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="relative block" aria-label={`${product.nameBn}। বিস্তারিত দেখুন`}>
        <ProductArt art={product.art} palette={product.palette} label={product.nameBn} className="h-52 w-full transition group-hover:scale-[1.02]" />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-rickshaw px-3 py-1 text-xs text-white">{product.badge}</span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-stone-700">
          ★ {product.rating.toFixed(1)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs tracking-wide text-leaf">{product.category} • {product.district}</p>
        <h3 className="font-display text-lg leading-snug">
          <Link to={`/product/${product.id}`} className="hover:text-rickshaw">{product.nameBn}</Link>
        </h3>
        <p className="text-sm text-stone-500">{product.artisan}</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="text-xl text-rickshaw">{formatBDT(product.price)}</span>
          {product.oldPrice && <s className="text-sm text-stone-400">{formatBDT(product.oldPrice)}</s>}
        </p>
        <p className="text-xs text-stone-500">{product.stock > 0 ? `স্টকে আছে ${product.stock}টি` : 'স্টক শেষ'}</p>
        <div className="mt-auto flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => add(product.id)}
            disabled={product.stock <= 0}
            className="flex-1 rounded-full bg-rickshaw px-3 py-2 text-sm text-white hover:bg-rickshaw-dark disabled:opacity-40"
          >
            ঝুড়িতে নিন
          </button>
          <button
            type="button"
            onClick={() => toggleWish(product.id)}
            aria-pressed={wished}
            aria-label={wished ? 'পছন্দ থেকে সরান' : 'পছন্দে রাখুন'}
            className={`rounded-full border-2 px-3 py-2 text-sm ${wished ? 'border-rickshaw bg-rickshaw text-white' : 'border-amber-300 text-rickshaw hover:bg-holud-soft'}`}
          >
            {wished ? '♥ পছন্দ' : '♡ পছন্দ'}
          </button>
        </div>
      </div>
    </article>
  )
}
