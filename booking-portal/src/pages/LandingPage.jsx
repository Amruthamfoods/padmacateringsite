import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import HeroSlider      from '../components/HeroSlider'
import Services        from '../components/Services'
import CuisineShowcase from '../components/CuisineShowcase'
import Stats           from '../components/Stats'
import About           from '../components/About'
import BrandShowcase   from '../components/BrandShowcase'
import Testimonials    from '../components/Testimonials'
import CTABanner       from '../components/CTABanner'
import Footer          from '../components/Footer'

const NAV_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'About',     to: '/about' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Contact',   to: '/contact' },
]

function HomeNav({ onBookNow }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: scrolled ? 'var(--shadow)' : 'none',
      backdropFilter: 'blur(12px)',
      transition: 'box-shadow 0.3s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/booking/img/amrutham-logo.png" alt="Amrutham" style={{ height: 51, objectFit: 'contain' }} />
        </Link>

        <div className="homenav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              fontWeight: 500, fontSize: '0.9rem',
              color: pathname === l.to ? 'var(--primary-dark)' : 'var(--heading)',
              background: pathname === l.to ? 'var(--primary-bg)' : 'transparent',
              textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
        </div>

        <div className="homenav-cta" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="tel:+918686622722" style={{ fontWeight: 500, fontSize: '0.84rem', color: 'var(--muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-phone" style={{ color: 'var(--primary-dark)', fontSize: '0.78rem' }} />
            +91 86866 22722
          </a>
          <button onClick={onBookNow} className="site-btn site-btn-primary site-btn-sm">Book Now</button>
        </div>

        <button onClick={() => setMobileOpen(v => !v)} className="homenav-burger" aria-label="Menu">
          <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg)', padding: '12px 20px 20px' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '12px 4px', borderBottom: '1px solid var(--border-light)', fontWeight: 500, fontSize: '1rem', color: 'var(--heading)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
          <button onClick={() => { onBookNow(); setMobileOpen(false) }} className="site-btn site-btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>Book Now</button>
        </div>
      )}

      <style>{`
        .homenav-burger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:8px; }
        .homenav-burger span { width:22px; height:2px; background:var(--heading); border-radius:2px; display:block; transition:all 0.3s; }
        @media(max-width:900px){ .homenav-links,.homenav-cta{display:none!important} .homenav-burger{display:flex!important} }
      `}</style>
    </nav>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const bookNow = () => navigate('/setup')

  return (
    <>
      <HeroSlider onBookNow={bookNow} />
      <Services />
      <CuisineShowcase onBookNow={bookNow} />
      <Stats />
      <About />
      <BrandShowcase onBookNow={bookNow} />
      <Testimonials />
      <CTABanner onBookNow={bookNow} />
      <Footer />
    </>
  )
}
