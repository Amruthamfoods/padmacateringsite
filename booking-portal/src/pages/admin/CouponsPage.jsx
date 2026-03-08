import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const empty = { code: '', discountType: 'FLAT', value: '', minOrderValue: '0', expiryDate: '', usageLimit: '', active: true }

function genCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/admin/coupons').then(r => setCoupons(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(empty); setModal('add') }
  function openEdit(c) { setForm({ ...c, expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '', usageLimit: c.usageLimit || '' }); setModal(c) }

  async function handleSave() {
    if (!form.code || !form.value) { toast.error('Code and value required'); return }
    setSaving(true)
    try {
      if (modal === 'add') await api.post('/admin/coupons', form)
      else await api.put(`/admin/coupons/${modal.id}`, form)
      toast.success(modal === 'add' ? 'Coupon created' : 'Coupon updated')
      setModal(null); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save') }
    finally { setSaving(false) }
  }

  async function toggleActive(coupon) {
    try {
      await api.put(`/admin/coupons/${coupon.id}`, { active: !coupon.active })
      setCoupons(cs => cs.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c))
    } catch { toast.error('Failed to update') }
  }

  async function deleteCoupon(id) {
    if (!confirm('Delete this coupon?')) return
    try { await api.delete(`/admin/coupons/${id}`); setCoupons(cs => cs.filter(c => c.id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-sub">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Create Coupon
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>No coupons yet</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>{['Code', 'Type', 'Value', 'Min Order', 'Expiry', 'Usage', 'Active', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 600 }}>{c.code}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.discountType}</td>
                    <td style={{ color: 'var(--white)' }}>{c.discountType === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td style={{ color: 'var(--text-muted)' }}>₹{c.minOrderValue}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.expiryDate ? format(new Date(c.expiryDate), 'dd MMM yyyy') : '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                    <td>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={c.active} onChange={() => toggleActive(c)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(c)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => deleteCoupon(c.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'add' ? 'Create Coupon' : 'Edit Coupon'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}><i className="fa-solid fa-xmark" /></button>
            </div>

            <div className="field-block">
              <label className="field-label">Coupon Code *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="booking-input" style={{ flex: 1 }} />
                <button onClick={() => setForm(f => ({ ...f, code: genCode() }))} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
                  <i className="fa-solid fa-dice" />
                </button>
              </div>
            </div>

            <div className="form-row-2">
              <div className="field-block" style={{ marginBottom: 0 }}>
                <label className="field-label">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="booking-input">
                  <option value="FLAT">Flat (₹)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>
              <div className="field-block" style={{ marginBottom: 0 }}>
                <label className="field-label">Value *</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="booking-input" />
              </div>
            </div>

            {[
              ['Min Order Value (₹)', 'minOrderValue', 'number'],
              ['Expiry Date', 'expiryDate', 'date'],
              ['Usage Limit (blank = unlimited)', 'usageLimit', 'number'],
            ].map(([label, key, type]) => (
              <div className="field-block" key={key}>
                <label className="field-label">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="booking-input" style={{ colorScheme: 'dark' }} />
              </div>
            ))}

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-warm)', marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              Active (customers can use this coupon)
            </label>

            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Coupon</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
