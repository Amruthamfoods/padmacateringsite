import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import BookingSteps from '../components/BookingSteps'

const DIET_OPTIONS = [
  {
    id: 'VEG',
    title: 'Pure Veg Menu',
    desc: 'Only vegetarian items. Ideal for families & religious events.',
    icon: '🌿',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  {
    id: 'NON_VEG',
    title: 'Non-Veg Menu',
    desc: 'Mix of veg & non-veg items. Most popular choice for all events.',
    icon: '🍗',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  {
    id: 'SEPARATE',
    title: 'Separate Veg & Non-Veg',
    desc: 'Two separate menus side by side. Best for mixed guest groups.',
    icon: '🌿🍗',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
]

export default function DietPreferencePage() {
  const navigate  = useNavigate()
  const [selected, setSelected] = useState(null)
  const pkg = (() => { try { return JSON.parse(sessionStorage.getItem('selectedPackage') || '{}') } catch { return {} } })()

  function handleContinue() {
    if (!selected) { toast.error('Please select a menu type'); return }
    sessionStorage.setItem('dietPreference', selected)
    navigate(`/menu/${pkg.id}`)
  }

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="menu" />

      <div className="booking-center">
        <h1 className="booking-page-title">Menu Preference</h1>
        <p className="booking-page-sub">What kind of menu are you looking for? This helps us curate your selection.</p>

        {/* Package badge */}
        {pkg.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', marginBottom: 28 }}>
            <span style={{ fontSize: '1.5rem' }}>🍛</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-dark)' }}>{pkg.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pkg.type === 'VEG' ? '🟢 Pure Veg Package' : '🔴 Non-Veg Package'}</p>
            </div>
          </div>
        )}

        {/* Diet cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {DIET_OPTIONS.map(opt => (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px',
                background: selected === opt.id ? opt.bg : '#fff',
                border: `2px solid ${selected === opt.id ? opt.color : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: opt.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', marginBottom: 4 }}>{opt.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{opt.desc}</p>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${selected === opt.id ? opt.color : 'var(--border)'}`,
                background: selected === opt.id ? opt.color : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selected === opt.id && <i className="fa-solid fa-check" style={{ fontSize: '0.65rem', color: '#fff' }} />}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#EFF6FF', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.85rem', marginBottom: 28 }}>
          <i className="fa-solid fa-circle-info" />
          Pricing may vary slightly based on your menu preference and item selection.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/packages" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back
          </Link>
          <button className="btn-primary" onClick={handleContinue} style={{ flex: 1 }} disabled={!selected}>
            Continue to Menu Builder <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
