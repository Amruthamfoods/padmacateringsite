import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import * as XLSX from 'xlsx'

const STYLES = ['ANDHRA', 'NORTH_INDIAN', 'MIXED', 'FUSION']
const TYPES = ['VEG', 'NON_VEG']

function ItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', description: '', categoryId: '', style: 'ANDHRA', type: 'VEG', price: '', servingSize: '', servingUnit: 'gm', active: true })
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

        {[['Name *', 'name', 'text'], ['Description', 'description', 'text'], ['Price (₹/kg or ₹/pcs)', 'price', 'number']].map(([label, key, type]) => (
          <div className="field-block" key={key}>
            <label className="field-label">{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="booking-input" />
          </div>
        ))}

        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Serving Size (per person)</label>
            <input type="number" min="0" step="any" placeholder="e.g. 150 or 2" value={form.servingSize} onChange={e => setForm(f => ({ ...f, servingSize: e.target.value }))} className="booking-input" />
          </div>
          <div className="field-block" style={{ marginBottom: 0 }}>
            <label className="field-label">Serving Unit</label>
            <select value={form.servingUnit} onChange={e => setForm(f => ({ ...f, servingUnit: e.target.value }))} className="booking-input">
              <option value="gm">gm</option>
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
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

function PackageImageModal({ pkg, onSave, onClose }) {
  const [preview, setPreview]   = useState(pkg.image || null)
  const [file, setFile]         = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) { toast.error('Please select an image first'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post(`/admin/menu/packages/${pkg.id}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Image uploaded!')
      onSave(data.image)
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleRemove() {
    try {
      await api.put(`/admin/menu/packages/${pkg.id}`, { image: null })
      toast.success('Image removed')
      onSave(null)
    } catch { toast.error('Failed to remove image') }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3 className="modal-title">Package Image — {pkg.name}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        {/* Preview */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', height: 200, borderRadius: 12, overflow: 'hidden',
            background: 'var(--dark-3)', border: '2px dashed var(--gold-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 16, position: 'relative',
          }}
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-camera" style={{ marginRight: 6 }} />Click to change
                </span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-image" style={{ fontSize: '2.5rem', marginBottom: 10, display: 'block' }} />
              <span style={{ fontSize: '0.85rem' }}>Click to select image</span>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          JPG, PNG, WebP · Max 5 MB · Recommended: 800×600px
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleUpload} disabled={!file || uploading} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            {uploading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Uploading…</> : <><i className="fa-solid fa-upload" /> Upload Image</>}
          </button>
          {pkg.image && (
            <button onClick={handleRemove} className="btn btn-outline" style={{ color: '#c0392b', borderColor: '#c0392b' }}>
              <i className="fa-solid fa-trash" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



function PackageModal({ pkg, onSave, onClose }) {
  const defaultTiers = [
    { minGuests: pkg?.servesMin || 50,  maxGuests: 100, pricePerPerson: '' },
    { minGuests: 101, maxGuests: 200,   pricePerPerson: '' },
    { minGuests: 201, maxGuests: null,  pricePerPerson: '' },
  ]
  const [form, setForm] = useState(pkg || {
    name: '', type: 'VEG', style: 'ANDHRA', eventType: '', serviceType: '', servesMin: 50, basePrice: '', description: '',
    mealTypes: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
  })
  const [tiers, setTiers] = useState(
    (pkg?.pricingTiers?.length ? pkg.pricingTiers : defaultTiers).map(t => ({
      minGuests: t.minGuests,
      maxGuests: t.maxGuests ?? '',
      pricePerPerson: t.pricePerPerson ?? '',
    }))
  )
  const [saving, setSaving] = useState(false)

  function updateTier(i, field, val) {
    setTiers(ts => ts.map((t, idx) => idx === i ? { ...t, [field]: val } : t))
  }

  function addTier() {
    const last = tiers[tiers.length - 1]
    const nextMin = last?.maxGuests ? parseInt(last.maxGuests) + 1 : ''
    setTiers(ts => [...ts, { minGuests: nextMin, maxGuests: '', pricePerPerson: '' }])
  }

  function removeTier(i) {
    if (tiers.length <= 1) return
    setTiers(ts => ts.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!form.name) { toast.error('Package name required'); return }
    if (tiers.some(t => t.pricePerPerson === '' || t.pricePerPerson === null)) {
      toast.error('Set price per person for all slabs'); return
    }
    setSaving(true)
    try {
      const basePrice = tiers[0]?.pricePerPerson || form.basePrice || 0
      const servesMin = tiers[0]?.minGuests || form.servesMin || 50
      const payload = { ...form, basePrice, servesMin }
      let savedPkg
      if (pkg) {
        const res = await api.put(`/admin/menu/packages/${pkg.id}`, payload)
        savedPkg = res.data
      } else {
        const res = await api.post('/admin/menu/packages', payload)
        savedPkg = res.data
      }
      // Save tiers
      await api.put(`/admin/packages/${savedPkg.id}/tiers/bulk`, {
        tiers: tiers.map((t, i) => ({
          minGuests: parseInt(t.minGuests) || 0,
          maxGuests: i < tiers.length - 1 ? (parseInt(t.maxGuests) || null) : null,
          pricePerPerson: parseFloat(t.pricePerPerson) || 0,
        }))
      })
      onSave()
      toast.success(pkg ? 'Package updated' : 'Package created')
    } catch { toast.error('Failed to save package') }
    finally { setSaving(false) }
  }

  const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Hi-Tea']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 className="modal-title">Package Image — {pkg.name}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="field-block">
          <label className="field-label">Package Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="booking-input" placeholder="e.g. Premium Veg Package" />
        </div>

        <div className="field-block">
          <label className="field-label">Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="booking-input">
            <option value="VEG">VEG</option>
            <option value="NON_VEG">NON-VEG</option>
          </select>
        </div>

        <div className="form-row-2">
          <div className="field-block" style={{ marginBottom: 0, marginTop: 12 }}>
            <label className="field-label">Min Guests</label>
            <input type="number" min="1" value={form.servesMin} onChange={e => setForm(f => ({ ...f, servesMin: e.target.value }))} className="booking-input" placeholder="e.g. 50" />
          </div>
          <div className="field-block" style={{ marginBottom: 0, marginTop: 12 }}>
            <label className="field-label">Style</label>
            <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))} className="booking-input">
              {['ANDHRA','NORTH_INDIAN','MIXED','FUSION'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="field-block" style={{ marginTop: 12 }}>
          <label className="field-label">Service Type</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            {['Meal Box', 'Delivery', 'Catering'].map(svc => {
              const selected = (form.serviceType || '').split(',').map(s => s.trim()).filter(Boolean)
              const checked = selected.includes(svc)
              return (
                <label key={svc} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-warm)', cursor: 'pointer', background: checked ? 'rgba(180,140,60,0.15)' : 'var(--dark-3)', border: `1px solid ${checked ? 'var(--gold)' : 'var(--gold-line)'}`, borderRadius: 8, padding: '6px 12px' }}>
                  <input type="checkbox" checked={checked}
                    onChange={e => {
                      const next = e.target.checked ? [...selected, svc] : selected.filter(x => x !== svc)
                      setForm(f => ({ ...f, serviceType: next.join(', ') }))
                    }}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {svc}
                </label>
              )
            })}
          </div>
        </div>

        <div className="field-block">
          <label className="field-label">Event Category</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {['Wedding', 'Birthday', 'Engagement', 'Anniversary', 'Baby Shower', 'Housewarming', 'Graduation', 'Corporate', 'Social Gathering'].map(evt => {
              const selected = (form.eventType || '').split(',').map(s => s.trim()).filter(Boolean)
              const checked = selected.includes(evt)
              return (
                <label key={evt} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-warm)', cursor: 'pointer', background: checked ? 'rgba(180,140,60,0.12)' : 'var(--dark-3)', border: `1px solid ${checked ? 'var(--gold)' : 'var(--gold-line)'}`, borderRadius: 6, padding: '5px 10px' }}>
                  <input type="checkbox" checked={checked}
                    onChange={e => {
                      const next = e.target.checked ? [...selected, evt] : selected.filter(x => x !== evt)
                      setForm(f => ({ ...f, eventType: next.join(', ') }))
                    }}
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  {evt}
                </label>
              )
            })}
          </div>
        </div>

        <div className="field-block">
          <label className="field-label">Description</label>
          <input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="booking-input" />
        </div>

        <div className="field-block">
          <label className="field-label">Meal Types</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MEAL_TYPES.map(m => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-warm)', cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={(form.mealTypes || []).includes(m)}
                  onChange={e => setForm(f => ({
                    ...f,
                    mealTypes: e.target.checked ? [...(f.mealTypes || []), m] : (f.mealTypes || []).filter(x => x !== m)
                  }))}
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        {/* Pricing slabs */}
        <div className="field-block">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Pricing Slabs (&#8377;/person)</label>
            <button onClick={addTier} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              <i className="fa-solid fa-plus" /> Add Slab
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tiers.map((tier, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--dark-3)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--gold-line)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700, minWidth: 18 }}>S{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                  <input
                    type="number" min="1" placeholder="Min"
                    value={tier.minGuests}
                    onChange={e => updateTier(i, 'minGuests', e.target.value)}
                    style={{ width: 60, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--white)', fontSize: '0.8rem', fontFamily: 'inherit' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>–</span>
                  <input
                    type="number" min="1" placeholder={i === tiers.length - 1 ? '∞' : 'Max'}
                    value={i === tiers.length - 1 ? '' : tier.maxGuests}
                    disabled={i === tiers.length - 1}
                    onChange={e => updateTier(i, 'maxGuests', e.target.value)}
                    style={{ width: 60, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: i === tiers.length - 1 ? 'var(--dark-1)' : 'var(--dark-2)', color: i === tiers.length - 1 ? 'var(--text-faint)' : 'var(--white)', fontSize: '0.8rem', fontFamily: 'inherit' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>guests</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--gold)', fontSize: '0.78rem' }}>&#8377;</span>
                  <input
                    type="number" min="0" placeholder="Price/pp"
                    value={tier.pricePerPerson}
                    onChange={e => updateTier(i, 'pricePerPerson', e.target.value)}
                    style={{ width: 80, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--white)', fontSize: '0.8rem', fontFamily: 'inherit' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>/pp</span>
                </div>
                {tiers.length > 1 && (
                  <button onClick={() => removeTier(i)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', padding: '2px 4px', fontSize: '0.8rem' }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Last slab has no upper limit. Price of Slab 1 is used as the base price.
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving&hellip;</> : <><i className="fa-solid fa-floppy-disk" /> {pkg ? 'Update Package' : 'Create Package'}</>}
        </button>
      </div>
    </div>
  )
}

function CategoryModal({ cat, onSave, onClose }) {
  const [name, setName] = useState(cat?.name || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      if (cat) await api.put(`/admin/menu/categories/${cat.id}`, { name })
      else await api.post('/admin/menu/categories', { name })
      onSave()
      toast.success(cat ? 'Category updated' : 'Category created')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title">{cat ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="field-block">
          <label className="field-label">Category Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} className="booking-input" placeholder="e.g. Starters" autoFocus />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving&hellip;</> : <><i className="fa-solid fa-floppy-disk" /> {cat ? 'Update' : 'Add Category'}</>}
        </button>
      </div>
    </div>
  )
}




function PackageRulesModal({ pkg, allItems, categories, onSave, onClose }) {
  const blankRule = () => ({ id: null, label: '', minChoices: 1, maxChoices: 3, qtyPerPerson: '', qtyUnit: 'gm', ruleItems: [] })
  const blankItem = () => ({ menuItemId: null, name: '', price: '', grams: '', unit: 'gm', premiumPrice: 0, isNew: false, search: '', showDrop: false })

  const [rules, setRules] = useState(() =>
    (pkg.categoryRules || []).length > 0
      ? pkg.categoryRules.map(r => ({
          id: r.id,
          label: r.label,
          minChoices: r.minChoices,
          maxChoices: r.maxChoices,
          qtyPerPerson: r.qtyPerPerson ?? '',
          qtyUnit: r.qtyUnit || 'gm',
          ruleItems: (r.allowedItems || []).map(ai => ({
            menuItemId: ai.menuItemId,
            name: ai.menuItem?.name || '',
            price: ai.premiumPrice ?? '',
            grams: ai.menuItem?.servingSize ?? '',
            premiumPrice: ai.premiumPrice ?? 0,
            unit: ai.menuItem?.servingUnit || 'gm',
            isNew: false, search: '', showDrop: false,
          }))
        }))
      : [blankRule()]
  )
  const [saving, setSaving] = useState(false)

  /* ── rule helpers ── */
  function addRule() { setRules(rs => [...rs, blankRule()]) }
  function removeRule(ri) { setRules(rs => rs.filter((_, i) => i !== ri)) }
  function setRule(ri, field, val) { setRules(rs => rs.map((r, i) => i === ri ? { ...r, [field]: val } : r)) }

  /* ── item helpers ── */
  function addItem(ri) { setRules(rs => rs.map((r, i) => i === ri ? { ...r, ruleItems: [...r.ruleItems, blankItem()] } : r)) }
  function removeItem(ri, ii) { setRules(rs => rs.map((r, i) => i === ri ? { ...r, ruleItems: r.ruleItems.filter((_, j) => j !== ii) } : r)) }
  function moveItem(ri, ii, dir) {
    setRules(rs => rs.map((r, i) => {
      if (i !== ri) return r
      const items = [...r.ruleItems]
      const to = ii + dir
      if (to < 0 || to >= items.length) return r
      ;[items[ii], items[to]] = [items[to], items[ii]]
      return { ...r, ruleItems: items }
    }))
  }
  function setItem(ri, ii, field, val) {
    setRules(rs => rs.map((r, i) => i !== ri ? r : {
      ...r, ruleItems: r.ruleItems.map((it, j) => j !== ii ? it : { ...it, [field]: val })
    }))
  }

  /* ── select an existing item from dropdown ── */
  function pickItem(ri, ii, dbItem) {
    setRules(rs => rs.map((r, i) => i !== ri ? r : {
      ...r, ruleItems: r.ruleItems.map((it, j) => j !== ii ? it : {
        ...it,
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price ?? '',
        grams: dbItem.servingSize ?? '',
        unit: dbItem.servingUnit || 'gm',
        isNew: false, search: '', showDrop: false,
      })
    }))
  }

  /* ── save ── */
  async function handleSave() {
    for (const r of rules) {
      if (!r.label.trim()) { toast.error('Every category needs a name'); return }
    }
    setSaving(true)
    try {
      /* 1. Delete removed rules */
      const existingIds = (pkg.categoryRules || []).map(r => r.id)
      const keepIds = rules.filter(r => r.id).map(r => r.id)
      for (const id of existingIds.filter(id => !keepIds.includes(id))) {
        await api.delete(`/admin/packages/${pkg.id}/rules/${id}`)
      }

      /* 2. Upsert each rule */
      for (const rule of rules) {
        /* 2a. Create/update any new items first */
        const resolvedItems = []
        for (const it of rule.ruleItems) {
          if (!it.name.trim()) continue
          let itemId = it.menuItemId
          if (it.isNew || !itemId) {
            /* Create new menu item */
            const res = await api.post('/admin/menu/items', {
              name: it.name.trim(),
              price: parseFloat(it.price) || 0,
              servingSize: parseFloat(it.grams) || null,
              servingUnit: it.unit || 'gm',
              type: 'VEG',
              active: true,
            })
            itemId = res.data.id
          } else if (it.price !== '' || it.grams !== '') {
            /* Update existing item's price/grams */
            const patch = {}
            if (it.price !== '') patch.price = parseFloat(it.price) || 0
            if (it.grams !== '') { patch.servingSize = parseFloat(it.grams) || null; patch.servingUnit = it.unit || 'gm' }
            if (Object.keys(patch).length) await api.put(`/admin/menu/items/${itemId}`, patch)
          }
          resolvedItems.push({ menuItemId: itemId, premiumPrice: parseFloat(it.price) || 0 })
        }

        /* 2b. Save rule */
        const payload = {
          label: rule.label.trim(),
          minChoices: parseInt(rule.minChoices) || 1,
          maxChoices: parseInt(rule.maxChoices) || 1,
          qtyPerPerson: rule.qtyPerPerson !== '' ? parseFloat(rule.qtyPerPerson) || null : null,
          qtyUnit: rule.qtyUnit || 'gm',
          items: resolvedItems,
        }
        if (rule.id) {
          await api.put(`/admin/packages/${pkg.id}/rules/${rule.id}`, payload)
        } else {
          await api.post(`/admin/packages/${pkg.id}/rules`, payload)
        }
      }

      toast.success('Menu saved')
      onSave()
    } catch(e) { toast.error('Failed to save: ' + (e?.response?.data?.error || e.message || 'error')) }
    finally { setSaving(false) }
  }

  /* ── render ── */
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3 className="modal-title">Package Menu — {pkg.name}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {rules.map((rule, ri) => (
            <div key={ri} style={{ background: 'var(--dark-3)', border: '1px solid var(--gold-line)', borderRadius: 10, padding: 14, marginBottom: 12 }}>

              {/* Category header row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Category Name</label>
                  <input
                    value={rule.label}
                    onChange={e => setRule(ri, 'label', e.target.value)}
                    placeholder="e.g. Starters, Sweets, Rice"
                    className="booking-input"
                    style={{ fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>Free / Max picks</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number" min="0" value={rule.minChoices}
                      onChange={e => setRule(ri, 'minChoices', e.target.value)}
                      title="Items included free"
                      style={{ width: 44, padding: '6px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: '#2ea843', fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'center', fontWeight: 700 }}
                    />
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>/</span>
                    <input
                      type="number" min="1" value={rule.maxChoices}
                      onChange={e => setRule(ri, 'maxChoices', e.target.value)}
                      title="Max items user can select"
                      style={{ width: 44, padding: '6px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--white)', fontSize: '0.85rem', fontFamily: 'inherit', textAlign: 'center' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', textAlign: 'center' }}>free / total</span>
                </div>
                {rules.length > 1 && (
                  <button onClick={() => removeRule(ri)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '1rem', padding: '4px', marginTop: 16 }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>

              {/* Qty per person for whole category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 10px', background: 'rgba(180,140,60,0.08)', borderRadius: 7, border: '1px dashed rgba(180,140,60,0.25)' }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: 'var(--gold)', fontSize: '0.75rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1 }}>Qty per person (whole category)</span>
                <input
                  type="number" min="0" step="any"
                  value={rule.qtyPerPerson}
                  onChange={e => setRule(ri, 'qtyPerPerson', e.target.value)}
                  placeholder="e.g. 150"
                  style={{ width: 72, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--white)', fontSize: '0.82rem', fontFamily: 'inherit', textAlign: 'right' }}
                />
                <select
                  value={rule.qtyUnit || 'gm'}
                  onChange={e => setRule(ri, 'qtyUnit', e.target.value)}
                  style={{ padding: '5px 4px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <option value="gm">gm</option>
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>

              {/* Column headers */}
              {rule.ruleItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 60px 52px 28px', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                  {['', 'Item Name', 'Price ₹', 'Qty/pp', 'Unit', ''].map(h => (
                    <span key={h} style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{h}</span>
                  ))}
                </div>
              )}

              {/* Item rows */}
              {rule.ruleItems.map((it, ii) => {
                const matches = allItems.filter(db =>
                  it.search.length >= 1 &&
                  db.name.toLowerCase().includes(it.search.toLowerCase())
                ).slice(0, 8)
                const isTypingNew = it.search.length >= 1 && !matches.find(m => m.name.toLowerCase() === it.search.toLowerCase())

                return (
                  <div key={ii} style={{ position: 'relative', marginBottom: 5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 60px 52px 28px', gap: 6, alignItems: 'center' }}>
                      {/* Sort buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                        <button
                          onClick={() => moveItem(ri, ii, -1)}
                          disabled={ii === 0}
                          style={{ background: 'none', border: 'none', color: ii === 0 ? 'var(--dark-4,#333)' : 'var(--text-muted)', cursor: ii === 0 ? 'default' : 'pointer', padding: '1px 4px', fontSize: '0.65rem', lineHeight: 1 }}
                          title="Move up"
                        ><i className="fa-solid fa-chevron-up" /></button>
                        <button
                          onClick={() => moveItem(ri, ii, 1)}
                          disabled={ii === rule.ruleItems.length - 1}
                          style={{ background: 'none', border: 'none', color: ii === rule.ruleItems.length - 1 ? 'var(--dark-4,#333)' : 'var(--text-muted)', cursor: ii === rule.ruleItems.length - 1 ? 'default' : 'pointer', padding: '1px 4px', fontSize: '0.65rem', lineHeight: 1 }}
                          title="Move down"
                        ><i className="fa-solid fa-chevron-down" /></button>
                      </div>

                      {/* Name input with autocomplete */}
                      <div style={{ position: 'relative' }}>
                        <input
                          value={it.menuItemId ? it.name : it.search}
                          onChange={e => {
                            if (it.menuItemId) {
                              // Already selected — clear to re-search
                              setItem(ri, ii, 'menuItemId', null)
                              setItem(ri, ii, 'name', '')
                            }
                            setItem(ri, ii, 'search', e.target.value)
                            setItem(ri, ii, 'showDrop', true)
                          }}
                          onFocus={() => setItem(ri, ii, 'showDrop', true)}
                          onBlur={() => setTimeout(() => setItem(ri, ii, 'showDrop', false), 150)}
                          placeholder="Type item name…"
                          style={{
                            width: '100%', padding: '6px 10px', borderRadius: 6,
                            border: `1px solid ${it.menuItemId ? 'var(--gold)' : it.isNew ? '#5b9bd5' : 'var(--gold-line)'}`,
                            background: 'var(--dark-2)', color: 'var(--white)', fontSize: '0.82rem', fontFamily: 'inherit',
                          }}
                        />
                        {it.menuItemId && (
                          <i className="fa-solid fa-check" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontSize: '0.7rem', pointerEvents: 'none' }} />
                        )}
                        {it.isNew && (
                          <i className="fa-solid fa-plus" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#5b9bd5', fontSize: '0.7rem', pointerEvents: 'none' }} />
                        )}

                        {/* Dropdown */}
                        {it.showDrop && it.search.length >= 1 && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                            background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
                            borderRadius: 8, maxHeight: 180, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          }}>
                            {matches.map(db => (
                              <div
                                key={db.id}
                                onMouseDown={() => pickItem(ri, ii, db)}
                                style={{ padding: '7px 12px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gold-line)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-3)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <span style={{ color: 'var(--text-warm)' }}>{db.name}</span>
                                <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>{db.price > 0 ? `₹${db.price}` : ''} {db.servingSize ? `· ${db.servingSize}gm` : ''}</span>
                              </div>
                            ))}
                            {isTypingNew && (
                              <div
                                onMouseDown={() => {
                                  setItem(ri, ii, 'name', it.search)
                                  setItem(ri, ii, 'isNew', true)
                                  setItem(ri, ii, 'search', '')
                                  setItem(ri, ii, 'showDrop', false)
                                }}
                                style={{ padding: '7px 12px', cursor: 'pointer', fontSize: '0.8rem', color: '#5b9bd5', display: 'flex', alignItems: 'center', gap: 6 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-3)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <i className="fa-solid fa-plus" />
                                Add "{it.search}" as new item
                              </div>
                            )}
                            {matches.length === 0 && !isTypingNew && (
                              <div style={{ padding: '7px 12px', color: 'var(--text-faint)', fontSize: '0.78rem' }}>No matches</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <input
                        type="number" min="0" step="any"
                        value={it.price}
                        onChange={e => setItem(ri, ii, 'price', e.target.value)}
                        placeholder="0"
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--gold)', fontSize: '0.82rem', fontFamily: 'inherit', textAlign: 'right' }}
                      />

                      {/* Qty/pp */}
                      <input
                        type="number" min="0" step="any"
                        value={it.grams}
                        onChange={e => setItem(ri, ii, 'grams', e.target.value)}
                        placeholder={it.unit === 'pcs' ? 'pcs' : 'gm'}
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--text-warm)', fontSize: '0.82rem', fontFamily: 'inherit', textAlign: 'right' }}
                      />

                      {/* Unit */}
                      <select
                        value={it.unit || 'gm'}
                        onChange={e => setItem(ri, ii, 'unit', e.target.value)}
                        style={{ padding: '6px 4px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-2)', color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'inherit', cursor: 'pointer' }}
                      >
                        <option value="gm">gm</option>
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                      </select>

                      {/* Remove item */}
                      <button onClick={() => removeItem(ri, ii)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '0.85rem', padding: 2 }}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Add item row */}
              <button
                onClick={() => addItem(ri)}
                style={{ marginTop: 6, background: 'none', border: '1px dashed var(--gold-line)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', padding: '5px 12px', fontSize: '0.78rem', width: '100%' }}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: 5 }} />Add Item
              </button>
            </div>
          ))}

          <button onClick={addRule} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
            <i className="fa-solid fa-plus" /> Add Category
          </button>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Menu</>}
        </button>
      </div>
    </div>
  )
}

function PackageItemsModal({ pkg, allItems, categories, onSave, onClose }) {
  const [rows, setRows] = useState(
    (pkg.items || []).map(pi => ({
      menuItemId: pi.menuItemId,
      name: pi.menuItem?.name || '',
      category: pi.menuItem?.category?.name || '',
      quantityPerPerson: pi.quantityPerPerson || '',
      pricePerUnit: pi.pricePerUnit || '',
      unit: pi.menuItem?.servingUnit === 'pcs' ? 'pcs' : 'kg',
    }))
  )
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = allItems.filter(i =>
    !rows.find(r => r.menuItemId === i.id) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) ||
     (i.category?.name || '').toLowerCase().includes(search.toLowerCase()))
  )

  function addItem(item) {
    setRows(r => [...r, {
      menuItemId: item.id,
      name: item.name,
      category: item.category?.name || '',
      quantityPerPerson: item.servingSize || '',
      pricePerUnit: item.price || '',
      unit: item.servingUnit === 'pcs' ? 'pcs' : 'kg',
    }])
    setSearch('')
  }

  function removeRow(id) { setRows(r => r.filter(x => x.menuItemId !== id)) }

  function updateRow(id, field, val) {
    setRows(r => r.map(x => x.menuItemId === id ? { ...x, [field]: val } : x))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.put(`/admin/packages/${pkg.id}/items`, {
        items: rows.map(r => ({
          menuItemId: r.menuItemId,
          quantityPerPerson: r.quantityPerPerson || null,
          pricePerUnit: r.pricePerUnit || null,
        }))
      })
      onSave()
      toast.success('Package items saved')
    } catch {
      toast.error('Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 700, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h3 className="modal-title">Items — {pkg.name}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>

        {/* Add item search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            placeholder="Search item to add…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="booking-input"
            style={{ width: '100%' }}
          />
          {search && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
              borderRadius: 8, maxHeight: 200, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {filtered.slice(0, 30).map(item => (
                <div key={item.id} onClick={() => addItem(item)} style={{
                  padding: '8px 14px', cursor: 'pointer', fontSize: '0.85rem',
                  color: 'var(--text-warm)', borderBottom: '1px solid var(--gold-line)',
                  display: 'flex', justifyContent: 'space-between',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>{item.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items table */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
          {rows.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '32px 0', fontSize: '0.85rem' }}>No items yet — search above to add</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gold-line)' }}>
                  {['Item', 'Category', 'Qty / person', 'Price (₹/kg or pcs)', ''].map(h => (
                    <th key={h} style={{ padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.menuItemId} style={{ borderBottom: '1px solid var(--gold-line)' }}>
                    <td style={{ padding: '7px 8px', color: 'var(--white)', fontWeight: 500 }}>{row.name}</td>
                    <td style={{ padding: '7px 8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.category}</td>
                    <td style={{ padding: '4px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="number" min="0" step="any"
                          value={row.quantityPerPerson}
                          onChange={e => updateRow(row.menuItemId, 'quantityPerPerson', e.target.value)}
                          placeholder="e.g. 150"
                          style={{ width: 70, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-3)', color: 'var(--white)', fontSize: '0.8rem', fontFamily: 'inherit' }}
                        />
                        <select
                          value={row.unit}
                          onChange={e => updateRow(row.menuItemId, 'unit', e.target.value)}
                          style={{ padding: '4px 4px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-3)', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="kg">kg</option>
                          <option value="pcs">pcs</option>
                          <option value="gm">gm</option>
                        </select>
                      </div>
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>₹</span>
                        <input
                          type="number" min="0" step="any"
                          value={row.pricePerUnit}
                          onChange={e => updateRow(row.menuItemId, 'pricePerUnit', e.target.value)}
                          placeholder="e.g. 300"
                          style={{ width: 80, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--gold-line)', background: 'var(--dark-3)', color: 'var(--white)', fontSize: '0.8rem', fontFamily: 'inherit' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/{row.unit}</span>
                      </div>
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <button onClick={() => removeRow(row.menuItemId)} className="action-btn del" style={{ padding: '4px 8px' }}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save {rows.length} Items</>}
        </button>
      </div>
    </div>
  )
}


function ItemsByCategoryView({ items, categories, onEdit, onDelete, onPriceChange }) {
  const [collapsed, setCollapsed] = useState({})
  const [editingPrice, setEditingPrice] = useState({}) // {itemId: tempPrice}

  // Group items by category
  const grouped = categories.map(cat => ({
    cat,
    items: items.filter(i => i.categoryId === cat.id),
  })).filter(g => g.items.length > 0)

  // Uncategorised items
  const uncatItems = items.filter(i => !categories.find(c => c.id === i.categoryId))
  if (uncatItems.length > 0) grouped.push({ cat: { id: 0, name: 'Uncategorised' }, items: uncatItems })

  function toggleCollapse(catId) {
    setCollapsed(s => ({ ...s, [catId]: !s[catId] }))
  }

  function startEdit(itemId, currentPrice) {
    setEditingPrice(s => ({ ...s, [itemId]: currentPrice ?? '' }))
  }

  function commitPrice(item) {
    const val = editingPrice[item.id]
    if (val !== undefined && val !== String(item.price ?? '')) {
      onPriceChange(item, val)
    }
    setEditingPrice(s => { const n = { ...s }; delete n[item.id]; return n })
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {grouped.map(({ cat, items: catItems }) => (
        <div key={cat.id} style={{ borderBottom: '1px solid var(--gold-line)' }}>
          {/* Category header */}
          <div
            onClick={() => toggleCollapse(cat.id)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px', cursor: 'pointer', userSelect: 'none',
              background: collapsed[cat.id] ? 'transparent' : 'rgba(180,140,60,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className={`fa-solid fa-chevron-${collapsed[cat.id] ? 'right' : 'down'}`} style={{ fontSize: '0.7rem', color: 'var(--gold)', width: 10 }} />
              <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.88rem' }}>{cat.name}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', background: 'var(--dark-3)', borderRadius: 12, padding: '1px 8px' }}>{catItems.length}</span>
            </div>
          </div>

          {/* Items */}
          {!collapsed[cat.id] && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 20px 12px' }}>
              {catItems.map(item => {
                const isEditing = editingPrice[item.id] !== undefined
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 0,
                    background: 'var(--dark-3)', border: '1px solid var(--gold-line)',
                    borderRadius: 8, overflow: 'hidden', fontSize: '0.78rem',
                  }}>
                    {/* Veg/non-veg dot */}
                    <div style={{
                      width: 4, alignSelf: 'stretch', flexShrink: 0,
                      background: item.type === 'VEG' ? '#2ea843' : '#c0392b',
                    }} />

                    {/* Name */}
                    <span style={{ padding: '6px 10px', color: 'var(--white)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>

                    {/* Price — inline editable */}
                    <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--gold-line)', padding: '0 6px', gap: 2 }}>
                      <span style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>&#8377;</span>
                      {isEditing ? (
                        <input
                          type="number" min="0" step="any"
                          value={editingPrice[item.id]}
                          onChange={e => setEditingPrice(s => ({ ...s, [item.id]: e.target.value }))}
                          onBlur={() => commitPrice(item)}
                          onKeyDown={e => { if (e.key === 'Enter') commitPrice(item); if (e.key === 'Escape') setEditingPrice(s => { const n={...s}; delete n[item.id]; return n }) }}
                          autoFocus
                          style={{ width: 56, padding: '3px 4px', background: 'var(--dark-2)', border: '1px solid var(--gold)', borderRadius: 4, color: 'var(--white)', fontSize: '0.78rem', fontFamily: 'inherit' }}
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(item.id, item.price ?? '')}
                          title="Click to edit price"
                          style={{ cursor: 'text', color: item.price > 0 ? 'var(--gold)' : 'var(--text-faint)', minWidth: 28, padding: '4px 2px' }}
                        >
                          {item.price > 0 ? item.price : '—'}
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete */}
                    <div style={{ display: 'flex', borderLeft: '1px solid var(--gold-line)' }}>
                      <button onClick={() => onEdit(item)} style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.72rem' }} title="Edit item">
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button onClick={() => onDelete(item.id)} style={{ padding: '5px 8px', background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '0.72rem' }} title="Delete item">
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


function PackageCard({ pkg, onMenu, onEdit, onImage, onDelete, onPriceChange }) {
  const [open, setOpen] = useState(true)
  const [editingPrice, setEditingPrice] = useState({}) // { "ruleId_menuItemId": tempVal }

  // Collect all items from categoryRules
  const rules = pkg.categoryRules || []
  const totalItems = rules.reduce((s, r) => s + (r.allowedItems?.length || 0), 0)

  function priceKey(ruleId, itemId) { return `${ruleId}_${itemId}` }

  function startEdit(ruleId, itemId, current) {
    setEditingPrice(s => ({ ...s, [priceKey(ruleId, itemId)]: current ?? '' }))
  }

  function commitPrice(rule, ai) {
    const key = priceKey(rule.id, ai.menuItemId)
    const val = editingPrice[key]
    if (val !== undefined) {
      const price = val === '' ? null : parseFloat(val)
      onPriceChange(rule, ai.menuItemId, price)
    }
    setEditingPrice(s => { const n = { ...s }; delete n[key]; return n })
  }

  return (
    <div style={{ borderBottom: '1px solid var(--gold-line)' }}>
      {/* Package header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
        {/* Thumbnail */}
        <div onClick={onImage} style={{
          width: 52, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          background: 'var(--dark-3)', border: '1px solid var(--gold-line)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="Click to change image">
          {pkg.image
            ? <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <i className="fa-solid fa-image" style={{ color: 'var(--gold)', fontSize: '1rem' }} />}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--white)', fontSize: '0.92rem' }}>{pkg.name}</span>
            <span style={{
              padding: '1px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
              background: pkg.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)',
              color: pkg.type === 'VEG' ? '#2ea843' : '#c0392b',
            }}>{pkg.type.replace('_', '-')}</span>
            {pkg.eventType && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--dark-3)', borderRadius: 20, padding: '1px 8px' }}>{pkg.eventType}</span>}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-users" style={{ marginRight: 4, fontSize: '0.68rem' }} />{pkg.servesMin}+ guests
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>
              <i className="fa-solid fa-rupee-sign" style={{ marginRight: 3, fontSize: '0.68rem' }} />{pkg.basePrice}/person
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-utensils" style={{ marginRight: 4, fontSize: '0.68rem' }} />{rules.length} course{rules.length !== 1 ? 's' : ''} · {totalItems} items
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        {totalItems > 0 && (
          <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 6px', fontSize: '0.75rem' }}>
            <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} />
          </button>
        )}

        {/* Action buttons — merged into one Manage Menu button */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={onMenu} className="action-btn edit" title="Manage menu items & rules" style={{ background: 'rgba(80,140,200,0.15)', color: '#5b9bd5', padding: '5px 10px', gap: 5, fontSize: '0.75rem' }}>
            <i className="fa-solid fa-sliders" /> Menu
          </button>
          <button onClick={onEdit} className="action-btn edit" title="Edit package">
            <i className="fa-solid fa-pen" />
          </button>
          <button onClick={onImage} className="action-btn edit" title="Set image">
            <i className="fa-solid fa-image" />
          </button>
          <button onClick={onDelete} className="action-btn del">
            <i className="fa-solid fa-trash" />
          </button>
        </div>
      </div>

      {/* Rules + items below header */}
      {open && rules.length > 0 && (
        <div style={{ padding: '0 20px 14px 20px', borderTop: '1px solid rgba(180,140,60,0.15)' }}>
          {rules.map(rule => (
            <div key={rule.id} style={{ marginTop: 10 }}>
              {/* Rule label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {rule.label}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', background: 'var(--dark-3)', borderRadius: 20, padding: '1px 7px' }}>
                  pick {rule.minChoices}–{rule.maxChoices}
                </span>
              </div>

              {/* Items in this rule */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(rule.allowedItems || []).map(ai => {
                  const item = ai.menuItem
                  if (!item) return null
                  const isPremium = ai.premiumPrice != null && ai.premiumPrice > 0
                  const key = priceKey(rule.id, ai.menuItemId)
                  const isEditing = editingPrice[key] !== undefined
                  return (
                    <div key={ai.menuItemId} style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      background: 'var(--dark-3)',
                      border: `1px solid ${isPremium ? 'rgba(232,160,32,0.5)' : 'var(--gold-line)'}`,
                      borderRadius: 8, overflow: 'visible', fontSize: '0.75rem',
                    }}>
                      {/* Veg/non-veg strip */}
                      <div style={{ width: 3, alignSelf: 'stretch', background: item.type === 'VEG' ? '#2ea843' : '#c0392b', borderRadius: '8px 0 0 8px', flexShrink: 0 }} />

                      {/* Name */}
                      <span style={{ padding: '5px 8px', color: 'var(--white)', whiteSpace: 'nowrap' }}>{item.name}</span>

                      {/* Price — click to edit */}
                      <div style={{ display: 'flex', alignItems: 'center', borderLeft: `1px solid ${isPremium ? 'rgba(232,160,32,0.4)' : 'var(--gold-line)'}`, padding: '0 6px', gap: 2 }}>
                        {isPremium && <i className="fa-solid fa-star" style={{ fontSize: '0.6rem', color: '#e8a020', marginRight: 2 }} />}
                        <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>₹</span>
                        {isEditing ? (
                          <input
                            type="number" min="0" step="any"
                            value={editingPrice[key]}
                            onChange={e => setEditingPrice(s => ({ ...s, [key]: e.target.value }))}
                            onBlur={() => commitPrice(rule, ai)}
                            onKeyDown={e => { if (e.key === 'Enter') commitPrice(rule, ai); if (e.key === 'Escape') setEditingPrice(s => { const n={...s}; delete n[key]; return n }) }}
                            autoFocus
                            style={{ width: 52, padding: '2px 4px', background: 'var(--dark-2)', border: '1px solid var(--gold)', borderRadius: 4, color: 'var(--white)', fontSize: '0.75rem', fontFamily: 'inherit' }}
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(rule.id, ai.menuItemId, ai.premiumPrice ?? '')}
                            title="Click to set premium price (0 = included free)"
                            style={{ cursor: 'text', color: isPremium ? '#e8a020' : 'var(--text-faint)', minWidth: 24, padding: '4px 2px' }}
                          >
                            {isPremium ? ai.premiumPrice : '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default function MenuAdminPage() {
  const [tab, setTab]           = useState('items')
  const [items, setItems]       = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)       // item modal
  const [pkgImgModal, setPkgImgModal] = useState(null) // package image modal
  const [pkgItemsModal, setPkgItemsModal] = useState(null) // package items modal
  const [pkgModal, setPkgModal] = useState(null)       // create/edit package modal
  const [pkgRulesModal, setPkgRulesModal] = useState(null) // menu selection rules modal
  const [catModal, setCatModal] = useState(null)       // create/edit category modal
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

  async function deletePackage(id) {
    if (!confirm('Delete this package?')) return
    try {
      await api.delete(`/admin/menu/packages/${id}`)
      setPackages(ps => ps.filter(p => p.id !== id))
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete') }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? Items in it will lose their category.')) return
    try {
      await api.delete(`/admin/menu/categories/${id}`)
      load()
      toast.success('Category deleted')
    } catch { toast.error('Failed to delete') }
  }

  function exportMenuExcel() {
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))
    const rows = items.map(item => ({
      'ID':           item.id,
      'Name':         item.name,
      'Description':  item.description || '',
      'Category':     item.category?.name || catMap[item.categoryId] || '',
      'Style':        item.style,
      'Type':         item.type,
      'Price (₹)':   item.price || '',
      'Serving Size': item.servingSize || '',
      'Serving Unit': item.servingUnit || 'gm',
      'Active':       item.active ? 'TRUE' : 'FALSE',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [8,28,32,18,14,10,10,12,12,8].map(w => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Items')
    XLSX.writeFile(wb, 'menu_items.xlsx')
    toast.success('Excel downloaded!')
  }

  async function handleExcelImport(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      if (!rows.length) { toast.error('No data in file'); return }

      const catByName = Object.fromEntries(categories.map(c => [c.name.toLowerCase().trim(), c.id]))

      let updated = 0, created = 0, failed = 0
      for (const row of rows) {
        try {
          const catName = (row['Category'] || '').toLowerCase().trim()
          const categoryId = catByName[catName]
          const payload = {
            name:        String(row['Name'] || '').trim(),
            description: String(row['Description'] || '').trim(),
            categoryId:  categoryId || undefined,
            style:       row['Style'] || 'ANDHRA',
            type:        row['Type'] || 'VEG',
            price:       row['Price (₹)'] ? parseFloat(row['Price (₹)']) : null,
            servingSize: row['Serving Size'] ? parseFloat(row['Serving Size']) : null,
            servingUnit: row['Serving Unit'] || 'gm',
            active:      String(row['Active'] || 'TRUE').toUpperCase() !== 'FALSE',
          }
          if (!payload.name) continue
          if (row['ID']) {
            await api.put(`/admin/menu/items/${row['ID']}`, payload)
            updated++
          } else {
            await api.post('/admin/menu/items', payload)
            created++
          }
        } catch { failed++ }
      }
      toast.success(`Done: ${updated} updated, ${created} created${failed ? `, ${failed} failed` : ''}`)
      load()
    } catch (err) { toast.error('Import failed: ' + (err.message || 'unknown error')) }
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
            <input type="file" ref={fileRef} accept=".xlsx,.xls" onChange={handleExcelImport} style={{ display: 'none' }} />
            <button onClick={exportMenuExcel} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px', color: '#22c55e', borderColor: '#22c55e' }}>
              <i className="fa-solid fa-file-excel" /> Export Excel
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              <i className="fa-solid fa-file-arrow-up" /> Import Excel
            </button>
          </div>
          <ItemsByCategoryView
            items={items}
            categories={categories}
            onEdit={item => setModal(item)}
            onDelete={deleteItem}
            onPriceChange={async (item, newPrice) => {
              try {
                await api.put(`/admin/menu/items/${item.id}`, { price: parseFloat(newPrice) || 0 })
                setItems(its => its.map(i => i.id === item.id ? { ...i, price: parseFloat(newPrice) || 0 } : i))
              } catch { toast.error("Failed to update price") }
            }}
          />
        </div>
      ) : tab === 'packages' ? (
        <div className="admin-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPkgModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              <i className="fa-solid fa-plus" /> Create Package
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>{packages.length} packages</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {packages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onMenu={() => setPkgRulesModal(pkg)}
                onEdit={() => setPkgModal(pkg)}
                onImage={() => setPkgImgModal(pkg)}
                onDelete={() => deletePackage(pkg.id)}
                onPriceChange={async (rule, menuItemId, price) => {
                  try {
                    const updatedItems = (rule.allowedItems || []).map(ai => ({
                      menuItemId: ai.menuItemId,
                      premiumPrice: ai.menuItemId === menuItemId ? price : ai.premiumPrice ?? null,
                    }))
                    await api.put(`/admin/packages/${pkg.id}/rules/${rule.id}`, { items: updatedItems })
                    load()
                  } catch { toast.error('Failed to update price') }
                }}
              />
            ))}
            {packages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '40px 0', fontSize: '0.85rem' }}>
                No packages yet — click "Create Package" to add one
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCatModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              <i className="fa-solid fa-plus" /> Add Category
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>{categories.length} categories</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>{['Name', 'Items', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{cat._count?.items ?? ''}</td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => setCatModal(cat)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Menu item modal */}
      {modal && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          categories={categories}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}

      {/* Package image modal */}
      {pkgImgModal && (
        <PackageImageModal
          pkg={pkgImgModal}
          onSave={(newImage) => {
            setPackages(ps => ps.map(p => p.id === pkgImgModal.id ? { ...p, image: newImage } : p))
            setPkgImgModal(null)
          }}
          onClose={() => setPkgImgModal(null)}
        />
      )}

      {/* Package menu rules modal */}
      {pkgRulesModal && (
        <PackageRulesModal
          pkg={pkgRulesModal}
          allItems={items}
          categories={categories}
          onSave={() => { load(); setPkgRulesModal(null) }}
          onClose={() => setPkgRulesModal(null)}
        />
      )}

      {/* Create/edit package modal */}
      {pkgModal && (
        <PackageModal
          pkg={pkgModal === 'add' ? null : pkgModal}
          onSave={() => { setPkgModal(null); load() }}
          onClose={() => setPkgModal(null)}
        />
      )}

      {/* Create/edit category modal */}
      {catModal && (
        <CategoryModal
          cat={catModal === 'add' ? null : catModal}
          onSave={() => { setCatModal(null); load() }}
          onClose={() => setCatModal(null)}
        />
      )}

      {/* Package items modal */}
      {pkgItemsModal && (
        <PackageItemsModal
          pkg={pkgItemsModal}
          allItems={items}
          categories={categories}
          onSave={() => { load(); setPkgItemsModal(null) }}
          onClose={() => setPkgItemsModal(null)}
        />
      )}
    </div>
  )
}
