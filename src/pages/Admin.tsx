import { lazy, Suspense } from 'react'
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { bn } from '../data/products'
import { useApi } from '../lib/useApi'
import { useTitle } from '../lib/useTitle'
import { useMarket } from '../store/market'
import { MamaLoader, MamaScene } from '../components/MamaScenes'
import { AdminCtx, type Summary } from './admin/kit'

const Summ = lazy(() => import('./admin/Summary'))
const Orders = lazy(() => import('./admin/Orders'))
const Products = lazy(() => import('./admin/Products'))
const Sellers = lazy(() => import('./admin/Sellers'))
const Customers = lazy(() => import('./admin/Customers'))
const Stories = lazy(() => import('./admin/Stories'))
const Pages = lazy(() => import('./admin/Pages'))
const Messages = lazy(() => import('./admin/Messages'))
const Reviews = lazy(() => import('./admin/Reviews'))
const Money = lazy(() => import('./admin/Money'))
const Settings = lazy(() => import('./admin/Settings'))

type Badge = 'toConfirm' | 'pendingSellers' | 'unreadMessages'
const TABS: [string, string, Badge?][] = [
  ['', 'সারাংশ'], ['order', 'অর্ডার', 'toConfirm'], ['ponno', 'পণ্য'], ['bikreta', 'বিক্রেতা', 'pendingSellers'], ['kreta', 'ক্রেতা'],
  ['golpo', 'গল্প'], ['pata', 'পাতা'], ['barta', 'বার্তা', 'unreadMessages'], ['motamot', 'মতামত'], ['taka', 'টাকা'], ['sajano', 'সাজানো'],
]

/** মালিকের খাতা: সারাংশ, অর্ডার, পণ্য, বিক্রেতা আর বাকি সব, একেকটা ভাগে */
export default function Admin() {
  const { user, ready } = useMarket()
  const isAdmin = user?.role === 'admin'
  const summary = useApi<Summary>(isAdmin ? '/admin/summary' : null)
  useTitle('বাজারের খাতা')

  if (!ready) return <MamaLoader full />
  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <MamaScene kind="khoj" as="h1" title="এই পাতা আপনার জন্য নয়">
          <Link to="/" className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">ঘরে ফিরুন</Link>
        </MamaScene>
      </div>
    )
  }

  return (
    <AdminCtx.Provider value={{ summary: summary.data, reloadSummary: summary.reload }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-4xl">বাজারের খাতা</h1>
        <nav aria-label="খাতার ভাগ" className="no-scrollbar mt-6 flex gap-1 overflow-x-auto">
          {TABS.map(([path, label, badge]) => {
            const n = badge && summary.data ? summary.data[badge] : 0
            return (
              <NavLink
                key={path}
                to={path ? `/admin/${path}` : '/admin'}
                end={path === ''}
                className={({ isActive }) => `shrink-0 rounded-full px-5 py-2 ${isActive ? 'bg-rickshaw text-white' : 'text-rickshaw hover:bg-holud-soft'}`}
              >
                {label}
                {n > 0 && <span className="ml-2 rounded-full bg-holud px-2 text-sm">{bn(n)}</span>}
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-6">
          <Suspense fallback={<MamaLoader />}>
            <Routes>
              <Route index element={<Summ />} />
              <Route path="order" element={<Orders />} />
              <Route path="ponno" element={<Products />} />
              <Route path="bikreta" element={<Sellers />} />
              <Route path="kreta" element={<Customers />} />
              <Route path="golpo" element={<Stories />} />
              <Route path="pata" element={<Pages />} />
              <Route path="barta" element={<Messages />} />
              <Route path="motamot" element={<Reviews />} />
              <Route path="taka" element={<Money />} />
              <Route path="sajano" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </AdminCtx.Provider>
  )
}
