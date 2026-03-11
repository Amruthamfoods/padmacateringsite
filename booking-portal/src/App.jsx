import { BrowserRouter, Routes, Route, Navigate, useLocation, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import { useCartStore } from './store/useCartStore'
import api from './lib/api'

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
import BookingWizard from './components/BookingWizard'

function AnnouncementBar() {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const cartCount = useCartStore(s => s.items.length)
  const cartTotal = useCartStore(s => s.items.reduce((sum, i) => sum + (i.pricePerPerson || 0) * (i.eventDetails?.guestCount || i.pkg?.servesMin || 50), 0))

  useEffect(() => {
    api.get('/coupon/active').then(r => setCoupons(Array.isArray(r.data) ? r.data : [])).catch(() => { })
  }, [])

  useEffect(() => {
    if (coupons.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(a => (a + 1) % coupons.length)
        setVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [coupons.length])

  // Always render the bar (for cart), hide coupon if none
  const c = coupons[active]
  const msg = c && (c.discountType === 'PERCENTAGE'
    ? `🎉 ${c.value}% OFF — Use code ${c.code}${c.minOrderValue > 0 ? ` on orders above ₹${c.minOrderValue.toLocaleString('en-IN')}` : ''}`
    : `🎉 ₹${c.value} OFF — Use code ${c.code}${c.minOrderValue > 0 ? ` on orders above ₹${c.minOrderValue.toLocaleString('en-IN')}` : ''}`)

  if (!coupons.length && cartCount === 0) return null

  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%)',
      color: '#fff', fontSize: 12.5, fontWeight: 600,
      padding: '5px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: 34, gap: 12,
    }}>
      {/* LEFT: coupon info + dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {coupons.length > 1 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {coupons.map((_, i) => (
              <span key={i} onClick={() => setActive(i)} style={{
                width: i === active ? 16 : 6, height: 6, borderRadius: 3,
                background: i === active ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s', cursor: 'pointer', flexShrink: 0,
              }} />
            ))}
          </div>
        )}
        {msg && (
          <span style={{
            transition: 'opacity 0.35s, transform 0.35s',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-5px)',
            display: 'inline-block', letterSpacing: 0.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{msg}</span>
        )}
        {coupons.length > 1 && (
          <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>{active + 1}/{coupons.length}</span>
        )}
      </div>

      {/* RIGHT: Cart pill */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          title="View Cart"
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '4px 12px 4px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.22)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 12.5, flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
        >
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: 12 }} />
          <span>₹{cartTotal >= 1000 ? (cartTotal / 1000).toFixed(1) + 'k' : cartTotal}</span>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', color: 'var(--primary)',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{cartCount}</span>
        </button>
      )}
    </div>
  )
}

function WebNav({ onBookNow }) {
  const navigate = useNavigate()
  const { user, logout: storeLogout } = useAuthStore()
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

          {/* Desktop navigation links */}
          <div className="web-nav-links">
            {navLinks.map(l => (
              <NavLink key={l.path} to={l.path} end={l.end} className={({ isActive }) => 'web-nav-link' + (isActive ? ' active' : '')}>{l.label}</NavLink>
            ))}
          </div>

          {/* Right actions — always pushed to right */}
          <div className="web-nav-actions">
            <button onClick={onBookNow} style={
              {
                padding: '7px 16px', borderRadius: 'var(--r-pill)',
                background: 'var(--primary)', color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-green)',
                cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s'
              }}>Book Now</button>

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

function FloatingCart() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const cartCount = useCartStore(s => s.items.length)
  const cartTotal = useCartStore(s => s.items.reduce((sum, i) => sum + (i.pricePerPerson || 0) * (i.eventDetails?.guestCount || i.pkg?.servesMin || 50), 0))
  const [pop, setPop] = useState(false)

  useEffect(() => {
    if (cartCount === 0) return
    setPop(true)
    const t = setTimeout(() => setPop(false), 650)
    return () => clearTimeout(t)
  }, [cartCount])

  if (pathname === '/cart' || cartCount === 0) return null

  return (
    <>
      <style>{`
        @keyframes cartBounce { 0%,100%{transform:scale(1)} 30%{transform:scale(1.18)} 60%{transform:scale(0.93)} }
        @keyframes cartWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
      `}</style>
      <button
        onClick={() => navigate('/cart')}
        title={`View Cart — ${cartCount} package${cartCount > 1 ? 's' : ''}`}
        style={{
          position: 'fixed', right: 20, bottom: 88, zIndex: 400,
          width: 58, height: 58, borderRadius: '50%',
          background: 'var(--primary)', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(52,199,89,0.45), 0 2px 8px rgba(0,0,0,0.15)',
          animation: pop ? 'cartBounce 0.65s ease' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(52,199,89,0.6), 0 4px 12px rgba(0,0,0,0.2)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(52,199,89,0.45), 0 2px 8px rgba(0,0,0,0.15)'}
      >
        <i className="fa-solid fa-cart-shopping" style={{ color: '#fff', fontSize: 20, animation: pop ? 'cartWiggle 0.5s ease' : 'none' }} />
        <span style={{
          position: 'absolute', top: -4, right: -4,
          background: '#FF3B30', color: '#fff',
          width: 20, height: 20, borderRadius: '50%',
          fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #fff',
        }}>{cartCount}</span>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: 700, marginTop: 1 }}>
          ₹{cartTotal >= 1000 ? (cartTotal / 1000).toFixed(1) + 'k' : cartTotal}
        </span>
      </button>
    </>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const location = useLocation()
  const [showWizard, setShowWizard] = useState(false)

  function handleBookNow() {
    if (!token) {
      navigate('/login?returnTo=/?book=1')
      return
    }
    setShowWizard(true)
  }

  // Auto-open wizard when returning from login with ?book=1
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('book') === '1' && token) {
      setShowWizard(true)
      // Clean URL without reloading
      navigate(location.pathname, { replace: true })
    }
  }, [location.search, token])

  function onWizardComplete(prefs) {
    setShowWizard(false)
    const params = new URLSearchParams({ pkgType: prefs.pkgType, diet: prefs.diet })
    navigate(`/setup?${params.toString()}`)
  }

  return (
    <div className="portal-desktop-bg">
      <AnnouncementBar />
      <WebNav onBookNow={handleBookNow} />
      <FloatingCart />
      <main className="portal-app-frame">
        <Routes>
          <Route path="/" element={<LandingPage onBookNow={handleBookNow} />} />
          <Route path="/setup" element={<PrivateRoute><EventSetupPage /></PrivateRoute>} />
          <Route path="/menu" element={<PrivateRoute><MenuBuilderPage /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><PaymentPlanPage /></PrivateRoute>} />
          <Route path="/success" element={<PrivateRoute><BookingSuccessPage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>

      {showWizard && (
        <BookingWizard
          onClose={prefs => {
            if (prefs?.pkgType) onWizardComplete(prefs)
            else setShowWizard(false)
          }}
        />
      )}
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
