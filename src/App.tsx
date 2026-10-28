import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AlpanaFlower } from './components/Alpana'
import { StitchLine } from './components/Stitch'
import { CartProvider } from './store/cart'
import { MarketProvider } from './store/market'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Jhuri from './pages/Jhuri'
import Artisans from './pages/Artisans'
import Login from './pages/Login'
import Account from './pages/Account'
import SellerJoin from './pages/SellerJoin'
import SellerDashboard from './pages/SellerDashboard'
import SellerShop from './pages/SellerShop'
import Admin from './pages/Admin'

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <AlpanaFlower className="mx-auto h-20 w-20" />
      <h1 className="mt-4 text-4xl">এই পাতাটা নেই</h1>
      <p className="mt-2 text-stone-600">মেলায় পথ হারালেন? বাজারে ফিরে আবার খুঁজুন।</p>
      <StitchLine className="mx-auto mt-6 max-w-xs" />
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/shop" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
        <Link to="/" className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">হোমে ফিরুন</Link>
      </div>
    </div>
  )
}

/** নতুন পাতায় গেলে ওপর থেকে শুরু হয়। একই পাতায় শুধু খোঁজ বদলালে নয়। */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <MarketProvider>
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/jhuri" element={<Jhuri />} />
              <Route path="/cart" element={<Navigate to="/jhuri" replace />} />
              <Route path="/checkout" element={<Navigate to="/jhuri?dhap=thikana" replace />} />
              <Route path="/artisans" element={<Artisans />} />
              <Route path="/dokan/:id" element={<SellerShop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/amar" element={<Account />} />
              <Route path="/bikreta" element={<SellerJoin />} />
              <Route path="/bikreta/dokan" element={<SellerDashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
    </MarketProvider>
  )
}
