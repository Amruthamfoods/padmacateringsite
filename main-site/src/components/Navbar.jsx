import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Menus',    to: '/menus' },
  { label: 'Gallery',  to: '/gallery' },
  { label: 'Contact',  to: '/contact' },
]

export default function Navbar({ onBookNow, onViewMenu }) {
  const [scrolled, setScrolled]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={`${import.meta.env.BASE_URL}img/logo-large.png`} alt="Padma Catering Services" />
        </Link>

        <div className="nav-links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
          <button className="nav-link-btn" onClick={onViewMenu}>Menu</button>
          <button className="nav-book-btn" onClick={onBookNow}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} />
            Book Now
          </button>
        </div>

        <button
          className={`burger${drawerOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setDrawerOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav-drawer${drawerOpen ? ' open' : ''}`}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? 'active' : ''} onClick={closeDrawer}>
            {l.label}
          </Link>
        ))}
        <button className="nav-link-btn" onClick={() => { onViewMenu(); closeDrawer() }}>Menu</button>
        <button onClick={() => { onBookNow(); closeDrawer() }}>
          <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} />
          Book Now
        </button>
      </div>
    </nav>
  )
}
