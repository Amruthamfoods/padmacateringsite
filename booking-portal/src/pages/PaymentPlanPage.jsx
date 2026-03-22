import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'
import AddressAutocomplete from '../components/AddressAutocomplete'

export default function PaymentPlanPage() {
  const navigate = useNavigate()
  const { eventDetails, setEventDetails, menuPreferences, pricing, guestInfo, setGuestInfo, setPaymentPlan, paymentPlan, getBookingPayload, resetBooking } = useBookingStore()

  const [payPlan, setPayPlan] = useState(paymentPlan || 'FULL')
  const [contact, setContact] = useState({ name: guestInfo.name || '', email: guestInfo.email || '', phone: guestInfo.phone || '' })
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('OFFLINE')
  const [venue, setVenue] = useState(eventDetails.venueAddress || '')
  const [venueConfirmed, setVenueConfirmed] = useState(!!(eventDetails.venueAddress))
  const [venueLat, setVenueLat] = useState(eventDetails.venueLat || null)
  const [venueLng, setVenueLng] = useState(eventDetails.venueLng || null)
  const { user: authUser, token: authToken } = useAuthStore()
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [calcingDelivery, setCalcingDelivery] = useState(false)
  const [deliveryMeta, setDeliveryMeta] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [addingNew, setAddingNew] = useState(false)
  const [acKey, setAcKey] = useState(0)

  useEffect(() => {
    if (!authToken) return
    api.get('/auth/me', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => {
        const u = r.data
        setContact(c => ({
          name: c.name || u.name || '',
          email: c.email || u.email || '',
          phone: c.phone || (u.phone ? u.phone.replace(/^91/, '') : ''),
        }))
      })
      .catch(() => {
        if (authUser?.name) setContact(c => ({
          name: c.name || authUser.name || '',
          email: c.email || authUser.email || '',
          phone: c.phone || '',
        }))
      })
  }, [])

  useEffect(() => {
    if (!authToken) return
    api.get('/booking/my-addresses', { headers: { Authorization: `Bearer ${authToken}` } })
      .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setSavedAddresses(r.data) })
      .catch(() => {})
  }, [authToken])

  // Validate stored venue on mount
  useEffect(() => {
    if (eventDetails.venueLat && eventDetails.venueLng && eventDetails.venueAddress) {
      calcDelivery(eventDetails.venueLat, eventDetails.venueLng).then(ok => {
        if (!ok) setVenueConfirmed(false)
      })
    }
  // eslint-disable-next-line
  }, [])

  async function calcDelivery(lat, lng) {
    if (!lat || !lng) return false
    setCalcingDelivery(true)
    try {
      const guestCount = eventDetails.guestCount || 0
      const { data } = await api.post('/delivery/calculate', { lat, lng, guestCount })
      setDeliveryMeta(data)
      if (data.outOfRange) {
        setDeliveryCharge(null); setVenue(''); setAcKey(k => k + 1); setVenueLat(null); setVenueLng(null)
        toast.error('Address is outside our delivery range (30 km from Visakhapatnam)')
        return false
      } else {
        setDeliveryCharge(data.charge || 0)
        return true
      }
    } catch {
      setDeliveryCharge(0); setDeliveryMeta(null)
      return false
    } finally {
      setCalcingDelivery(false)
    }
  }

  if (!pricing.total || !menuPreferences.selectedPackage) {
    return <Navigate to="/setup" replace />
  }

  const total = pricing.total - (pricing.deliveryCharge || 0) + (deliveryCharge ?? 0)
  const advanceAmt = Math.round(total * 0.5)
  const payAmt = payPlan === 'FULL' ? total : advanceAmt

  function loadRazorpay() {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async function handleConfirm() {
    if (!venue.trim()) { toast.error('Please enter your venue address'); return }
    if (deliveryMeta?.outOfRange) { toast.error('This location is outside our delivery range. Call +91 86 86 622 722'); return }
    if (!contact.name.trim()) { toast.error('Please enter your name'); return }
    if (!contact.phone.trim()) { toast.error('Please enter your phone number'); return }
    const _phone = contact.phone.replace(/\s/g, '').replace(/^\+?91/, '')
    if (!/^[6-9]\d{9}$/.test(_phone)) { toast.error('Please enter a valid 10-digit mobile number'); return }
    if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) { toast.error('Please enter a valid email address'); return }
    setLoading(true)
    try {
      // 1. Save event details to store
      setEventDetails({ ...eventDetails, venueAddress: venue.trim(), venueLat, venueLng })
      setGuestInfo(contact)
      setPaymentPlan(payPlan)

      // 2. Create booking (status=PENDING, payment pending)
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
      const payload = { ...getBookingPayload(), guestName: contact.name, guestEmail: contact.email, guestPhone: contact.phone, paymentPlan: payPlan }
      const { data: bookingData } = await api.post('/booking', payload, { headers })
      const bookingId = bookingData.bookingId

      // 3. Create Razorpay order (amount in paise)
      const amtPaise = payAmt * 100
      const { data: orderData } = await api.post('/payment/create-order', {
        amount: amtPaise,
        notes: { bookingId: String(bookingId), name: contact.name, phone: contact.phone },
      })

      // 4. Load Razorpay checkout script
      const loaded = await loadRazorpay()
      if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.')
        setLoading(false)
        return
      }

      // 5. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Amrutham by Padma Catering',
        description: `Booking #${bookingId}`,
        image: '/img/amrutham-logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: contact.name,
          contact: contact.phone,
          email: contact.email || '',
        },
        theme: { color: '#5C9E3E' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            })
            toast.success('Payment successful! Booking confirmed.')
            resetBooking()
            navigate(`/success?id=${bookingId}`)
          } catch {
            toast.error('Payment received but verification pending. We will confirm within 2 hours.')
            resetBooking()
            navigate(`/success?id=${bookingId}`)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled. You can retry or choose "Cash / Call" instead.', { icon: 'ℹ️' })
          },
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      const errMsg = err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Booking failed. Please try again.'
      console.error('Booking error:', err.response?.data)
      toast.error(errMsg, { duration: 6000 })
      setLoading(false)
    }
  }

  async function handleOfflineBooking() {
    if (!venue.trim()) { toast.error('Please enter your venue address'); return }
    if (deliveryMeta?.outOfRange) { toast.error('This location is outside our delivery range. Call +91 86 86 622 722'); return }
    if (!contact.name.trim()) { toast.error('Please enter your name'); return }
    if (!contact.phone.trim()) { toast.error('Please enter your phone number'); return }
    const _phone = contact.phone.replace(/\s/g, '').replace(/^\+?91/, '')
    if (!/^[6-9]\d{9}$/.test(_phone)) { toast.error('Please enter a valid 10-digit mobile number'); return }
    if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) { toast.error('Please enter a valid email address'); return }
    setLoading(true)
    try {
      setEventDetails({ ...eventDetails, venueAddress: venue.trim(), venueLat, venueLng })
      setGuestInfo(contact)
      setPaymentPlan(payPlan)
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
      const payload = { ...getBookingPayload(), guestName: contact.name, guestEmail: contact.email, guestPhone: contact.phone, paymentPlan: payPlan }
      const { data: bookingData } = await api.post('/booking', payload, { headers })
      toast.success('Booking placed! Our team will call you to confirm.')
      resetBooking()
      navigate(`/success?id=${bookingData.bookingId}`)
    } catch (err) {
      const errMsg = err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Booking failed. Please try again.'
      toast.error(errMsg, { duration: 6000 })
    } finally { setLoading(false) }
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
            {/* Venue Address Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p className="ios-section-header" style={{ marginTop: 0, marginBottom: 0 }}>Venue Address</p>
              {venueConfirmed && venue && (
                <button
                  onClick={() => { setVenueConfirmed(false); setAddingNew(false) }}
                  style={{ fontSize: '0.78rem', color: 'var(--primary)', background: 'none', border: '1px solid var(--primary-light)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <i className="fa-solid fa-pen" style={{ marginRight: 5 }} />Edit
                </button>
              )}
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 24, padding: '12px 18px' }}>

              {venueConfirmed && venue ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 0' }}>
                  <i className="fa-solid fa-map-pin" style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: 'var(--heading)', lineHeight: 1.5 }}>{venue}</span>
                </div>
              ) : !authUser ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <i className="fa-solid fa-user-lock" style={{ fontSize: 28, color: 'var(--muted)', marginBottom: 10, display: 'block' }} />
                  <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 12px' }}>Log in to use saved addresses, or search your venue below</p>
                  {!addingNew ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        onClick={() => { window.location.href = '/booking/login?redirect=/booking/payment' }}
                        style={{ padding: '11px 0', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                      >
                        Log in to continue
                      </button>
                      <button
                        onClick={() => setAddingNew(true)}
                        style={{ padding: '10px 0', background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary-light)', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                      >
                        Continue as guest
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setAddingNew(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
                      >
                        <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
                        Back
                      </button>
                      <AddressAutocomplete key={acKey}
                        label="Delivery / Event Venue"
                        required
                        value={venue}
                        placeholder="Search your venue address..."
                        onSelect={async ({ address, lat, lng }) => {
                          setVenue(address); setVenueLat(lat); setVenueLng(lng);
                          const ok = await calcDelivery(lat, lng); if (ok) setVenueConfirmed(true);
                        }}
                        style={{ width: '100%', padding: '8px 0', fontFamily: 'var(--font)', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: 'var(--heading)', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                </div>
              ) : savedAddresses.length > 0 && !addingNew ? (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 10px', fontWeight: 500 }}>Recent addresses</p>
                  {savedAddresses.map((addr, i) => (
                    <button
                      key={addr.id || i}
                      onClick={async () => {
                        setVenue(addr.address || addr);
                        setVenueLat(addr.lat || null); setVenueLng(addr.lng || null);
                        if (addr.lat && addr.lng) { const ok = await calcDelivery(addr.lat, addr.lng); if (ok) setVenueConfirmed(true) }
                        else { setDeliveryCharge(0); setDeliveryMeta(null); setVenueConfirmed(true) }
                      }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                        padding: '11px 12px', marginBottom: i < savedAddresses.length - 1 ? 6 : 0,
                        background: 'var(--fill-tertiary)', border: '1.5px solid transparent',
                        borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--muted)', marginTop: 2, flexShrink: 0, fontSize: 13 }} />
                      <div>
                        {(addr.label) && <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{addr.label}</p>}
                        <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{addr.address || addr}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => setAddingNew(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 12px', width: '100%', background: 'transparent', border: '1.5px dashed var(--primary-light)', borderRadius: 10, color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: 12 }} />
                    Use a different address
                  </button>
                </div>
              ) : (
                <div>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setAddingNew(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
                    >
                      <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
                      Back to saved addresses
                    </button>
                  )}
                  <AddressAutocomplete key={acKey}
                    label="Delivery / Event Venue"
                    required
                    value={venue}
                    placeholder="Search your venue address..."
                    onSelect={async ({ address, lat, lng }) => {
                      setVenue(address); setVenueLat(lat); setVenueLng(lng);
                      const ok = await calcDelivery(lat, lng); if (ok) setVenueConfirmed(true);
                    }}
                    style={{ width: '100%', padding: '8px 0', fontFamily: 'var(--font)', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: 'var(--heading)', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {calcingDelivery && <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Calculating delivery charge...</p>}
              {!calcingDelivery && deliveryMeta?.outOfRange && (
                <div style={{ margin: '10px 0 0', padding: '16px', background: 'rgba(244,67,54,0.07)', borderRadius: 12, border: '1.5px solid rgba(244,67,54,0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(244,67,54,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#d32f2f', margin: 0 }}>Not Serviceable</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>This location is outside our Visakhapatnam delivery area</p>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(244,67,54,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12.5, color: '#c62828', fontWeight: 500, margin: '0 0 6px' }}>We currently serve within 30 km of Visakhapatnam city centre.</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>For outstation events, call us directly:</p>
                    <a href="tel:+918686622722" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#d32f2f', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 13a16 16 0 006.29 6.29l.61-1.09a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                      +91 86 86 622 722
                    </a>
                  </div>
                </div>
              )}
              {!calcingDelivery && !deliveryMeta?.outOfRange && deliveryCharge > 0 && (
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, margin: '6px 0 0' }}>
                  Delivery charge: ₹{deliveryCharge.toLocaleString('en-IN')} ({deliveryMeta?.distanceKm} km)
                </p>
              )}
              {!calcingDelivery && !deliveryMeta?.outOfRange && deliveryCharge === 0 && venue && (
                <p style={{ fontSize: 12, color: '#4caf50', margin: '4px 0 0' }}>
                  ✓ {deliveryMeta?.bulkSaving > 0 ? 'Free delivery for 100+ packs (up to 10km)' : 'Free delivery for this location'}
                  {deliveryMeta?.distanceKm ? ' (' + deliveryMeta.distanceKm + ' km)' : ''}
                </p>
              )}
              {!calcingDelivery && !deliveryMeta?.outOfRange && deliveryCharge > 0 && deliveryMeta?.bulkSaving > 0 && (
                <p style={{ fontSize: 12, color: '#4caf50', margin: '2px 0 0' }}>
                  ✓ 100+ packs: ₹300 off delivery applied
                </p>
              )}
            </div>

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
              {/* Service preference row with edit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', minHeight: 48, borderTop: '0.5px solid var(--separator-nm)' }}>
                <span style={{ fontSize: 15, color: 'var(--muted)' }}>Service Type</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>
                    {menuPreferences.servicePreference === 'Mealbox' ? 'Mealbox' : menuPreferences.servicePreference === 'PackedFood' ? 'Packed Food' : menuPreferences.servicePreference === 'Catering' ? 'Catering' : menuPreferences.servicePreference || '—'}
                  </span>
                  <Link to="/menu" state={{ openServiceModal: true }} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Edit</Link>
                </div>
              </div>
              {deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderTop: '0.5px solid var(--separator-nm)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Delivery ({deliveryMeta?.distanceKm} km)</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>+₹{deliveryCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 18px', borderTop: '0.5px solid var(--separator-nm)',
                background: 'var(--primary-bg)',
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

          {/* ── RIGHT COLUMN: Payment breakup + plan + confirm ── */}
          <div className="d-sticky">
            <p className="ios-section-header" style={{ marginTop: 0 }}>Price Breakup</p>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
              {/* Base food cost */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--heading)', fontWeight: 500 }}>Food (₹{pricing.pricePerPerson}/person × {eventDetails.guestCount})</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>Base package price</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{(pricing.basePrice || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Packing cost */}
              {pricing.packingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--heading)', fontWeight: 500 }}>Packing Charge</p>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{(pricing.packingCost).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Premium item addons */}
              {pricing.addonCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--heading)', fontWeight: 500 }}>Premium Items</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>Extra item charges</p>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{(pricing.addonCost).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Staff / Service charge */}
              {(pricing.staffCharge > 0 || pricing.staffChargeOriginal > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--heading)', fontWeight: 500 }}>Service Charge</p>
                    {pricing.staffCharge === 0 && pricing.staffChargeOriginal > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#4caf50', fontWeight: 600 }}>Free for 100+ guests</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {pricing.staffCharge === 0 && pricing.staffChargeOriginal > 0 ? (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through', marginRight: 6 }}>₹{(pricing.staffChargeOriginal).toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#4caf50' }}>Free</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{(pricing.staffCharge).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)', background: 'var(--bg-light)' }}>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Subtotal</p>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{(pricing.subtotal || pricing.basePrice + pricing.packingCost + pricing.addonCost + pricing.staffCharge || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Coupon discount */}
              {pricing.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: '#4caf50', fontWeight: 500 }}>Coupon Discount</p>
                    {pricing.coupon && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{pricing.coupon}</p>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#4caf50' }}>−₹{(pricing.discount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* GST — CGST 2.5% + SGST 2.5% */}
              {pricing.gst > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px 4px', borderBottom: 'none' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>CGST @ 2.5%</p>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>₹{Math.round(pricing.gst / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 18px 10px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>SGST @ 2.5%</p>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>₹{(pricing.gst - Math.round(pricing.gst / 2)).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              {/* Delivery */}
              {deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--heading)', fontWeight: 500 }}>Delivery</p>
                    {deliveryMeta?.distanceKm && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{deliveryMeta.distanceKm} km from Ushodaya Junction</p>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)' }}>₹{deliveryCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              {deliveryCharge === 0 && venue && !deliveryMeta?.outOfRange && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#4caf50', fontWeight: 500 }}>Delivery</p>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#4caf50' }}>Free</span>
                </div>
              )}

              {/* Grand total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: 'var(--primary-bg)' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--heading)' }}>Total</p>
                <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="ios-section-header">Payment Method</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div onClick={() => setPaymentMethod('OFFLINE')} style={{
                flex: 1, padding: '14px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                background: paymentMethod === 'OFFLINE' ? 'var(--primary)' : 'var(--bg)',
                border: `1.5px solid ${paymentMethod === 'OFFLINE' ? 'var(--primary)' : 'var(--separator-nm)'}`,
                boxShadow: paymentMethod === 'OFFLINE' ? 'var(--shadow-green)' : 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <i className="fa-solid fa-phone" style={{ color: paymentMethod === 'OFFLINE' ? '#fff' : 'var(--primary)', fontSize: 14 }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: paymentMethod === 'OFFLINE' ? '#fff' : 'var(--heading)' }}>Cash / Call</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: paymentMethod === 'OFFLINE' ? 'rgba(255,255,255,0.8)' : 'var(--muted)', lineHeight: 1.4 }}>We’ll call to confirm &amp; collect</p>
              </div>
              <div onClick={() => setPaymentMethod('ONLINE')} style={{
                flex: 1, padding: '14px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                background: paymentMethod === 'ONLINE' ? 'var(--primary)' : 'var(--bg)',
                border: `1.5px solid ${paymentMethod === 'ONLINE' ? 'var(--primary)' : 'var(--separator-nm)'}`,
                boxShadow: paymentMethod === 'ONLINE' ? 'var(--shadow-green)' : 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <i className="fa-solid fa-credit-card" style={{ color: paymentMethod === 'ONLINE' ? '#fff' : 'var(--primary)', fontSize: 14 }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: paymentMethod === 'ONLINE' ? '#fff' : 'var(--heading)' }}>Pay Online</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: paymentMethod === 'ONLINE' ? 'rgba(255,255,255,0.8)' : 'var(--muted)', lineHeight: 1.4 }}>UPI / Card / Net Banking</p>
              </div>
            </div>

            <p className="ios-section-header">Payment Plan</p>
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
              onClick={paymentMethod === 'ONLINE' ? handleConfirm : handleOfflineBooking}
              disabled={loading || !venueConfirmed || calcingDelivery || !!deliveryMeta?.outOfRange}
              style={{
                width: '100%', padding: '17px', borderRadius: 'var(--r-pill)',
                background: loading || deliveryMeta?.outOfRange ? 'var(--primary-light)' : 'var(--primary)',
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
              ) : deliveryMeta?.outOfRange ? (
                <><i className="fa-solid fa-ban" style={{ marginRight: 8 }} />Not Serviceable — Call +91 86 86 622 722</>
              ) : (
                paymentMethod === 'ONLINE'
                  ? `Pay ₹${payAmt.toLocaleString('en-IN')} Securely →`
                  : <><i className="fa-solid fa-check" />&nbsp; Confirm Booking — We’ll Call You</>
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
