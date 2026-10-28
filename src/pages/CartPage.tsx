import { Link } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { useCart } from '../store/cart'
import ProductArt from '../components/ProductArt'

export default function CartPage() {
  const { detailed, setQty, remove, total, count, clear } = useCart()

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl" aria-hidden="true">🧺</p>
        <h1 className="mt-4 text-3xl">ঝুড়ি এখনো খালি</h1>
        <p className="mt-2 text-stone-600">মেলায় ঘুরে কিছু পছন্দ করুন। জামদানি, কাঁথা, মাটির বাটি, যা ভালো লাগে।</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">বাজার ঘুরে দেখুন</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl">আমার ঝুড়ি</h1>
      <p className="mt-1 text-stone-600">{bn(count)}টি পণ্য</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {detailed.map(({ product, qty }) => (
            <li key={product.id} className="flex flex-col gap-4 rounded-3xl border-2 border-amber-200 bg-white p-4 shadow-sm sm:flex-row">
              <Link to={`/product/${product.id}`} className="shrink-0">
                <ProductArt art={product.art} palette={product.palette} label={product.nameBn} className="h-28 w-40 rounded-2xl" />
              </Link>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg">
                  <Link to={`/product/${product.id}`} className="hover:text-rickshaw">{product.nameBn}</Link>
                </h2>
                <p className="text-sm text-stone-500">{product.artisan} • {product.district}</p>
                <p className="mt-1 text-rickshaw">{formatBDT(product.price)} <span className="text-sm font-normal text-stone-500">× {bn(qty)} = {formatBDT(product.price * qty)}</span></p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-sm" htmlFor={`qty-${product.id}`}>
                    পরিমাণ
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={0}
                      max={99}
                      value={qty}
                      onChange={(e) => setQty(product.id, Number(e.target.value) || 0)}
                      className="w-20 rounded-full border-2 border-amber-300 px-3 py-1.5 text-center"
                    />
                  </label>
                  <button type="button" onClick={() => remove(product.id)} className="rounded-full border-2 border-red-200 px-4 py-1.5 text-sm text-rickshaw hover:bg-red-50">
                    সরিয়ে ফেলুন
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-3xl border-2 border-amber-200 bg-white p-5 shadow-sm lg:sticky lg:top-36">
          <h2 className="font-display text-xl">হিসাব</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>পণ্যের দাম</dt><dd className="">{formatBDT(total)}</dd></div>
            <div className="flex justify-between"><dt>ডেলিভারি</dt><dd>চেকআউটে হিসাব হবে</dd></div>
            <div className="flex justify-between border-t border-amber-200 pt-2 text-base"><dt className="">মোট (ডেলিভারি ছাড়া)</dt><dd className=" text-rickshaw">{formatBDT(total)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-stone-500">পেমেন্ট: ক্যাশ অন ডেলিভারি (ডেমো)। পণ্য হাতে পেয়ে টাকা দেবেন। কোনো অনলাইন পেমেন্ট নেই।</p>
          <Link to="/checkout" className="mt-4 block rounded-full bg-rickshaw py-3 text-center text-white hover:bg-rickshaw-dark">
            অর্ডার করুন
          </Link>
          <button type="button" onClick={clear} className="mt-2 w-full rounded-full border-2 border-amber-300 py-2 text-sm text-stone-600 hover:bg-holud-soft">
            ঝুড়ি খালি করুন
          </button>
          <Link to="/shop" className="mt-3 block text-center text-sm text-rickshaw underline">আরও কিনতে বাজারে ফিরুন</Link>
        </aside>
      </div>
    </div>
  )
}
