import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'

export default function PaymentPlanPage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, pricing, guestInfo, setGuestInfo, setPaymentPlan, paymentPlan, getBookingPayload, resetBooking } = useBookingStore()

  const [payPlan, setPayPlan] = useState(paymentPlan || 'FULL')
  const [contact, setContact] = useState({ name: guestInfo.name || '', email: guestInfo.email || '', phone: guestInfo.phone || '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('padma_user') || '{}')
      if (u.name && !contact.name) setContact({ name: u.name || '', email: u.email || '', phone: u.phone || '' })
    } catch {}
  }, [])

  if (!pricing.total || !menuPreferences.selectedPackage) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: 15 }}>Please complete your booking setup first.</p>
          <Link to="/setup" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 15 }}>Start Over</Link>
        </div>
      </div>
    )
  }

  const total = pricing.total
  const advanceAmt = Math.round(total * 0.5)
  const payAmt = payPlan === 'FULL' ? total : advanceAmt

  async function handleConfirm() {
    if (!contact.name.trim()) { toast.error('Please enter your name'); return }
    if (!contact.phone.trim()) { toast.error('Please enter your phone number'); return }
    setLoading(true)
    try {
      setGuestInfo(contact)
      setPaymentPlan(payPlan)
      const token = localStorage.getItem('padma_token')
      const payload = { ...getBookingPayload(), guestName: contact.name, guestEmail: contact.email, guestPhone: contact.phone, paymentPlan: payPlan }
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

  const ioInput = {
    width: '100%', padding: '13px 16px', fontFamily: 'var(--font)', fontSize: 17,
    background: 'var(--fill-tertiary)', border: 'none', borderRadius: 'var(--r)',
    color: 'var(--heading)', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div className="page-outer">
      <style>{'@keyframes spin{to{transform:rotate(360deg)}} @media(min-width:900px){.checkout-grid{display:grid!important;grid-template-columns:1fr 420px;gap:40px;align-items:start;}}'}</style>

      {/* Page header */}
      <div style={{ borderBottom: '0.5px solid var(--separator-nm)', padding: '20px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--heading)', margin: 0, letterSpacing: '-0.02em' }}>Checkout</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: '4px 0 0' }}>Review your order and confirm booking</p>
        </div>
      </div>

      <div className="page-inner">
        <div className="checkout-grid">

          {/* ── LEFT COLUMN: Summary + Contact ── */}
          <div>
            <p className="ios-section-header" style={{ marginTop: 0 }}>Order Summary</p>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              {[
                ['Package', menuPreferences.selectedPackage?.name || '—'],
                ['Event Date', eventDetails.eventDate || '—'],
                ['Time Slot', eventDetails.timeSlot || '—'],
                ['Guests', eventDetails.guestCount ? `${eventDetails.guestCount} guests` : '—'],
              ].map(([lbl, val], i, arr) => (
                <div key={lbl} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 18px', minHeight: 48,
                  borderBottom: i < arr.length - 1 ? '0.5px solid var(--separator-nm)' : 'none',
                }}>
                  <span style={{ fontSize: 15, color: 'var(--muted)' }}>{lbl}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)', textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 18px', borderTop: '0.5px solid var(--separator-nm)',
                background: 'rgba(52,199,89,0.04)',
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--heading)' }}>Total</span>
                <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="ios-section-header">Your Contact Details</p>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name', required: true },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210', required: true },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'For order confirmation (optional)', required: false },
              ].map((field, i, arr) => (
                <div key={field.key} style={{
                  borderBottom: i < arr.length - 1 ? '0.5px solid var(--separator-nm)' : 'none',
                  padding: '10px 18px',
                }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>
                    {field.label}{field.required && <span style={{ color: 'var(--ios-red)' }}> *</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={contact[field.key]}
                    onChange={e => setContact(c => ({ ...c, [field.key]: e.target.value }))}
                    style={{ ...ioInput, padding: '6px 0', background: 'transparent', fontSize: 16 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Payment plan + confirm ── */}
          <div className="d-sticky">
            <p className="ios-section-header" style={{ marginTop: 0 }}>Payment Plan</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>

              <div onClick={() => setPayPlan('FULL')} style={{
                background: payPlan === 'FULL' ? 'var(--primary)' : 'var(--bg)',
                borderRadius: 'var(--r-md)', padding: '18px', cursor: 'pointer',
                boxShadow: payPlan === 'FULL' ? 'var(--shadow-green)' : 'var(--shadow-sm)',
                border: `1.5px solid ${payPlan === 'FULL' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s var(--ease)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: payPlan === 'FULL' ? '#fff' : 'var(--heading)', margin: 0 }}>Full Payment</p>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: payPlan === 'FULL' ? 'rgba(255,255,255,0.22)' : 'rgba(255,204,0,0.2)', color: payPlan === 'FULL' ? '#fff' : '#856404' }}>Recommended</span>
                    </div>
                    <p style={{ fontSize: 13, color: payPlan === 'FULL' ? 'rgba(255,255,255,0.75)' : 'var(--muted)', margin: 0 }}>Pay once · confirmed instantly</p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 16 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: payPlan === 'FULL' ? '#fff' : 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>₹{total.toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: 11, color: payPlan === 'FULL' ? 'rgba(255,255,255,0.65)' : 'var(--muted)', margin: 0, marginTop: 2 }}>full amount</p>
                  </div>
                </div>
              </div>

              <div onClick={() => setPayPlan('ADVANCE')} style={{
                background: payPlan === 'ADVANCE' ? 'var(--primary)' : 'var(--bg)',
                borderRadius: 'var(--r-md)', padding: '18px', cursor: 'pointer',
                boxShadow: payPlan === 'ADVANCE' ? 'var(--shadow-green)' : 'var(--shadow-sm)',
                border: `1.5px solid ${payPlan === 'ADVANCE' ? 'var(--primary)' : 'transparent'}`,
                transition: 'all 0.2s var(--ease)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: payPlan === 'ADVANCE' ? '#fff' : 'var(--heading)', margin: '0 0 4px' }}>50% Advance</p>
                    <p style={{ fontSize: 13, color: payPlan === 'ADVANCE' ? 'rgba(255,255,255,0.75)' : 'var(--muted)', margin: 0 }}>Pay half now · rest before event</p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 16 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: payPlan === 'ADVANCE' ? '#fff' : 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>₹{advanceAmt.toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: 11, color: payPlan === 'ADVANCE' ? 'rgba(255,255,255,0.65)' : 'var(--muted)', margin: 0, marginTop: 2 }}>+₹{(total - advanceAmt).toLocaleString('en-IN')} later</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'rgba(0,122,255,0.07)', borderRadius: 'var(--r-md)', border: '0.5px solid rgba(0,122,255,0.18)', marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ios-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: 'var(--ios-blue)', fontSize: 13, lineHeight: 1.5 }}>
                Our team will contact you within 2 hours to collect payment and confirm your booking.
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: '100%', padding: '17px', borderRadius: 'var(--r-pill)',
                background: loading ? 'var(--primary-light)' : 'var(--primary)',
                border: 'none', color: '#fff', fontWeight: 600, fontSize: 17,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
                boxShadow: loading ? 'none' : 'var(--shadow-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s var(--ease)', letterSpacing: '-0.01em',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Processing...
                </>
              ) : (
                `Confirm Booking · ₹${payAmt.toLocaleString('en-IN')}`
              )}
            </button>

            <Link to="/menu" style={{ display: 'block', textAlign: 'center', marginTop: 14, color: 'var(--muted)', fontSize: 14 }}>
              ← Back to Menu
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
