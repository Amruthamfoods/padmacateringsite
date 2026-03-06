import { BrowserRouter, Routes, Route, useLocation, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import LandingPage from './pages/LandingPage'
import EventSetupPage from './pages/EventSetupPage'
import MenuBuilderPage from './pages/MenuBuilderPage'
import PaymentPlanPage from './pages/PaymentPlanPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import LoginPage from './pages/LoginPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

function WebNav() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  if (isLanding) return null

  const user = (() => { try { return JSON.parse(localStorage.getItem('padma_user') || '{}') } catch { return {} } })()

  return (
    <nav className="web-nav">
      {/* Brand */}
      <NavLink to="/setup" className="web-nav-brand">
        <div className="web-nav-brand-icon">🍛</div>
        <div>
          <div className="web-nav-brand-text">Amrutham</div>
          <div className="web-nav-brand-sub">by Padma Catering</div>
        </div>
      </NavLink>

      {/* Navigation links */}
      <div className="web-nav-links">
        <NavLink to="/setup" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>
          Home
        </NavLink>
        <NavLink to="/my-orders" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>
          My Orders
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>
          About
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>
          Contact
        </NavLink>
      </div>

      {/* Right actions */}
      <div className="web-nav-actions">
        <a
          href="tel:+919876543210"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 'var(--r-pill)',
            background: 'var(--fill-tertiary)', textDecoration: 'none',
            fontSize: 14, fontWeight: 500, color: 'var(--body-text)',
          }}
          className="desktop-only"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Call Us
        </a>
        {user.name ? (
          <NavLink
            to="/my-orders"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 'var(--r-pill)',
              background: 'var(--primary-bg)', textDecoration: 'none',
              fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {user.name.split(' ')[0]}
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            style={{
              padding: '7px 18px', borderRadius: 'var(--r-pill)',
              background: 'var(--primary)', color: '#fff', textDecoration: 'none',
              fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)',
              transition: 'all 0.15s',
            }}
          >
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
  )
}

function AppShell() {
  return (
    <div className="portal-desktop-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#111827',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }}
      />
      <WebNav />
      <main className="portal-app-frame">
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/setup"     element={<EventSetupPage />} />
          <Route path="/menu"      element={<MenuBuilderPage />} />
          <Route path="/payment"   element={<PaymentPlanPage />} />
          <Route path="/success"   element={<BookingSuccessPage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/contact"   element={<ContactPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <AppShell />
    </BrowserRouter>
  )
}
