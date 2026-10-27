import { Link } from 'react-router-dom'
import { AlpanaBorder } from './Decor'

export default function Footer() {
  return (
    <footer className="mt-16 bg-rickshaw-dark text-cream">
      <AlpanaBorder />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl">বাঙালিয়ানা বাজার</p>
          <p className="mt-2 text-sm text-amber-100">
            হাতে বোনা, হাতে গড়া, হাতে সেলাই করা। বাংলাদেশের কারিগরদের কাজ সরাসরি আপনার ঘরে।
            কোনো কারখানার ছাপ নয়, প্রতিটি পণ্যে একেকজন মানুষের হাতের ছোঁয়া।
          </p>
          <p className="mt-3 text-sm">বাঙালিয়ানা বাজার • ঢাকা, বাংলাদেশ</p>
        </div>
        <div>
          <p className="font-display text-lg">ঘুরে দেখুন</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/shop">বাজার। সব পণ্য</Link></li>
            <li><Link className="hover:underline" to="/artisans">কারিগরদের গল্প</Link></li>
            <li><Link className="hover:underline" to="/cart">আমার ঝুড়ি</Link></li>
            <li><Link className="hover:underline" to="/checkout">অর্ডার করুন</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg">অর্ডার ও ডেলিভারি</p>
          <ul className="mt-3 space-y-2 text-sm text-amber-100">
            <li>• পেমেন্ট: ক্যাশ অন ডেলিভারি (ডেমো)। পণ্য হাতে পেয়ে টাকা দিন।</li>
            <li>• ঢাকায় ডেলিভারি ৳৬০, ঢাকার বাইরে ৳১২০।</li>
            <li>• ডেলিভারি সময়: ২ থেকে ৪ দিন।</li>
            <li>• কোনো অনলাইন পেমেন্ট নেই। এটা ডেমো চেকআউট।</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-red-900/60 py-4 text-center text-xs text-amber-100">
        © ২০২৬ বাঙালিয়ানা বাজার। হাতের কাজ, বাংলার গল্প।
      </div>
    </footer>
  )
}
