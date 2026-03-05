import { } from 'react'

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=420&h=420&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=420&h=420&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=420&h=420&fit=crop&q=80',
]

export default function HeroSlider({ onBookNow }) {
  return (
    <section style={{ background: 'var(--bg)', paddingTop: 100, paddingBottom: 80, overflow: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', minHeight: '80vh' }} className="hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 28 }}>
              <i className="fa-solid fa-location-dot" style={{ fontSize: '0.75rem' }} />
              Serving Visakhapatnam since 1993
            </div>
            <h1 style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: 'var(--heading)', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Your Favorite <span style={{ color: 'var(--primary-dark)' }}>Catering</span><br />Delivered Hot &amp; Fresh
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Best catering service in Visakhapatnam. We are ready to serve your desire with 1 Crore+ plates of experience and a team that truly cares.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={onBookNow} className="site-btn site-btn-primary">
                <i className="fa-solid fa-calendar-check" /> Book Your Event
              </button>
              <a href="/consultation" className="site-btn site-btn-outline">Get Free Consultation</a>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 44, flexWrap: 'wrap' }}>
              {[{ n: '5000+', l: 'Events Catered' }, { n: '1 Cr+', l: 'Plates Served' }, { n: '3000+', l: 'Happy Families' }].map(s => (
                <div key={s.n}>
                  <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--heading)' }}>{s.n}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 420 }}>
            <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'var(--primary-bg)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <div style={{ position: 'relative', zIndex: 2, width: 240, height: 240, borderRadius: '50%', overflow: 'hidden', border: '5px solid white', boxShadow: 'var(--shadow-lg)' }}>
              <img src={FOOD_IMAGES[0]} alt="Catering" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', zIndex: 3, width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-md)', top: '5%', right: '5%' }}>
              <img src={FOOD_IMAGES[1]} alt="Food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', zIndex: 3, width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-md)', bottom: '5%', left: '8%' }}>
              <img src={FOOD_IMAGES[2]} alt="Cuisine" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', zIndex: 4, bottom: '12%', right: '-2%', background: 'white', borderRadius: 'var(--r)', padding: '10px 16px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border-light)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-truck-fast" style={{ color: 'var(--primary-dark)', fontSize: '0.9rem' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--heading)' }}>On-Time Delivery</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Guaranteed</div>
              </div>
            </div>
            <div style={{ position: 'absolute', zIndex: 4, top: '10%', left: '-2%', background: 'white', borderRadius: 'var(--r)', padding: '10px 16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-star" style={{ color: 'var(--star)', fontSize: '0.7rem' }} />)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--heading)' }}>4.9 / 5.0</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>3000+ reviews</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width:900px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important;text-align:center}.hero-grid>div:last-child{display:none}}`}</style>
    </section>
  )
}
