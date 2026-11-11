import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MamaLoader, MamaScene } from './components/MamaScenes'
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

const MamaPreview = lazy(() => import('./pages/MamaPreview'))

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <MamaScene kind="khoj" as="h1" title="এই পাতাটা নেই" text="মামাও খুঁজে পাচ্ছেন না। বাজারে ফিরে আবার দেখুন।">
        <Link to="/shop" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">বাজারে যান</Link>
        <Link to="/" className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">হোমে ফিরুন</Link>
      </MamaScene>
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
              {import.meta.env.DEV && <Route path="/mama" element={<Suspense fallback={<MamaLoader full />}><MamaPreview /></Suspense>} />}
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
