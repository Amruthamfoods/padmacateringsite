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
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', width: '100%', gap: 0, flex: 1 }}>

        {/* Logo only */}
        <NavLink to="/setup" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, marginRight: 'auto' }}>
          <img src="/amrutham-logo.png" alt="Amrutham by Padma Catering" style={{ height: 44, objectFit: 'contain', borderRadius: 10 }} />
        </NavLink>

        {/* Nav links — desktop only */}
        <div className="web-nav-links">
          <NavLink to="/setup"   className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>Home</NavLink>
          <NavLink to="/about"   className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>Contact Us</NavLink>
        </div>

        {/* Right: Book Now + auth */}
        <div className="web-nav-actions">
          <NavLink to="/setup"
            style={{
              padding: '8px 20px', borderRadius: 'var(--r-pill)',
              background: 'var(--primary)', color: '#fff', textDecoration: 'none',
              fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)',
              transition: 'opacity 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Book Now
          </NavLink>
          {user.name ? (
            <NavLink to="/my-orders"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 'var(--r-pill)',
                background: 'var(--fill-tertiary)', textDecoration: 'none',
                fontSize: 14, fontWeight: 600, color: 'var(--heading)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {user.name.split(' ')[0]}
            </NavLink>
          ) : (
            <NavLink to="/login"
              style={{
                padding: '8px 16px', borderRadius: 'var(--r-pill)',
                background: 'var(--fill-tertiary)', color: 'var(--heading)', textDecoration: 'none',
                fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
              }}
            >
              Login
            </NavLink>
          )}
        </div>

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
