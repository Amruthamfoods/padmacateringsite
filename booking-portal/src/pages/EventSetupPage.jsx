import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'

const OCCASIONS = [
  'Wedding', 'Birthday Party', 'Baby Shower', 'Corporate Event',
  'Anniversary', 'Reception', 'Engagement', 'House Warming',
  'Festival', 'Retirement Party', 'Other',
]

const TIME_SLOT_GROUPS = [
  {
    label: 'Afternoon',
    slots: ['11:00 AM – 1:00 PM', '12:00 PM – 2:00 PM', '1:00 PM – 3:00 PM'],
  },
  {
    label: 'Night',
    slots: ['7:00 PM – 9:00 PM', '8:00 PM – 10:00 PM', '9:00 PM – 11:00 PM'],
  },
]

const DELIVERY_OPTIONS = [
  { value: 'GATE',             label: 'Gate Delivery',      icon: '🚚', charge: 0,    desc: 'Free' },
  { value: 'DOORSTEP',         label: 'Doorstep',           icon: '🏠', charge: 500,  desc: '+₹500' },
  { value: 'DOORSTEP_SERVICE', label: 'Doorstep + Service', icon: '👨‍🍳', charge: 1500, desc: '+₹1500' },
]

const DIET_OPTIONS = [
  { value: 'VEG',      label: '🌿 Pure Veg' },
  { value: 'NON_VEG',  label: '🍗 Non-Veg' },
  { value: 'SEPARATE', label: '🌿🍗 Separate' },
]

// Colorful food-inspired gradients — cycles per card index
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #FF9A3C 0%, #FF5722 100%)',  // saffron orange
  'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',  // herb green
  'linear-gradient(135deg, #8e24aa 0%, #ce93d8 100%)',  // royal purple
  'linear-gradient(135deg, #e53935 0%, #ff8a65 100%)',  // tomato red
  'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',  // ocean blue
  'linear-gradient(135deg, #f9a825 0%, #ffcc02 100%)',  // turmeric gold
]

export default function EventSetupPage() {
  const navigate = useNavigate()
  const { eventDetails, setEventDetails, menuPreferences, setMenuPreferences } = useBookingStore()

  const [packages,    setPackages]    = useState([])
  const [pkgFilter,   setPkgFilter]   = useState('ALL')
  const [loading,     setLoading]     = useState(true)
  const [previewPkg,  setPreviewPkg]  = useState(null)  // modal

  // Form state initialized from store
  const [selectedPkg,    setSelectedPkg]    = useState(menuPreferences.selectedPackage || null)
  const [occasion,       setOccasion]       = useState(eventDetails.occasion || '')
  const [eventDate,      setEventDate]      = useState(eventDetails.eventDate || '')
  const [timeSlot,       setTimeSlot]       = useState(eventDetails.timeSlot || '')
  const [vegCount,       setVegCount]       = useState(eventDetails.vegCount || 50)
  const [nonVegCount,    setNonVegCount]    = useState(eventDetails.nonVegCount || 50)
  const [dietPreference, setDietPreference] = useState(eventDetails.dietPreference || 'NON_VEG')
  const [deliveryType,   setDeliveryType]   = useState(eventDetails.deliveryType || 'GATE')

  useEffect(() => {
    api.get('/menu/packages')
      .then(r => setPackages(r.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  const filteredPkgs = packages.filter(p => {
    if (pkgFilter === 'VEG')    return p.type === 'VEG'
    if (pkgFilter === 'NONVEG') return p.type === 'NON_VEG' || p.type === 'BOTH'
    return true
  })

  const guestCount = vegCount + nonVegCount
  const todayStr   = new Date().toISOString().split('T')[0]

  function handleContinue() {
    if (!selectedPkg)    { toast.error('Please select a package'); return }
    if (!occasion)       { toast.error('Please select an occasion'); return }
    if (!eventDate)      { toast.error('Please select an event date'); return }
    if (!timeSlot)       { toast.error('Please select a time slot'); return }
    if (guestCount < 10) { toast.error('Minimum 10 guests required'); return }

    const deliveryCharge = DELIVERY_OPTIONS.find(d => d.value === deliveryType)?.charge || 0

    setEventDetails({
      occasion, eventDate, timeSlot, guestCount, vegCount, nonVegCount,
      deliveryType, deliveryCharge, dietPreference,
    })
    setMenuPreferences({ selectedPackage: selectedPkg, menuItems: [], dietPreference })
    navigate('/menu')
  }

  function handleSelectFromModal(pkg) {
    setSelectedPkg(pkg)
    setPreviewPkg(null)
    toast.success(`"${pkg.name}" selected!`)
  }

  return (
    <div className="booking-page-wrap">
      <BookingSteps />

      <div className="booking-center" style={{ maxWidth: 1100, paddingBottom: 100 }}>
        <h1 className="booking-page-title">Set Up Your Event</h1>
        <p className="booking-page-sub">Choose a package and fill in your event details to get started.</p>

        <div className="setup-layout">

          {/* ── LEFT: Package selection ── */}
          <div>
            <p className="setup-pkg-label">Select Package</p>

            {/* Filter chips */}
            <div className="packages-filter-bar">
              {[
                { key: 'ALL',    label: 'All Packages', icon: '🍽️' },
                { key: 'VEG',    label: 'Veg Only',     icon: '🌿' },
                { key: 'NONVEG', label: 'Non-Veg',      icon: '🍗' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-chip ${pkgFilter === f.key ? 'active' : ''}`}
                  onClick={() => setPkgFilter(f.key)}
                  type="button"
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <i className="fa-solid fa-circle-notch spin" style={{ fontSize: '1.8rem', color: 'var(--red)' }} />
              </div>
            ) : filteredPkgs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>No packages found.</p>
            ) : (
              <div className="packages-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {filteredPkgs.map((pkg, idx) => {
                  const isSelected = selectedPkg?.id === pkg.id
                  const tier = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests)[0]
                  const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
                  return (
                    <div
                      key={pkg.id}
                      className={`pkg-card-d ${isSelected ? 'pkg-card-selected' : ''}`}
                      onClick={() => setPreviewPkg({ pkg, idx })}
                    >
                      <div className="pkg-card-d-thumb" style={{ background: gradient }}>
                        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
                          {pkg.emoji || '🍛'}
                        </span>
                        <span className={`diet-badge ${pkg.type === 'VEG' ? 'veg' : 'nonveg'}`}>
                          {pkg.type === 'VEG' ? '🌿 Veg' : pkg.type === 'BOTH' ? '🌿🍗 Mixed' : '🍗 Non-Veg'}
                        </span>
                        {isSelected && (
                          <div className="pkg-selected-overlay">
                            <i className="fa-solid fa-circle-check" />
                          </div>
                        )}
                      </div>
                      <div className="pkg-card-d-body">
                        <h3>{pkg.name}</h3>
                        <p className="desc">{pkg.description || 'Customizable catering package'}</p>
                        <div className="pkg-card-d-tags">
                          {(pkg.categoryRules || []).slice(0, 3).map(r => (
                            <span key={r.id} className="pkg-rule">{r.label}</span>
                          ))}
                          {(pkg.categoryRules || []).length > 3 && (
                            <span className="pkg-rule">+{(pkg.categoryRules || []).length - 3} more</span>
                          )}
                        </div>
                        <div className="pkg-card-d-footer">
                          <span className="pkg-price">
                            {tier ? <>₹{tier.pricePerPerson}<span>/person</span></> : '—'}
                          </span>
                          <span className={`pkg-view-btn ${isSelected ? 'selected' : ''}`}>
                            {isSelected ? '✓ Selected' : 'View Details'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Event details form ── */}
          <div>
            <div className="form-section">
              <div className="form-section-header">
                <i className="fa-solid fa-calendar" /> Event Details
              </div>
              <div className="form-section-body">

                {/* Occasion */}
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label">
                    <i className="fa-solid fa-champagne-glasses" /> Occasion *
                  </label>
                  <div className="form-select-wrap">
                    <select
                      className="form-select"
                      value={occasion}
                      onChange={e => setOccasion(e.target.value)}
                    >
                      <option value="">Select occasion…</option>
                      {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Event Date */}
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label">
                    <i className="fa-solid fa-calendar-days" /> Event Date *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={eventDate}
                    min={todayStr}
                    onChange={e => setEventDate(e.target.value)}
                  />
                </div>

                {/* Time Slot */}
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label">
                    <i className="fa-solid fa-clock" /> Time Slot *
                  </label>
                  {TIME_SLOT_GROUPS.map(group => (
                    <div key={group.label} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        {group.label}
                      </p>
                      <div className="option-pills">
                        {group.slots.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            className={`option-pill ${timeSlot === slot ? 'selected' : ''}`}
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guest counts */}
                <div className="form-grid-2" style={{ marginBottom: 16 }}>
                  <div className="form-field">
                    <label className="form-label">🌿 Veg Guests</label>
                    <div className="guest-counter">
                      <button className="counter-btn" type="button" onClick={() => setVegCount(v => Math.max(0, v - 10))}>−</button>
                      <span className="counter-value" style={{ minWidth: 52 }}>{vegCount}</span>
                      <button className="counter-btn" type="button" onClick={() => setVegCount(v => v + 10)}>+</button>
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">🍗 Non-Veg Guests</label>
                    <div className="guest-counter">
                      <button className="counter-btn" type="button" onClick={() => setNonVegCount(v => Math.max(0, v - 10))}>−</button>
                      <span className="counter-value" style={{ minWidth: 52 }}>{nonVegCount}</span>
                      <button className="counter-btn" type="button" onClick={() => setNonVegCount(v => v + 10)}>+</button>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, marginTop: -8 }}>
                  Total: <strong style={{ color: 'var(--text-dark)' }}>{guestCount} guests</strong>
                </p>

                {/* Diet Preference */}
                <div className="form-field" style={{ marginBottom: 16 }}>
                  <label className="form-label">
                    <i className="fa-solid fa-leaf" /> Diet Preference
                  </label>
                  <div className="diet-toggle-bar">
                    {DIET_OPTIONS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        className={`diet-pill ${dietPreference === d.value ? 'active' : ''}`}
                        onClick={() => setDietPreference(d.value)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="form-field">
                  <label className="form-label">
                    <i className="fa-solid fa-truck" /> Delivery Type
                  </label>
                  <div className="option-pills">
                    {DELIVERY_OPTIONS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        className={`option-pill ${deliveryType === d.value ? 'selected' : ''}`}
                        onClick={() => setDeliveryType(d.value)}
                      >
                        {d.icon} {d.label} <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom CTA bar ── */}
      <div className="booking-bottom-bar">
        <div>
          {selectedPkg ? (
            <div>
              <p style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                {selectedPkg.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {guestCount} guests · {DELIVERY_OPTIONS.find(d => d.value === deliveryType)?.label}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)' }}>Select a package to continue</p>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedPkg}
        >
          Build My Menu <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
        </button>
      </div>

      {/* ── Package Detail Modal ── */}
      {previewPkg && (
        <PackageModal
          pkg={previewPkg.pkg}
          gradient={CARD_GRADIENTS[previewPkg.idx % CARD_GRADIENTS.length]}
          isSelected={selectedPkg?.id === previewPkg.pkg.id}
          onSelect={() => handleSelectFromModal(previewPkg.pkg)}
          onClose={() => setPreviewPkg(null)}
        />
      )}
    </div>
  )
}

function PackageModal({ pkg, gradient, isSelected, onSelect, onClose }) {
  const tiers = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests) || []

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="pkg-modal-overlay" onClick={handleOverlayClick}>
      <div className="pkg-modal-popup">

        {/* Hero banner */}
        <div className="pkg-modal-hero" style={{ background: gradient }}>
          <button className="pkg-modal-close" onClick={onClose} type="button" aria-label="Close">
            <i className="fa-solid fa-times" />
          </button>
          <div className="pkg-modal-emoji">{pkg.emoji || '🍛'}</div>
          <span className={`diet-badge ${pkg.type === 'VEG' ? 'veg' : 'nonveg'}`}>
            {pkg.type === 'VEG' ? '🌿 Pure Veg' : pkg.type === 'BOTH' ? '🌿🍗 Mixed' : '🍗 Non-Veg'}
          </span>
        </div>

        {/* Body */}
        <div className="pkg-modal-body">
          <h2 className="pkg-modal-name">{pkg.name}</h2>
          {pkg.description && (
            <p className="pkg-modal-desc">{pkg.description}</p>
          )}

          {/* What's included */}
          {pkg.categoryRules?.length > 0 && (
            <div className="pkg-modal-section">
              <h4 className="pkg-modal-section-title">
                <i className="fa-solid fa-bowl-food" style={{ color: 'var(--red)', marginRight: 6 }} />
                What's Included
              </h4>
              <div className="pkg-modal-rules">
                {pkg.categoryRules.map(r => (
                  <div key={r.id} className="pkg-modal-rule-row">
                    <div className="pkg-modal-rule-left">
                      <span className="pkg-modal-rule-dot" />
                      <span className="pkg-modal-rule-name">{r.label}</span>
                    </div>
                    <span className="pkg-modal-rule-count">
                      {r.minChoices === r.maxChoices
                        ? `${r.minChoices} item${r.minChoices > 1 ? 's' : ''}`
                        : `${r.minChoices}–${r.maxChoices} items`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing tiers */}
          {tiers.length > 0 && (
            <div className="pkg-modal-section">
              <h4 className="pkg-modal-section-title">
                <i className="fa-solid fa-tag" style={{ color: 'var(--red)', marginRight: 6 }} />
                Pricing
              </h4>
              <div className="pkg-modal-tiers">
                {tiers.map(t => (
                  <div key={t.id} className="pkg-modal-tier-row">
                    <span className="pkg-modal-tier-guests">
                      <i className="fa-solid fa-users" style={{ marginRight: 6, opacity: 0.6, fontSize: '0.75rem' }} />
                      {t.minGuests}+ guests
                    </span>
                    <span className="pkg-modal-tier-price">
                      ₹{t.pricePerPerson}<span>/person</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            className={`pkg-modal-select-btn ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
          >
            {isSelected
              ? <><i className="fa-solid fa-circle-check" /> Package Selected</>
              : <>Select This Package <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.82rem' }} /></>}
          </button>
        </div>

      </div>
    </div>
  )
}
