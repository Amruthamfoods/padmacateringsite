import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/api'

function getTierPrice(tiers, guestCount) {
  if (!tiers || tiers.length === 0) return null
  // tiers sorted desc by minGuests — find first where guestCount >= minGuests
  const sorted = [...tiers].sort((a, b) => b.minGuests - a.minGuests)
  return sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
}

export default function PackageBrowsePage() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [guestCount, setGuestCount] = useState(100)

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    if (s1) setGuestCount(JSON.parse(s1).guestCount || 100)
    api.get('/menu/packages').then(r => setPackages(r.data)).catch(() => toast.error('Failed to load packages')).finally(() => setLoading(false))
  }, [])

  function selectPackage(pkg) {
    sessionStorage.setItem('selectedPackageId', pkg.id)
    navigate(`/preset/builder/${pkg.id}`)
  }

  if (loading) return (
    <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }} />
    </div>
  )

  return (
    <div className="booking-page">
      <div className="booking-header">
        <Link to="/details" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Choose a Package</span>
        <span className="booking-step-label">Step 2</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '50%' }} />
      </div>

      <div className="booking-body">
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          Pricing shown for <strong style={{ color: 'var(--gold)' }}>{guestCount} guests</strong>. Rates are per person.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {packages.map(pkg => {
            const activeTier = getTierPrice(pkg.pricingTiers, guestCount)
            const tiers = [...(pkg.pricingTiers || [])].sort((a, b) => a.minGuests - b.minGuests)
            return (
              <div key={pkg.id} className="summary-card" style={{ cursor: 'pointer' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--white)', marginBottom: 4 }}>{pkg.name}</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: pkg.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)', color: pkg.type === 'VEG' ? '#2ea843' : '#c0392b' }}>
                        {pkg.type.replace('_', '-')}
                      </span>
                      {pkg.eventType && (
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                          {pkg.eventType}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeTier && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your rate</p>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold)' }}>₹{activeTier.pricePerPerson}/pp</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {pkg.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>{pkg.description}</p>
                )}

                {/* Category rules summary */}
                {pkg.categoryRules && pkg.categoryRules.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Menu Rules</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {pkg.categoryRules.map(rule => (
                        <span key={rule.id} style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid var(--gold-line)', fontSize: '0.72rem', color: 'var(--text-warm)' }}>
                          {rule.label}: Pick {rule.minChoices}–{rule.maxChoices}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tier pricing table */}
                {tiers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Pricing Tiers</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                      {tiers.map(t => (
                        <div key={t.id} style={{
                          padding: '6px 10px', borderRadius: 8, border: `1px solid ${activeTier?.id === t.id ? 'var(--gold)' : 'var(--gold-line)'}`,
                          background: activeTier?.id === t.id ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} guests
                          </p>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: activeTier?.id === t.id ? 'var(--gold)' : 'var(--text-warm)' }}>
                            ₹{t.pricePerPerson}/pp
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => selectPackage(pkg)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Select Package <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }} />
                </button>
              </div>
            )
          })}
        </div>

        {packages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '2rem', marginBottom: 12, display: 'block', color: 'var(--text-faint)' }} />
            No packages available yet. Contact us directly.
          </div>
        )}
      </div>
    </div>
  )
}
