import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'

import LandingPage from './pages/LandingPage'
import EventSetupPage from './pages/EventSetupPage'
import MenuBuilderPage from './pages/MenuBuilderPage'
import PaymentPlanPage from './pages/PaymentPlanPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import LoginPage from './pages/LoginPage'
import MyOrdersPage from './pages/MyOrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProfilePage from './pages/ProfilePage'
import RewardsPage from './pages/RewardsPage'

import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import BookingsAdminPage from './pages/admin/BookingsAdminPage'
import MenuAdminPage from './pages/admin/MenuAdminPage'
import CouponsPage from './pages/admin/CouponsPage'
import CustomersPage from './pages/admin/CustomersPage'
import SettingsPage from './pages/admin/SettingsPage'
import QuotesAdminPage from './pages/admin/QuotesAdminPage'
import RewardsAdminPage from './pages/admin/RewardsAdminPage'
import DeliveryAdminPage from './pages/admin/DeliveryAdminPage'
import PricingAdminPage from './pages/admin/PricingAdminPage'

function WebNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout: storeLogout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handler(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function logout() {
    storeLogout()
    setOpen(false)
    navigate('/login')
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  const menuItems = [
    { icon: 'fa-user', label: 'My Profile', path: '/profile' },
    { icon: 'fa-clipboard-list', label: 'My Bookings', path: '/my-orders' },
    { icon: 'fa-star', label: 'Rewards', path: '/rewards' },
  ]

  return (
    <nav className="web-nav">
      <div className="web-nav-inner">
      {/* Brand */}
      <NavLink to="/" className="web-nav-brand">
        <img src="/img/amrutham-logo.png" alt="Amrutham" style={{ height: 46, objectFit: 'contain' }} />
      </NavLink>

      {/* Navigation links */}
      <div className="web-nav-links">
        <NavLink to="/" end className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>Home</NavLink>
        <NavLink to="/my-orders" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>My Orders</NavLink>
        <NavLink to="/about" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>About</NavLink>
        <NavLink to="/contact" className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>Contact</NavLink>
      </div>

      {/* Right actions */}
      <div className="web-nav-actions">
        <NavLink to="/setup" className="desktop-only" style={{
          padding: '7px 18px', borderRadius: 'var(--r-pill)',
          background: 'var(--primary)', color: '#fff', textDecoration: 'none',
          fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)', transition: 'all 0.15s',
        }}>Book Now</NavLink>

        {user?.name ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 12px 5px 5px', borderRadius: 'var(--r-pill)',
              background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
              }}>{initials}</span>
              {user.name.split(' ')[0]}
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.6rem', marginLeft: 2, color: 'var(--primary)' }} />
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 44, right: 0, minWidth: 190,
                background: '#fff', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid var(--border-light)',
                overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-light)' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--heading)' }}>{user.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                {menuItems.map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false) }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.88rem', color: 'var(--heading)', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <i className={`fa-solid ${item.icon}`} style={{ width: 16, color: 'var(--primary)', fontSize: '0.85rem' }} />
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button onClick={logout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '0.88rem', color: '#e53e3e', textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" style={{
            padding: '7px 18px', borderRadius: 'var(--r-pill)',
            background: 'var(--primary)', color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)', transition: 'all 0.15s',
          }}>Sign In</NavLink>
        )}
      </div>
      </div>
    </nav>
  )
}


function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  const location = useLocation()
  if (!token) return <Navigate to={'/login?returnTo=' + encodeURIComponent(location.pathname)} replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function PrivateRoute({ children }) {
  const location = useLocation()
  const { token } = useAuthStore()
  if (!token) return <Navigate to={'/login?returnTo=' + encodeURIComponent(location.pathname)} replace />
  return children
}

function AppShell() {
  return (
    <div className="portal-desktop-bg">
      <WebNav />
      <main className="portal-app-frame">
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/setup"     element={<PrivateRoute><EventSetupPage /></PrivateRoute>} />
          <Route path="/menu"      element={<PrivateRoute><MenuBuilderPage /></PrivateRoute>} />
          <Route path="/payment"   element={<PrivateRoute><PaymentPlanPage /></PrivateRoute>} />
          <Route path="/success"   element={<PrivateRoute><BookingSuccessPage /></PrivateRoute>} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/contact"   element={<ContactPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/rewards"   element={<RewardsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '12px', background: '#fff', color: '#111827', fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
        }}
      />
      <Routes>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
          <Route path="menu" element={<MenuAdminPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="quotes" element={<QuotesAdminPage />} />
          <Route path="rewards" element={<RewardsAdminPage />} />
          <Route path="delivery" element={<DeliveryAdminPage />} />
          <Route path="pricing" element={<PricingAdminPage />} />
        </Route>
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}
