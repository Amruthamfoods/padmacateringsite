import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

const SERVING_LABELS = { BUFFET: 'Buffet', BANANA_LEAF: 'Banana Leaf', BOX_LUNCH: 'Box Lunch' }

export default function QuoteFormPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step1, setStep1] = useState(null)
  const [items, setItems] = useState([])
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [special, setSpecial] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    const s2 = sessionStorage.getItem('bookingStep2')
    if (!s1 || !s2) { navigate('/custom/builder'); return }
    setStep1(JSON.parse(s1))
    setItems(JSON.parse(s2))
    if (user) {
      setContact({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
    }
  }, [navigate, user])

  const grouped = useMemo(() => {
    const map = {}
    items.forEach(item => {
      const cat = item.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(item)
    })
    return map
  }, [items])

  async function handleSubmit() {
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast.error('Name and phone are required')
      return
    }
    if (items.length < 1) {
      toast.error('No items selected')
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        eventType: step1.eventType,
        eventDate: step1.eventDate,
        guestCount: step1.guestCount,
        venueAddress: step1.venueAddress,
        servingStyle: step1.servingStyle,
        specialInstructions: special,
        selectedItems: items,
      }
      const { data } = await api.post('/quote', payload)
      toast.success('Quote request submitted!')
      sessionStorage.removeItem('bookingStep1')
      sessionStorage.removeItem('bookingStep2')
      navigate(`/success?type=quote&id=${data.quoteId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit quote request')
    } finally {
      setLoading(false)
    }
  }

  if (!step1) return null

  return (
    <div className="booking-page">
      <div className="booking-header">
        <Link to="/custom/builder" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Request a Quote</span>
        <span className="booking-step-label">Step 3</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '90%' }} />
      </div>

      <div className="booking-body">
        {/* Event Summary (read-only) */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Event Summary</h3>
          {[
            ['Event', step1.eventType],
            ['Date', step1.eventDate ? format(new Date(step1.eventDate + 'T00:00:00'), 'dd MMMM yyyy') : '—'],
            ['Guests', `${step1.guestCount} guests`],
            ['Venue', step1.venueAddress],
            ['Serving Style', SERVING_LABELS[step1.servingStyle]],
          ].map(([lbl, val]) => (
            <div key={lbl} className="summary-row">
              <span className="summary-lbl">{lbl}</span>
              <span className="summary-val">{val}</span>
            </div>
          ))}
        </div>

        {/* Selected Items (read-only, no prices) */}
        <div className="summary-card">
          <h3 className="summary-card-title">
            <i className="fa-solid fa-bowl-rice" style={{ marginRight: 8 }} />
            Selected Menu <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>({items.length} items)</span>
          </h3>
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{cat}</p>
              {catItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'VEG' ? '#4caf70' : '#e05c5c', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-warm)', fontSize: '0.85rem' }}>{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-user" style={{ marginRight: 8 }} />Contact Details</h3>
          {[
            { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
            { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '9876543210' },
          ].map(f => (
            <div className="field-block" key={f.key}>
              <label className="field-label">{f.label}</label>
              <input
                type={f.type}
                value={contact[f.key]}
                placeholder={f.placeholder}
                onChange={e => setContact(c => ({ ...c, [f.key]: e.target.value }))}
                className="booking-input"
              />
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-note-sticky" style={{ marginRight: 8 }} />Special Instructions</h3>
          <textarea
            value={special} onChange={e => setSpecial(e.target.value)} rows={3}
            placeholder="Dietary restrictions, special requests, or any other notes…"
            className="booking-input" style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <i className="fa-solid fa-clock" style={{ color: 'var(--gold)', marginRight: 6 }} />
          We'll review your menu and send a personalised quote within <strong style={{ color: 'var(--white)' }}>24 hours</strong>.
        </div>
      </div>

      <div className="booking-fixed-bar">
        <div className="booking-fixed-inner">
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Custom Quote</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
              {items.length} items · {step1.guestCount} guests
            </p>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Submitting…</>
              : <><i className="fa-solid fa-paper-plane" /> Submit Quote Request</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
