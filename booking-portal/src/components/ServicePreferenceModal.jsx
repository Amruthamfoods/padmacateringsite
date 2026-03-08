import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'

const STAFF_RATE = 800

// Maps admin-side serviceType labels to booking portal keys
const SERVICE_TYPE_MAP = { 'Meal Box': 'Mealbox', 'Delivery': 'PackedFood', 'Catering': 'Catering' }

const DEFAULT_PS = { packingCostPercent: 5, mealboxDelivery: 500, packedFoodDelivery: 500, cateringDelivery: 2000, serviceChargeFlat: 1500, serviceChargeFreeAbove: 100 }

function calcPricing(menuItems, pkg, eventDetails, staffCount, coupon, servicePref, ps = DEFAULT_PS) {
  const guestCount = eventDetails.guestCount || 0
  let pricePerPerson = 0
  if (pkg?.pricingTiers?.length) {
    const sorted = [...pkg.pricingTiers].sort((a, b) => b.minGuests - a.minGuests)
    const tier = sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
    pricePerPerson = tier?.pricePerPerson || 0
  }
  // pricePerPerson = package tier price only (e.g. ₹230)
  const basePrice = pricePerPerson * guestCount
  const packingCost = (servicePref === 'Mealbox' || servicePref === 'PackedFood') ? Math.round(basePrice * (Number(ps.packingCostPercent || 5) / 100)) : 0
  const addonCost = menuItems.reduce((sum, i) => {
    const delta = Math.max(0, (i.quantity || 0) - (i.baseQuantity || 0))
    return sum + delta * (i.pricePerUnit || 0)
  }, 0)
  const buffetSurcharge = 0
  const buffetSurchargePerPerson = 0
  const deliveryCharge = servicePref === 'Catering' ? Number(ps.cateringDelivery || 1500) : servicePref === 'PackedFood' ? Number(ps.packedFoodDelivery || 500) : Number(ps.mealboxDelivery || 500)
  const serviceFlat = Number(ps.serviceChargeFlat || 1500)
  const serviceFreeAbove = Number(ps.serviceChargeFreeAbove || 100)
  const staffChargeOriginal = servicePref === 'Catering' ? serviceFlat : (staffCount || 0) * STAFF_RATE
  const staffCharge = servicePref === 'Catering' && guestCount >= serviceFreeAbove ? 0 : staffChargeOriginal
  const finalStaffCount = servicePref === 'Catering' ? 1 : staffCount
  const subtotal = basePrice + buffetSurcharge + packingCost + addonCost + deliveryCharge + staffCharge
  let discount = 0
  if (coupon?.discountPercent) discount = Math.round(subtotal * coupon.discountPercent / 100)
  if (coupon?.discountFlat) discount = coupon.discountFlat
  const gst = Math.round((subtotal - discount) * 0.05)
  const total = subtotal - discount + gst
  return { pricePerPerson, basePrice, buffetSurcharge, buffetSurchargePerPerson, packingCost, addonCost, deliveryCharge, staffCharge, staffChargeOriginal, subtotal, discount, gst, total, finalStaffCount }
}

export default function ServicePreferenceModal({ onClose }) {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences, setPricing } = useBookingStore()
  const pkg = menuPreferences.selectedPackage
  // Compute allowed service keys from package's serviceType field
  const allowedServices = pkg?.serviceType
    ? pkg.serviceType.split(',').map(s => SERVICE_TYPE_MAP[s.trim()]).filter(Boolean)
    : ['Mealbox', 'PackedFood', 'Catering']
  const [pricingSettings, setPricingSettings] = useState(DEFAULT_PS)

  useEffect(() => {
    api.get('/pricing/settings').then(r => setPricingSettings({ ...DEFAULT_PS, ...r.data })).catch(() => {})
  }, [])

  const [items, setItems] = useState(() =>
    (menuPreferences.menuItems || []).map(i => ({
      ...i,
      baseQuantity: i.baseQuantity != null ? i.baseQuantity : i.quantity,
      pricePerUnit: i.pricePerUnit != null ? i.pricePerUnit : 0,
    }))
  )
  const [servicePref, setServicePref] = useState(() => {
    const saved = menuPreferences.servicePreference
    const allowed = pkg?.serviceType
      ? pkg.serviceType.split(',').map(s => SERVICE_TYPE_MAP[s.trim()]).filter(Boolean)
      : ['Mealbox', 'PackedFood', 'Catering']
    if (saved && allowed.includes(saved)) return saved
    return allowed[0] || 'Mealbox'
  })
  const [staffCount, setStaffCount] = useState(eventDetails.staffCount || 0)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    setMenuPreferences({ servicePreference: servicePref })
  }, [servicePref, setMenuPreferences])

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
    () => calcPricing(items, pkg, eventDetails, staffCount, coupon, servicePref, pricingSettings),
    [items, pkg, eventDetails, staffCount, coupon, servicePref, pricingSettings]
  )

  function adjustQuantity(itemId, delta) {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const step = item.unit === 'kg' ? 0.1 : 1
      const newQty = Math.max(step, Math.round((item.quantity + delta * step) * 10) / 10)
      return { ...item, quantity: newQty }
    }))
  }

  function editQuantity(itemId, raw) {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const step = item.unit === 'kg' ? 0.1 : 1
      const parsed = parseFloat(raw)
      if (isNaN(parsed) || parsed <= 0) return item
      const newQty = item.unit === 'kg'
        ? Math.round(parsed * 10) / 10
        : Math.round(parsed)
      return { ...item, quantity: Math.max(step, newQty) }
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
      if (data.valid) { setCoupon(data); toast.success(data.message || 'Coupon applied!') }
      else { toast.error(data.message || 'Invalid coupon code'); setCoupon(null) }
    } catch { toast.error('Could not validate coupon'); setCoupon(null) }
    finally { setCouponLoading(false) }
  }

  function handleContinue() {
    if (items.length === 0) { toast.error('No menu items selected'); return }
    setMenuPreferences({ menuItems: items })
    setPricing({
      basePrice: pricing.basePrice, buffetSurcharge: pricing.buffetSurcharge, packingCost: pricing.packingCost,
      addonCost: pricing.addonCost, deliveryCharge: pricing.deliveryCharge,
      staffCharge: pricing.staffCharge, staffChargeOriginal: pricing.staffChargeOriginal,
      subtotal: pricing.subtotal, coupon: coupon?.code || null, discount: pricing.discount,
      gst: pricing.gst, total: pricing.total, pricePerPerson: pricing.pricePerPerson,
    })
    navigate('/payment')
  }

  if (!pkg || items.length === 0) return null

  const { eventDate, timeSlot, guestCount } = eventDetails

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        display: 'flex', flexDirection: 'column',
        width: '100%', maxWidth: 860,
        maxHeight: '92vh', overflow: 'hidden',
        borderRadius: 20, background: 'var(--bg-page)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── Header ── */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center',
          padding: '14px 20px', background: 'var(--bg)',
          borderBottom: '0.5px solid var(--separator-nm)', gap: 12,
        }}>
          <img src="/img/amrutham-logo.png" alt="Amrutham" style={{ height: 36, objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--heading)', lineHeight: 1.2 }}>Review &amp; Confirm</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{pkg.name} · {guestCount} guests · {eventDate}</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--fill-tertiary)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 16, flexShrink: 0,
          }}>×</button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 0' }}>

          {/* Service toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { key: 'Mealbox', icon: 'fa-solid fa-box-open', label: 'Mealbox', sub: 'Individual meal boxes' },
              { key: 'PackedFood', icon: 'fa-solid fa-bag-shopping', label: 'Packed Food', sub: 'Packed containers, self-serve' },
              { key: 'Catering', icon: 'fa-solid fa-bell-concierge', label: 'Catering', sub: 'Full setup + service at venue' },
            ].filter(opt => allowedServices.includes(opt.key)).map(opt => (
              <button key={opt.key} onClick={() => setServicePref(opt.key)} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, border: `1.5px solid ${servicePref === opt.key ? 'var(--primary)' : 'var(--separator-nm)'}`,
                background: servicePref === opt.key ? 'var(--primary-bg)' : 'var(--bg)',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit',
              }}>
                <i className={opt.icon} style={{ fontSize: '1.1rem', color: servicePref === opt.key ? 'var(--primary)' : 'var(--muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: servicePref === opt.key ? 'var(--primary)' : 'var(--heading)', lineHeight: 1.2 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{opt.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }} className="modal-cols">

            {/* LEFT: Menu items */}
            <div>
              {Object.entries(grouped).map(([category, catItems]) => (
                <div key={category} style={{ background: 'var(--bg)', borderRadius: 12, marginBottom: 12, overflow: 'hidden', border: '0.5px solid var(--separator-nm)' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--separator-nm)', fontWeight: 600, fontSize: 13, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-bowl-food" style={{ color: 'var(--primary)', fontSize: 12 }} /> {category}
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {catItems.map((item, i) => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '7px 14px',
                        borderBottom: i < catItems.length - 1 ? '0.5px solid var(--separator-nm)' : 'none',
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'VEG' ? '#34C759' : '#FF3B30', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--heading)', fontWeight: 500 }}>{item.name}</span>
                        {item.extraCharge > 0 && <span style={{ fontSize: 11, color: 'var(--ios-orange)', fontWeight: 600 }}>+₹{item.extraCharge}/pl</span>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => adjustQuantity(item.id, -1)} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--fill-tertiary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--heading)' }}>−</button>
                          <input
                            type="number"
                            value={item.quantity}
                            step={item.unit === 'kg' ? 0.1 : 1}
                            min={item.unit === 'kg' ? 0.1 : 1}
                            onChange={e => editQuantity(item.id, e.target.value)}
                            style={{
                              width: 70, textAlign: 'center', fontWeight: 700, fontSize: 13,
                              color: 'var(--heading)', background: 'var(--fill-tertiary)',
                              border: '1.5px solid var(--primary)', borderRadius: 8,
                              outline: 'none', padding: '2px 4px', fontFamily: 'inherit',
                            }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{item.unit}</span>
                          <button onClick={() => adjustQuantity(item.id, 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--primary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0 2px', fontSize: 14, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Staff (Mealbox/PackedFood only) */}
              {servicePref !== 'Catering' && (
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '0.5px solid var(--separator-nm)', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--heading)', fontWeight: 500 }}>
                    <i className="fa-solid fa-user-tie" style={{ color: 'var(--muted)', marginRight: 8 }} />Add Waitstaff (₹{STAFF_RATE}/person)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setStaffCount(s => Math.max(0, s - 1))} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--fill-tertiary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{staffCount}</span>
                    <button onClick={() => setStaffCount(s => s + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--primary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</button>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--separator-nm)', background: 'var(--bg)', fontSize: 14, color: 'var(--heading)', fontFamily: 'inherit', outline: 'none', letterSpacing: '0.05em' }}
                />
                <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} style={{
                  padding: '10px 16px', borderRadius: 10, background: 'var(--primary)', border: 'none',
                  color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                }}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {coupon && (
                <p style={{ fontSize: 12, color: '#34C759', fontWeight: 600, marginBottom: 12 }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} />
                  {coupon.message || `Coupon applied`}
                </p>
              )}
            </div>

            {/* RIGHT: Price summary + confirm */}
            <div style={{ position: 'sticky', top: 0 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', border: '0.5px solid var(--separator-nm)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--separator-nm)', fontWeight: 600, fontSize: 13, color: 'var(--heading)' }}>
                  Price Breakdown
                </div>
                <div style={{ padding: '8px 16px' }}>
                  {[
                    [`Food (₹${pricing.pricePerPerson}/pp × ${guestCount})`, pricing.basePrice],
                    pricing.packingCost > 0 ? ['Packing', pricing.packingCost] : null,
                    pricing.addonCost > 0 ? ['Extra items', pricing.addonCost] : null,
                    [`${servicePref === 'Catering' ? 'Setup & service (+ transport extra)' : 'Delivery'}`, pricing.deliveryCharge],
                    pricing.staffCharge > 0 ? [`Staff (${pricing.finalStaffCount} × ₹${STAFF_RATE})`, pricing.staffCharge] : null,
                  ].filter(Boolean).map(([lbl, val]) => (
                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '0.5px solid var(--separator-nm)' }}>
                      <span style={{ color: 'var(--muted)' }}>{lbl}</span>
                      <span style={{ fontWeight: 500, color: 'var(--heading)' }}>₹{val.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {pricing.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '0.5px solid var(--separator-nm)' }}>
                      <span style={{ color: '#34C759' }}>Coupon discount</span>
                      <span style={{ fontWeight: 600, color: '#34C759' }}>−₹{pricing.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>GST (5%)</span>
                    <span style={{ fontWeight: 500, color: 'var(--heading)' }}>₹{pricing.gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--primary-bg)', borderTop: '0.5px solid var(--separator-nm)' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--heading)' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)', letterSpacing: '-0.02em' }}>₹{pricing.total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ padding: 14 }}>
                  <button onClick={handleContinue} style={{
                    width: '100%', padding: '14px', borderRadius: 999,
                    background: 'var(--primary)', border: 'none',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: 'var(--shadow-green)', letterSpacing: '-0.01em',
                  }}>
                    Proceed to Payment →
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                    <i className="fa-solid fa-shield-check" style={{ marginRight: 4, color: '#34C759' }} />
                    Our team contacts you within 2 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 20, flexShrink: 0 }} />
      </div>
      <style>{`
        @media (max-width: 700px) { .modal-cols { grid-template-columns: 1fr !important; } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.94) translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>,
    document.body
  )
}
