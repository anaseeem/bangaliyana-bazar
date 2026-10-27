import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './store/cart'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Artisans from './pages/Artisans'

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl">এই পাতাটা নেই</h1>
      <p className="mt-2 text-stone-600">মেলায় হারিয়ে গেছেন? হোমে ফিরে আবার শুরু করুন।</p>
      <a href="/" className="mt-6 inline-block rounded-full bg-rickshaw px-6 py-3 text-white">হোমে ফিরুন →</a>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/artisans" element={<Artisans />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}
