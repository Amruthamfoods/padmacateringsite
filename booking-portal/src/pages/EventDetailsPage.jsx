import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'

const OCCASIONS = [
  'Birthday Party', 'House Party', 'Family Get-Together', 'Corporate Event',
  'Puja', 'Wedding', 'House Warming', 'Farm House Party', 'Workshop', 'Other',
]

const TIME_SLOTS = {
  Afternoon: ['11:30 AM – 12:30 PM', '12:00 PM – 1:00 PM', '12:30 PM – 1:30 PM', '1:30 PM – 2:30 PM', '2:30 PM – 3:30 PM'],
  Night:     ['6:30 PM – 7:30 PM', '7:00 PM – 8:00 PM', '7:30 PM – 8:30 PM', '8:00 PM – 9:00 PM'],
}
const ALL_SLOTS = [...TIME_SLOTS.Afternoon, ...TIME_SLOTS.Night]

const DELIVERY_OPTIONS = [
  { id: 'GATE',             label: 'Gate Delivery (Included)',             price: 0 },
  { id: 'DOORSTEP',         label: 'Doorstep Delivery (+₹500)',            price: 500 },
  { id: 'DOORSTEP_SERVICE', label: 'Doorstep + Serving (+₹650/server)',    price: 650 },
]

const today = new Date().toISOString().split('T')[0]

export default function EventDetailsPage() {
  const navigate = useNavigate()
  const [occasion, setOccasion]     = useState('')
  const [eventDate, setEventDate]   = useState('')
  const [timeSlot, setTimeSlot]     = useState('')
  const [guestCount, setGuestCount] = useState(100)
  const [vegCount, setVegCount]     = useState(50)
  const [address, setAddress]       = useState('')
  const [delivery, setDelivery]     = useState('GATE')
  const [staffCount, setStaffCount] = useState(2)
  const [spiceLevel, setSpiceLevel] = useState('MEDIUM')
  const [specialNotes, setSpecialNotes] = useState('')
  const [blockedDates, setBlockedDates] = useState([])
  const [errors, setErrors]         = useState({})

  useEffect(() => {
    api.get('/menu/blocked-dates').then(r => {
      setBlockedDates(r.data.map(d => d.date?.split('T')[0] || d))
    }).catch(() => {})
  }, [])

  const nonVegCount = Math.max(0, guestCount - vegCount)
  const suggestedStaff = Math.max(1, Math.ceil(guestCount / 30))

  const pkg = (() => { try { return JSON.parse(sessionStorage.getItem('selectedPackage') || '{}') } catch { return {} } })()
  const step2 = (() => { try { return JSON.parse(sessionStorage.getItem('bookingStep2') || '{}') } catch { return {} } })()

  function validate() {
    const errs = {}
    if (!occasion)                    errs.occasion   = 'Select an occasion'
    if (!eventDate)                   errs.eventDate  = 'Select a date'
    else if (blockedDates.includes(eventDate)) errs.eventDate = 'This date is unavailable'
    if (!timeSlot)                    errs.timeSlot   = 'Select a time slot'
    if (guestCount < 10)              errs.guestCount = 'Minimum 10 guests'
    if (!address.trim())              errs.address    = 'Enter venue address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleContinue() {
    if (!validate()) { toast.error('Please fill all required fields'); return }
    const deliveryInfo = DELIVERY_OPTIONS.find(d => d.id === delivery)
    const deliveryCharge = delivery === 'DOORSTEP_SERVICE'
      ? deliveryInfo.price * staffCount
      : deliveryInfo.price

    sessionStorage.setItem('bookingStep1', JSON.stringify({
      occasion, eventDate, timeSlot, guestCount, vegCount, nonVegCount,
      venueAddress: address, deliveryType: delivery, deliveryCharge,
      staffCount: delivery === 'DOORSTEP_SERVICE' ? staffCount : 0,
      spiceLevel, specialInstructions: specialNotes,
    }))
    navigate('/summary')
  }

  function Field({ label, icon, error, children }) {
    return (
      <div className="form-field">
        <label className="form-label">{icon && <i className={`fa-solid ${icon}`} />} {label}</label>
        {children}
        {error && <p style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 2 }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 4 }} />{error}</p>}
      </div>
    )
  }

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="event" />

      <div className="booking-center" style={{ paddingBottom: 100 }}>
        {/* Package badge */}
        {pkg.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', marginBottom: 24 }}>
            <span style={{ fontSize: '1.5rem' }}>🍛</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-dark)' }}>{pkg.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{step2.items?.length || 0} items selected</p>
            </div>
            <Link to={`/menu/${pkg.id}`} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Edit Menu</Link>
          </div>
        )}

        {/* Section: Event Info */}
        <div className="form-section">
          <div className="form-section-header">
            <i className="fa-solid fa-calendar-star" /> Event Information
          </div>
          <div className="form-section-body">
            <div className="form-grid-2">
              <Field label="Occasion" icon="fa-party-horn" error={errors.occasion}>
                <div className="form-select-wrap">
                  <select className="form-select" value={occasion} onChange={e => { setOccasion(e.target.value); setErrors(er => ({ ...er, occasion: undefined })) }}>
                    <option value="">Select occasion</option>
                    {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </Field>

              <Field label="Event Date" icon="fa-calendar" error={errors.eventDate}>
                <input type="date" className="form-input" min={today} value={eventDate}
                  onChange={e => { setEventDate(e.target.value); setErrors(er => ({ ...er, eventDate: undefined })) }} />
              </Field>

              <Field label="Delivery Time Slot" icon="fa-clock" error={errors.timeSlot}>
                <div className="form-select-wrap">
                  <select className="form-select" value={timeSlot} onChange={e => { setTimeSlot(e.target.value); setErrors(er => ({ ...er, timeSlot: undefined })) }}>
                    <option value="">Select time slot</option>
                    <optgroup label="Afternoon">
                      {TIME_SLOTS.Afternoon.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="Night">
                      {TIME_SLOTS.Night.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  </select>
                </div>
              </Field>

              <Field label="Venue Address" icon="fa-location-dot" error={errors.address}>
                <textarea className="form-textarea" rows={2} value={address}
                  onChange={e => { setAddress(e.target.value); setErrors(er => ({ ...er, address: undefined })) }}
                  placeholder="Full venue / delivery address…"
                  style={{ minHeight: 60 }}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Guest Count */}
        <div className="form-section">
          <div className="form-section-header">
            <i className="fa-solid fa-users" /> Guest Count
          </div>
          <div className="form-section-body">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label"><i className="fa-solid fa-users" /> Total Guests</label>
                <div className="guest-counter">
                  <button className="counter-btn" onClick={() => setGuestCount(g => Math.max(10, g - 10))}>
                    <i className="fa-solid fa-minus" style={{ fontSize: '0.7rem' }} />
                  </button>
                  <input
                    type="number" min={10} value={guestCount}
                    onChange={e => setGuestCount(Math.max(10, parseInt(e.target.value) || 10))}
                    className="form-input"
                    style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.2rem', maxWidth: 100 }}
                  />
                  <button className="counter-btn" onClick={() => setGuestCount(g => g + 10)}>
                    <i className="fa-solid fa-plus" style={{ fontSize: '0.7rem' }} />
                  </button>
                </div>
                {errors.guestCount && <p style={{ fontSize: '0.78rem', color: '#DC2626' }}>{errors.guestCount}</p>}
              </div>

              <div className="form-field">
                <label className="form-label"><i className="fa-solid fa-leaf" /> Veg / Non-Veg Split</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700, display: 'block', marginBottom: 4 }}>🟢 Veg</label>
                    <input type="number" className="form-input" min={0} max={guestCount} value={vegCount}
                      onChange={e => setVegCount(Math.min(guestCount, parseInt(e.target.value) || 0))}
                      style={{ textAlign: 'center', fontWeight: 700 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, display: 'block', marginBottom: 4 }}>🔴 Non-Veg</label>
                    <input type="number" className="form-input" readOnly value={nonVegCount}
                      style={{ textAlign: 'center', fontWeight: 700, background: 'var(--surface-2)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Delivery */}
        <div className="form-section">
          <div className="form-section-header">
            <i className="fa-solid fa-truck" /> Delivery Service
          </div>
          <div className="form-section-body">
            <div className="option-pills" style={{ marginBottom: 0 }}>
              {DELIVERY_OPTIONS.map(opt => (
                <button key={opt.id} className={`option-pill ${delivery === opt.id ? 'selected' : ''}`}
                  onClick={() => setDelivery(opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>

            {delivery === 'DOORSTEP_SERVICE' && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)', marginBottom: 4 }}>Number of Serving Staff</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Recommended: {suggestedStaff} staff for {guestCount} guests (1 per 30 guests)
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button className="counter-btn" onClick={() => setStaffCount(s => Math.max(1, s - 1))}>
                    <i className="fa-solid fa-minus" style={{ fontSize: '0.7rem' }} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: 36, textAlign: 'center' }}>{staffCount}</span>
                  <button className="counter-btn" onClick={() => setStaffCount(s => s + 1)}>
                    <i className="fa-solid fa-plus" style={{ fontSize: '0.7rem' }} />
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 4 }}>× ₹650 = <strong style={{ color: 'var(--red)' }}>₹{staffCount * 650}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Preferences */}
        <div className="form-section">
          <div className="form-section-header">
            <i className="fa-solid fa-sliders" /> Preferences (Optional)
          </div>
          <div className="form-section-body">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label"><i className="fa-solid fa-pepper-hot" /> Spice Level</label>
                <div className="option-pills">
                  {[['MILD', '😊 Mild'], ['MEDIUM', '🌶️ Medium'], ['SPICY', '🔥 Spicy']].map(([val, lbl]) => (
                    <button key={val} className={`option-pill ${spiceLevel === val ? 'selected' : ''}`}
                      onClick={() => setSpiceLevel(val)}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field form-grid-full">
                <label className="form-label"><i className="fa-solid fa-note-sticky" /> Special Instructions</label>
                <textarea className="form-textarea" rows={3} value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  placeholder="Dietary restrictions, allergies, special requests…" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="booking-bottom-bar">
        <div className="price-summary">
          <strong>{guestCount}</strong> guests · {occasion || 'Event'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/menu/${pkg.id || ''}`} className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back
          </Link>
          <button className="btn-primary" onClick={handleContinue}>
            Review Order <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
