import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STYLES = ['ANDHRA', 'NORTH_INDIAN', 'MIXED', 'FUSION']
const TYPES  = ['VEG', 'NON_VEG']

/* ─── Shared field helpers ─────────────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="field-block">
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

/* ─── Item Modal (unchanged) ────────────────────────────────────────────── */
function ItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(
    item || { name: '', description: '', categoryId: '', style: 'ANDHRA', type: 'VEG', price: '', active: true }
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name || !form.categoryId) { toast.error('Name and category required'); return }
    setSaving(true)
    try {
      const fn = item
        ? api.put(`/admin/menu/items/${item.id}`, form)
        : api.post('/admin/menu/items', form)
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
          <Field label={label} key={key}>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="booking-input" />
          </Field>
        ))}

        <Field label="Category *">
          <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="booking-input">
            <option value="">Select…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <div className="form-row-2">
          <Field label="Style">
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))} className="booking-input">
              {STYLES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="booking-input">
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', '-')}</option>)}
            </select>
          </Field>
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

/* ─── Package Modal (create / edit basic info) ──────────────────────────── */
function PackageModal({ pkg, onSave, onClose }) {
  const [form, setForm] = useState(
    pkg
      ? { name: pkg.name, eventType: pkg.eventType || '', style: pkg.style, type: pkg.type, servesMin: pkg.servesMin, description: pkg.description || '', basePrice: pkg.basePrice }
      : { name: '', eventType: '', style: 'ANDHRA', type: 'VEG', servesMin: 50, description: '', basePrice: 0 }
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name) { toast.error('Package name required'); return }
    setSaving(true)
    try {
      if (pkg) await api.put(`/admin/menu/packages/${pkg.id}`, form)
      else await api.post('/admin/menu/packages', form)
      toast.success(pkg ? 'Package updated' : 'Package created')
      onSave()
    } catch { toast.error('Failed to save package') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 className="modal-title">{pkg ? 'Edit Package' : 'New Package'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <Field label="Package Name *">
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="booking-input" placeholder="e.g. Silver Thali" />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="booking-input" rows={2} style={{ resize: 'vertical' }} placeholder="Brief description of what's included…" />
        </Field>

        <Field label="Event Type (optional)">
          <input type="text" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} className="booking-input" placeholder="e.g. Wedding, Birthday, Corporate" />
        </Field>

        <div className="form-row-2">
          <Field label="Type">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="booking-input">
              <option value="VEG">Pure Veg</option>
              <option value="NON_VEG">Non-Veg</option>
            </select>
          </Field>
          <Field label="Style">
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))} className="booking-input">
              {STYLES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </Field>
        </div>

        <div className="form-row-2">
          <Field label="Min Guests">
            <input type="number" value={form.servesMin} onChange={e => setForm(f => ({ ...f, servesMin: e.target.value }))} className="booking-input" min={1} />
          </Field>
          <Field label="Base Price (₹/person)">
            <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className="booking-input" min={0} />
          </Field>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Package</>}
        </button>
      </div>
    </div>
  )
}

/* ─── Tier Modal ────────────────────────────────────────────────────────── */
function TierModal({ pkgId, tier, onSave, onClose }) {
  const [form, setForm] = useState(
    tier
      ? { minGuests: tier.minGuests, maxGuests: tier.maxGuests ?? '', pricePerPerson: tier.pricePerPerson }
      : { minGuests: '', maxGuests: '', pricePerPerson: '' }
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.minGuests || !form.pricePerPerson) { toast.error('Min guests and price required'); return }
    setSaving(true)
    try {
      if (tier) await api.put(`/admin/packages/${pkgId}/tiers/${tier.id}`, form)
      else await api.post(`/admin/packages/${pkgId}/tiers`, form)
      toast.success(tier ? 'Tier updated' : 'Tier added')
      onSave()
    } catch { toast.error('Failed to save tier') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 className="modal-title">{tier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          e.g. 50–100 guests at ₹350/person, 101–200 guests at ₹300/person
        </p>

        <div className="form-row-2">
          <Field label="Min Guests *">
            <input type="number" value={form.minGuests} onChange={e => setForm(f => ({ ...f, minGuests: e.target.value }))} className="booking-input" min={1} placeholder="e.g. 50" />
          </Field>
          <Field label="Max Guests (blank = unlimited)">
            <input type="number" value={form.maxGuests} onChange={e => setForm(f => ({ ...f, maxGuests: e.target.value }))} className="booking-input" min={1} placeholder="e.g. 100" />
          </Field>
        </div>

        <Field label="Price per Person (₹) *">
          <input type="number" value={form.pricePerPerson} onChange={e => setForm(f => ({ ...f, pricePerPerson: e.target.value }))} className="booking-input" min={0} placeholder="e.g. 350" />
        </Field>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Tier</>}
        </button>
      </div>
    </div>
  )
}

/* ─── Rule Modal ────────────────────────────────────────────────────────── */
function RuleModal({ pkgId, rule, categories, allItems, onSave, onClose }) {
  const [form, setForm] = useState(
    rule
      ? {
          categoryId: rule.categoryId,
          label: rule.label,
          minChoices: rule.minChoices,
          maxChoices: rule.maxChoices,
          allowExtras: rule.extraItemPrice > 0,
          itemIds: rule.allowedItems?.map(ai => ai.menuItemId) || [],
        }
      : { categoryId: '', label: '', minChoices: 1, maxChoices: 3, allowExtras: false, itemIds: [] }
  )
  const [saving, setSaving] = useState(false)

  // Items filtered to the selected category
  const catItems = allItems.filter(i => i.categoryId === parseInt(form.categoryId))

  function toggleItem(id) {
    setForm(f => ({
      ...f,
      itemIds: f.itemIds.includes(id) ? f.itemIds.filter(x => x !== id) : [...f.itemIds, id],
    }))
  }

  function selectAll() {
    setForm(f => ({ ...f, itemIds: catItems.map(i => i.id) }))
  }
  function clearAll() {
    setForm(f => ({ ...f, itemIds: [] }))
  }

  async function handleSave() {
    if (!form.categoryId || !form.label) { toast.error('Category and label required'); return }
    if (parseInt(form.minChoices) > parseInt(form.maxChoices)) { toast.error('Min choices cannot exceed max choices'); return }
    setSaving(true)
    try {
      const payload = {
        categoryId: parseInt(form.categoryId),
        label: form.label,
        minChoices: parseInt(form.minChoices),
        maxChoices: parseInt(form.maxChoices),
        // 1 = extras allowed (use item's own price), 0 = no extras
        extraItemPrice: form.allowExtras ? 1 : 0,
        itemIds: form.itemIds,
      }
      if (rule) await api.put(`/admin/packages/${pkgId}/rules/${rule.id}`, payload)
      else await api.post(`/admin/packages/${pkgId}/rules`, payload)
      toast.success(rule ? 'Rule updated' : 'Rule added')
      onSave()
    } catch { toast.error('Failed to save rule') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3 className="modal-title">{rule ? 'Edit Category Rule' : 'Add Category Rule'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <Field label="Category *">
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, itemIds: [] }))}
            className="booking-input"
          >
            <option value="">Select category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Label (shown to customer) *">
          <input
            type="text"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            className="booking-input"
            placeholder="e.g. Main Dish, Desserts, Beverages"
          />
        </Field>

        <div className="form-row-2">
          <Field label="Min Choices *">
            <input type="number" value={form.minChoices} onChange={e => setForm(f => ({ ...f, minChoices: e.target.value }))} className="booking-input" min={0} />
          </Field>
          <Field label="Max Choices *">
            <input type="number" value={form.maxChoices} onChange={e => setForm(f => ({ ...f, maxChoices: e.target.value }))} className="booking-input" min={1} />
          </Field>
        </div>

        {/* Allow extras toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderRadius: 8,
          border: `1px solid ${form.allowExtras ? 'var(--gold)' : 'var(--gold-line)'}`,
          background: form.allowExtras ? 'rgba(228,197,144,0.06)' : 'transparent',
          marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s',
        }} onClick={() => setForm(f => ({ ...f, allowExtras: !f.allowExtras }))}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-warm)', margin: 0 }}>
              Allow extra items beyond max
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
              Customer can pick more than max choices at an added cost
            </p>
          </div>
          <div style={{
            width: 40, height: 22, borderRadius: 11, flexShrink: 0,
            background: form.allowExtras ? 'var(--gold)' : 'var(--dark-5)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: form.allowExtras ? 21 : 3,
              transition: 'left 0.2s',
            }} />
          </div>
        </div>

        {form.allowExtras && (
          <p style={{ fontSize: '0.78rem', color: 'var(--gold)', padding: '0 2px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-circle-info" />
            Extra item charge = that item's price set in Menu Items
          </p>
        )}

        {/* Item selection */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>
              Allowed Items
              <span style={{ fontSize: '0.73rem', color: 'var(--text-faint)', fontWeight: 400, marginLeft: 6 }}>
                {form.itemIds.length === 0 && form.categoryId ? `(${catItems.length} items — all allowed)` : form.itemIds.length > 0 ? `${form.itemIds.length} selected` : ''}
              </span>
            </label>
            {form.categoryId && catItems.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={selectAll} style={{ fontSize: '0.72rem', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  All
                </button>
                <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>·</span>
                <button type="button" onClick={clearAll} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {!form.categoryId ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', padding: '12px 0' }}>Select a category first to see items.</p>
          ) : catItems.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', padding: '12px 0' }}>No items in this category.</p>
          ) : (
            <div style={{
              border: '1px solid var(--gold-line)',
              borderRadius: 8,
              maxHeight: 240,
              overflowY: 'auto',
            }}>
              {catItems.map((item, idx) => {
                const checked = form.itemIds.includes(item.id)
                return (
                  <label
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      cursor: 'pointer',
                      borderTop: idx > 0 ? '1px solid var(--gold-line)' : 'none',
                      background: checked ? 'rgba(228,197,144,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${checked ? 'var(--gold)' : 'var(--gold-line)'}`,
                      background: checked ? 'var(--gold)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <i className="fa-solid fa-check" style={{ fontSize: '0.6rem', color: 'var(--dark-1)' }} />}
                    </div>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: item.type === 'VEG' ? '#2ea843' : '#c0392b',
                    }} />
                    <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-warm)' }}>{item.name}</span>
                    {item.price > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600 }}>+₹{item.price}</span>
                    )}
                  </label>
                )
              })}
            </div>
          )}
          {form.categoryId && catItems.length > 0 && form.itemIds.length === 0 && (
            <p style={{ fontSize: '0.74rem', color: 'var(--text-faint)', marginTop: 6 }}>
              Leave all unchecked to allow any item from this category.
            </p>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Rule</>}
        </button>
      </div>
    </div>
  )
}

/* ─── Package Detail Panel ──────────────────────────────────────────────── */
function PackageDetail({ pkg, categories, allItems, onBack, onPackageUpdate }) {
  const [tiers, setTiers] = useState(pkg.pricingTiers || [])
  const [rules, setRules] = useState(pkg.categoryRules || [])
  const [modal, setModal] = useState(null)
  // modal: null | 'editPkg' | 'addTier' | {tier} | 'addRule' | {rule}

  async function deleteTier(tierId) {
    if (!confirm('Delete this pricing tier?')) return
    try {
      await api.delete(`/admin/packages/${pkg.id}/tiers/${tierId}`)
      setTiers(ts => ts.filter(t => t.id !== tierId))
      toast.success('Tier deleted')
    } catch { toast.error('Failed to delete tier') }
  }

  async function deleteRule(ruleId) {
    if (!confirm('Delete this category rule?')) return
    try {
      await api.delete(`/admin/packages/${pkg.id}/rules/${ruleId}`)
      setRules(rs => rs.filter(r => r.id !== ruleId))
      toast.success('Rule deleted')
    } catch { toast.error('Failed to delete rule') }
  }

  async function reloadPkg() {
    try {
      const { data } = await api.get('/admin/menu/packages')
      const updated = data.find(p => p.id === pkg.id)
      if (updated) {
        setTiers(updated.pricingTiers || [])
        setRules(updated.categoryRules || [])
        onPackageUpdate(updated)
      }
    } catch { /* silent */ }
  }

  const tiersSorted = [...tiers].sort((a, b) => a.minGuests - b.minGuests)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Packages
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.25rem', margin: 0 }}>{pkg.name}</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            {pkg.type.replace('_', '-')} · {pkg.style.replace('_', ' ')} · Min {pkg.servesMin} guests
            {pkg.description && ` · ${pkg.description}`}
          </p>
        </div>
        <button onClick={() => setModal('editPkg')} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <i className="fa-solid fa-pen" style={{ marginRight: 6 }} />Edit Info
        </button>
      </div>

      {/* ── Pricing Tiers ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-warm)', fontSize: '0.9rem', margin: 0 }}>
              <i className="fa-solid fa-tags" style={{ marginRight: 8, color: 'var(--gold)' }} />Pricing Tiers
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
              Set per-person price for different guest count ranges
            </p>
          </div>
          <button onClick={() => setModal('addTier')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            <i className="fa-solid fa-plus" /> Add Tier
          </button>
        </div>

        {tiersSorted.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
            No pricing tiers yet. Add one to set per-person rates.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Guest Range', 'Price / Person', 'Est. (100 guests)', ''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tiersSorted.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-warm)', fontWeight: 600 }}>
                      {t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} guests
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1rem' }}>
                      ₹{t.pricePerPerson}<span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>/pp</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      ₹{(t.pricePerPerson * 100).toLocaleString('en-IN')}
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setModal(t)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => deleteTier(t.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Category Rules ── */}
      <div className="admin-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-warm)', fontSize: '0.9rem', margin: 0 }}>
              <i className="fa-solid fa-list-check" style={{ marginRight: 8, color: 'var(--gold)' }} />Menu Selection Rules
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
              Define which categories customers pick from and how many items
            </p>
          </div>
          <button onClick={() => setModal('addRule')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
            <i className="fa-solid fa-plus" /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
            No menu rules yet. Add rules to define how customers build their menu.
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {rules.map((rule, idx) => {
              const allowedCount = rule.allowedItems?.length || 0
              const catItemsInRule = allItems.filter(i => i.categoryId === rule.categoryId)

              return (
                <div key={rule.id} style={{
                  padding: '14px 20px',
                  borderTop: idx > 0 ? '1px solid var(--gold-line)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* Rule header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-warm)', fontSize: '0.9rem' }}>{rule.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', padding: '2px 8px', border: '1px solid var(--gold-line)', borderRadius: 20 }}>
                          {rule.category?.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)', padding: '2px 8px', background: 'rgba(228,197,144,0.1)', borderRadius: 20 }}>
                          Pick {rule.minChoices}–{rule.maxChoices}
                        </span>
                        {rule.extraItemPrice > 0 ? (
                          <span style={{ fontSize: '0.72rem', color: '#c0392b', padding: '2px 8px', background: 'rgba(192,57,43,0.1)', borderRadius: 20 }}>
                            Extras allowed (item price)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 20 }}>
                            No extras
                          </span>
                        )}
                      </div>

                      {/* Allowed items */}
                      {allowedCount > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {rule.allowedItems.map(ai => {
                            const item = ai.menuItem
                            return (
                              <span key={ai.id} style={{
                                fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20,
                                border: '1px solid var(--gold-line)',
                                color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: item?.type === 'VEG' ? '#2ea843' : '#c0392b', flexShrink: 0 }} />
                                {item?.name}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: 0 }}>
                          All {catItemsInRule.length} items in "{rule.category?.name}" are allowed
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => setModal({ ...rule, isRule: true })} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => deleteRule(rule.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal === 'editPkg' && (
        <PackageModal
          pkg={pkg}
          onSave={() => { setModal(null); reloadPkg() }}
          onClose={() => setModal(null)}
        />
      )}

      {(modal === 'addTier' || (modal && !modal.isRule && modal.pricePerPerson !== undefined)) && (
        <TierModal
          pkgId={pkg.id}
          tier={modal !== 'addTier' ? modal : null}
          onSave={() => { setModal(null); reloadPkg() }}
          onClose={() => setModal(null)}
        />
      )}

      {(modal === 'addRule' || (modal && modal.isRule)) && (
        <RuleModal
          pkgId={pkg.id}
          rule={modal !== 'addRule' ? modal : null}
          categories={categories}
          allItems={allItems}
          onSave={() => { setModal(null); reloadPkg() }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

/* ─── Packages Tab ──────────────────────────────────────────────────────── */
function PackagesTab({ packages, setPackages, categories, allItems, load }) {
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [modal, setModal] = useState(null)

  async function deletePackage(id) {
    if (!confirm('Delete this package and all its tiers/rules?')) return
    try {
      await api.delete(`/admin/menu/packages/${id}`)
      setPackages(ps => ps.filter(p => p.id !== id))
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete') }
  }

  function handlePackageUpdate(updated) {
    setPackages(ps => ps.map(p => p.id === updated.id ? updated : p))
    setSelectedPkg(updated)
  }

  if (selectedPkg) {
    return (
      <PackageDetail
        pkg={selectedPkg}
        categories={categories}
        allItems={allItems}
        onBack={() => setSelectedPkg(null)}
        onPackageUpdate={handlePackageUpdate}
      />
    )
  }

  return (
    <>
      <div className="admin-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            {packages.length} package{packages.length !== 1 ? 's' : ''} — click <strong style={{ color: 'var(--text-warm)' }}>Manage</strong> to set pricing tiers & menu rules
          </p>
          <button onClick={() => setModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 14px' }}>
            <i className="fa-solid fa-plus" /> New Package
          </button>
        </div>

        {packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>
            No packages yet. Create one to get started.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Name', 'Type', 'Style', 'Min Guests', 'Base Price', 'Tiers', 'Rules', ''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td>
                      <p style={{ color: 'var(--white)', fontWeight: 600, margin: 0 }}>{pkg.name}</p>
                      {pkg.eventType && <p style={{ color: 'var(--text-faint)', fontSize: '0.72rem', margin: 0 }}>{pkg.eventType}</p>}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                        background: pkg.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)',
                        color: pkg.type === 'VEG' ? '#2ea843' : '#c0392b',
                      }}>{pkg.type.replace('_', '-')}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{pkg.style.replace('_', ' ')}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{pkg.servesMin}+</td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                      {pkg.basePrice > 0 ? `₹${pkg.basePrice}` : <span style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ color: pkg.pricingTiers?.length > 0 ? 'var(--gold)' : 'var(--text-faint)', fontSize: '0.82rem', fontWeight: 600 }}>
                        {pkg.pricingTiers?.length || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: pkg.categoryRules?.length > 0 ? '#4caf70' : 'var(--text-faint)', fontSize: '0.82rem', fontWeight: 600 }}>
                        {pkg.categoryRules?.length || 0}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => setSelectedPkg(pkg)}
                        className="action-btn edit"
                        title="Manage tiers & rules"
                        style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: 600 }}
                      >
                        <i className="fa-solid fa-gear" style={{ marginRight: 4 }} />Manage
                      </button>
                      <button onClick={() => deletePackage(pkg.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'add' && (
        <PackageModal
          pkg={null}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function MenuAdminPage() {
  const [tab, setTab]           = useState('items')
  const [items, setItems]       = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
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
    <div>
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
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                        background: item.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)',
                        color: item.type === 'VEG' ? '#2ea843' : '#c0392b',
                      }}>{item.type.replace('_', '-')}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>₹{item.price}</td>
                    <td>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: item.active ? '#2ea843' : 'var(--text-faint)' }} />
                    </td>
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
        <PackagesTab
          packages={packages}
          setPackages={setPackages}
          categories={categories}
          allItems={items}
          load={load}
        />
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
                    <td>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cat.active ? '#2ea843' : 'var(--text-faint)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && tab === 'items' && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          categories={categories}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
