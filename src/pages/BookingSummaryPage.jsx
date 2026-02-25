import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

const SERVING_LABELS = { BUFFET: 'Buffet', BANANA_LEAF: 'Banana Leaf', BOX_LUNCH: 'Box Lunch' }

export default function BookingSummaryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step1, setStep1] = useState(null)
  const [step2Items, setStep2Items] = useState([])
  const [special, setSpecial] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    const s2 = sessionStorage.getItem('bookingStep2')
    if (!s1 || !s2) { navigate('/booking'); return }
    setStep1(JSON.parse(s1))
    setStep2Items(JSON.parse(s2))
  }, [navigate])

  const pricePerPerson = useMemo(() => step2Items.reduce((s, i) => s + i.price, 0), [step2Items])
  const baseTotal = pricePerPerson * (step1?.guestCount || 0)
  const discount = couponData?.discount || 0
  const gst = (baseTotal - discount) * 0.05
  const total = baseTotal - discount + gst

  const grouped = useMemo(() => {
    const map = {}
    step2Items.forEach(item => {
      const cat = item.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(item)
    })
    return map
  }, [step2Items])

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await api.post('/coupon/validate', { code: couponCode, orderValue: baseTotal })
      if (data.valid) { setCouponData(data); toast.success(data.message) }
      else { toast.error(data.message); setCouponData(null) }
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  async function handlePay() {
    if (!user && (!guestInfo.name || !guestInfo.phone)) {
      toast.error('Please enter your name and phone number')
      return
    }
    setLoading(true)
    try {
      const payload = {
        eventType: step1.eventType, eventDate: step1.eventDate,
        guestCount: step1.guestCount, venueAddress: step1.venueAddress,
        servingStyle: step1.servingStyle, menuItemIds: step2Items.map(i => i.id),
        specialInstructions: special,
        couponCode: couponData ? couponCode : undefined,
        guestName: user?.name || guestInfo.name,
        guestEmail: user?.email || guestInfo.email,
        guestPhone: user?.phone || guestInfo.phone,
      }
      const { data } = await api.post('/booking', payload)
      toast.success('Booking confirmed!')
      sessionStorage.removeItem('bookingStep1')
      sessionStorage.removeItem('bookingStep2')
      navigate(`/booking/success?id=${data.bookingId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!step1) return null

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <Link to="/booking/menu-builder" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Review & Confirm</span>
        <span className="booking-step-label">Step 3 / 3</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '100%' }} />
      </div>

      <div className="booking-body">

        {/* Event Details */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Event Details</h3>
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

        {/* Menu Summary */}
        <div className="summary-card">
          <h3 className="summary-card-title">
            <i className="fa-solid fa-bowl-rice" style={{ marginRight: 8 }} />
            Selected Menu <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>({step2Items.length} items)</span>
          </h3>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{cat}</p>
              {items.map(item => (
                <div key={item.id} className="summary-row" style={{ padding: '6px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'VEG' ? '#4caf70' : '#e05c5c', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-warm)', fontSize: '0.85rem' }}>{item.name}</span>
                  </div>
                  <span style={{ color: 'var(--gold)', fontSize: '0.78rem', fontFamily: 'var(--font-display)' }}>₹{item.price}/pp</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-note-sticky" style={{ marginRight: 8 }} />Special Instructions</h3>
          <textarea
            value={special} onChange={e => setSpecial(e.target.value)} rows={3}
            placeholder="Dietary restrictions, special requests, or any notes…"
            className="booking-input" style={{ resize: 'vertical' }}
          />
        </div>

        {/* Coupon */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-tag" style={{ marginRight: 8 }} />Coupon Code</h3>
          <div className="coupon-row">
            <input
              value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. WELCOME10)"
              className="booking-input" style={{ flex: 1 }}
            />
            <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} className="btn btn-outline">
              {couponLoading ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Apply'}
            </button>
          </div>
          {couponData && (
            <p style={{ color: '#4caf70', fontSize: '0.82rem', marginTop: 8 }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: 5 }} />{couponData.message}
            </p>
          )}
        </div>

        {/* Guest Info (if not logged in) */}
        {!user && (
          <div className="summary-card">
            <h3 className="summary-card-title"><i className="fa-solid fa-user" style={{ marginRight: 8 }} />Contact Details</h3>
            {[
              { key: 'name', label: 'Full Name *', type: 'text', placeholder: 'Your name' },
              { key: 'email', label: 'Email (optional)', type: 'email', placeholder: 'your@email.com' },
              { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '9876543210' },
            ].map(f => (
              <div className="field-block" key={f.key}>
                <label className="field-label">{f.label}</label>
                <input type={f.type} value={guestInfo[f.key]} placeholder={f.placeholder}
                  onChange={e => setGuestInfo(g => ({ ...g, [f.key]: e.target.value }))}
                  className="booking-input" />
              </div>
            ))}
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <Link to="/login" style={{ color: 'var(--gold)' }}>Sign in</Link> to auto-fill your details and track bookings.
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="summary-card">
          <h3 className="summary-card-title"><i className="fa-solid fa-receipt" style={{ marginRight: 8 }} />Price Breakdown</h3>
          <div className="price-row">
            <span className="lbl">Base Total ({step1.guestCount} guests × ₹{pricePerPerson}/pp)</span>
            <span className="val">₹{baseTotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="price-row discount">
              <span className="lbl">Discount ({couponCode})</span>
              <span className="val">−₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="price-row">
            <span className="lbl">GST (5%)</span>
            <span className="val">₹{Math.round(gst).toLocaleString('en-IN')}</span>
          </div>
          <div className="price-total">
            <span className="lbl">Grand Total</span>
            <span className="val">₹{Math.round(total).toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Fixed CTA */}
      <div className="booking-fixed-bar">
        <div className="booking-fixed-inner">
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Grand Total</p>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.3rem' }}>
              ₹{Math.round(total).toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={handlePay} disabled={loading} className="btn btn-primary">
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Processing…</>
              : <><i className="fa-solid fa-lock" /> Confirm Booking</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
