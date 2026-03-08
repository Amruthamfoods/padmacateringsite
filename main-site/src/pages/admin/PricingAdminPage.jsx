import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

const DEFAULTS = {
  packingCostPercent: 5,
  mealboxDelivery: 500,
  packedFoodDelivery: 500,
  cateringDelivery: 1500,
  serviceChargeFlat: 1500,
  serviceChargeFreeAbove: 100,
}

export default function PricingAdminPage() {
  const { token } = useAuthStore()
  const headers = { Authorization: `Bearer ${token}` }
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/pricing/settings', { headers })
      .then(r => setForm({ ...DEFAULTS, ...r.data }))
      .catch(() => toast.error('Failed to load pricing settings'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/pricing/settings', form, { headers })
      toast.success('Pricing settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const field = (label, key, hint, suffix = '') => (
    <div className="admin-field" style={{ marginBottom: 14 }}>
      <label className="admin-label">{label}</label>
      {hint && <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', margin: '2px 0 4px' }}>{hint}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number" step="any" className="admin-input"
          value={form[key] ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ maxWidth: 140 }}
        />
        {suffix && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{suffix}</span>}
      </div>
    </div>
  )

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pricing Settings</h1>
        <p className="admin-page-sub">Configure delivery and service charges for each service type.</p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          {/* Mealbox */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-box" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Mealbox (Individual Meal Boxes)
            </div>
            <div style={{ padding: 20 }}>
              {field('Packing Cost', 'packingCostPercent', '% of base food price added for packaging', '% of food total')}
              {field('Delivery Charge', 'mealboxDelivery', 'Flat delivery charge for Mealbox orders', 'Rs')}
            </div>
          </div>

          {/* Packed Food */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-bag-shopping" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Packed Food (Self-Serve Containers)
            </div>
            <div style={{ padding: 20 }}>
              {field('Packing Cost', 'packingCostPercent', 'Same packing % as Mealbox', '% of food total')}
              {field('Delivery Charge', 'packedFoodDelivery', 'Flat delivery charge for Packed Food orders', 'Rs')}
            </div>
          </div>

          {/* Catering */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-bell-concierge" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Catering (Full Setup + Service)
            </div>
            <div style={{ padding: 20 }}>
              {field('Transport Charge', 'cateringDelivery', 'Delivery/transport estimate for catering events', 'Rs')}
              {field('Service Charge (flat)', 'serviceChargeFlat', 'Flat service charge for catering events', 'Rs')}
              {field('Free Above (guests)', 'serviceChargeFreeAbove', 'Service charge waived for orders above this count', 'guests')}
              <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)' }}>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#4caf50', fontWeight: 600 }}>Current Rule</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Orders of {form.serviceChargeFreeAbove}+ guests get service free (shows ~~₹{form.serviceChargeFlat}~~ Free)
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-calculator" style={{ marginRight: 8 }} />
              Sample Calculation Preview
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Example: 100 guests, ₹250/person package</p>
              {[
                ['Food', '₹' + (100 * 250).toLocaleString('en-IN')],
                ['Packing (Mealbox/Packed)', '₹' + Math.round(100 * 250 * form.packingCostPercent / 100).toLocaleString('en-IN')],
                ['Service charge (Catering)', 100 >= Number(form.serviceChargeFreeAbove) ? 'Free' : '₹' + Number(form.serviceChargeFlat).toLocaleString('en-IN')],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border-light)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: val === 'Free' ? '#4caf50' : 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Pricing Settings'}
        </button>
      </form>
    </div>
  )
}
