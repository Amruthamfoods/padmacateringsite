import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import './page-styles.css'
import useScrollReveal from './hooks/useScrollReveal'
import useAuthStore from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollTopBtn from './components/ScrollTopBtn'
import BookingModal from './components/booking/BookingModal'
import MenuModal from './components/MenuModal'

// Existing pages
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import MenusPage from './pages/MenusPage'

// New pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import MenuBuilderPage from './pages/MenuBuilderPage'
import BookingSummaryPage from './pages/BookingSummaryPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import AccountPage from './pages/AccountPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import BookingsAdminPage from './pages/admin/BookingsAdminPage'
import MenuAdminPage from './pages/admin/MenuAdminPage'
import CouponsPage from './pages/admin/CouponsPage'
import CustomersPage from './pages/admin/CustomersPage'
import SettingsPage from './pages/admin/SettingsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />
  }
  return children
}

function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function AppInner() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useScrollReveal()

  const isAdminRoute = pathname.startsWith('/admin')
  const isFullPage = isAdminRoute ||
    ['/login', '/register', '/booking', '/account'].some(p => pathname === p || pathname.startsWith(p + '/'))

  const goToBooking = () => navigate('/booking')

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {!isFullPage && (
        <Navbar onBookNow={goToBooking} onViewMenu={() => setMenuOpen(true)} />
      )}

      <main>
        <Routes>
          {/* Existing routes */}
          <Route path="/" element={<HomePage onBookNow={goToBooking} />} />
          <Route path="/about" element={<AboutPage onBookNow={goToBooking} />} />
          <Route path="/services" element={<ServicesPage onBookNow={goToBooking} />} />
          <Route path="/gallery" element={<GalleryPage onBookNow={goToBooking} />} />
          <Route path="/contact" element={<ContactPage onBookNow={goToBooking} />} />
          <Route path="/menus" element={<MenusPage onBookNow={goToBooking} />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Booking flow */}
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/menu-builder" element={<MenuBuilderPage />} />
          <Route path="/booking/summary" element={<BookingSummaryPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />

          {/* Account */}
          <Route path="/account" element={
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsAdminPage />} />
            <Route path="menu" element={<MenuAdminPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </main>

      {!isFullPage && <Footer onViewMenu={() => setMenuOpen(true)} />}
      {!isFullPage && <ScrollTopBtn />}

      {menuOpen && <MenuModal onClose={() => setMenuOpen(false)} />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/padmacateringsite">
      <AppInner />
    </BrowserRouter>
  )
}
