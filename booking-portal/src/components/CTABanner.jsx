export default function CTABanner({ onBookNow }) {
  return (
    <section style={{ background: 'var(--heading)', padding: '80px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="cta-grid">
          <div>
            <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 16 }}>Book Online</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: 'white', marginBottom: 14, lineHeight: 1.2 }}>Download Our Mobile App to Make It Easier</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>Browse menus, build your custom order and book your event from your phone. Or use our web booking portal directly.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="/booking/" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', color: 'var(--heading)', borderRadius: 'var(--r)', padding: '12px 20px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                <i className="fa-brands fa-google-play" style={{ fontSize: '1.2rem' }} />
                <div><div style={{ fontSize: '0.6rem', opacity: 0.6, lineHeight: 1 }}>GET IT ON</div><div>Google Play</div></div>
              </a>
              <a href="/booking/" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', color: 'var(--heading)', borderRadius: 'var(--r)', padding: '12px 20px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                <i className="fa-brands fa-apple" style={{ fontSize: '1.3rem' }} />
                <div><div style={{ fontSize: '0.6rem', opacity: 0.6, lineHeight: 1 }}>DOWNLOAD ON THE</div><div>App Store</div></div>
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 220, background: 'rgba(255,255,255,0.08)', borderRadius: 32, padding: 8, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ background: 'var(--primary)', borderRadius: 26, padding: '40px 20px', textAlign: 'center' }}>
                <i className="fa-solid fa-bowl-rice" style={{ fontSize: '3rem', color: 'white', marginBottom: 16, display: 'block' }} />
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', marginBottom: 4 }}>Amrutham</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>by Padma Catering</div>
                <a href="/booking/" style={{ display: 'block', background: 'white', borderRadius: 'var(--r-pill)', padding: '10px 20px', fontWeight: 700, fontSize: '0.82rem', color: 'var(--heading)', textDecoration: 'none' }}>Book Now</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.cta-grid{grid-template-columns:1fr!important}.cta-grid>div:last-child{display:none}}`}</style>
    </section>
  )
}
