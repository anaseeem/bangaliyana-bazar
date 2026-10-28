import { Link } from 'react-router-dom'
import { AlpanaBorder } from './Decor'

export default function Footer() {
  return (
    <footer className="bg-rickshaw-dark text-cream">
      <AlpanaBorder onDark />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl">বাঙালিয়ানা বাজার</p>
          <p className="mt-2 text-sm text-amber-100">হাতে বোনা, হাতে গড়া, হাতে সেলাই করা।</p>
        </div>
        <div>
          <p className="font-display text-lg">ঘুরে দেখুন</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/shop">বাজার। সব পণ্য</Link></li>
            <li><Link className="hover:underline" to="/artisans">কারিগরদের গল্প</Link></li>
            <li><Link className="hover:underline" to="/jhuri">আমার ঝুড়ি</Link></li>
            <li><Link className="hover:underline" to="/bikreta">বিক্রেতা হোন</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg">অর্ডার ও ডেলিভারি</p>
          <ul className="mt-3 space-y-2 text-sm text-amber-100">
            <li>ঢাকায় ৳৬০, দুই দিনে</li>
            <li>ঢাকার বাইরে ৳১২০, দুই থেকে চার দিনে</li>
            <li>পণ্য হাতে পেয়ে টাকা দিন</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-red-900/60 py-4 text-center text-xs text-amber-100">
        © ২০২৬ বাঙালিয়ানা বাজার। হাতের কাজ, বাংলার গল্প।
      </div>
    </footer>
  )
}
