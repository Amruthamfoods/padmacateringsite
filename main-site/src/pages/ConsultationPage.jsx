import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

const SERVING_STYLES = ['Buffet', 'Banana Leaf', 'Plated / Sit-down', 'Live Counters', 'Combination', 'Not sure yet']

const CUISINE_OPTIONS = ['Andhra / Telugu', 'North Indian', 'South Indian', 'Continental', 'Fusion', 'Mixed']

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1.5px solid #e5e7eb', fontSize: '0.95rem', color: '#323434',
  background: '#fff', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontWeight: 600, fontSize: '0.83rem',
  color: '#555', marginBottom: 6,
}

function SectionCard({ icon, title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid #f0f0f0' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#9AD983,#7BC565)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#323434', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Row({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {children}
    </div>
  )
}

export default function ConsultationPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    eventType: '', eventDate: '', guestCount: '',
    venue: '', city: 'Visakhapatnam', servingStyle: '',
    budget: '', cuisines: [], preferences: '', specialRequirements: '',
  })
  const [status, setStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleCuisine = (c) => setForm(f => ({
    ...f,
    cuisines: f.cuisines.includes(c) ? f.cuisines.filter(x => x !== c) : [...f.cuisines, c],
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.eventType || !form.eventDate || !form.guestCount) {
      return
    }
    setStatus('sending')
    try {
      const payload = { ...form, preferences: [form.cuisines.join(', '), form.preferences].filter(Boolean).join(' | ') }
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        throw new Error()
      }
    } catch {
      const body = [
        `Name: ${form.name}`, `Phone: ${form.phone}`, `Email: ${form.email}`,
        `Event: ${form.eventType}`, `Date: ${form.eventDate}`, `Guests: ${form.guestCount}`,
        `Venue: ${form.venue}, ${form.city}`, `Style: ${form.servingStyle}`, `Budget: ${form.budget}`,
        `Cuisines: ${form.cuisines.join(', ')}`, `Notes: ${form.preferences}`,
        `Special: ${form.specialRequirements}`,
      ].join('\n')
      window.open(`mailto:amruthamfoodsvizag@gmail.com?subject=${encodeURIComponent(`Consultation – ${form.eventType} – ${form.name}`)}&body=${encodeURIComponent(body)}`)
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 36px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#9AD983,#7BC565)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(154,217,131,0.4)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.6rem', color: '#323434', margin: '0 0 12px' }}>
            Thank You, {form.name || 'Friend'}!
          </h2>
          <p style={{ color: '#888', lineHeight: 1.7, margin: '0 0 32px' }}>
            We've received your consultation request. Our team will review your requirements
            and reach out within <strong style={{ color: '#9AD983' }}>24 hours</strong> to discuss your event in detail.
          </p>
          <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ color: '#166534', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>What happens next?</p>
            {['Our team reviews your requirements', 'We call you within 24 hours', 'Free personalised menu proposal'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#9AD983', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>{i + 1}</span>
                </div>
                <span style={{ color: '#323434', fontSize: '0.85rem' }}>{step}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', borderRadius: 50, background: '#9AD983', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
            Back to Home
          </button>
          <button onClick={() => { setStatus(null); setForm({ name: '', phone: '', email: '', eventType: '', eventDate: '', guestCount: '', venue: '', city: 'Visakhapatnam', servingStyle: '', budget: '', cuisines: [], preferences: '', specialRequirements: '' }) }}
            style={{ width: '100%', padding: '14px', borderRadius: 50, background: '#F5F5F5', border: 'none', color: '#323434', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Submit Another Request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #9AD983 0%, #7BC565 100%)',
        padding: 'clamp(48px,8vw,96px) 24px clamp(56px,10vw,110px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
          Free Consultation
        </p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
          Plan Your Perfect Event
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
          Tell us about your event and we'll craft a personalised catering proposal — at no cost.
        </p>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 32 }}>
          {[
            { icon: '⚡', text: '24hr Response' },
            { icon: '🎯', text: 'Free Proposal' },
            { icon: '🏆', text: '15+ Years Exp.' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: '6px 14px' }}>
              <span style={{ fontSize: '0.9rem' }}>{b.icon}</span>
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 60px' }}>
        <form onSubmit={handleSubmit}>

          <SectionCard icon="👤" title="Your Contact Details">
            <Row>
              <Field label="Full Name *">
                <input
                  type="text" placeholder="Your full name" value={form.name} required
                  onChange={e => set('name', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
              <Field label="Phone Number *">
                <input
                  type="tel" placeholder="+91 98765 43210" value={form.phone} required
                  onChange={e => set('phone', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
            </Row>
            <Field label="Email Address (optional)">
              <input
                type="email" placeholder="your@email.com" value={form.email}
                onChange={e => set('email', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#9AD983'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>
          </SectionCard>

          <SectionCard icon="🎉" title="Event Details">
            <Row>
              <Field label="Type of Event *">
                <select value={form.eventType} onChange={e => set('eventType', e.target.value)} required
                  style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="">Select event type</option>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Event Date *">
                <input
                  type="date" value={form.eventDate} required
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => set('eventDate', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
            </Row>
            <Row>
              <Field label="Expected Guests *">
                <input
                  type="number" placeholder="e.g. 200" min="1" value={form.guestCount} required
                  onChange={e => set('guestCount', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
              <Field label="Preferred Serving Style">
                <select value={form.servingStyle} onChange={e => set('servingStyle', e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="">Select style</option>
                  {SERVING_STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </Row>
          </SectionCard>

          <SectionCard icon="📍" title="Venue & Budget">
            <Row>
              <Field label="Venue / Hall Name">
                <input
                  type="text" placeholder="Venue or hall name (if known)" value={form.venue}
                  onChange={e => set('venue', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
              <Field label="City / Area">
                <input
                  type="text" placeholder="e.g. Visakhapatnam" value={form.city}
                  onChange={e => set('city', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#9AD983'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>
            </Row>
            <Field label="Approximate Budget Range">
              <select value={form.budget} onChange={e => set('budget', e.target.value)}
                style={{ ...inputStyle, appearance: 'auto' }}>
                <option value="">Select budget range</option>
                {BUDGETS.map(b => <option key={b}>{b}</option>)}
              </select>
            </Field>
          </SectionCard>

          <SectionCard icon="🍽️" title="Cuisine & Preferences">
            <Field label="Cuisine Preferences (select all that apply)">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CUISINE_OPTIONS.map(c => (
                  <button
                    key={c} type="button" onClick={() => toggleCuisine(c)}
                    style={{
                      padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
                      background: form.cuisines.includes(c) ? '#9AD983' : '#F5F5F5',
                      color: form.cuisines.includes(c) ? '#fff' : '#555',
                      boxShadow: form.cuisines.includes(c) ? '0 4px 12px rgba(154,217,131,0.35)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Menu Ideas / Special Dishes">
              <textarea
                rows={4}
                placeholder="Tell us about any specific dishes, live counters, theme ideas, or cuisine requirements..."
                value={form.preferences}
                onChange={e => set('preferences', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#9AD983'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>
            <Field label="Special Requirements / Additional Notes">
              <textarea
                rows={4}
                placeholder="Any dietary restrictions, VIP arrangements, decor coordination, puja setup needs, or anything else we should know..."
                value={form.specialRequirements}
                onChange={e => set('specialRequirements', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#9AD983'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </Field>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              width: '100%', padding: '18px', borderRadius: 50,
              background: status === 'sending' ? '#C5EBB5' : '#9AD983',
              border: 'none', color: '#fff', fontWeight: 800, fontSize: '1.05rem',
              cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: 0.3,
              boxShadow: '0 8px 28px rgba(154,217,131,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s',
            }}
          >
            {status === 'sending' ? (
              <>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Sending Request...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Submit Consultation Request
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Your details are private and used only to plan your event.
          </p>
        </form>
      </div>

      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
