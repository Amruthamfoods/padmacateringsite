import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import { useCartStore } from './store/useCartStore'

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
import CartPage from './pages/CartPage'

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
  const navigate = useNavigate()
  const { user, logout: storeLogout } = useAuthStore()
  const cartCount = useCartStore(s => s.items.length)
  const [open, setOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    function handler(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  const location = useLocation()
  useEffect(() => { setMobileMenu(false) }, [location.pathname])

  function logout() {
    storeLogout()
    setOpen(false)
    setMobileMenu(false)
    navigate('/login')
  }

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  const accountItems = [
    { icon: 'fa-user', label: 'My Profile', path: '/profile' },
    { icon: 'fa-clipboard-list', label: 'My Bookings', path: '/my-orders' },
    { icon: 'fa-star', label: 'Rewards', path: '/rewards' },
  ]

  const navLinks = [
    { label: 'Home', path: '/', end: true },
    { label: 'My Orders', path: '/my-orders' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <>
      <nav className="web-nav">
        <div className="web-nav-inner">
          {/* Brand */}
          <NavLink to="/" className="web-nav-brand">
            <img src="/img/amrutham-logo.png" alt="Amrutham" style={{ height: 46, objectFit: 'contain' }} />
          </NavLink>

          {/* Cart icon — always visible */}
          <NavLink to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--fill-tertiary)', textDecoration: 'none', color: 'var(--heading)', flexShrink: 0 }}
            title="Compare cart">
            <i className="fa-solid fa-cart-shopping" style={{ fontSize: 15 }} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Desktop navigation links */}
          <div className="web-nav-links">
            {navLinks.map(l => (
              <NavLink key={l.path} to={l.path} end={l.end} className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>{l.label}</NavLink>
            ))}
          </div>

          {/* Right actions — always pushed to right */}
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
                  <span className="desktop-only">{user.name.split(' ')[0]}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.6rem', marginLeft: 2, color: 'var(--primary)' }} />
                </button>
                {open && (
                  <div style={{
                    position: 'absolute', top: 44, right: 0, minWidth: 190,
                    background: '#fff', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid var(--border-light)',
                    overflow: 'hidden', zIndex: 300,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-light)' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--heading)' }}>{user.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                    {accountItems.map(item => (
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
                padding: '7px 16px', borderRadius: 'var(--r-pill)',
                background: 'var(--primary)', color: '#fff', textDecoration: 'none',
                fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)', transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}>Sign In</NavLink>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenu(m => !m)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 4px', display: 'flex', flexDirection: 'column',
                gap: 5, alignItems: 'flex-end',
              }}
              aria-label="Menu"
            >
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--heading)', borderRadius: 2, transition: 'all 0.2s', transform: mobileMenu ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
              <span style={{ display: 'block', width: 16, height: 2, background: 'var(--heading)', borderRadius: 2, transition: 'all 0.2s', opacity: mobileMenu ? 0 : 1 }} />
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--heading)', borderRadius: 2, transition: 'all 0.2s', transform: mobileMenu ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileMenu && (
        <div className="mobile-only" style={{
          position: 'fixed', top: 56, right: 0, left: 0, zIndex: 250,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--separator-nm)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        }}>
          <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {navLinks.map(l => (
              <NavLink
                key={l.path} to={l.path} end={l.end}
                onClick={() => setMobileMenu(false)}
                style={({ isActive }) => ({
                  padding: '13px 24px', fontSize: 16, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--heading)', textDecoration: 'none',
                  width: '100%', textAlign: 'right', display: 'block',
                  background: isActive ? 'var(--primary-bg)' : 'none',
                })}
              >{l.label}</NavLink>
            ))}
            <div style={{ width: '100%', padding: '12px 24px', borderTop: '1px solid var(--separator-nm)', display: 'flex', justifyContent: 'flex-end' }}>
              <NavLink to="/setup" onClick={() => setMobileMenu(false)} style={{
                padding: '10px 24px', borderRadius: 'var(--r-pill)',
                background: 'var(--primary)', color: '#fff', textDecoration: 'none',
                fontSize: 15, fontWeight: 600, boxShadow: 'var(--shadow-green)',
              }}>Book Now</NavLink>
            </div>
          </div>
        </div>
      )}
    </>
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
          <Route path="/cart"     element={<CartPage />} />
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
