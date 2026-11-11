import { Link } from 'react-router-dom'
import { bn, formatBDT } from '../data/products'
import { whatsappLink } from '../lib/whatsapp'
import { useMarket } from '../store/market'
import { AlpanaBorder } from './Decor'

export default function Footer() {
  const { settings: s } = useMarket()
  return (
    <footer className="bg-rickshaw-dark text-cream">
      <AlpanaBorder onDark />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl">বাঙালিয়ানা বাজার</p>
          <p className="mt-2 text-sm text-amber-100">{s.footerLine}</p>
          <a href={whatsappLink('আসসালামু আলাইকুম। বাঙালিয়ানা বাজার নিয়ে একটা কথা জানতে চাই।', undefined, s.whatsapp)} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-full border-2 border-holud px-4 py-1.5 text-sm text-holud hover:bg-holud hover:text-stone-900">
            WhatsApp {bn(s.whatsapp)}
          </a>
        </div>
        <div>
          <p className="font-display text-lg">ঘুরে দেখুন</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/shop">বাজার। সব পণ্য</Link></li>
            <li><Link className="hover:underline" to="/artisans">কারিগরদের দোকান</Link></li>
            <li><Link className="hover:underline" to="/golpo">গল্পের আসর</Link></li>
            <li><Link className="hover:underline" to="/bikreta">বিক্রেতা হোন</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg">দরকারি</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" to="/khoj">অর্ডার খুঁজুন</Link></li>
            <li><Link className="hover:underline" to="/sahajjo">সাহায্য</Link></li>
            <li><Link className="hover:underline" to="/jogajog">যোগাযোগ</Link></li>
            <li><Link className="hover:underline" to="/amader-kotha">আমাদের কথা</Link></li>
            <li><Link className="hover:underline" to="/niyom">নিয়ম ও গোপনীয়তা</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-display text-lg">অর্ডার ও ডেলিভারি</p>
          <ul className="mt-3 space-y-2 text-sm text-amber-100">
            <li>ঢাকায় {formatBDT(s.feeDhaka)}, {s.daysDhaka}</li>
            <li>ঢাকার বাইরে {formatBDT(s.feeOutside)}, {s.daysOutside}</li>
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
