import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'

const DELIVERY_CHARGES = { GATE: 0, DOORSTEP: 500, DOORSTEP_SERVICE: 1500 }
const DELIVERY_LABELS = { GATE: 'Gate Delivery', DOORSTEP: 'Doorstep', DOORSTEP_SERVICE: 'Doorstep + Service' }
const STAFF_RATE = 800  // ₹ per staff member

function calcPricing(menuItems, pkg, eventDetails, staffCount, coupon, servicePref) {
  const guestCount = eventDetails.guestCount || 0

  // Base price from package tier
  let pricePerPerson = 0
  if (pkg?.pricingTiers?.length) {
    const sorted = [...pkg.pricingTiers].sort((a, b) => b.minGuests - a.minGuests)
    const tier = sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
    pricePerPerson = tier?.pricePerPerson || 0
  }

  // NinjaBuffet adds a premium per plate
  if (servicePref === 'NinjaBuffet') {
    pricePerPerson += 150 // Example buffet premium
  }

  const basePrice = pricePerPerson * guestCount
  const packingCost = servicePref === 'NinjaBox' ? Math.round(basePrice * 0.05) : 0 // Packing cost applies to box delivery

  // Extra item charges
  const addonCost = menuItems.reduce((sum, i) => sum + (i.extraCharge || 0) * guestCount, 0)

  // Delivery charge based on preference
  const deliveryCharge = servicePref === 'NinjaBuffet' ? 1500 : 500

  // Staff charge based on preference
  const finalStaffCount = servicePref === 'NinjaBuffet' ? Math.max(1, Math.ceil(guestCount / 25)) : staffCount
  const staffCharge = (finalStaffCount || 0) * STAFF_RATE

  const subtotal = basePrice + packingCost + addonCost + deliveryCharge + staffCharge

  // Coupon
  let discount = 0
  if (coupon?.discountPercent) discount = Math.round(subtotal * coupon.discountPercent / 100)
  if (coupon?.discountFlat) discount = coupon.discountFlat

  const gst = Math.round((subtotal - discount) * 0.05)
  const total = subtotal - discount + gst

  return { pricePerPerson, basePrice, packingCost, addonCost, deliveryCharge, staffCharge, subtotal, discount, gst, total, finalStaffCount }
}

export default function ServicePreferenceModal({ onClose }) {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences, setPricing } = useBookingStore()

  const pkg = menuPreferences.selectedPackage

  const [items, setItems] = useState(() => menuPreferences.menuItems || [])
  const [servicePref, setServicePref] = useState(menuPreferences.servicePreference || 'NinjaBox')
  const [staffCount, setStaffCount] = useState(eventDetails.staffCount || 0)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Auto-sync stores when servicePref changes
  useEffect(() => {
    setMenuPreferences({ servicePreference: servicePref })
  }, [servicePref, setMenuPreferences])

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
    () => calcPricing(items, pkg, eventDetails, staffCount, coupon, servicePref),
    [items, pkg, eventDetails, staffCount, coupon, servicePref]
  )

  function adjustQuantity(itemId, delta) {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const step = item.unit === 'kg' ? 0.1 : 1
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
        code: couponCode.trim().toUpperCase(),
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
      basePrice: pricing.basePrice,
      packingCost: pricing.packingCost,
      addonCost: pricing.addonCost,
      deliveryCharge: pricing.deliveryCharge,
      staffCharge: pricing.staffCharge,
      subtotal: pricing.subtotal,
      coupon: coupon?.code || null,
      discount: pricing.discount,
      gst: pricing.gst,
      total: pricing.total,
      pricePerPerson: pricing.pricePerPerson,
    })
    navigate('/payment')
  }

  if (!pkg || items.length === 0) {
    return null
  }

  const { occasion, eventDate, timeSlot, guestCount, vegCount, nonVegCount } = eventDetails

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      {/* Modal Container */}
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column',
          maxWidth: 900, width: '95%',
          maxHeight: '90vh', overflow: 'hidden',
          borderRadius: 24, background: '#fff',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          animation: 'modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Top Header: Full-Bleed Figma Style Image */}
        <div style={{ position: 'relative', width: '100%', height: '180px', background: '#e5e7eb', flexShrink: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop"
            alt="Delicious food"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <button type="button" onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.9)', border: 'none',
            width: 36, height: 36, borderRadius: '50%',
            color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <i className="fa-solid fa-times" />
          </button>

          {/* Gradient Overlay for Text Readability */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '48px 24px 16px 24px', color: '#fff'
          }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Choose Your Service Preference
            </h1>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Review your menu and exact pricing below.
            </p>
          </div>
        </div>

        <div className="booking-center" style={{ maxWidth: 1100, padding: '24px', overflowY: 'auto' }}>

          {/* ── Service Preference Toggle ── */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ display: 'flex', gap: 16, background: '#fff', padding: 8, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <button
                onClick={() => setServicePref('NinjaBox')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 32px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: servicePref === 'NinjaBox' ? '#fef2f2' : 'transparent',
                  color: servicePref === 'NinjaBox' ? 'var(--red)' : 'var(--text-muted)',
                  boxShadow: servicePref === 'NinjaBox' ? '0 2px 8px rgba(220, 38, 38, 0.15)' : 'none'
                }}
              >
                <i className="fa-solid fa-box-open" style={{ fontSize: '1.8rem' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>NinjaBox</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Delivery Only</span>
              </button>
              <button
                onClick={() => setServicePref('NinjaBuffet')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 32px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: servicePref === 'NinjaBuffet' ? '#fef2f2' : 'transparent',
                  color: servicePref === 'NinjaBuffet' ? 'var(--red)' : 'var(--text-muted)',
                  boxShadow: servicePref === 'NinjaBuffet' ? '0 2px 8px rgba(220, 38, 38, 0.15)' : 'none'
                }}
              >
                <i className="fa-solid fa-bell-concierge" style={{ fontSize: '1.8rem' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>NinjaBuffet</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Full Service</span>
              </button>
            </div>
          </div>

          <div className="summary-layout">

            {/* ── LEFT: Item review + controls ── */}
            <div>
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
                  <i className="fa-solid fa-truck" style={{ color: 'var(--red)' }} /> Delivery & Setup
                </div>
                <div className="summary-card-body">
                  <div className="review-item-row">
                    <div className="review-item-left">
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--text-muted)', width: 14 }} />
                      <span className="review-item-name">{servicePref === 'NinjaBuffet' ? 'Premium Setup + Service' : 'Doorstep Delivery'}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: pricing.deliveryCharge > 0 ? 'var(--text-dark)' : 'var(--veg)', fontSize: '0.9rem', flexShrink: 0 }}>
                      {pricing.deliveryCharge > 0 ? `₹${pricing.deliveryCharge}` : 'Free'}
                    </span>
                  </div>
                  {servicePref === 'NinjaBox' && (
                    <div className="review-item-row">
                      <div className="review-item-left">
                        <i className="fa-solid fa-user-tie" style={{ color: 'var(--text-muted)', width: 14 }} />
                        <span className="review-item-name">Add Waitstaff (₹{STAFF_RATE}/person)</span>
                      </div>
                      <div className="qty-control">
                        <button className="qty-btn" type="button" onClick={() => setStaffCount(s => Math.max(0, s - 1))}>−</button>
                        <span className="qty-val">{staffCount} staff</span>
                        <button className="qty-btn" type="button" onClick={() => setStaffCount(s => s + 1)}>+</button>
                      </div>
                    </div>
                  )}
                  {servicePref === 'NinjaBuffet' && (
                    <div className="review-item-row">
                      <div className="review-item-left">
                        <i className="fa-solid fa-user-tie" style={{ color: 'var(--text-muted)', width: 14 }} />
                        <span className="review-item-name">Serving Staff Included</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem', flexShrink: 0 }}>
                        {pricing.finalStaffCount} staff
                      </span>
                    </div>
                  )}
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
              <div className="summary-card" style={{ marginBottom: 24 }}>
                <div className="summary-card-header">
                  <i className="fa-solid fa-calendar-check" style={{ color: 'var(--red)' }} /> Event Summary
                </div>
                <div className="summary-card-body">
                  {[
                    ['Occasion', occasion || '—'],
                    ['Date', eventDate || '—'],
                    ['Time', timeSlot || '—'],
                    ['Guests', `${guestCount} (${vegCount}V + ${nonVegCount}NV)`],
                    ['Service', servicePref],
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
                  {pricing.packingCost > 0 && (
                    <div className="price-row">
                      <span className="label">Packing charges</span>
                      <span className="value">₹{pricing.packingCost.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {pricing.addonCost > 0 && (
                    <div className="price-row">
                      <span className="label">Extra items</span>
                      <span className="value">₹{pricing.addonCost.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {pricing.deliveryCharge > 0 && (
                    <div className="price-row">
                      <span className="label">{servicePref === 'NinjaBuffet' ? 'Setup & Transport' : 'Doorstep Delivery'}</span>
                      <span className="value">₹{pricing.deliveryCharge.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {pricing.staffCharge > 0 && (
                    <div className="price-row">
                      <span className="label">Waitstaff ({pricing.finalStaffCount} × ₹{STAFF_RATE})</span>
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
                    onClick={handleContinue}
                    style={{
                      width: '100%', padding: '16px', fontSize: '1.05rem', borderRadius: '50px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                      background: '#E67E22', border: 'none', color: '#fff', fontWeight: 800,
                      boxShadow: '0 8px 16px rgba(230, 126, 34, 0.25)', cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#d35400'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#E67E22'}
                  >
                    Proceed to Payment <i className="fa-solid fa-arrow-right" />
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 16 }}>
                    <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#28a745' }} />
                    Secure booking · Our team contacts you within 2 hours
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
