import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHero from '../components/PageHero'
import useScrollReveal from '../hooks/useScrollReveal'

const EVENT_TYPES = [
  'Wedding', 'Engagement / Reception', 'Birthday Celebration',
  'Anniversary', 'Baby Shower / Naming Ceremony', 'Corporate Event',
  'Conference / Seminar', 'Product Launch', 'Puja / Religious Event',
  'College / Institutional Event', 'Social Gathering', 'Other',
]

const BUDGETS = [
  'Below ₹50,000', '₹50,000 – ₹1 Lakh', '₹1 – 2 Lakhs',
  '₹2 – 3 Lakhs', '₹3 – 5 Lakhs', '₹5 – 10 Lakhs',
  '₹10 Lakhs+', 'Not decided yet',
]

const SERVING_STYLES = ['Buffet', 'Plated / Sit-down', 'Live Counters', 'Combination', 'Not sure yet']

export default function ConsultationPage() {
  useScrollReveal()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    eventType: '', eventDate: '', guestCount: '',
    venue: '', city: '', servingStyle: '',
    budget: '', preferences: '', specialRequirements: '',
  })
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        throw new Error()
      }
    } catch {
      // fallback mailto
      const body = [
        `Name: ${form.name}`,
        `Phone: ${form.phone}`,
        `Email: ${form.email}`,
        `Event Type: ${form.eventType}`,
        `Event Date: ${form.eventDate}`,
        `Guests: ${form.guestCount}`,
        `Venue: ${form.venue}, ${form.city}`,
        `Serving Style: ${form.servingStyle}`,
        `Budget: ${form.budget}`,
        `Preferences: ${form.preferences}`,
        `Special Requirements: ${form.specialRequirements}`,
      ].join('\n')
      window.open(
        `mailto:amruthamfoodsvizag@gmail.com?subject=${encodeURIComponent(`Event Consultation – ${form.eventType}`)}&body=${encodeURIComponent(body)}`
      )
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-1)' }}>
        <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 520 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem', color: 'var(--gold)' }}>
            <i className="fa-solid fa-circle-check" />
          </div>
          <p style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}>Request Received</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', color: 'var(--white)', marginBottom: 16 }}>
            Thank You, <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{form.name || 'Guest'}!</em>
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
            We've received your consultation request. Our team will review your requirements
            and get back to you within <strong style={{ color: 'var(--text-warm)' }}>24 hours</strong> to discuss your event in detail.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <i className="fa-solid fa-house" /> Back to Home
            </button>
            <button className="btn btn-outline" onClick={() => { setStatus(null); setForm({ name: '', phone: '', email: '', eventType: '', eventDate: '', guestCount: '', venue: '', city: '', servingStyle: '', budget: '', preferences: '', specialRequirements: '' }) }}>
              New Request
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero
        label="Free Consultation"
        title="Plan Your Perfect"
        em="Event with Us"
        bg="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&auto=format&q=80"
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="centered reveal" style={{ marginBottom: 48 }}>
            <span className="section-label">Tell Us About Your Event</span>
            <h2 className="section-title">Share Your <em>Vision</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 16px' }}>
              <div className="dot" />
            </div>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Fill in the details below and our culinary team will craft a personalised proposal just for you — at no cost.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="consultation-form reveal">

            {/* Contact Details */}
            <div className="cf-section">
              <div className="cf-section-title"><i className="fa-solid fa-user" /> Your Details</div>
              <div className="cf-row">
                <div className="cf-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="cf-field">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
              </div>
              <div className="cf-field">
                <label>Email Address</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>

            {/* Event Details */}
            <div className="cf-section">
              <div className="cf-section-title"><i className="fa-solid fa-calendar-star" /> Event Details</div>
              <div className="cf-row">
                <div className="cf-field">
                  <label>Type of Event *</label>
                  <select value={form.eventType} onChange={e => set('eventType', e.target.value)} required>
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="cf-field">
                  <label>Event Date *</label>
                  <input type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="cf-row">
                <div className="cf-field">
                  <label>Expected Number of Guests *</label>
                  <input type="number" placeholder="e.g. 200" min="1" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} required />
                </div>
                <div className="cf-field">
                  <label>Preferred Serving Style</label>
                  <select value={form.servingStyle} onChange={e => set('servingStyle', e.target.value)}>
                    <option value="">Select style</option>
                    {SERVING_STYLES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Venue & Budget */}
            <div className="cf-section">
              <div className="cf-section-title"><i className="fa-solid fa-location-dot" /> Venue & Budget</div>
              <div className="cf-row">
                <div className="cf-field">
                  <label>Venue / Hall Name</label>
                  <input type="text" placeholder="Venue or hall name (if known)" value={form.venue} onChange={e => set('venue', e.target.value)} />
                </div>
                <div className="cf-field">
                  <label>City / Area</label>
                  <input type="text" placeholder="e.g. Visakhapatnam" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
              </div>
              <div className="cf-field">
                <label>Approximate Budget Range</label>
                <select value={form.budget} onChange={e => set('budget', e.target.value)}>
                  <option value="">Select budget range</option>
                  {BUDGETS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {/* Preferences */}
            <div className="cf-section">
              <div className="cf-section-title"><i className="fa-solid fa-star" /> Preferences & Ideas</div>
              <div className="cf-field">
                <label>Cuisine Preferences / Menu Ideas</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your cuisine preferences — South Indian, North Indian, Live Counters, custom menu ideas, theme preferences, etc."
                  value={form.preferences}
                  onChange={e => set('preferences', e.target.value)}
                />
              </div>
              <div className="cf-field">
                <label>Special Requirements or Additional Notes</label>
                <textarea
                  rows={4}
                  placeholder="Any dietary restrictions, special arrangements, decor requirements, specific dishes you must have, or anything else we should know..."
                  value={form.specialRequirements}
                  onChange={e => set('specialRequirements', e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}
              disabled={status === 'sending'}
            >
              {status === 'sending'
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending Request...</>
                : <><i className="fa-solid fa-paper-plane" /> Submit Consultation Request</>
              }
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: 6 }} />
              Your information is kept private and used only to plan your event.
            </p>
          </form>
        </div>
      </section>
    </>
  )
}
