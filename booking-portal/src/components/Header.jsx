import { useNavigate, useLocation } from 'react-router-dom'

export default function Header({ title, back, actions }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const autoTitle = {
    '/setup': 'Home',
    '/menu': 'Catering Menu',
    '/payment': 'Checkout',
    '/success': 'Order Placed',
    '/my-orders': 'My Orders',
    '/login': 'Sign In',
    '/about': 'About',
    '/contact': 'Contact',
  }[pathname] || title || 'Amrutham'

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
        {pathname === '/setup' && (
          <>
            <button onClick={() => navigate('/my-orders')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--heading)', fontSize: '0.85rem' }} />
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-light)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <i className="fa-solid fa-bell" style={{ color: 'var(--heading)', fontSize: '0.85rem' }} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', border: '2px solid white' }} />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
