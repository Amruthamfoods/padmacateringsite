import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Header({ title, back, actions }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout: storeLogout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  // Close dropdown on outside click
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

  const autoTitle = {
    '/setup': 'Home',
    '/menu': 'Catering Menu',
    '/payment': 'Checkout',
    '/success': 'Order Placed',
    '/my-orders': 'My Orders',
    '/login': 'Sign In',
    '/about': 'About',
    '/contact': 'Contact',
    '/profile': 'My Profile',
    '/rewards': 'Rewards',
  }[pathname] || title || 'Amrutham'

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  const menuItems = [
    { icon: 'fa-user', label: 'My Profile', path: '/profile' },
    { icon: 'fa-clipboard-list', label: 'My Bookings', path: '/my-orders' },
    { icon: 'fa-star', label: 'Rewards', path: '/rewards' },
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'white', borderBottom: '1px solid var(--border-light)',
      padding: '0 16px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {back !== false && pathname !== '/setup' && (
          <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-arrow-left" style={{ color: 'var(--heading)', fontSize: '0.85rem' }} />
          </button>
        )}
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--heading)' }}>{autoTitle}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {actions}

        {pathname === '/setup' && !user && (
          <button onClick={() => navigate('/my-orders')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--heading)', fontSize: '0.85rem' }} />
          </button>
        )}

        {/* User avatar / dropdown */}
        {user ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'var(--primary-bg)', border: '1.5px solid var(--primary-light)',
                borderRadius: 20, padding: '4px 10px 4px 4px', cursor: 'pointer',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
              }}>{initials}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--heading)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name.split(' ')[0]}
              </span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }} />
            </button>

            {open && (
              <div style={{
                position: 'absolute', top: 44, right: 0, minWidth: 180,
                background: '#fff', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)', border: '1px solid var(--border-light)',
                overflow: 'hidden', zIndex: 100,
              }}>
                {/* User info header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-light)' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--heading)' }}>{user.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                </div>

                {menuItems.map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '0.88rem', color: 'var(--heading)',
                      textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <i className={`fa-solid ${item.icon}`} style={{ width: 16, color: 'var(--primary)', fontSize: '0.85rem' }} />
                    {item.label}
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button onClick={logout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '0.88rem', color: '#e53e3e', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <i className="fa-solid fa-right-from-bracket" style={{ width: 16, fontSize: '0.85rem' }} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => navigate('/login')} style={{
            padding: '6px 14px', borderRadius: 20, border: '1.5px solid var(--primary)',
            background: 'none', color: 'var(--primary)', fontWeight: 600,
            fontSize: '0.82rem', cursor: 'pointer',
          }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  )
}
