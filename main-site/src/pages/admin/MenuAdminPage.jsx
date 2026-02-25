import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STYLES = ['ANDHRA', 'NORTH_INDIAN', 'MIXED', 'FUSION']
const TYPES = ['VEG', 'NON_VEG']

function ItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', description: '', categoryId: '', style: 'ANDHRA', type: 'VEG', price: '', active: true })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name || !form.categoryId) { toast.error('Name and category required'); return }
    setSaving(true)
    try {
      const fn = item ? api.put(`/admin/menu/items/${item.id}`, form) : api.post('/admin/menu/items', form)
      await fn
      onSave()
      toast.success(item ? 'Item updated' : 'Item created')
    } catch { toast.error('Failed to save item') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">{item ? 'Edit Item' : 'Add Menu Item'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        {[['Name *', 'name', 'text'], ['Description', 'description', 'text'], ['Price (₹/person)', 'price', 'number']].map(([label, key, type]) => (
          <div className="field-block" key={key}>
            <label className="field-label">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="booking-input" />
          </div>
        ))}
        <div className="field-block">
          <label className="field-label">Category *</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="booking-input">
            <option value="">Select…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Style</label>
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))} className="booking-input">
              {STYLES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="booking-input">
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
            </select>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-warm)', margin: '16px 0 20px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          Active (visible to customers)
        </label>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Item</>}
        </button>
      </div>
    </div>
  )
}

function PackageModal({ pkg, onSave, onClose }) {
  const [form, setForm] = useState(pkg || { name: '', eventType: '', style: 'ANDHRA', type: 'VEG', servesMin: 50, description: '', basePrice: 0 })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name) { toast.error('Package name required'); return }
    setSaving(true)
    try {
      if (pkg) {
        await api.put(`/admin/menu/packages/${pkg.id}`, form)
        toast.success('Package updated')
      } else {
        await api.post('/admin/menu/packages', form)
        toast.success('Package created')
      }
      onSave()
    } catch { toast.error('Failed to save package') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">{pkg ? 'Edit Package' : 'Create Package'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        {[['Name *', 'name', 'text'], ['Event Type', 'eventType', 'text'], ['Base Price (₹/pp)', 'basePrice', 'number'], ['Min Serves', 'servesMin', 'number']].map(([label, key, type]) => (
          <div className="field-block" key={key}>
            <label className="field-label">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="booking-input" />
          </div>
        ))}
        <div className="field-block">
          <label className="field-label">Description</label>
          <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="booking-input" style={{ resize: 'vertical' }} />
        </div>
        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Style</label>
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))} className="booking-input">
              {STYLES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="booking-input">
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Package</>}
        </button>
      </div>
    </div>
  )
}

function TierModal({ packageId, tier, onSave, onClose }) {
  const [form, setForm] = useState(tier || { minGuests: '', maxGuests: '', pricePerPerson: '' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.minGuests || !form.pricePerPerson) { toast.error('Min guests and price required'); return }
    setSaving(true)
    try {
      if (tier) {
        await api.put(`/admin/packages/${packageId}/tiers/${tier.id}`, form)
        toast.success('Tier updated')
      } else {
        await api.post(`/admin/packages/${packageId}/tiers`, form)
        toast.success('Tier created')
      }
      onSave()
    } catch { toast.error('Failed to save tier') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h3 className="modal-title">{tier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Min Guests *</label>
            <input type="number" value={form.minGuests} onChange={e => setForm(f => ({ ...f, minGuests: e.target.value }))} className="booking-input" />
          </div>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Max Guests</label>
            <input type="number" placeholder="(none = unlimited)" value={form.maxGuests || ''} onChange={e => setForm(f => ({ ...f, maxGuests: e.target.value }))} className="booking-input" />
          </div>
        </div>
        <div className="field-block">
          <label className="field-label">Price per Person (₹) *</label>
          <input type="number" value={form.pricePerPerson} onChange={e => setForm(f => ({ ...f, pricePerPerson: e.target.value }))} className="booking-input" />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Tier</>}
        </button>
      </div>
    </div>
  )
}

function RuleModal({ packageId, rule, categories, onSave, onClose }) {
  const [form, setForm] = useState(rule || { categoryId: '', label: '', minChoices: 1, maxChoices: '' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.categoryId || !form.label || !form.maxChoices) { toast.error('All fields required'); return }
    setSaving(true)
    try {
      if (rule) {
        await api.put(`/admin/packages/${packageId}/rules/${rule.id}`, form)
        toast.success('Rule updated')
      } else {
        await api.post(`/admin/packages/${packageId}/rules`, form)
        toast.success('Rule created')
      }
      onSave()
    } catch { toast.error('Failed to save rule') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h3 className="modal-title">{rule ? 'Edit Category Rule' : 'Add Category Rule'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="field-block">
          <label className="field-label">Display Label *</label>
          <input type="text" placeholder="e.g. Choose your Sweet" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="booking-input" />
        </div>
        <div className="field-block">
          <label className="field-label">Category *</label>
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="booking-input">
            <option value="">Select…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Min Choices *</label>
            <input type="number" min={0} value={form.minChoices} onChange={e => setForm(f => ({ ...f, minChoices: e.target.value }))} className="booking-input" />
          </div>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Max Choices *</label>
            <input type="number" min={1} value={form.maxChoices} onChange={e => setForm(f => ({ ...f, maxChoices: e.target.value }))} className="booking-input" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Rule</>}
        </button>
      </div>
    </div>
  )
}

function PackageEditPanel({ pkg, categories, onReload, onClose }) {
  const [tierModal, setTierModal] = useState(null) // null | 'add' | tier object
  const [ruleModal, setRuleModal] = useState(null)

  async function deleteTier(tierId) {
    if (!confirm('Delete this pricing tier?')) return
    try {
      await api.delete(`/admin/packages/${pkg.id}/tiers/${tierId}`)
      toast.success('Tier deleted')
      onReload()
    } catch { toast.error('Failed to delete tier') }
  }

  async function deleteRule(ruleId) {
    if (!confirm('Delete this category rule?')) return
    try {
      await api.delete(`/admin/packages/${pkg.id}/rules/${ruleId}`)
      toast.success('Rule deleted')
      onReload()
    } catch { toast.error('Failed to delete rule') }
  }

  return (
    <div style={{
      width: 380, flexShrink: 0, background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
      borderRadius: 14, padding: 20, overflowY: 'auto', maxHeight: '80vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '1rem' }}>{pkg.name}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Pricing Tiers */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>Pricing Tiers</p>
          <button onClick={() => setTierModal('add')} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            <i className="fa-solid fa-plus" /> Add Tier
          </button>
        </div>
        {(pkg.pricingTiers || []).length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>No pricing tiers yet</p>
        ) : (
          (pkg.pricingTiers || []).map(tier => (
            <div key={tier.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--dark-3)', borderRadius: 8, marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--white)' }}>
                  {tier.minGuests}{tier.maxGuests ? `–${tier.maxGuests}` : '+'} guests
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>₹{tier.pricePerPerson}/pp</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setTierModal(tier)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                <button onClick={() => deleteTier(tier.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Rules */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>Category Rules</p>
          <button onClick={() => setRuleModal('add')} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
            <i className="fa-solid fa-plus" /> Add Rule
          </button>
        </div>
        {(pkg.categoryRules || []).length === 0 ? (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>No category rules yet</p>
        ) : (
          (pkg.categoryRules || []).map(rule => (
            <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--dark-3)', borderRadius: 8, marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--white)' }}>{rule.label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {rule.category?.name} · Pick {rule.minChoices}–{rule.maxChoices}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setRuleModal(rule)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                <button onClick={() => deleteRule(rule.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tier modal */}
      {tierModal && (
        <TierModal
          packageId={pkg.id}
          tier={tierModal === 'add' ? null : tierModal}
          onSave={() => { setTierModal(null); onReload() }}
          onClose={() => setTierModal(null)}
        />
      )}

      {/* Rule modal */}
      {ruleModal && (
        <RuleModal
          packageId={pkg.id}
          rule={ruleModal === 'add' ? null : ruleModal}
          categories={categories}
          onSave={() => { setRuleModal(null); onReload() }}
          onClose={() => setRuleModal(null)}
        />
      )}
    </div>
  )
}

export default function MenuAdminPage() {
  const [tab, setTab] = useState('items')
  const [items, setItems] = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [pkgModal, setPkgModal] = useState(null)
  const [editingPkg, setEditingPkg] = useState(null)
  const fileRef = useRef()

  function load() {
    setLoading(true)
    Promise.all([
      api.get('/admin/menu/items'),
      api.get('/admin/menu/packages'),
      api.get('/menu/categories'),
    ]).then(([i, p, c]) => {
      setItems(i.data)
      setPackages(p.data)
      setCategories(c.data)
      // Refresh editingPkg if open
      if (editingPkg) {
        const refreshed = p.data.find(x => x.id === editingPkg.id)
        if (refreshed) setEditingPkg(refreshed)
      }
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function deleteItem(id) {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/admin/menu/items/${id}`)
      setItems(its => its.filter(i => i.id !== id))
      toast.success('Item deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function deletePackage(id) {
    if (!confirm('Delete this package?')) return
    try {
      await api.delete(`/admin/menu/packages/${id}`)
      setPackages(ps => ps.filter(p => p.id !== id))
      if (editingPkg?.id === id) setEditingPkg(null)
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function handleCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/admin/menu/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(`Imported ${data.imported} items`)
      load()
    } catch { toast.error('Import failed') }
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Menu Manager</h1>
            <p className="admin-page-sub">{items.length} items · {packages.length} packages</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[['items', 'Items'], ['packages', 'Packages'], ['categories', 'Categories']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
                background: tab === key ? 'var(--gold)' : 'transparent',
                color: tab === key ? 'var(--dark-1)' : 'var(--text-muted)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : tab === 'items' ? (
          <div className="admin-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', gap: 8 }}>
              <button onClick={() => setModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-plus" /> Add Item
              </button>
              <input type="file" ref={fileRef} accept=".csv" onChange={handleCSV} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-file-csv" /> Import CSV
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>{['Name', 'Category', 'Style', 'Type', 'Price', 'Active', ''].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.category?.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.style.replace('_', ' ')}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: item.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)', color: item.type === 'VEG' ? '#2ea843' : '#c0392b' }}>
                          {item.type.replace('_', '-')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>₹{item.price}</td>
                      <td><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: item.active ? '#2ea843' : 'var(--text-faint)' }} /></td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setModal(item)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                        <button onClick={() => deleteItem(item.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'packages' ? (
          <div className="admin-card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gold-line)' }}>
              <button onClick={() => setPkgModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-plus" /> Create Package
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>{['Name', 'Style', 'Type', 'Tiers', 'Rules', 'Items', ''].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id} style={{ cursor: 'pointer' }} onClick={() => setEditingPkg(pkg)}>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{pkg.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{pkg.style.replace('_', ' ')}</td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: pkg.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)', color: pkg.type === 'VEG' ? '#2ea843' : '#c0392b' }}>
                          {pkg.type.replace('_', '-')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{pkg.pricingTiers?.length || 0}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{pkg.categoryRules?.length || 0}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{pkg.items?.length || 0}</td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button onClick={e => { e.stopPropagation(); setPkgModal(pkg) }} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                        <button onClick={e => { e.stopPropagation(); deletePackage(pkg.id) }} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '30px 0' }}>No packages yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>{['#', 'Name', 'Sort Order', 'Active'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>{cat.id}</td>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{cat.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{cat.sortOrder}</td>
                      <td><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cat.active ? '#2ea843' : 'var(--text-faint)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Package edit panel (tiers + rules) */}
      {editingPkg && tab === 'packages' && (
        <PackageEditPanel
          pkg={editingPkg}
          categories={categories}
          onReload={load}
          onClose={() => setEditingPkg(null)}
        />
      )}

      {/* Item modal */}
      {modal && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          categories={categories}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}

      {/* Package create/edit modal */}
      {pkgModal && (
        <PackageModal
          pkg={pkgModal === 'add' ? null : pkgModal}
          onSave={() => { setPkgModal(null); load() }}
          onClose={() => setPkgModal(null)}
        />
      )}
    </div>
  )
}
