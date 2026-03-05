import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Menus',    to: '/menus' },
  { label: 'Gallery',  to: '/gallery' },
  { label: 'Contact',  to: '/contact' },
]

export default function Navbar({ onBookNow }) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: scrolled ? 'var(--shadow)' : 'none',
      transition: 'box-shadow 0.3s var(--ease)',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-bowl-rice" style={{ color: 'var(--heading)', fontSize: '1rem' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--heading)', lineHeight: 1.15 }}>Amrutham</div>
            <div style={{ fontWeight: 400, fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1 }}>by Padma Catering</div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              fontWeight: 500, fontSize: '0.9rem',
              color: pathname === l.to ? 'var(--primary-dark)' : 'var(--heading)',
              background: pathname === l.to ? 'var(--primary-bg)' : 'transparent',
              transition: 'all 0.2s', textDecoration: 'none', display: 'block',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="nav-desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="tel:+918686622722" style={{
            fontWeight: 500, fontSize: '0.84rem',
            color: 'var(--muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="fa-solid fa-phone" style={{ color: 'var(--primary-dark)', fontSize: '0.78rem' }} />
            +91 86866 22722
          </a>
          <button onClick={onBookNow} className="site-btn site-btn-primary site-btn-sm">
            Book Now
          </button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMobileOpen(v => !v)} className="nav-burger-btn" aria-label="Menu">
          <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg)', padding: '12px 20px 20px' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} style={{
              display: 'block', padding: '12px 4px',
              borderBottom: '1px solid var(--border-light)',
              fontWeight: 500, fontSize: '1rem',
              color: pathname === l.to ? 'var(--primary-dark)' : 'var(--heading)',
              textDecoration: 'none',
            }}>
              {l.label}
            </Link>
          ))}
          <button onClick={() => { onBookNow(); setMobileOpen(false) }}
            className="site-btn site-btn-primary"
            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
            Book Now
          </button>
        </div>
      )}

      <style>{`
        .nav-burger-btn {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 8px;
        }
        .nav-burger-btn span {
          width: 22px; height: 2px; background: var(--heading);
          border-radius: 2px; display: block; transition: all 0.3s;
        }
        @media (max-width: 900px) {
          .nav-desktop-links, .nav-desktop-cta { display: none !important; }
          .nav-burger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
