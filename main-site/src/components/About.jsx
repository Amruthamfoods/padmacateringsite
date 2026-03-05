const GALLERY = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop&q=80',
]
export default function About() {
  return (
    <section style={{ background: 'var(--bg-light)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="plan-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {GALLERY.map((src, i) => (
              <div key={i} style={{ borderRadius: 'var(--r)', overflow: 'hidden', aspectRatio: '1', boxShadow: 'var(--shadow-sm)' }}>
                <img src={src} alt="Event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 16 }}>Plan With Us</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 16 }}>Plan Your Event With Amrutham</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.75, marginBottom: 16 }}>From intimate family gatherings to grand wedding receptions — we have catered 5000+ events across Visakhapatnam. Our team brings decades of culinary expertise to every occasion.</p>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.75, marginBottom: 32 }}>We offer personalised menus, flexible serving styles and on-time delivery. Tell us about your event and we will craft the perfect dining experience.</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="/consultation" className="site-btn site-btn-primary"><i className="fa-solid fa-phone" /> Get Free Consultation</a>
              <a href="/gallery" className="site-btn site-btn-outline">View Our Work</a>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.plan-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
