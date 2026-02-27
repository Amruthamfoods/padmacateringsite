import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'

const DELIVERY_CHARGES = { GATE: 0, DOORSTEP: 500, DOORSTEP_SERVICE: 1500 }
const DELIVERY_LABELS  = { GATE: 'Gate Delivery', DOORSTEP: 'Doorstep', DOORSTEP_SERVICE: 'Doorstep + Service' }
const STAFF_RATE       = 800  // ₹ per staff member

function calcPricing(menuItems, pkg, eventDetails, staffCount, coupon) {
  const guestCount = eventDetails.guestCount || 0

  // Base price from package tier
  let pricePerPerson = 0
  if (pkg?.pricingTiers?.length) {
    const sorted = [...pkg.pricingTiers].sort((a, b) => b.minGuests - a.minGuests)
    const tier   = sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
    pricePerPerson = tier?.pricePerPerson || 0
  }
  const basePrice   = pricePerPerson * guestCount
  const packingCost = Math.round(basePrice * 0.05)  // 5% packing

  // Extra item charges
  const addonCost = menuItems.reduce((sum, i) => sum + (i.extraCharge || 0) * guestCount, 0)

  const deliveryCharge = DELIVERY_CHARGES[eventDetails.deliveryType] || 0
  const staffCharge    = (staffCount || 0) * STAFF_RATE

  const subtotal  = basePrice + packingCost + addonCost + deliveryCharge + staffCharge

  // Coupon
  let discount = 0
  if (coupon?.discountPercent) discount = Math.round(subtotal * coupon.discountPercent / 100)
  if (coupon?.discountFlat)    discount = coupon.discountFlat

  const gst   = Math.round((subtotal - discount) * 0.05)
  const total  = subtotal - discount + gst

  return { pricePerPerson, basePrice, packingCost, addonCost, deliveryCharge, staffCharge, subtotal, discount, gst, total }
}

export default function ReviewPricePage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences, setPricing } = useBookingStore()

  const pkg = menuPreferences.selectedPackage

  const [items,         setItems]         = useState(() => menuPreferences.menuItems || [])
  const [staffCount,    setStaffCount]    = useState(eventDetails.staffCount || 0)
  const [couponCode,    setCouponCode]    = useState('')
  const [coupon,        setCoupon]        = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Group items by category
  const grouped = useMemo(() => {
    const map = {}
    items.forEach(item => {
      const cat = item.categoryName || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(item)
    })
    return map
  }, [items])

  const pricing = useMemo(
    () => calcPricing(items, pkg, { ...eventDetails, staffCount }, staffCount, coupon),
    [items, pkg, eventDetails, staffCount, coupon]
  )

  function adjustQuantity(itemId, delta) {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const step   = item.unit === 'kg' ? 0.1 : 1
      const newQty = Math.max(step, Math.round((item.quantity + delta * step) * 10) / 10)
      return { ...item, quantity: newQty }
    }))
  }

  function removeItem(itemId) {
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await api.post('/coupon/validate', {
        code:       couponCode.trim().toUpperCase(),
        orderValue: pricing.subtotal,
      })
      if (data.valid) {
        setCoupon(data)
        toast.success(data.message || 'Coupon applied!')
      } else {
        toast.error(data.message || 'Invalid coupon code')
        setCoupon(null)
      }
    } catch {
      toast.error('Could not validate coupon')
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  function handleContinue() {
    if (items.length === 0) { toast.error('No menu items selected'); return }
    setMenuPreferences({ menuItems: items })
    setPricing({
      basePrice:     pricing.basePrice,
      packingCost:   pricing.packingCost,
      addonCost:     pricing.addonCost,
      deliveryCharge: pricing.deliveryCharge,
      staffCharge:   pricing.staffCharge,
      subtotal:      pricing.subtotal,
      coupon:        coupon?.code || null,
      discount:      pricing.discount,
      gst:           pricing.gst,
      total:         pricing.total,
      pricePerPerson: pricing.pricePerPerson,
    })
    navigate('/payment')
  }

  if (!pkg || items.length === 0) {
    return (
      <div className="booking-page-wrap">
        <BookingSteps />
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No menu items found. Please go back and build your menu.</p>
          <Link to="/menu" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" /> Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  const { occasion, eventDate, timeSlot, guestCount, vegCount, nonVegCount, deliveryType } = eventDetails

  return (
    <div className="booking-page-wrap">
      <BookingSteps />

      <div className="booking-center" style={{ maxWidth: 1100, paddingBottom: 100 }}>
        <h1 className="booking-page-title">Review & Get Price</h1>
        <p className="booking-page-sub">Quantities are auto-calculated for {guestCount} guests. Adjust if needed.</p>

        <div className="summary-layout">

          {/* ── LEFT: Item review + controls ── */}
          <div>
            {/* Info banner */}
            <div style={{ display: 'flex', gap: 8, padding: '11px 14px', background: '#EFF6FF', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', fontSize: '0.83rem', color: '#1D4ED8', marginBottom: 20 }}>
              <i className="fa-solid fa-circle-info" style={{ flexShrink: 0, marginTop: 1 }} />
              Quantities auto-calculated based on guest count. Use ± to adjust per your needs.
            </div>

            {/* Items grouped by category */}
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="summary-card">
                <div className="summary-card-header">
                  <i className="fa-solid fa-bowl-food" style={{ color: 'var(--red)' }} /> {category}
                </div>
                <div className="summary-card-body">
                  {catItems.map(item => (
                    <div key={item.id} className="review-item-row">
                      <div className="review-item-left">
                        <span
                          style={{
                            display: 'inline-block', width: 9, height: 9, borderRadius: '50%',
                            background: item.type === 'VEG' ? 'var(--veg)' : 'var(--nonveg)',
                            flexShrink: 0,
                          }}
                        />
                        <span className="review-item-name">{item.name}</span>
                        {item.extraCharge > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, flexShrink: 0 }}>
                            +₹{item.extraCharge}/plate
                          </span>
                        )}
                      </div>
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          type="button"
                          onClick={() => adjustQuantity(item.id, -1)}
                        >−</button>
                        <span className="qty-val">{item.quantity} {item.unit}</span>
                        <button
                          className="qty-btn"
                          type="button"
                          onClick={() => adjustQuantity(item.id, 1)}
                        >+</button>
                      </div>
                      <button className="review-item-remove" type="button" onClick={() => removeItem(item.id)} title="Remove">
                        <i className="fa-solid fa-times" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Delivery & Staff section */}
            <div className="summary-card">
              <div className="summary-card-header">
                <i className="fa-solid fa-truck" style={{ color: 'var(--red)' }} /> Delivery & Staff
              </div>
              <div className="summary-card-body">
                <div className="review-item-row">
                  <div className="review-item-left">
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--text-muted)', width: 14 }} />
                    <span className="review-item-name">{DELIVERY_LABELS[deliveryType] || 'Gate Delivery'}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: pricing.deliveryCharge > 0 ? 'var(--text-dark)' : 'var(--veg)', fontSize: '0.9rem', flexShrink: 0 }}>
                    {pricing.deliveryCharge > 0 ? `₹${pricing.deliveryCharge}` : 'Free'}
                  </span>
                </div>
                <div className="review-item-row">
                  <div className="review-item-left">
                    <i className="fa-solid fa-user-tie" style={{ color: 'var(--text-muted)', width: 14 }} />
                    <span className="review-item-name">Serving Staff (₹{STAFF_RATE}/person)</span>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" type="button" onClick={() => setStaffCount(s => Math.max(0, s - 1))}>−</button>
                    <span className="qty-val">{staffCount} staff</span>
                    <button className="qty-btn" type="button" onClick={() => setStaffCount(s => s + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon section */}
            <div className="summary-card">
              <div className="summary-card-header">
                <i className="fa-solid fa-tag" style={{ color: 'var(--red)' }} /> Coupon Code
              </div>
              <div className="summary-card-body">
                <div className="coupon-row">
                  <input
                    className="form-input"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    style={{
                      padding: '11px 18px', borderRadius: 'var(--radius)',
                      background: 'var(--red)', color: '#fff',
                      fontWeight: 700, fontSize: '0.87rem', border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap', opacity: couponLoading ? 0.7 : 1,
                    }}
                  >
                    {couponLoading ? <i className="fa-solid fa-circle-notch spin" /> : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <p style={{ marginTop: 8, fontSize: '0.83rem', color: '#28a745', fontWeight: 600 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} />
                    {coupon.message || `Coupon applied: ${coupon.discountPercent ? `${coupon.discountPercent}% off` : `₹${coupon.discountFlat} off`}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sticky sidebar ── */}
          <div>

            {/* Event summary */}
            <div className="summary-card" style={{ marginBottom: 12 }}>
              <div className="summary-card-header">
                <i className="fa-solid fa-calendar-check" style={{ color: 'var(--red)' }} /> Event Summary
              </div>
              <div className="summary-card-body">
                {[
                  ['Occasion',  occasion || '—'],
                  ['Date',      eventDate || '—'],
                  ['Time',      timeSlot  || '—'],
                  ['Guests',    `${guestCount} (${vegCount}V + ${nonVegCount}NV)`],
                  ['Delivery',  DELIVERY_LABELS[deliveryType] || 'Gate Delivery'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', gap: 8 }}>
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{lbl}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="summary-card">
              <div className="summary-card-header">
                <i className="fa-solid fa-receipt" style={{ color: 'var(--red)' }} /> Price Breakdown
              </div>
              <div className="summary-card-body">
                <div className="price-row">
                  <span className="label">Food (₹{pricing.pricePerPerson}/person × {guestCount})</span>
                  <span className="value">₹{pricing.basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row">
                  <span className="label">Packing charges (5%)</span>
                  <span className="value">₹{pricing.packingCost.toLocaleString('en-IN')}</span>
                </div>
                {pricing.addonCost > 0 && (
                  <div className="price-row">
                    <span className="label">Extra items</span>
                    <span className="value">₹{pricing.addonCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.deliveryCharge > 0 && (
                  <div className="price-row">
                    <span className="label">{DELIVERY_LABELS[deliveryType]}</span>
                    <span className="value">₹{pricing.deliveryCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.staffCharge > 0 && (
                  <div className="price-row">
                    <span className="label">Serving staff ({staffCount} × ₹{STAFF_RATE})</span>
                    <span className="value">₹{pricing.staffCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {pricing.discount > 0 && (
                  <div className="price-row">
                    <span className="label" style={{ color: '#28a745' }}>
                      <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />Coupon discount
                    </span>
                    <span className="value" style={{ color: '#28a745' }}>
                      −₹{pricing.discount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <hr className="price-divider" />
                <div className="price-row">
                  <span className="label">GST (5%)</span>
                  <span className="value">₹{pricing.gst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total row */}
              <div className="price-row total-row">
                <span className="label">Grand Total</span>
                <span className="value">₹{pricing.total.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ padding: '14px 16px 16px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.97rem' }}
                  onClick={handleContinue}
                >
                  Proceed to Payment <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 10 }}>
                  <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#28a745' }} />
                  Secure booking · Our team contacts you within 2 hours
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 16 }}>
          <Link to="/menu" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Edit Menu
          </Link>
        </div>
      </div>
    </div>
  )
}
