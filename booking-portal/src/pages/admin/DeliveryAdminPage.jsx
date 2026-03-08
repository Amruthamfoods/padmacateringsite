import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

const DEFAULTS = {
  baseAddress: 'Ushodaya Junction, Dwaraka Nagar, Visakhapatnam',
  baseLat: 17.7261, baseLng: 83.3044,
  freeUpToKm: 0,
  tier1MaxKm: 5,   tier1Charge: 300,
  tier2MaxKm: 10,  tier2Charge: 600,
  tier3MaxKm: 15,  tier3Charge: 800,
  tier4MaxKm: 20,  tier4Charge: 1200,
  tier5Charge: 1500,
  maxDeliveryKm: 30,
}

export default function DeliveryAdminPage() {
  const { token } = useAuthStore()
  const headers = { Authorization: `Bearer ${token}` }
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/delivery/settings', { headers })
      .then(r => setForm({ ...DEFAULTS, ...r.data }))
      .catch(() => toast.error('Failed to load delivery settings'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/delivery/settings', form, { headers })
      toast.success('Delivery settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="admin-page"><p>Loading...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Delivery Settings</h1>
        <p className="admin-page-sub">Configure delivery zones and charges. 100+ packs = free up to 10km.</p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Kitchen / Base Location
            </div>
            <div style={{ padding: 20 }}>
              <div className="admin-field" style={{ marginBottom: 14 }}>
                <label className="admin-label">Base Address</label>
                <input type="text" className="admin-input" value={form.baseAddress ?? ''} onChange={e => setForm(f => ({ ...f, baseAddress: e.target.value }))} style={{ maxWidth: 320 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label className="admin-label">Latitude</label>
                  <input type="number" step="any" className="admin-input" value={form.baseLat ?? 17.7261} onChange={e => setForm(f => ({ ...f, baseLat: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-label">Longitude</label>
                  <input type="number" step="any" className="admin-input" value={form.baseLng ?? 83.3044} onChange={e => setForm(f => ({ ...f, baseLng: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">Max Delivery Distance (km)</label>
                <input type="number" className="admin-input" value={form.maxDeliveryKm ?? 30} onChange={e => setForm(f => ({ ...f, maxDeliveryKm: e.target.value }))} style={{ maxWidth: 120 }} />
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.25)' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#4caf50', fontWeight: 600 }}>Bulk Free Rule</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>100+ packs: free delivery up to 10km, Rs300 off for zones beyond 10km</p>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-truck" style={{ marginRight: 8, color: 'var(--gold)' }} />
              Delivery Charge Tiers
            </div>
            <div style={{ padding: 20 }}>
              {[
                { label: 'Zone 1', color: '#4CAF50', maxKey: 'tier1MaxKm', chargeKey: 'tier1Charge', from: 0 },
                { label: 'Zone 2', color: '#2196F3', maxKey: 'tier2MaxKm', chargeKey: 'tier2Charge', fromKey: 'tier1MaxKm' },
                { label: 'Zone 3', color: '#FF9800', maxKey: 'tier3MaxKm', chargeKey: 'tier3Charge', fromKey: 'tier2MaxKm' },
                { label: 'Zone 4', color: '#F44336', maxKey: 'tier4MaxKm', chargeKey: 'tier4Charge', fromKey: 'tier3MaxKm' },
              ].map(t => (
                <div key={t.label} style={{ padding: '10px 14px', borderRadius: 8, background: t.color + '11', border: '1px solid ' + t.color + '44', marginBottom: 10 }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 700, color: t.color, fontSize: '0.82rem' }}>{t.label} ({t.fromKey ? form[t.fromKey] : t.from} - {form[t.maxKey]} km)</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label className="admin-label" style={{ fontSize: '0.72rem' }}>Max km</label>
                      <input type="number" className="admin-input" value={form[t.maxKey] ?? ''} onChange={e => setForm(f => ({ ...f, [t.maxKey]: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-label" style={{ fontSize: '0.72rem' }}>Charge (Rs)</label>
                      <input type="number" className="admin-input" value={form[t.chargeKey] ?? ''} onChange={e => setForm(f => ({ ...f, [t.chargeKey]: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(156,39,176,0.1)', border: '1px solid rgba(156,39,176,0.25)' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#9c27b0', fontSize: '0.82rem' }}>Zone 5 ({form.tier4MaxKm} - {form.maxDeliveryKm} km)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Charge (Rs)</span>
                  <input type="number" className="admin-input" value={form.tier5Charge ?? 1500} onChange={e => setForm(f => ({ ...f, tier5Charge: e.target.value }))} style={{ width: 90 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header"><i className="fa-solid fa-table" style={{ marginRight: 8 }} />Zone Preview</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%' }}>
              <thead><tr><th>Zone</th><th>Distance</th><th>Standard</th><th>100+ Packs</th></tr></thead>
              <tbody>
                <tr><td>Zone 1</td><td>0 - {form.tier1MaxKm} km</td><td>Rs {form.tier1Charge}</td><td style={{ color: '#4caf50', fontWeight: 600 }}>Free</td></tr>
                <tr><td>Zone 2</td><td>{form.tier1MaxKm} - {form.tier2MaxKm} km</td><td>Rs {form.tier2Charge}</td><td style={{ color: '#4caf50', fontWeight: 600 }}>Free (up to 10km)</td></tr>
                <tr><td>Zone 3</td><td>{form.tier2MaxKm} - {form.tier3MaxKm} km</td><td>Rs {form.tier3Charge}</td><td>Rs {form.tier3Charge - 300}</td></tr>
                <tr><td>Zone 4</td><td>{form.tier3MaxKm} - {form.tier4MaxKm} km</td><td>Rs {form.tier4Charge}</td><td>Rs {form.tier4Charge - 300}</td></tr>
                <tr><td>Zone 5</td><td>{form.tier4MaxKm} - {form.maxDeliveryKm} km</td><td>Rs {form.tier5Charge}</td><td>Rs {form.tier5Charge - 300}</td></tr>
                <tr><td style={{ color: 'var(--text-muted)' }}>Out of Range</td><td>Beyond {form.maxDeliveryKm} km</td><td colSpan={2} style={{ color: '#f44336' }}>Call +91 86 86 622 722</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Delivery Settings'}
        </button>
      </form>
    </div>
  )
}
