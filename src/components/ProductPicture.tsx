import type { Product } from '../data/products'
import ProductArt from './ProductArt'

/** বিক্রেতা ছবি দিলে সেই ছবি, নইলে হাতে আঁকা নকশা */
export default function ProductPicture({ product, className, label = product.nameBn }: { product: Product; className?: string; label?: string }) {
  if (product.photo) return <img src={product.photo} alt={label} className={`object-cover ${className ?? ''}`} />
  return <ProductArt plain art={product.art} palette={product.palette} label={label} className={className} />
}
