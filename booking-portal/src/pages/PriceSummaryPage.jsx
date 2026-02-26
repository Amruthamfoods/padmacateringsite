import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'

const DELIVERY_LABELS = { GATE: 'Gate Delivery', DOORSTEP: 'Doorstep', DOORSTEP_SERVICE: 'Doorstep + Service' }

export default function PriceSummaryPage() {
  const navigate = useNavigate()
  const [step1, setStep1]   = useState(null)
  const [step2, setStep2]   = useState(null)
  const [pkg, setPkg]       = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [showItems, setShowItems] = useState(false)

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    const s2 = sessionStorage.getItem('bookingStep2')
    const sp = sessionStorage.getItem('selectedPackage')
    if (!s1 || !s2) { navigate('/'); return }
    setStep1(JSON.parse(s1))
    setStep2(JSON.parse(s2))
    if (sp) setPkg(JSON.parse(sp))
  }, [navigate])

  const pb = useMemo(() => {
    if (!step1 || !step2) return null
    const tierPrice    = step2.tierPrice || 0
    const guestCount   = step1.guestCount || 0
    const baseFoodCost = tierPrice * guestCount
    const packingCost  = Math.round(tierPrice * 0.10 * guestCount)
    const addonCost    = step2.addonCost || 0
    const deliveryCost = step1.deliveryCharge || 0
    const staffCost    = (step1.staffCount || 0) * 650
    const subtotal     = baseFoodCost + packingCost + addonCost + deliveryCost + staffCost
    const discount     = couponData?.discount || 0
    const gst          = Math.round((subtotal - discount) * 0.05)
    const total        = subtotal - discount + gst
    return { tierPrice, guestCount, baseFoodCost, packingCost, addonCost, deliveryCost, staffCost, subtotal, discount, gst, total }
  }, [step1, step2, couponData])

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await api.post('/coupon/validate', { code: couponCode, orderValue: pb?.subtotal || 0 })
      if (data.valid) { setCouponData(data); toast.success(data.message) }
      else { toast.error(data.message); setCouponData(null) }
    } catch { toast.error('Failed to validate coupon') }
    finally { setCouponLoading(false) }
  }

  if (!step1 || !step2 || !pb) return null

  const grouped = {}
  ;(step2.items || []).forEach(item => {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="price" />

      <div className="booking-center" style={{ paddingBottom: 100 }}>
        <h1 className="booking-page-title">Order Summary</h1>
        <p className="booking-page-sub">Review your booking details before proceeding to payment.</p>

        <div className="summary-layout">
          {/* Left: Details */}
          <div>
            {/* Event card */}
            <div className="summary-card">
              <div className="summary-card-header">
                <i className="fa-solid fa-calendar-check" /> Event Details
              </div>
              <div className="summary-card-body">
                <div className="price-row">
                  <span className="label">Occasion</span>
                  <span className="value">{step1.occasion}</span>
                </div>
                <div className="price-row">
                  <span className="label">Date</span>
                  <span className="value">{step1.eventDate}</span>
                </div>
                <div className="price-row">
                  <span className="label">Time Slot</span>
                  <span className="value">{step1.timeSlot}</span>
                </div>
                <div className="price-row">
                  <span className="label">Guests</span>
                  <span className="value">{step1.guestCount} ({step1.vegCount} veg · {step1.nonVegCount} non-veg)</span>
                </div>
                <div className="price-row">
                  <span className="label">Venue</span>
                  <span className="value" style={{ maxWidth: '60%', textAlign: 'right' }}>{step1.venueAddress}</span>
                </div>
                <div className="price-row">
                  <span className="label">Delivery</span>
                  <span className="value">{DELIVERY_LABELS[step1.deliveryType] || 'Gate Delivery'}</span>
                </div>
                <div className="price-row">
                  <span className="label">Spice Level</span>
                  <span className="value">{step1.spiceLevel}</span>
                </div>
              </div>
            </div>

            {/* Menu card */}
            <div className="summary-card">
              <div className="summary-card-header" style={{ cursor: 'pointer' }} onClick={() => setShowItems(!showItems)}>
                <i className="fa-solid fa-utensils" /> Menu — {pkg?.name || step2.packageName}
                <i className={`fa-solid fa-chevron-${showItems ? 'up' : 'down'}`} style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.82rem' }} />
              </div>
              {showItems && (
                <div className="summary-card-body">
                  {Object.entries(grouped).map(([cat, items]) => (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{cat}</p>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'VEG' ? '#28a745' : '#E53E3E', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {!showItems && (
                <div className="summary-card-body" style={{ padding: '10px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {step2.items?.length || 0} items selected · Click to expand
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="summary-card">
              <div className="summary-card-header">
                <i className="fa-solid fa-tag" /> Coupons & Offers
              </div>
              <div className="summary-card-body">
                <div className="coupon-row">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                    {couponLoading ? <i className="fa-solid fa-circle-notch" style={{ animation: 'spin 1s linear infinite' }} /> : 'Apply'}
                  </button>
                </div>
                {couponData && (
                  <p style={{ color: '#28a745', fontSize: '0.83rem', marginTop: 10, fontWeight: 600 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} />{couponData.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Price breakdown */}
          <div>
            <div className="summary-card" style={{ position: 'sticky', top: 90 }}>
              <div className="summary-card-header">
                <i className="fa-solid fa-receipt" /> Price Breakdown
              </div>
              <div className="summary-card-body">
                <div className="price-row">
                  <span className="label">Food cost ({pb.guestCount} × ₹{pb.tierPrice})</span>
                  <span className="value">₹{pb.baseFoodCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row">
                  <span className="label">Packing charges (10%)</span>
                  <span className="value">₹{pb.packingCost.toLocaleString('en-IN')}</span>
                </div>
                {pb.addonCost > 0 && (
                  <div className="price-row">
                    <span className="label">Cutlery & essentials</span>
                    <span className="value">₹{pb.addonCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pb.deliveryCost > 0 && (
                  <div className="price-row">
                    <span className="label">{DELIVERY_LABELS[step1.deliveryType]}</span>
                    <span className="value">₹{pb.deliveryCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pb.staffCost > 0 && (
                  <div className="price-row">
                    <span className="label">Serving staff ({step1.staffCount} × ₹650)</span>
                    <span className="value">₹{pb.staffCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row">
                  <span className="label">Subtotal</span>
                  <span className="value">₹{pb.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {pb.discount > 0 && (
                  <div className="price-row discount">
                    <span className="label" style={{ color: '#28a745' }}>
                      <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />Coupon discount
                    </span>
                    <span className="value" style={{ color: '#28a745' }}>−₹{pb.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row">
                  <span className="label">GST (5%)</span>
                  <span className="value">₹{pb.gst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total row */}
              <div className="price-row total-row">
                <span className="label">Grand Total</span>
                <span className="value">₹{pb.total.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '1rem' }}
                  onClick={() => {
                    sessionStorage.setItem('priceSummary', JSON.stringify({ ...pb, couponCode: couponData?.code, couponId: couponData?.id }))
                    navigate('/payment')
                  }}
                >
                  Proceed to Payment <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#28a745' }} />
                  Secure booking · Pay advance or full amount
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <Link to="/details" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Edit Event Details
          </Link>
        </div>
      </div>
    </div>
  )
}
