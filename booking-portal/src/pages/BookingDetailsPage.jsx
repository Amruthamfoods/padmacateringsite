import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

const EVENT_TYPES = [
  { label: 'Wedding', icon: 'fa-solid fa-ring' },
  { label: 'Birthday', icon: 'fa-solid fa-cake-candles' },
  { label: 'Reception', icon: 'fa-solid fa-champagne-glasses' },
  { label: '1st Birthday', icon: 'fa-solid fa-baby' },
  { label: 'Engagement', icon: 'fa-solid fa-heart' },
  { label: 'Housewarming', icon: 'fa-solid fa-house-chimney' },
  { label: 'Corporate', icon: 'fa-solid fa-briefcase' },
  { label: 'Ceremony', icon: 'fa-solid fa-om' },
  { label: 'Social Gathering', icon: 'fa-solid fa-people-group' },
]

const SERVING_STYLES = [
  { value: 'BUFFET', label: 'Buffet', desc: 'Self-service stations', icon: 'fa-solid fa-bowl-food' },
  { value: 'BANANA_LEAF', label: 'Banana Leaf', desc: 'Traditional served meal', icon: 'fa-solid fa-leaf' },
  { value: 'BOX_LUNCH', label: 'Box Lunch', desc: 'Individual packed boxes', icon: 'fa-solid fa-box' },
]

const today = new Date().toISOString().split('T')[0]

export default function BookingDetailsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [guestCount, setGuestCount] = useState(100)
  const [venue, setVenue] = useState('')
  const [servingStyle, setServingStyle] = useState('BUFFET')
  const [blockedDates, setBlockedDates] = useState([])
  const [errors, setErrors] = useState({})

  // Allow flow to be set via query param as well
  useEffect(() => {
    const flowParam = searchParams.get('flow')
    if (flowParam) sessionStorage.setItem('bookingFlow', flowParam)
    api.get('/menu/blocked-dates').then(r => {
      setBlockedDates(r.data.map(d => d.date?.split('T')[0] || d))
    }).catch(() => {})
  }, [searchParams])

  function validate() {
    const errs = {}
    if (!eventType) errs.eventType = 'Please select an event type'
    if (!eventDate) errs.eventDate = 'Please select a date'
    else if (blockedDates.includes(eventDate)) errs.eventDate = 'This date is not available'
    if (guestCount < 10) errs.guestCount = 'Minimum 10 guests required'
    if (!venue.trim()) errs.venue = 'Please enter venue address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleContinue() {
    if (!validate()) { toast.error('Please fill all required fields'); return }
    sessionStorage.setItem('bookingStep1', JSON.stringify({ eventType, eventDate, guestCount, venueAddress: venue, servingStyle }))
    const flow = sessionStorage.getItem('bookingFlow') || 'preset'
    navigate(flow === 'custom' ? '/custom/builder' : '/preset/packages')
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <Link to="/" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Event Details</span>
        <span className="booking-step-label">Step 1</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '25%' }} />
      </div>

      <div className="booking-body">
        {/* Event Type */}
        <div className="booking-card">
          <h2 className="booking-card-title">
            <i className="fa-solid fa-calendar-star" style={{ marginRight: 10 }} />Select Event Type
          </h2>
          <div className="event-grid">
            {EVENT_TYPES.map(et => (
              <button
                key={et.label}
                onClick={() => { setEventType(et.label); setErrors(e => ({ ...e, eventType: undefined })) }}
                className={`event-card${eventType === et.label ? ' active' : ''}`}
              >
                <i className={et.icon} style={{ fontSize: '1.4rem', color: eventType === et.label ? 'var(--gold)' : 'var(--text-muted)' }} />
                <span className="event-card-label">{et.label}</span>
              </button>
            ))}
          </div>
          {errors.eventType && <p className="field-error" style={{ marginTop: 12 }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 5 }} />{errors.eventType}</p>}
        </div>

        {/* Date & Guests */}
        <div className="booking-card">
          <h2 className="booking-card-title">
            <i className="fa-solid fa-calendar-days" style={{ marginRight: 10 }} />Event Details
          </h2>
          <div className="form-row-2">
            <div className="field-block" style={{ marginBottom: 0 }}>
              <label className="field-label">Event Date *</label>
              <input
                type="date" min={today} value={eventDate}
                onChange={e => { setEventDate(e.target.value); setErrors(er => ({ ...er, eventDate: undefined })) }}
                className={`booking-input${errors.eventDate ? ' error' : ''}`}
                style={{ colorScheme: 'dark' }}
              />
              {errors.eventDate && <p className="field-error">{errors.eventDate}</p>}
            </div>
            <div className="field-block" style={{ marginBottom: 0 }}>
              <label className="field-label">Number of Guests *</label>
              <div className="guest-counter">
                <button className="guest-btn" onClick={() => setGuestCount(g => Math.max(10, g - 10))}>−</button>
                <input
                  type="number" min={10} value={guestCount}
                  onChange={e => { setGuestCount(parseInt(e.target.value) || 10); setErrors(er => ({ ...er, guestCount: undefined })) }}
                  className={`booking-input${errors.guestCount ? ' error' : ''}`}
                  style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}
                />
                <button className="guest-btn" onClick={() => setGuestCount(g => g + 10)}>+</button>
              </div>
              {errors.guestCount && <p className="field-error">{errors.guestCount}</p>}
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="booking-card">
          <h2 className="booking-card-title">
            <i className="fa-solid fa-location-dot" style={{ marginRight: 10 }} />Venue Address
          </h2>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <input
              type="text" value={venue}
              onChange={e => { setVenue(e.target.value); setErrors(er => ({ ...er, venue: undefined })) }}
              placeholder="Enter full venue address…"
              className={`booking-input${errors.venue ? ' error' : ''}`}
            />
            {errors.venue && <p className="field-error">{errors.venue}</p>}
          </div>
        </div>

        {/* Serving Style */}
        <div className="booking-card">
          <h2 className="booking-card-title">
            <i className="fa-solid fa-plate-utensils" style={{ marginRight: 10 }} />Serving Style
          </h2>
          <div className="serving-grid">
            {SERVING_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setServingStyle(s.value)}
                className={`serving-card${servingStyle === s.value ? ' active' : ''}`}
              >
                <i className={s.icon} style={{ fontSize: '1.6rem', color: servingStyle === s.value ? 'var(--gold)' : 'var(--text-muted)' }} />
                <span className="serving-card-title">{s.label}</span>
                <span className="serving-card-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="booking-fixed-bar">
        <div className="booking-fixed-inner">
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Event</p>
            <p style={{ fontSize: '0.92rem', color: eventType ? 'var(--gold)' : 'var(--text-faint)', fontFamily: 'var(--font-display)' }}>
              {eventType || 'No event selected'}{eventDate ? ` · ${eventDate}` : ''}
            </p>
          </div>
          <button onClick={handleContinue} className="btn btn-primary">
            Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
