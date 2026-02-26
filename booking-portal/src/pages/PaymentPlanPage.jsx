import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'

export default function PaymentPlanPage() {
  const navigate = useNavigate()
  const [payPlan, setPayPlan] = useState('FULL')
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [step1, setStep1]     = useState(null)
  const [step2, setStep2]     = useState(null)

  useEffect(() => {
    const s  = sessionStorage.getItem('priceSummary')
    const s1 = sessionStorage.getItem('bookingStep1')
    const s2 = sessionStorage.getItem('bookingStep2')
    if (!s || !s1 || !s2) { navigate('/'); return }
    setSummary(JSON.parse(s))
    setStep1(JSON.parse(s1))
    setStep2(JSON.parse(s2))
    // Pre-fill from stored user
    try {
      const u = JSON.parse(localStorage.getItem('padma_user') || '{}')
      if (u.name) setGuestInfo({ name: u.name || '', email: u.email || '', phone: u.phone || '' })
    } catch {}
  }, [navigate])

  if (!summary || !step1 || !step2) return null

  const advanceAmt = Math.round(summary.total * 0.5)
  const payAmt     = payPlan === 'FULL' ? summary.total : advanceAmt

  async function handleConfirm() {
    if (!guestInfo.name.trim() || !guestInfo.phone.trim()) {
      toast.error('Please enter your name and phone number')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('padma_token')
      const payload = {
        eventType:           step1.occasion,
        eventDate:           step1.eventDate,
        guestCount:          step1.guestCount,
        vegCount:            step1.vegCount,
        nonVegCount:         step1.nonVegCount,
        venueAddress:        step1.venueAddress,
        servingStyle:        'BUFFET',
        menuItemIds:         (step2.items || []).map(i => i.id),
        specialInstructions: step1.specialInstructions,
        guestName:           guestInfo.name,
        guestEmail:          guestInfo.email,
        guestPhone:          guestInfo.phone,
        packageId:           step2.packageId,
        pricePerPerson:      step2.tierPrice,
        deliveryType:        step1.deliveryType,
        deliveryCharge:      step1.deliveryCharge,
        staffCount:          step1.staffCount,
        addonCost:           step2.addonCost,
        dietPreference:      sessionStorage.getItem('dietPreference') || 'NON_VEG',
        spiceLevel:          step1.spiceLevel,
        timeSlot:            step1.timeSlot,
        paymentPlan:         payPlan,
        totalAmount:         summary.total,
        couponCode:          summary.couponCode || undefined,
        couponId:            summary.couponId   || undefined,
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/booking', payload, { headers })
      toast.success('Booking confirmed!')
      ;['bookingStep1','bookingStep2','selectedPackage','dietPreference','priceSummary','bookingService'].forEach(k => sessionStorage.removeItem(k))
      navigate(`/success?id=${data.bookingId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="payment" />

      <div className="booking-center" style={{ paddingBottom: 60 }}>
        <h1 className="booking-page-title">Payment & Confirmation</h1>
        <p className="booking-page-sub">Almost there! Enter your contact details and choose a payment plan.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
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
                    <input type="text" className="form-input" placeholder="Your full name"
                      value={guestInfo.name} onChange={e => setGuestInfo(g => ({ ...g, name: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label className="form-label"><i className="fa-solid fa-phone" /> Phone Number *</label>
                    <input type="tel" className="form-input" placeholder="+91 98765 43210"
                      value={guestInfo.phone} onChange={e => setGuestInfo(g => ({ ...g, phone: e.target.value }))} />
                  </div>
                  <div className="form-field form-grid-full">
                    <label className="form-label"><i className="fa-solid fa-envelope" /> Email (optional)</label>
                    <input type="email" className="form-input" placeholder="Confirmation will be sent here"
                      value={guestInfo.email} onChange={e => setGuestInfo(g => ({ ...g, email: e.target.value }))} />
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
                  <div className={`payment-option ${payPlan === 'FULL' ? 'selected' : ''}`} onClick={() => setPayPlan('FULL')}>
                    <div className="payment-option-check">
                      {payPlan === 'FULL' && <i className="fa-solid fa-check" style={{ fontSize: '0.7rem' }} />}
                    </div>
                    <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 50, background: '#FEF3C7', color: '#92400E', fontSize: '0.68rem', fontWeight: 700, marginBottom: 8 }}>
                      ⭐ Recommended
                    </div>
                    <h4>Full Payment</h4>
                    <p>One-time payment. Quick and hassle-free confirmation.</p>
                    <div className="pay-amount">₹{summary.total.toLocaleString('en-IN')}</div>
                  </div>

                  <div className={`payment-option ${payPlan === 'ADVANCE' ? 'selected' : ''}`} onClick={() => setPayPlan('ADVANCE')}>
                    <div className="payment-option-check">
                      {payPlan === 'ADVANCE' && <i className="fa-solid fa-check" style={{ fontSize: '0.7rem' }} />}
                    </div>
                    <h4>50% Advance</h4>
                    <p>Pay half now, remaining balance before the event.</p>
                    <div className="pay-amount">₹{advanceAmt.toLocaleString('en-IN')} now</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      + ₹{(summary.total - advanceAmt).toLocaleString('en-IN')} on event day
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, padding: '12px 14px', background: '#EFF6FF', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.83rem', marginTop: 8 }}>
                  <i className="fa-solid fa-circle-info" style={{ flexShrink: 0, marginTop: 2 }} />
                  After confirming, our team will contact you within 2 hours to confirm availability and collect payment.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div>
            <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'sticky', top: 90 }}>
              <div style={{ padding: '16px 20px', background: 'var(--bg-pink)', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                <i className="fa-solid fa-receipt" style={{ marginRight: 8, color: 'var(--red)' }} /> Order Total
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total amount</span>
                  <span style={{ fontWeight: 700 }}>₹{summary.total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 16 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{payPlan === 'FULL' ? 'Paying now' : 'Advance (50%)'}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--red)' }}>₹{payAmt.toLocaleString('en-IN')}</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.97rem', opacity: loading ? 0.7 : 1 }}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading
                    ? <><i className="fa-solid fa-circle-notch" style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />Processing…</>
                    : <>Confirm Booking · ₹{payAmt.toLocaleString('en-IN')} <i className="fa-solid fa-check" style={{ fontSize: '0.8rem' }} /></>
                  }
                </button>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--surface-2)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#28a745' }} />
                  Secure booking · Team contacts within 2 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link to="/summary" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back to Summary
          </Link>
        </div>
      </div>
    </div>
  )
}
