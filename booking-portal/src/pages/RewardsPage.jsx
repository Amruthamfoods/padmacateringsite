import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import Header from '../components/Header'
import useAuthStore from '../store/authStore'

const POINTS_PER_100 = 4   // 4 pts for every ₹100 spent
const POINT_VALUE = 0.25    // each point = ₹0.25

const TIERS = [
  { name: 'Bronze', min: 0,    max: 499,  color: '#CD7F32', discount: 0 },
  { name: 'Silver', min: 500,  max: 1999, color: '#94A3B8', discount: 5 },
  { name: 'Gold',   min: 2000, max: null, color: '#F59E0B', discount: 10 },
]

function getTier(pts) {
  return TIERS.slice().reverse().find(t => pts >= t.min) || TIERS[0]
}

export default function RewardsPage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/booking/my')
      .then(res => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, navigate])

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
  const totalSpend = completedBookings.reduce((s, b) => s + (Number(b.total) || 0), 0)
  const points = Math.floor(totalSpend / 100) * POINTS_PER_100
  const tier = getTier(points)
  const nextTier = TIERS[TIERS.findIndex(t => t.name === tier.name) + 1]

  const progressMax = nextTier ? nextTier.min : tier.min || 1
  const progressPct = nextTier ? Math.min(100, (points / progressMax) * 100) : 100

  if (loading) return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="Rewards" />
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--primary)', fontSize: 24 }} />
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="Rewards" />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* Points hero card */}
        <div style={{
          background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)`,
          borderRadius: 16, padding: '28px 24px', color: '#fff', marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, opacity: 0.8 }}>Your Points</p>
          <p style={{ margin: '0 0 4px', fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{points.toLocaleString('en-IN')}</p>
          <p style={{ margin: '0 0 4px', fontSize: 13, opacity: 0.7 }}>from ₹{totalSpend.toLocaleString('en-IN')} total spend</p>
          <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, opacity: 0.95 }}>Worth ₹{(points * POINT_VALUE).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <span style={{
            display: 'inline-block', padding: '5px 16px', borderRadius: 20,
            background: tier.color, color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            <i className="fa-solid fa-crown" style={{ marginRight: 6 }} />{tier.name} Member
          </span>
          {tier.discount > 0 && (
            <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.9 }}>
              <i className="fa-solid fa-tag" style={{ marginRight: 5 }} />
              {tier.discount}% discount on all bookings
            </p>
          )}
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Progress to {nextTier.name}</p>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '18px', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>{points.toLocaleString('en-IN')} pts</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: nextTier.color }}>{nextTier.min.toLocaleString('en-IN')} pts for {nextTier.name}</span>
              </div>
              <div style={{ height: 10, background: 'var(--bg-light)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progressPct}%`,
                  background: `linear-gradient(90deg, var(--primary), ${nextTier.color})`,
                  borderRadius: 5, transition: 'width 0.6s ease',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'right' }}>
                {nextTier.min - points} pts to go · spend ₹{Math.ceil((nextTier.min - points) / POINTS_PER_100 * 100).toLocaleString('en-IN')} more
              </p>
            </div>
          </>
        )}

        {/* Earning rule */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Earning Points</p>
        <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-indian-rupee-sign" style={{ color: 'var(--primary)', fontSize: '1rem' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--heading)' }}>4 points per ₹100 spent</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>Earned on every completed booking · 1 pt = ₹0.25</p>
            </div>
          </div>
        </div>

        {/* Tier benefits */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Member Tiers</p>
        <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
          {TIERS.map((t, i) => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < TIERS.length - 1 ? '0.5px solid var(--separator-nm)' : 'none',
              background: tier.name === t.name ? `${t.color}12` : 'transparent',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--heading)' }}>{t.name}</p>
                <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                  {t.max ? `${t.min.toLocaleString('en-IN')} – ${t.max.toLocaleString('en-IN')} pts` : `${t.min.toLocaleString('en-IN')}+ pts`}
                </p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.discount > 0 ? t.color : 'var(--muted)' }}>
                {t.discount > 0 ? `${t.discount}% off` : 'Base'}
              </span>
              {tier.name === t.name && (
                <i className="fa-solid fa-circle-check" style={{ color: t.color, fontSize: '0.9rem' }} />
              )}
            </div>
          ))}
        </div>

        {/* Completed bookings count */}
        <div style={{ textAlign: 'center', padding: '14px', background: 'var(--primary-bg)', borderRadius: 12, border: '1px solid var(--primary-light)' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--primary)', fontWeight: 600 }}>
            <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} />
            {completedBookings.length} completed booking{completedBookings.length !== 1 ? 's' : ''} · {points} pts earned
          </p>
        </div>

      </div>
    </div>
  )
}
