import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [splash, setSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800)
    return () => clearTimeout(t)
  }, [])

  if (splash) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-bowl-rice" style={{ fontSize: '3rem', color: 'white' }} />
          </div>
        </div>
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: 'white', letterSpacing: '-0.02em' }}>Amrutham</h1>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>by Padma Catering</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero image area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '55vh' }}>
        <img
          src="https://images.unsplash.com/photo-1555244162-803834f87a4d?w=600&h=800&fit=crop&q=80"
          alt="Catering"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            <i className="fa-solid fa-bowl-rice" style={{ fontSize: '1.4rem', color: 'var(--heading)' }} />
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '32px 24px 40px', marginTop: -28, position: 'relative' }}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 28px' }} />
        <h1 style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--heading)', marginBottom: 12, lineHeight: 1.2 }}>
          The Fastest<br />In Catering <span style={{ color: 'var(--primary-dark)' }}>Food</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: 32 }}>
          Our job is to fill your occasion with delicious food — Meal Trays, Bulk Delivery or Full Catering, all from Visakhapatnam's most trusted caterer.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 4, background: i === 0 ? 'var(--primary)' : 'var(--border)' }} />)}
        </div>
        <button className="btn-green" onClick={() => navigate('/setup')}>
          Get Started <i className="fa-solid fa-arrow-right" />
        </button>
        <button className="btn-outline-green" style={{ marginTop: 12 }} onClick={() => navigate('/login')}>
          Sign In to Your Account
        </button>
      </div>
    </div>
  )
}
