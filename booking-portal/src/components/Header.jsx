import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('padma_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [location.pathname])

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem('padma_token')
    localStorage.removeItem('padma_user')
    setUser(null)
    setDropdownOpen(false)
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Logo */}
        <a href="https://padmacatering.com" className="site-logo">
          <span className="site-logo-icon">🍛</span>
          <span className="site-logo-text">Padma<span>Catering</span></span>
        </a>

        {/* Nav */}
        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/packages">Packages</Link>
          <a href="https://padmacatering.com/#about">About Us</a>
          <a href="tel:+918686622722">Contact</a>
        </nav>

        {/* Actions */}
        <div className="site-header-actions">
          <Link to="/packages" className="btn-book-now">
            Book Now <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
          </Link>

          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div
                className="user-avatar"
                onClick={() => setDropdownOpen(o => !o)}
                title={user.name}
              >
                {initials}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-dark)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  <Link to="/my-orders" onClick={() => setDropdownOpen(false)}>
                    <i className="fa-solid fa-receipt" style={{ width: 16 }} /> My Orders
                  </Link>
                  <hr className="user-dropdown-divider" />
                  <button
                    onClick={handleLogout}
                    className="danger"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              <i className="fa-solid fa-user" style={{ fontSize: '0.82rem' }} /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
