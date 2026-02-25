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
import MenuModal from './components/MenuModal'

import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import GalleryPage from './pages/GalleryPage'
import ContactPage from './pages/ContactPage'
import MenusPage from './pages/MenusPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import BookingsAdminPage from './pages/admin/BookingsAdminPage'
import MenuAdminPage from './pages/admin/MenuAdminPage'
import CouponsPage from './pages/admin/CouponsPage'
import CustomersPage from './pages/admin/CustomersPage'
import SettingsPage from './pages/admin/SettingsPage'
import QuotesAdminPage from './pages/admin/QuotesAdminPage'
import ConsultationPage from './pages/ConsultationPage'

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
    ['/login', '/register', '/account', '/consultation'].some(p => pathname === p || pathname.startsWith(p + '/'))

  const goToConsultation = () => navigate('/consultation')

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {!isFullPage && (
        <Navbar onBookNow={goToConsultation} onViewMenu={() => setMenuOpen(true)} />
      )}

      <main>
        <Routes>
          <Route path="/" element={<HomePage onBookNow={goToConsultation} />} />
          <Route path="/about" element={<AboutPage onBookNow={goToConsultation} />} />
          <Route path="/services" element={<ServicesPage onBookNow={goToConsultation} />} />
          <Route path="/gallery" element={<GalleryPage onBookNow={goToConsultation} />} />
          <Route path="/contact" element={<ContactPage onBookNow={goToConsultation} />} />
          <Route path="/menus" element={<MenusPage onBookNow={goToConsultation} />} />
          <Route path="/consultation" element={<ConsultationPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/account" element={
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsAdminPage />} />
            <Route path="menu" element={<MenuAdminPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="quotes" element={<QuotesAdminPage />} />
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
    <BrowserRouter basename="/">
      <AppInner />
    </BrowserRouter>
  )
}
