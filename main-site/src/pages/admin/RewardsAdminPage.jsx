import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

const TIER_COLOR = { Bronze: '#CD7F32', Silver: '#94A3B8', Gold: '#F59E0B' }

export default function RewardsAdminPage() {
  const { token } = useAuthStore()
  const headers = { Authorization: `Bearer ${token}` }

  const [settings, setSettings] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [loadingCust, setLoadingCust] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/rewards/settings', { headers }).then(r => {
      setSettings(r.data)
      setForm({
        enabled: r.data.enabled,
        pointsPer100: r.data.pointsPer100,
        pointValue: r.data.pointValue,
        expiryDays: r.data.expiryDays ?? '',
        minRedeem: r.data.minRedeem,
        silverMin: r.data.silverMin,
        silverDiscount: r.data.silverDiscount,
        goldMin: r.data.goldMin,
        goldDiscount: r.data.goldDiscount,
      })
    }).catch(() => toast.error('Failed to load settings'))
    .finally(() => setLoadingSettings(false))

    api.get('/admin/rewards/customers', { headers }).then(r => setCustomers(r.data))
    .catch(() => toast.error('Failed to load customer data'))
    .finally(() => setLoadingCust(false))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/admin/rewards/settings', form, { headers })
      setSettings(res.data)
      toast.success('Reward settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const fld = (key, label, type = 'number', hint = '') => (
    <div className="admin-field" style={{ marginBottom: 16 }}>
      <label className="admin-label">{label}</label>
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{hint}</p>}
      <input
        type={type} className="admin-input"
        value={form[key] ?? ''}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ maxWidth: 200 }}
      />
    </div>
  )

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: customers.length,
    bronze: customers.filter(c => c.tier === 'Bronze').length,
    silver: customers.filter(c => c.tier === 'Silver').length,
    gold: customers.filter(c => c.tier === 'Gold').length,
    totalPts: customers.reduce((s, c) => s + c.points, 0),
  }

  if (loadingSettings) return <div className="admin-page"><p>Loading…</p></div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Rewards Program</h1>
        <p className="admin-page-sub">Configure points, tiers and redemption rules</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Members', value: stats.total, color: 'var(--gold)' },
          { label: 'Bronze', value: stats.bronze, color: '#CD7F32' },
          { label: 'Silver', value: stats.silver, color: '#94A3B8' },
          { label: 'Gold', value: stats.gold, color: '#F59E0B' },
          { label: 'Total Points Issued', value: stats.totalPts.toLocaleString('en-IN'), color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card" style={{ padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>

        {/* Points Config */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-coins" style={{ marginRight: 8, color: 'var(--gold)' }} />
            Points Configuration
          </div>
          <form onSubmit={handleSave} style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rewards Program</span>
              <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.enabled}
                  onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                  style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.88rem', color: form.enabled ? '#4caf50' : 'var(--text-muted)', fontWeight: 600 }}>
                  {form.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {fld('pointsPer100', 'Points per ₹100 spent', 'number', 'How many points customer earns per ₹100')}
            {fld('pointValue', 'Point value (₹ per point)', 'number', 'Rupee worth of 1 point (e.g. 0.25 = 25 paise)')}
            {fld('minRedeem', 'Minimum points to redeem', 'number', 'Min points needed before redemption allowed')}
            {fld('expiryDays', 'Points expiry (days)', 'number', 'Leave blank for no expiry')}

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving} style={{ marginTop: 4 }}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Tier Config */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-crown" style={{ marginRight: 8, color: 'var(--gold)' }} />
            Tier Configuration
          </div>
          <form onSubmit={handleSave} style={{ padding: 20 }}>

            {/* Bronze */}
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(205,127,50,0.1)', border: '1px solid rgba(205,127,50,0.25)', marginBottom: 12 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#CD7F32', fontSize: '0.88rem' }}>Bronze (Base)</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>0 points — no discount</p>
            </div>

            {/* Silver */}
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.3)', marginBottom: 12 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#94A3B8', fontSize: '0.88rem' }}>Silver Tier</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="admin-label" style={{ fontSize: '0.75rem' }}>Min Points</label>
                  <input type="number" className="admin-input" value={form.silverMin ?? ''} onChange={e => setForm(f => ({ ...f, silverMin: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-label" style={{ fontSize: '0.75rem' }}>Discount %</label>
                  <input type="number" className="admin-input" value={form.silverDiscount ?? ''} onChange={e => setForm(f => ({ ...f, silverDiscount: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Gold */}
            <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#F59E0B', fontSize: '0.88rem' }}>Gold Tier</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="admin-label" style={{ fontSize: '0.75rem' }}>Min Points</label>
                  <input type="number" className="admin-input" value={form.goldMin ?? ''} onChange={e => setForm(f => ({ ...f, goldMin: e.target.value }))} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-label" style={{ fontSize: '0.75rem' }}>Discount %</label>
                  <input type="number" className="admin-input" value={form.goldDiscount ?? ''} onChange={e => setForm(f => ({ ...f, goldDiscount: e.target.value }))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Tiers'}
            </button>
          </form>
        </div>
      </div>

      {/* Customer Rewards Table */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><i className="fa-solid fa-users" style={{ marginRight: 8 }} />Customer Rewards</span>
          <input
            className="admin-input" placeholder="Search customers…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 220, padding: '6px 12px' }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loadingCust ? <p style={{ padding: 20, color: 'var(--text-muted)' }}>Loading…</p> : (
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Bookings</th>
                  <th>Total Spend</th>
                  <th>Points</th>
                  <th>Value</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No customers found</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</p>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{c.phone || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{c.bookingCount}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(c.totalSpend).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)' }}>{c.points.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#4caf50', fontWeight: 600 }}>₹{(c.points * (settings?.pointValue || 0.25)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700,
                        background: `${TIER_COLOR[c.tier]}22`, color: TIER_COLOR[c.tier],
                      }}>{c.tier}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
