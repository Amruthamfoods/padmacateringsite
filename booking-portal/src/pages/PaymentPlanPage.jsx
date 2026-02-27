import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'

export default function PaymentPlanPage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, pricing, guestInfo, setGuestInfo, setPaymentPlan, paymentPlan, getBookingPayload, resetBooking } = useBookingStore()

  const [payPlan,  setPayPlan]  = useState(paymentPlan || 'FULL')
  const [contact,  setContact]  = useState({ name: guestInfo.name || '', email: guestInfo.email || '', phone: guestInfo.phone || '' })
  const [loading,  setLoading]  = useState(false)

  // Pre-fill from auth
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('padma_user') || '{}')
      if (u.name && !contact.name) {
        setContact({ name: u.name || '', email: u.email || '', phone: u.phone || '' })
      }
    } catch {}
  }, [])

  // Guard: must have pricing and menu
  if (!pricing.total || !menuPreferences.selectedPackage) {
    return (
      <div className="booking-page-wrap">
        <BookingSteps />
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Please complete your booking setup first.</p>
          <Link to="/setup" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" /> Start Over
          </Link>
        </div>
      </div>
    )
  }

  const total      = pricing.total
  const advanceAmt = Math.round(total * 0.5)
  const payAmt     = payPlan === 'FULL' ? total : advanceAmt

  async function handleConfirm() {
    if (!contact.name.trim())  { toast.error('Please enter your name'); return }
    if (!contact.phone.trim()) { toast.error('Please enter your phone number'); return }

    setLoading(true)
    try {
      setGuestInfo(contact)
      setPaymentPlan(payPlan)

      const token   = localStorage.getItem('padma_token')
      const payload = {
        ...getBookingPayload(),
        guestName:  contact.name,
        guestEmail: contact.email,
        guestPhone: contact.phone,
        paymentPlan: payPlan,
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/booking', payload, { headers })

      toast.success('Booking confirmed!')
      resetBooking()
      navigate(`/success?id=${data.bookingId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-page-wrap">
      <BookingSteps />

      <div className="booking-center" style={{ paddingBottom: 60 }}>
        <h1 className="booking-page-title">Payment & Confirmation</h1>
        <p className="booking-page-sub">Enter your contact details and choose a payment plan.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Contact + payment plan ── */}
          <div>
            {/* Contact details */}
            <div className="form-section">
              <div className="form-section-header">
                <i className="fa-solid fa-user" /> Your Contact Details
              </div>
              <div className="form-section-body">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label"><i className="fa-solid fa-user" /> Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your full name"
                      value={contact.name}
                      onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label"><i className="fa-solid fa-phone" /> Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={contact.phone}
                      onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-field form-grid-full">
                    <label className="form-label"><i className="fa-solid fa-envelope" /> Email (optional)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Confirmation will be sent here"
                      value={contact.email}
                      onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment plan */}
            <div className="form-section">
              <div className="form-section-header">
                <i className="fa-solid fa-wallet" /> Payment Plan
              </div>
              <div className="form-section-body">
                <div className="payment-cards">
                  {/* Full Payment */}
                  <div
                    className={`payment-option ${payPlan === 'FULL' ? 'selected' : ''}`}
                    onClick={() => setPayPlan('FULL')}
                  >
                    <div className="payment-option-check">
                      {payPlan === 'FULL' && <i className="fa-solid fa-check" style={{ fontSize: '0.7rem' }} />}
                    </div>
                    <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 50, background: '#FEF3C7', color: '#92400E', fontSize: '0.68rem', fontWeight: 700, marginBottom: 8 }}>
                      ⭐ Recommended
                    </div>
                    <h4>Full Payment</h4>
                    <p>One-time payment. Quick and hassle-free booking confirmation.</p>
                    <div className="pay-amount">₹{total.toLocaleString('en-IN')}</div>
                  </div>

                  {/* 50% Advance */}
                  <div
                    className={`payment-option ${payPlan === 'ADVANCE' ? 'selected' : ''}`}
                    onClick={() => setPayPlan('ADVANCE')}
                  >
                    <div className="payment-option-check">
                      {payPlan === 'ADVANCE' && <i className="fa-solid fa-check" style={{ fontSize: '0.7rem' }} />}
                    </div>
                    <h4>50% Advance</h4>
                    <p>Pay half now, remaining balance before the event.</p>
                    <div className="pay-amount">₹{advanceAmt.toLocaleString('en-IN')} now</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      + ₹{(total - advanceAmt).toLocaleString('en-IN')} on event day
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: '#EFF6FF', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.83rem', marginTop: 8 }}>
                  <i className="fa-solid fa-circle-info" style={{ flexShrink: 0, marginTop: 2 }} />
                  After confirming, our team will contact you within 2 hours to verify details and collect payment.
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order total ── */}
          <div>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'sticky', top: 90 }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg-pink)', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-receipt" style={{ color: 'var(--red)' }} /> Order Total
              </div>
              <div style={{ padding: '16px 20px' }}>
                {/* Quick summary */}
                {[
                  ['Package',   menuPreferences.selectedPackage?.name || '—'],
                  ['Occasion',  eventDetails.occasion || '—'],
                  ['Date',      eventDetails.eventDate || '—'],
                  ['Guests',    eventDetails.guestCount ? `${eventDetails.guestCount} guests` : '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.83rem', gap: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total amount</span>
                  <span style={{ fontWeight: 700 }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                {pricing.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.88rem' }}>
                    <span style={{ color: '#28a745' }}>Coupon discount</span>
                    <span style={{ fontWeight: 700, color: '#28a745' }}>−₹{pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{payPlan === 'FULL' ? 'Paying now' : 'Advance (50%)'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--red)' }}>₹{payAmt.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.97rem', opacity: loading ? 0.7 : 1 }}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading
                    ? <><i className="fa-solid fa-circle-notch spin" style={{ marginRight: 6 }} />Processing…</>
                    : <>Confirm Booking · ₹{payAmt.toLocaleString('en-IN')} <i className="fa-solid fa-check" style={{ fontSize: '0.8rem' }} /></>
                  }
                </button>
              </div>
              <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--surface-2)' }}>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#28a745' }} />
                  Secure booking · Team contacts within 2 hours
                </p>
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: 24 }}>
          <Link to="/review" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back to Review
          </Link>
        </div>
      </div>
    </div>
  )
}
