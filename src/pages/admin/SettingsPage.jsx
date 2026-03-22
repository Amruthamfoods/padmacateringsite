import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const TABS = [
  { id: 'booking', label: 'Booking Rules', icon: 'fa-solid fa-clock' },
  { id: 'delivery', label: 'Delivery', icon: 'fa-solid fa-truck' },
  { id: 'pricing', label: 'Pricing', icon: 'fa-solid fa-tags' },
  { id: 'rewards', label: 'Rewards', icon: 'fa-solid fa-star' },
  { id: 'blocked', label: 'Blocked Dates', icon: 'fa-solid fa-calendar-xmark' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('booking')

  // ── Booking Rules ──
  const [bookingForm, setBookingForm] = useState({ minAdvanceHours: 48, gstPercent: 18 })
  const [bookingSaving, setBookingSaving] = useState(false)

  // ── Delivery ──
  const [deliveryForm, setDeliveryForm] = useState({
    baseAddress: '', baseLat: 17.6868, baseLng: 83.2185,
    freeUpToKm: 0,
    tier1MaxKm: 5, tier1Charge: 300,
    tier2MaxKm: 10, tier2Charge: 600,
    tier3MaxKm: 15, tier3Charge: 800,
    tier4MaxKm: 20, tier4Charge: 1200,
    tier5Charge: 1500, maxDeliveryKm: 30,
  })
  const [deliverySaving, setDeliverySaving] = useState(false)

  // ── Pricing ──
  const [pricingForm, setPricingForm] = useState({
    packingCostPercent: 5, packingChargeFixed: 10.9,
    mealboxDelivery: 500, packedFoodDelivery: 500, cateringDelivery: 1500,
    serviceChargeFlat: 1500, serviceChargeFreeAbove: 100,
  })
  const [pricingSaving, setPricingSaving] = useState(false)

  // ── Rewards ──
  const [rewardsForm, setRewardsForm] = useState({
    enabled: true, pointsPer100: 4, pointValue: 0.25, minRedeem: 100,
    signupBonus: 300, referralBonus: 200,
    silverMin: 500, silverDiscount: 5,
    goldMin: 2000, goldDiscount: 10,
    platinumMin: 5000, platinumDiscount: 15,
  })
  const [rewardsSaving, setRewardsSaving] = useState(false)

  // ── Blocked Dates ──
  const [blockedDates, setBlockedDates] = useState([])
  const [blockedLoading, setBlockedLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')

  useEffect(() => {
    // Load pricing + booking rules
    api.get('/admin/pricing/settings')
      .then(r => {
        setBookingForm(f => ({
          ...f,
          minAdvanceHours: r.data.minAdvanceHours ?? 48,
          gstPercent: r.data.gstPercent ?? 18,
        }))
        setPricingForm(f => ({
          ...f,
          packingCostPercent: r.data.packingCostPercent ?? 5,
          packingChargeFixed: r.data.packingChargeFixed ?? 10.9,
          mealboxDelivery: r.data.mealboxDelivery ?? 500,
          packedFoodDelivery: r.data.packedFoodDelivery ?? 500,
          cateringDelivery: r.data.cateringDelivery ?? 1500,
          serviceChargeFlat: r.data.serviceChargeFlat ?? 1500,
          serviceChargeFreeAbove: r.data.serviceChargeFreeAbove ?? 100,
        }))
      })
      .catch(() => {})

    api.get('/admin/delivery/settings')
      .then(r => setDeliveryForm(r.data))
      .catch(() => {})

    api.get('/admin/rewards/settings')
      .then(r => setRewardsForm(r.data))
      .catch(() => {})

    api.get('/admin/blocked-dates')
      .then(r => setBlockedDates(r.data))
      .catch(() => toast.error('Failed to load blocked dates'))
      .finally(() => setBlockedLoading(false))
  }, [])

  async function saveBooking() {
    setBookingSaving(true)
    try {
      await api.put('/admin/pricing/settings', {
        minAdvanceHours: Number(bookingForm.minAdvanceHours),
        gstPercent: Number(bookingForm.gstPercent),
      })
      toast.success('Booking rules saved')
    } catch { toast.error('Failed to save') }
    finally { setBookingSaving(false) }
  }

  async function saveDelivery() {
    setDeliverySaving(true)
    try {
      await api.put('/admin/delivery/settings', deliveryForm)
      toast.success('Delivery settings saved')
    } catch { toast.error('Failed to save') }
    finally { setDeliverySaving(false) }
  }

  async function savePricing() {
    setPricingSaving(true)
    try {
      await api.put('/admin/pricing/settings', pricingForm)
      toast.success('Pricing settings saved')
    } catch { toast.error('Failed to save') }
    finally { setPricingSaving(false) }
  }

  async function saveRewards() {
    setRewardsSaving(true)
    try {
      await api.put('/admin/rewards/settings', rewardsForm)
      toast.success('Rewards settings saved')
    } catch { toast.error('Failed to save') }
    finally { setRewardsSaving(false) }
  }

  async function addBlockedDate() {
    if (!newDate) { toast.error('Select a date'); return }
    setAdding(true)
    try {
      const { data } = await api.post('/admin/blocked-dates', { date: newDate, reason: newReason })
      setBlockedDates(d => [...d, data])
      setNewDate(''); setNewReason('')
      toast.success('Date blocked')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to block date')
    } finally { setAdding(false) }
  }

  async function removeBlockedDate(id) {
    try {
      await api.delete(`/admin/blocked-dates/${id}`)
      setBlockedDates(d => d.filter(bd => bd.id !== id))
      toast.success('Date unblocked')
    } catch { toast.error('Failed to unblock') }
  }

  function NumField({ label, value, onChange, min, max, step, suffix }) {
    return (
      <div className="field-block">
        <label className="field-label">
          {label}
          {suffix && <span style={{ color: 'var(--text-faint)', marginLeft: 4, fontSize: '0.78rem' }}>{suffix}</span>}
        </label>
        <input
          type="number"
          className="booking-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min} max={max} step={step || 1}
          style={{ maxWidth: 180 }}
        />
      </div>
    )
  }

  function TextField({ label, value, onChange }) {
    return (
      <div className="field-block">
        <label className="field-label">{label}</label>
        <input
          type="text"
          className="admin-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub">Manage business rules, delivery tiers, pricing and rewards</p>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className={t.icon} style={{ fontSize: '0.75rem' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Booking Rules ── */}
      {activeTab === 'booking' && (
        <div className="admin-card">
          <div className="admin-card-head">
            <p className="admin-card-title">
              <i className="fa-solid fa-clock" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Booking Rules
            </p>
          </div>
          <div style={{ padding: '4px 24px 24px' }}>
            <NumField
              label="Minimum Advance Booking Hours"
              value={bookingForm.minAdvanceHours}
              onChange={v => setBookingForm(f => ({ ...f, minAdvanceHours: v }))}
              min={0} max={720} suffix="hrs"
            />
            <NumField
              label="GST Percentage"
              value={bookingForm.gstPercent}
              onChange={v => setBookingForm(f => ({ ...f, gstPercent: v }))}
              min={0} max={28} step={0.5} suffix="%"
            />
            <button onClick={saveBooking} disabled={bookingSaving} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px', marginTop: 8 }}>
              {bookingSaving
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Rules</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Delivery ── */}
      {activeTab === 'delivery' && (
        <div className="admin-card">
          <div className="admin-card-head">
            <p className="admin-card-title">
              <i className="fa-solid fa-truck" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Delivery Settings
            </p>
          </div>
          <div style={{ padding: '4px 24px 24px' }}>
            <TextField
              label="Base Location (address)"
              value={deliveryForm.baseAddress || ''}
              onChange={v => setDeliveryForm(f => ({ ...f, baseAddress: v }))}
            />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <NumField label="Base Latitude" value={deliveryForm.baseLat} onChange={v => setDeliveryForm(f => ({ ...f, baseLat: v }))} step={0.0001} />
              <NumField label="Base Longitude" value={deliveryForm.baseLng} onChange={v => setDeliveryForm(f => ({ ...f, baseLng: v }))} step={0.0001} />
            </div>
            <NumField label="Free Delivery Up To" value={deliveryForm.freeUpToKm} onChange={v => setDeliveryForm(f => ({ ...f, freeUpToKm: v }))} min={0} suffix="km" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: '16px 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Delivery Tiers
            </p>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <NumField
                  label={`Tier ${n}: Up to`}
                  value={deliveryForm[`tier${n}MaxKm`]}
                  onChange={v => setDeliveryForm(f => ({ ...f, [`tier${n}MaxKm`]: v }))}
                  min={0} suffix="km"
                />
                <NumField
                  label={`Tier ${n}: Charge`}
                  value={deliveryForm[`tier${n}Charge`]}
                  onChange={v => setDeliveryForm(f => ({ ...f, [`tier${n}Charge`]: v }))}
                  min={0} suffix="₹"
                />
              </div>
            ))}
            <NumField label="Tier 5 (Beyond): Charge" value={deliveryForm.tier5Charge} onChange={v => setDeliveryForm(f => ({ ...f, tier5Charge: v }))} min={0} suffix="₹" />
            <NumField label="Max Delivery Distance" value={deliveryForm.maxDeliveryKm} onChange={v => setDeliveryForm(f => ({ ...f, maxDeliveryKm: v }))} min={0} suffix="km" />
            <button onClick={saveDelivery} disabled={deliverySaving} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px', marginTop: 8 }}>
              {deliverySaving
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Delivery</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Pricing ── */}
      {activeTab === 'pricing' && (
        <div className="admin-card">
          <div className="admin-card-head">
            <p className="admin-card-title">
              <i className="fa-solid fa-tags" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Pricing Settings
            </p>
          </div>
          <div style={{ padding: '4px 24px 24px' }}>
            <NumField label="Packing Cost %" value={pricingForm.packingCostPercent} onChange={v => setPricingForm(f => ({ ...f, packingCostPercent: v }))} min={0} max={50} step={0.5} suffix="%" />
            <NumField label="Packing Charge Fixed" value={pricingForm.packingChargeFixed} onChange={v => setPricingForm(f => ({ ...f, packingChargeFixed: v }))} min={0} step={0.1} suffix="₹" />
            <NumField label="Mealbox Delivery Charge" value={pricingForm.mealboxDelivery} onChange={v => setPricingForm(f => ({ ...f, mealboxDelivery: v }))} min={0} suffix="₹" />
            <NumField label="Packed Food Delivery Charge" value={pricingForm.packedFoodDelivery} onChange={v => setPricingForm(f => ({ ...f, packedFoodDelivery: v }))} min={0} suffix="₹" />
            <NumField label="Catering Delivery Charge" value={pricingForm.cateringDelivery} onChange={v => setPricingForm(f => ({ ...f, cateringDelivery: v }))} min={0} suffix="₹" />
            <NumField label="Service Charge (Flat)" value={pricingForm.serviceChargeFlat} onChange={v => setPricingForm(f => ({ ...f, serviceChargeFlat: v }))} min={0} suffix="₹" />
            <NumField label="Service Charge Free Above (Guests)" value={pricingForm.serviceChargeFreeAbove} onChange={v => setPricingForm(f => ({ ...f, serviceChargeFreeAbove: v }))} min={0} suffix="pax" />
            <button onClick={savePricing} disabled={pricingSaving} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px', marginTop: 8 }}>
              {pricingSaving
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Pricing</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Rewards ── */}
      {activeTab === 'rewards' && (
        <div className="admin-card">
          <div className="admin-card-head">
            <p className="admin-card-title">
              <i className="fa-solid fa-star" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Rewards Settings
            </p>
          </div>
          <div style={{ padding: '4px 24px 24px' }}>
            <div className="field-block">
              <label className="field-label">Rewards Program</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rewardsForm.enabled}
                  onChange={e => setRewardsForm(f => ({ ...f, enabled: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: 'var(--gold)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-warm)' }}>Enabled</span>
              </label>
            </div>
            <NumField label="Points per ₹100 spent" value={rewardsForm.pointsPer100} onChange={v => setRewardsForm(f => ({ ...f, pointsPer100: v }))} min={0} step={0.5} />
            <NumField label="Point value in ₹" value={rewardsForm.pointValue} onChange={v => setRewardsForm(f => ({ ...f, pointValue: v }))} min={0} step={0.01} />
            <NumField label="Min points to redeem" value={rewardsForm.minRedeem} onChange={v => setRewardsForm(f => ({ ...f, minRedeem: v }))} min={0} />
            <NumField label="Signup bonus points" value={rewardsForm.signupBonus} onChange={v => setRewardsForm(f => ({ ...f, signupBonus: v }))} min={0} />
            <NumField label="Referral bonus points" value={rewardsForm.referralBonus} onChange={v => setRewardsForm(f => ({ ...f, referralBonus: v }))} min={0} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: '16px 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tier Thresholds
            </p>
            {[
              { label: 'Silver', minKey: 'silverMin', discKey: 'silverDiscount' },
              { label: 'Gold', minKey: 'goldMin', discKey: 'goldDiscount' },
              { label: 'Platinum', minKey: 'platinumMin', discKey: 'platinumDiscount' },
            ].map(({ label, minKey, discKey }) => (
              <div key={minKey} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <NumField
                  label={`${label}: Min Points`}
                  value={rewardsForm[minKey]}
                  onChange={v => setRewardsForm(f => ({ ...f, [minKey]: v }))}
                  min={0}
                />
                <NumField
                  label={`${label}: Discount %`}
                  value={rewardsForm[discKey]}
                  onChange={v => setRewardsForm(f => ({ ...f, [discKey]: v }))}
                  min={0} max={100} step={0.5} suffix="%"
                />
              </div>
            ))}
            <button onClick={saveRewards} disabled={rewardsSaving} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px', marginTop: 8 }}>
              {rewardsSaving
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save Rewards</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Blocked Dates ── */}
      {activeTab === 'blocked' && (
        <div className="admin-card">
          <div className="admin-card-head">
            <p className="admin-card-title">
              <i className="fa-solid fa-calendar-xmark" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Blocked Dates
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Customers cannot book on these dates</p>
          </div>
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', marginTop: 16 }}>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                className="admin-input" style={{ colorScheme: 'dark', width: 160 }} />
              <input type="text" value={newReason} onChange={e => setNewReason(e.target.value)}
                placeholder="Reason (optional)" className="admin-input" style={{ flex: 1, minWidth: 160 }} />
              <button onClick={addBlockedDate} disabled={adding} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                {adding
                  ? <><i className="fa-solid fa-circle-notch fa-spin" /> Adding…</>
                  : <><i className="fa-solid fa-ban" /> Block Date</>}
              </button>
            </div>
            {blockedLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.5rem', color: 'var(--gold)' }} />
              </div>
            ) : blockedDates.length === 0 ? (
              <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No blocked dates</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {blockedDates.map(bd => (
                  <div key={bd.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 8, padding: '10px 14px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-warm)', fontWeight: 500 }}>{format(new Date(bd.date), 'dd MMMM yyyy')}</span>
                      {bd.reason && <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginLeft: 10 }}>— {bd.reason}</span>}
                    </div>
                    <button onClick={() => removeBlockedDate(bd.id)}
                      style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '2px 8px' }}>
                      <i className="fa-solid fa-trash" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
