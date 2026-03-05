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
    label: 'Breakfast',
    slots: ['8:00 AM – 8:30 AM', '8:30 AM – 9:00 AM', '9:00 AM – 9:30 AM'],
  },
  {
    label: 'Snacks',
    slots: [
      '10:00 AM – 10:30 AM', '10:30 AM – 11:00 AM', '11:00 AM – 11:30 AM', '11:30 AM – 12:00 PM',
      '3:00 PM – 3:30 PM', '3:30 PM – 4:00 PM', '4:00 PM – 4:30 PM', '4:30 PM – 5:00 PM',
      '5:00 PM – 5:30 PM', '5:30 PM – 6:00 PM'
    ],
  },
  {
    label: 'Lunch',
    slots: [
      '11:30 AM – 12:00 PM', '12:00 PM – 12:30 PM', '12:30 PM – 1:00 PM',
      '1:00 PM – 1:30 PM', '1:30 PM – 2:00 PM', '2:00 PM – 2:30 PM'
    ],
  },
  {
    label: 'Dinner',
    slots: [
      '6:30 PM – 7:00 PM', '7:00 PM – 7:30 PM', '7:30 PM – 8:00 PM', '8:00 PM – 8:30 PM'
    ],
  },
]

// Colorful food-inspired gradients
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #FF9A3C 0%, #FF5722 100%)',
  'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
  'linear-gradient(135deg, #8e24aa 0%, #ce93d8 100%)',
  'linear-gradient(135deg, #e53935 0%, #ff8a65 100%)',
  'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
  'linear-gradient(135deg, #f9a825 0%, #ffcc02 100%)',
]

export default function EventSetupPage() {
  const [packages, setPackages] = useState([])
  const [pkgFilter, setPkgFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [activeModalPkg, setActiveModalPkg] = useState(null)

  const { eventDetails, setEventDetails } = useBookingStore()
  const [guestCount, setGuestCount] = useState(eventDetails.guestCount || 25)

  // Sync guestCount back to the store whenever it changes on this page
  useEffect(() => {
    setEventDetails({ ...eventDetails, guestCount })
  }, [guestCount, setEventDetails])

  useEffect(() => {
    api.get('/menu/packages')
      .then(r => setPackages(r.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  const filteredPkgs = packages.filter(p => {
    if (pkgFilter === 'VEG' && p.type !== 'VEG') return false
    if (pkgFilter === 'NONVEG' && p.type === 'VEG') return false

    // Check minimum guests allowed for this package
    const minRequiredGuests = p.pricingTiers?.length > 0
      ? Math.min(...p.pricingTiers.map(t => t.minGuests))
      : (p.servesMin || 50)

    if (guestCount < minRequiredGuests) return false

    return true
  })

  return (
    <div className="booking-page-wrap">
      <BookingSteps />

      <div className="booking-center" style={{ maxWidth: 1200, paddingBottom: 100 }}>
        <h1 className="booking-page-title" style={{ textAlign: 'center' }}>
          Packages for {eventDetails.occasion || 'Your Event'}
        </h1>
        <p className="booking-page-sub" style={{ textAlign: 'center', marginBottom: 40 }}>
          {eventDetails.city ? `Showing options in ${eventDetails.city}` : 'Select a package to view its menu and pricing.'}
        </p>

        {/* Guest Count Input & Sync */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}><i className="fa-solid fa-users" /> Guest Count:</span>
            <div className="guest-counter" style={{ background: '#f8fafc', padding: '4px', borderRadius: '12px' }}>
              <button className="counter-btn" type="button" onClick={() => setGuestCount(v => Math.max(25, v - 5))}>−</button>
              <input
                type="number"
                min={25}
                value={guestCount}
                onChange={e => setGuestCount(Math.max(25, parseInt(e.target.value) || 25))}
                style={{ width: '50px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 800, fontSize: '1.05rem', outline: 'none' }}
              />
              <button className="counter-btn" type="button" onClick={() => setGuestCount(v => v + 5)}>+</button>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="packages-filter-bar" style={{ justifyContent: 'center', marginBottom: 40 }}>
          {[
            { key: 'ALL', label: 'All Packages', icon: '🍽️' },
            { key: 'VEG', label: 'Veg Only', icon: '🌿' },
            { key: 'NONVEG', label: 'Non-Veg', icon: '🍗' },
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
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 8 }}>No packages available for {guestCount} guests.</p>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem' }}>Try increasing the guest count to unlock premium banquet packages.</p>
          </div>
        ) : (
          <div className="packages-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredPkgs.map((pkg, idx) => {
              const tier = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests)[0]
              const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
              return (
                <div
                  key={pkg.id}
                  className="pkg-card-d"
                  onClick={() => setActiveModalPkg({ pkg, gradient })}
                >
                  <div className="pkg-card-d-thumb" style={{ background: gradient, position: 'relative', overflow: 'hidden' }}>
                    {(() => {
                      const itemImages = pkg.items?.map(pi => pi.menuItem?.image).filter(Boolean) || []
                      const displayImages = itemImages.slice(0, 3)

                      if (displayImages.length === 0) {
                        return (
                          <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
                            {pkg.emoji || '🍛'}
                          </span>
                        )
                      }

                      return (
                        <div style={{ display: 'flex', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                          <img src={displayImages[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )
                    })()}

                    <span style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 10,
                      background: pkg.type === 'VEG' ? '#f0fdf4' : pkg.type === 'BOTH' ? '#fef3c7' : '#fef2f2',
                      color: pkg.type === 'VEG' ? '#166534' : pkg.type === 'BOTH' ? '#92400e' : '#991b1b',
                      border: `1px solid ${pkg.type === 'VEG' ? '#bbf7d0' : pkg.type === 'BOTH' ? '#fde68a' : '#fecaca'}`,
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {pkg.type === 'VEG' ? '🟢 Veg' : pkg.type === 'BOTH' ? '🌿🍗 Mixed' : '🔴 Non-Veg'}
                    </span>
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
                      <span className="pkg-view-btn">
                        Customize <i className="fa-solid fa-arrow-right" />
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {activeModalPkg && (
        <EventDetailsModal
          pkg={activeModalPkg.pkg}
          gradient={activeModalPkg.gradient}
          onClose={() => setActiveModalPkg(null)}
        />
      )}
    </div>
  )
}

function EventDetailsModal({ pkg, gradient, onClose }) {
  const navigate = useNavigate()
  const { eventDetails, setEventDetails, setMenuPreferences } = useBookingStore()

  const [eventDate, setEventDate] = useState(eventDetails.eventDate || '')
  const [timeSlot, setTimeSlot] = useState(eventDetails.timeSlot || '')
  const [blockedDatesMap, setBlockedDatesMap] = useState({})
  // Note: Guest count is automatically synchronized via the store and the top-level form now.
  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Fetch blocked dates so we know which dates/slots to disable
    api.get('/menu/blocked-dates')
      .then(res => {
        const map = {}
        res.data.forEach(d => { map[d.date] = d.blockedSlots || [] })
        setBlockedDatesMap(map)
      })
      .catch(err => console.error('Failed to load blocked dates', err))
  }, [])

  const handleContinue = () => {
    if (!eventDate) { toast.error('Please select an event date'); return }
    if (!timeSlot) { toast.error('Please select a time slot'); return }
    // Save details to store (passing the already existing global guestCount)
    setEventDetails({ ...eventDetails, eventDate, timeSlot, guestCount: eventDetails.guestCount, vegCount: eventDetails.guestCount, nonVegCount: 0 })

    // Auto-determine dietPreference (since we don't have split, let's keep NON_VEG or VEG based on pkg type)
    const dietPreference = pkg.type === 'VEG' ? 'VEG' : 'NON_VEG'

    setMenuPreferences({ selectedPackage: pkg, menuItems: [], dietPreference })

    // Close modal and navigate
    onClose()
    navigate('/menu')
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="pkg-modal-overlay" onClick={handleOverlayClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000
    }}>
      <div className="pkg-modal-popup" style={{
        display: 'flex', flexDirection: 'column',
        maxWidth: 480, width: '95%', background: '#fff',
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        animation: 'modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        maxHeight: '90vh'
      }}>

        {/* Top Header: Full-Bleed Figma Style Image */}
        <div style={{ position: 'relative', width: '100%', height: '240px', background: gradient || '#e5e7eb' }}>
          {(() => {
            const itemImages = pkg.items?.map(pi => pi.menuItem?.image).filter(Boolean) || []
            const image = itemImages[0]

            if (!image) {
              return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                  {pkg.emoji || '🍛'}
                </div>
              )
            }

            return (
              <img
                src={image}
                alt={pkg.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )
          })()}

          {/* Floating Close Button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            width: 36, height: 36, borderRadius: '50%',
            color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <i className="fa-solid fa-times" />
          </button>

          {/* Gradient Overlay for Text Readability at the bottom of the image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '48px 24px 16px 24px', color: '#fff'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {pkg.name}
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {pkg.description || 'Customize your event requirements.'}
            </p>
          </div>
        </div>

        {/* Bottom Body: Event Details Form */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0', color: '#111827' }}>Setup Details</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Provide details to customize your menu.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Event Date */}
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-calendar-days" /> Event Date *</label>
              <input
                type="date"
                className="form-input"
                value={eventDate}
                min={todayStr}
                onChange={e => setEventDate(e.target.value)}
                onClick={e => e.target.showPicker()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', background: '#fff', cursor: 'pointer' }}
              />
            </div>

            {/* Time Slot */}
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-clock" /> Time Slot *</label>
              <select
                className="form-input"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', background: '#fff', cursor: 'pointer', appearance: 'auto' }}
              >
                <option value="" disabled>Select a time slot...</option>
                {TIME_SLOT_GROUPS.filter(g => !pkg.mealTypes || pkg.mealTypes.length === 0 || pkg.mealTypes.includes(g.label)).map(group => {
                  const isGroupBlocked = eventDate && blockedDatesMap[eventDate] &&
                    (blockedDatesMap[eventDate].length === 0 || blockedDatesMap[eventDate].includes(group.label))

                  return (
                    <optgroup key={group.label} label={`${group.label}${isGroupBlocked ? ' (Blocked)' : ''}`}>
                      {group.slots.map(slot => (
                        <option
                          key={slot}
                          value={slot}
                          disabled={isGroupBlocked}
                          style={{ color: isGroupBlocked ? '#9ca3af' : 'var(--text-dark)' }}
                        >
                          {slot}
                        </option>
                      ))}
                    </optgroup>
                  )
                })}
              </select>
            </div>

            {/* Global Guest count display (Readonly, editable at top of page) */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}><i className="fa-solid fa-users" /> Locked Guest Count</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>{eventDetails.guestCount}</strong>
            </div>
          </div>

          <div style={{ paddingTop: '24px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleContinue}
              style={{
                width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '50px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                background: '#E67E22', border: 'none', color: '#fff', fontWeight: 800,
                boxShadow: '0 8px 16px rgba(230, 126, 34, 0.25)', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#d35400'}
              onMouseOut={(e) => e.currentTarget.style.background = '#E67E22'}
            >
              Continue to Customize <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
