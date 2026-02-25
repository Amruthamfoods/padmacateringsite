import { useState, useRef, useEffect } from 'react'

const EVENT_TYPES = [
  { id: 'wedding',   icon: '💒', label: 'Wedding' },
  { id: 'corporate', icon: '🏢', label: 'Corporate' },
  { id: 'birthday',  icon: '🎂', label: 'Birthday' },
  { id: 'social',    icon: '🎉', label: 'Social Gathering' },
  { id: 'pooja',     icon: '🪔', label: 'Pooja / Religious' },
  { id: 'other',     icon: '📝', label: 'Other' },
]

const PACKAGES = [
  {
    id: 'standard-veg',
    name: 'Standard Veg Menu',
    price: '₹200 / person',
    desc: 'Sweets × 1 • Flavoured Rice × 1 • Spl Veg Curry × 1 • Veg Curry/Fry × 2 • White Rice, Dal, Raitha, Sambar, Curd, Papad, Water & Ice Cream*',
    badge: 'Veg',
  },
  {
    id: 'deluxe-veg',
    name: 'Deluxe Veg Menu',
    price: '₹300 / person',
    desc: 'Sweets × 2 • Hots × 1 • Flavoured Rice × 2 • Spl Veg Curry × 1 • Veg Curry × 1 • Veg Fry × 2 • White Rice, Dal, Raitha, Sambar, Rasam, Curd, Ghee, Podi, Papad, Water & Premium Ice Cream*',
    badge: 'Veg',
  },
  {
    id: 'amrutham-premium',
    name: 'Amrutham Premium',
    price: 'Quote on request',
    desc: 'Our elevated Amrutham format — bespoke multi-cuisine menu, fine dining presentation, live counters & white-glove service for elite events',
    badge: 'Premium',
  },
  {
    id: 'custom',
    name: 'Custom Menu',
    price: 'Quote on request',
    desc: 'Tell us your requirements — we\'ll craft a fully customised menu tailored to your event, guests and preferences',
    badge: 'Custom',
  },
]

const STEPS = ['Event', 'Details', 'Package', 'Contact', 'Confirm']

const empty = v => !v || !v.toString().trim()

/* Tomorrow's date as YYYY-MM-DD */
const getTomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function BookingModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const dateRef = useRef(null)

  const [form, setForm] = useState({
    eventType: '',
    date: '',
    guests: 50,
    location: '',
    package: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  /* Auto-open date picker when step 2 mounts */
  useEffect(() => {
    if (step === 2 && dateRef.current) {
      setTimeout(() => {
        try { dateRef.current.showPicker() } catch { dateRef.current.focus() }
      }, 150)
    }
  }, [step])

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  /* Select event type and auto-advance */
  const selectEvent = (id) => {
    set('eventType', id)
    setTimeout(() => setStep(2), 280)
  }

  const validate = () => {
    const errs = {}
    if (step === 1 && empty(form.eventType))  errs.eventType = 'Please select an event type'
    if (step === 2) {
      if (empty(form.date))     errs.date     = 'Please pick a date'
      if (form.guests < 10)     errs.guests   = 'Minimum 10 guests required'
      if (empty(form.location)) errs.location = 'Please enter a location'
    }
    if (step === 3 && empty(form.package)) errs.package = 'Please select a package'
    if (step === 4) {
      if (empty(form.name))  errs.name  = 'Name is required'
      if (empty(form.email) || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
      if (empty(form.phone)) errs.phone = 'Phone number is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      const subject = encodeURIComponent(`Booking Request — ${form.eventType} — ${form.name}`)
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n` +
        `Event: ${form.eventType}\nDate: ${form.date}\nGuests: ${form.guests}\n` +
        `Location: ${form.location}\nPackage: ${form.package}\nNotes: ${form.notes}`
      )
      window.open(`mailto:amruthamfoodsvizag@gmail.com?subject=${subject}&body=${body}`)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const pkg = PACKAGES.find(p => p.id === form.package)
  const evt = EVENT_TYPES.find(e => e.id === form.eventType)
  const minDate = getTomorrow()

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{submitted ? 'Booking Received!' : 'Book Your Event'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body">
            <div className="success-msg">
              <div className="success-icon"><i className="fa-solid fa-check" /></div>
              <h3>Thank You, {form.name}!</h3>
              <p>Your booking request has been received. Our team will contact you at <strong>{form.phone}</strong> within 24 hours.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="booking-progress">
              <div className="progress-steps">
                {STEPS.map((label, i) => {
                  const n = i + 1
                  const cls = n < step ? 'done' : n === step ? 'active' : ''
                  return (
                    <div key={label} className={`progress-step ${cls}`}>
                      <div className="step-circle">
                        {n < step ? <i className="fa-solid fa-check" style={{ fontSize: '0.6rem' }} /> : n}
                      </div>
                      <span className="step-label">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="modal-body">

              {/* Step 1 — Event Type */}
              {step === 1 && (
                <>
                  <h3 className="step-heading">What are you celebrating?</h3>
                  <p className="step-sub">Select your event type to continue</p>
                  <div className="event-type-grid">
                    {EVENT_TYPES.map(e => (
                      <div
                        key={e.id}
                        className={`event-type-card${form.eventType === e.id ? ' selected' : ''}`}
                        onClick={() => selectEvent(e.id)}
                        role="radio"
                        aria-checked={form.eventType === e.id}
                        tabIndex={0}
                        onKeyDown={ev => ev.key === 'Enter' && selectEvent(e.id)}
                      >
                        <span className="etc-icon">{e.icon}</span>
                        <span className="etc-label">{e.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.eventType && <div className="field-error">{errors.eventType}</div>}
                </>
              )}

              {/* Step 2 — Details */}
              {step === 2 && (
                <>
                  <h3 className="step-heading">Event Details</h3>
                  <p className="step-sub">When, where, and how many guests?</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Event Date</label>
                      <input
                        ref={dateRef}
                        type="date"
                        className="form-input"
                        value={form.date}
                        min={minDate}
                        onClick={e => { try { e.target.showPicker() } catch {} }}
                        onChange={e => set('date', e.target.value)}
                      />
                      {errors.date && <div className="field-error">{errors.date}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Number of Guests</label>
                      <div className="guest-counter">
                        <button type="button" onClick={() => set('guests', Math.max(10, form.guests - 10))}>
                          <i className="fa-solid fa-minus" style={{ fontSize: '0.75rem' }} />
                        </button>
                        <input
                          type="number"
                          value={form.guests}
                          min={10}
                          onChange={e => set('guests', Math.max(10, parseInt(e.target.value) || 10))}
                        />
                        <button type="button" onClick={() => set('guests', form.guests + 10)}>
                          <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem' }} />
                        </button>
                      </div>
                      {errors.guests && <div className="field-error">{errors.guests}</div>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue / Location</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Kalyana Mandapam, Sector 8, Vizag"
                      value={form.location}
                      onChange={e => set('location', e.target.value)}
                    />
                    {errors.location && <div className="field-error">{errors.location}</div>}
                  </div>
                </>
              )}

              {/* Step 3 — Package */}
              {step === 3 && (
                <>
                  <h3 className="step-heading">Choose a Package</h3>
                  <p className="step-sub">Select a menu package or request a custom quote</p>
                  <div className="package-grid">
                    {PACKAGES.map(p => (
                      <div
                        key={p.id}
                        className={`package-card${form.package === p.id ? ' selected' : ''}`}
                        onClick={() => set('package', p.id)}
                        role="radio"
                        aria-checked={form.package === p.id}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && set('package', p.id)}
                      >
                        <div className="pkg-radio" />
                        <div>
                          <div className="pkg-name">{p.name}</div>
                          <div className="pkg-price">{p.price}</div>
                          <div className="pkg-desc">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.package && <div className="field-error">{errors.package}</div>}
                </>
              )}

              {/* Step 4 — Contact */}
              {step === 4 && (
                <>
                  <h3 className="step-heading">Your Contact Details</h3>
                  <p className="step-sub">We'll use these to confirm your booking</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
                      {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
                      {errors.phone && <div className="field-error">{errors.phone}</div>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special Requests <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <textarea className="form-input" rows={3} placeholder="Dietary requirements, special arrangements..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                  </div>
                </>
              )}

              {/* Step 5 — Confirm */}
              {step === 5 && (
                <>
                  <h3 className="step-heading">Review &amp; Confirm</h3>
                  <p className="step-sub">Check your details before submitting</p>
                  <div className="summary-box">
                    {[
                      ['Event Type', evt ? `${evt.icon} ${evt.label}` : '—'],
                      ['Date', form.date || '—'],
                      ['Guests', form.guests],
                      ['Venue', form.location || '—'],
                      ['Package', pkg ? `${pkg.name} (${pkg.price})` : '—'],
                      ['Name', form.name],
                      ['Phone', form.phone],
                      ['Email', form.email],
                      ...(form.notes ? [['Notes', form.notes]] : []),
                    ].map(([k, v]) => (
                      <div className="summary-row" key={k}>
                        <span className="s-key">{k}</span>
                        <span className="s-val">{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              {step > 1
                ? <button className="btn btn-outline" onClick={back}><i className="fa-solid fa-arrow-left" /> Back</button>
                : <div />
              }
              {step < 5
                ? <button className="btn btn-primary" onClick={next}>Next <i className="fa-solid fa-arrow-right" /></button>
                : <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> Sending…</> : <><i className="fa-solid fa-paper-plane" /> Confirm Booking</>}
                  </button>
              }
            </div>
          </>
        )}
      </div>
    </div>
  )
}
