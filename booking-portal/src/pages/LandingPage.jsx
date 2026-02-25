import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  function choose(flow) {
    sessionStorage.setItem('bookingFlow', flow)
    navigate('/details')
  }

  return (
    <div className="booking-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <a href="/" style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="fa-solid fa-arrow-left" /> Back to Padma Catering
      </a>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Padma Catering</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', color: 'var(--white)', marginBottom: 12 }}>
          How would you like to book?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>
          Choose a curated package for straightforward pricing, or build a fully custom menu and request a quote.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640, width: '100%' }}>
        {/* Preset package card */}
        <button
          onClick={() => choose('preset')}
          style={{
            flex: '1 1 260px', minWidth: 240, background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
            borderRadius: 16, padding: '32px 28px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.transform = 'none' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--white)', marginBottom: 6 }}>Choose a Package</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Pick from curated menus with transparent tier pricing. Know your cost before you confirm.
            </p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 600 }}>
            Get Started <i className="fa-solid fa-arrow-right" />
          </div>
        </button>

        {/* Custom menu card */}
        <button
          onClick={() => choose('custom')}
          style={{
            flex: '1 1 260px', minWidth: 240, background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
            borderRadius: 16, padding: '32px 28px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-line)'; e.currentTarget.style.transform = 'none' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-sliders" style={{ fontSize: '1.4rem', color: 'var(--gold)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--white)', marginBottom: 6 }}>Build Custom Menu</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Hand-pick every dish to match your event. Submit for a personalised quote within 24 hours.
            </p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 600 }}>
            Build Menu <i className="fa-solid fa-arrow-right" />
          </div>
        </button>
      </div>
    </div>
  )
}
