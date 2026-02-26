import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'

function getTierPrice(tiers, guestCount) {
  if (!tiers || tiers.length === 0) return null
  const sorted = [...tiers].sort((a, b) => b.minGuests - a.minGuests)
  return sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
}

const EMOJIS = { VEG: '🥗', NON_VEG: '🍗' }

export default function PackageBrowsePage() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [vegFilter, setVegFilter] = useState('all')
  const [guestCount] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bookingStep1') || '{}').guestCount || 100 } catch { return 100 }
  })

  useEffect(() => {
    api.get('/menu/packages')
      .then(r => setPackages(r.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  function selectPackage(pkg) {
    sessionStorage.setItem('selectedPackage', JSON.stringify({ id: pkg.id, name: pkg.name, type: pkg.type }))
    navigate('/diet')
  }

  const filtered = vegFilter === 'all' ? packages : packages.filter(p => p.type === vegFilter)

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="event" />

      <div className="booking-center">
        <h1 className="booking-page-title">Choose a Package</h1>
        <p className="booking-page-sub">
          Prices shown for <strong style={{ color: 'var(--text-dark)' }}>{guestCount} guests</strong>. Select a package to continue customizing your menu.
        </p>

        {/* Filter Bar */}
        <div className="packages-filter-bar">
          {[['all', 'All Packages'], ['VEG', '🟢 Pure Veg'], ['NON_VEG', '🔴 Non-Veg']].map(([id, label]) => (
            <button key={id} className={`filter-chip ${vegFilter === id ? 'active' : ''}`} onClick={() => setVegFilter(id)}>
              {label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            {filtered.length} package{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-circle-notch" style={{ fontSize: '2rem', color: 'var(--red)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No packages found</p>
            <a href="tel:+918686622722" style={{ color: 'var(--red)', fontWeight: 600 }}>Call us to book a custom package</a>
          </div>
        ) : (
          <div className="packages-grid">
            {filtered.map(pkg => {
              const activeTier = getTierPrice(pkg.pricingTiers, guestCount)
              const tiers = [...(pkg.pricingTiers || [])].sort((a, b) => a.minGuests - b.minGuests)
              const isVeg = pkg.type === 'VEG'

              return (
                <div key={pkg.id} className="pkg-card-d" onClick={() => selectPackage(pkg)}>
                  {/* Thumbnail */}
                  <div className="pkg-card-d-thumb">
                    <span>{EMOJIS[pkg.type] || '🍛'}</span>
                    <span className={`diet-badge ${isVeg ? 'veg' : 'nonveg'}`}>
                      {isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>

                  <div className="pkg-card-d-body">
                    <h3>{pkg.name}</h3>

                    {pkg.description && <p className="desc">{pkg.description}</p>}

                    {/* Category rules */}
                    {pkg.categoryRules?.length > 0 && (
                      <div className="pkg-card-d-tags">
                        {pkg.categoryRules.map(r => (
                          <span key={r.id} className="pkg-rule">
                            {r.label}: {r.minChoices}–{r.maxChoices}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pricing tiers */}
                    {tiers.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                        {tiers.map(t => (
                          <div key={t.id} style={{
                            padding: '3px 8px', borderRadius: 6, fontSize: '0.72rem',
                            border: `1px solid ${activeTier?.id === t.id ? 'var(--red)' : 'var(--border)'}`,
                            background: activeTier?.id === t.id ? 'var(--red-light)' : '#fff',
                            color: activeTier?.id === t.id ? 'var(--red-text)' : 'var(--text-muted)',
                            fontWeight: activeTier?.id === t.id ? 700 : 400,
                          }}>
                            {t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} pax
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pkg-card-d-footer">
                      <div className="pkg-price">
                        {activeTier ? (
                          <>₹{activeTier.pricePerPerson} <span>/person</span></>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Contact for price</span>
                        )}
                      </div>
                      <button className="pkg-select-btn" onClick={e => { e.stopPropagation(); selectPackage(pkg) }}>
                        Select <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.75rem' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-start' }}>
          <Link to="/" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.82rem' }} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
