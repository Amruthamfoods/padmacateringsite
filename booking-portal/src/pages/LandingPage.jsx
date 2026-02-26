import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const SLIDES = [
  {
    bg: 'linear-gradient(135deg, #2C0A0A 0%, #5C1A1A 50%, #3D0000 100%)',
    badge: 'Premium Catering',
    title: 'Any Celebration,\nOne Name',
    sub: 'Authentic Andhra flavors for weddings, corporate events & all special occasions in Visakhapatnam.',
    cta: 'Book Your Event',
    accent: '#C0392B',
  },
  {
    bg: 'linear-gradient(135deg, #0A2C0A 0%, #1A5C1A 50%, #003D00 100%)',
    badge: 'Wedding Catering',
    title: 'Make Your Wedding\nUnforgettable',
    sub: 'Traditional Andhra wedding menus with banana leaf service, buffet setup, and complete event management.',
    cta: 'Explore Packages',
    accent: '#27AE60',
  },
  {
    bg: 'linear-gradient(135deg, #0A1A2C 0%, #1A3A5C 50%, #00203D 100%)',
    badge: 'Corporate Events',
    title: 'Professional Catering\nFor Corporate Events',
    sub: 'From team lunches to large conferences — hygienic, punctual, and delicious catering for every occasion.',
    cta: 'Get Quote',
    accent: '#2980B9',
  },
  {
    bg: 'linear-gradient(135deg, #2C1A0A 0%, #5C3A1A 50%, #3D2000 100%)',
    badge: '⭐ 4.9 Rated',
    title: '1000+ Events\nTrusted Since 1993',
    sub: 'Over 30 years of culinary excellence. 50,000+ happy guests and counting across Visakhapatnam.',
    cta: 'Start Booking',
    accent: '#E67E22',
  },
]

const SERVICES = [
  {
    id: 'individual',
    emoji: '🥡',
    label: 'Individual Packs',
    sub: 'Per-person packed boxes',
    desc: 'Hygienic individually packed 5CP/8CP boxes. Perfect for offices, workshops & small gatherings.',
    highlights: ['5CP / 8CP boxes', 'Min 10 guests', 'Offices & workshops'],
    available: false,
  },
  {
    id: 'delivery_box',
    emoji: '📦',
    label: 'Delivery Box',
    sub: 'Bulk packed in trays',
    desc: 'Food packed in bulk trays for 10–300 guests. Optional serving staff & cutlery add-ons included.',
    highlights: ['Bulk trays', 'Doorstep delivery', 'Staff optional'],
    available: false,
  },
  {
    id: 'catering',
    emoji: '🍛',
    label: 'Full Catering',
    sub: 'Buffet setup + staff + service',
    desc: 'Complete event catering — buffet setup, chafing dishes, serving staff & cleaning. Min 50 guests.',
    highlights: ['Buffet setup', 'Serving staff', 'Chafing dishes', 'Cleanup included'],
    available: true,
    badge: 'Available Now',
  },
]

const STEPS = [
  { n: '01', icon: '📋', label: 'Pick a Package', desc: 'Choose from our curated catering packages' },
  { n: '02', icon: '🍽️', label: 'Build Your Menu', desc: 'Customize each course to your taste' },
  { n: '03', icon: '📅', label: 'Add Event Details', desc: 'Date, venue, guests & preferences' },
  { n: '04', icon: '✅', label: 'Confirm & Pay', desc: 'Review pricing and place your booking' },
]

const TESTIMONIALS = [
  { name: 'Ramesh K.', event: 'Wedding — 500 guests', text: 'Absolutely exceptional! The banana leaf spread was authentic and the service was impeccable. Every guest complimented the food.', rating: 5, initials: 'RK' },
  { name: 'Priya S.', event: 'Corporate Event — 200 guests', text: 'Very professional team. Food was delivered on time, tasted amazing, and the presentation was top-notch. Highly recommend!', rating: 5, initials: 'PS' },
  { name: 'Anand M.', event: 'Birthday — 150 guests', text: 'Great variety of dishes, perfectly spiced. The team set up everything on time and the cleanup was flawless. Will book again!', rating: 5, initials: 'AM' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [slide, setSlide]   = useState(0)
  const [paused, setPaused] = useState(false)

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % SLIDES.length), [])
  const prevSlide = useCallback(() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(nextSlide, 4500)
    return () => clearInterval(t)
  }, [paused, nextSlide])

  function handleService(svc) {
    if (!svc.available) {
      toast('Coming soon! Call us to book this service.', { icon: '🔔' })
      return
    }
    sessionStorage.setItem('bookingService', svc.id)
    navigate('/packages')
  }

  const s = SLIDES[slide]

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── BANNER SLIDER ── */}
      <div
        className="banner-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="banner-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
          {SLIDES.map((sl, i) => (
            <div key={i} className="banner-slide">
              <div className="banner-slide-bg" style={{ background: sl.bg }} />
              <div className="banner-slide-overlay" />
              <div className="banner-content">
                <span className="banner-badge">{sl.badge}</span>
                <h1 className="banner-title" style={{ whiteSpace: 'pre-line' }}>{sl.title}</h1>
                <p className="banner-sub">{sl.sub}</p>
                <button
                  className="banner-cta"
                  style={{ background: sl.accent }}
                  onClick={() => { sessionStorage.setItem('bookingService', 'catering'); navigate('/packages') }}
                >
                  {sl.cta} <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button className="banner-arrow prev" onClick={prevSlide} aria-label="Previous">
          <i className="fa-solid fa-chevron-left" />
        </button>
        <button className="banner-arrow next" onClick={nextSlide} aria-label="Next">
          <i className="fa-solid fa-chevron-right" />
        </button>

        {/* Dots */}
        <div className="banner-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`banner-dot ${i === slide ? 'active' : ''}`}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        <div className="stats-strip-inner">
          {[['30+', 'Years of Excellence'], ['1000+', 'Events Catered'], ['50,000+', 'Happy Guests'], ['4.9★', 'Average Rating']].map(([v, l]) => (
            <div key={l}>
              <div className="stat-value">{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div className="lp-section">
          <div className="lp-section-header">
            <p className="lp-section-eyebrow">Our Services</p>
            <h2 className="lp-section-title">Choose Your Catering Style</h2>
            <p className="lp-section-sub">From intimate gatherings to grand events — we have a catering solution for every occasion.</p>
          </div>

          <div className="services-grid">
            {SERVICES.map(svc => (
              <div
                key={svc.id}
                className={`service-card ${!svc.available ? 'disabled' : ''}`}
                onClick={() => handleService(svc)}
              >
                {svc.badge && (
                  <span className={`service-card-badge ${svc.available ? 'available' : 'soon'}`}>
                    {svc.badge}
                  </span>
                )}
                {!svc.available && (
                  <span className="service-card-badge soon">Coming Soon</span>
                )}
                <div className="service-card-icon">{svc.emoji}</div>
                <h3>{svc.label}</h3>
                <p className="sub">{svc.sub}</p>
                <p>{svc.desc}</p>
                <div className="service-card-chips">
                  {svc.highlights.map(h => (
                    <span key={h} className={`chip ${svc.available ? 'chip-red' : 'chip-gray'}`}>
                      {svc.available && <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: '0.6rem' }} />}
                      {h}
                    </span>
                  ))}
                </div>
                {svc.available && (
                  <button className="book-btn" onClick={() => handleService(svc)}>
                    Book Now <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="how-bg">
        <div className="lp-section">
          <div className="lp-section-header">
            <p className="lp-section-eyebrow">Simple Process</p>
            <h2 className="lp-section-title">How It Works</h2>
            <p className="lp-section-sub">Book your catering in 4 easy steps — takes less than 5 minutes.</p>
          </div>

          <div className="steps-row">
            {STEPS.map(step => (
              <div key={step.n} className="step-item">
                <div className="step-icon-wrap">{step.icon}</div>
                <p className="step-num">Step {step.n}</p>
                <p className="step-label">{step.label}</p>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link
              to="/packages"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 36px', borderRadius: 50,
                background: 'var(--red)', color: '#fff',
                fontWeight: 700, fontSize: '1rem',
                textDecoration: 'none',
              }}
              onClick={() => sessionStorage.setItem('bookingService', 'catering')}
            >
              Start Your Booking <i className="fa-solid fa-arrow-right" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="lp-section">
          <div className="lp-section-header">
            <p className="lp-section-eyebrow">Customer Reviews</p>
            <h2 className="lp-section-title">What Our Clients Say</h2>
            <p className="lp-section-sub">Trusted by families and businesses across Visakhapatnam.</p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-event">{t.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div style={{ background: 'var(--red)', padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          Ready to Plan Your Event?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Call us now or start your online booking. Our team is available 7 days a week.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="tel:+918686622722"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 50, background: '#fff', color: 'var(--red)', fontWeight: 700, fontSize: '0.97rem', textDecoration: 'none' }}
          >
            <i className="fa-solid fa-phone" /> +91 86866 22722
          </a>
          <Link
            to="/packages"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 50, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, fontSize: '0.97rem', textDecoration: 'none' }}
            onClick={() => sessionStorage.setItem('bookingService', 'catering')}
          >
            <i className="fa-solid fa-calendar-check" /> Book Online
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <div className="footer-brand-logo">
              <span>🍛</span>
              <span className="footer-brand-name">Padma Catering</span>
            </div>
            <p className="footer-brand-desc">
              Visakhapatnam's most trusted catering service since 1993. Authentic Andhra flavors crafted with love for every celebration.
            </p>
            <a href="tel:+918686622722" className="footer-contact-item">
              <i className="fa-solid fa-phone" /> +91 86866 22722
            </a>
            <a href="tel:+919849915468" className="footer-contact-item">
              <i className="fa-solid fa-phone" /> +91 98499 15468
            </a>
            <a href="mailto:amruthamfoodsvizag@gmail.com" className="footer-contact-item">
              <i className="fa-solid fa-envelope" /> amruthamfoodsvizag@gmail.com
            </a>
            <p className="footer-contact-item" style={{ cursor: 'default' }}>
              <i className="fa-solid fa-location-dot" /> Visakhapatnam, Andhra Pradesh
            </p>
          </div>

          <div className="footer-col">
            <h5>Services</h5>
            <a href="#" onClick={e => { e.preventDefault(); sessionStorage.setItem('bookingService','catering'); navigate('/packages') }}>Full Catering</a>
            <a href="#">Individual Packs (Soon)</a>
            <a href="#">Delivery Box (Soon)</a>
            <a href="#">Corporate Catering</a>
          </div>

          <div className="footer-col">
            <h5>Events</h5>
            <a href="#">Weddings</a>
            <a href="#">Corporate Events</a>
            <a href="#">Birthday Parties</a>
            <a href="#">Baby Showers</a>
            <a href="#">Receptions</a>
          </div>

          <div className="footer-col">
            <h5>Quick Links</h5>
            <Link to="/packages" style={{ display: 'block', fontSize: '0.88rem', color: 'rgba(255,255,255,0.70)', textDecoration: 'none', marginBottom: 10 }}>Browse Packages</Link>
            <Link to="/login" style={{ display: 'block', fontSize: '0.88rem', color: 'rgba(255,255,255,0.70)', textDecoration: 'none', marginBottom: 10 }}>My Orders</Link>
            <a href="https://padmacatering.com">Main Website</a>
            <a href="tel:+918686622722">Call Us</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Padma Catering, Visakhapatnam. All rights reserved.</p>
          <p>Serving Vizag since 1993 · GST registered</p>
        </div>
      </footer>

    </div>
  )
}
