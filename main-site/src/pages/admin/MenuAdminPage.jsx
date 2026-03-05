import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STYLES = ['ANDHRA', 'NORTH_INDIAN', 'MIXED', 'FUSION']
const TYPES = ['VEG', 'NON_VEG']

function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState(category || { name: '', sortOrder: 0, active: true })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name) { toast.error('Name required'); return }
    setSaving(true)
    try {
      if (category) {
        await api.put(`/admin/menu/categories/${category.id}`, form)
        toast.success('Category updated')
      } else {
        await api.post('/admin/menu/categories', form)
        toast.success('Category created')
      }
      onSave()
    } catch { toast.error('Failed to save category') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h3 className="modal-title">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className="field-block">
          <label className="field-label">Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="booking-input" />
        </div>
        <div className="field-block">
          <label className="field-label">Sort Order</label>
          <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="booking-input" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-warm)', margin: '16px 0 20px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          Active (visible to customers)
        </label>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Category</>}
        </button>
      </div>
    </div>
  )
}

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
  const [form, setForm] = useState(pkg || { name: '', eventType: '', style: 'ANDHRA', type: 'VEG', servesMin: 50, description: '', basePrice: 0, mealTypes: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] })
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
        <div className="field-block">
          <label className="field-label">Package Thumbnail / Banner Image</label>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
            Please provide high quality images for the frontend. Recommended sizes:
            <ul style={{ paddingLeft: 16, margin: '4px 0 0 0', color: 'var(--white)' }}>
              <li><strong>Thumbnail (Cards):</strong> 400x300px (4:3 aspect ratio)</li>
              <li><strong>Banner (Details):</strong> 1200x400px (3:1 aspect ratio)</li>
            </ul>
          </div>
          <input type="file" accept="image/*" className="booking-input" style={{ padding: '6px' }} />
        </div>
        <div className="field-block">
          <label className="field-label">Available Meal Types</label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
              <label key={meal} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-light)' }}>
                <input
                  type="checkbox"
                  checked={form.mealTypes?.includes(meal)}
                  onChange={e => {
                    const current = form.mealTypes || []
                    setForm(f => ({
                      ...f,
                      mealTypes: e.target.checked
                        ? [...current, meal]
                        : current.filter(m => m !== meal)
                    }))
                  }}
                />
                {meal}
              </label>
            ))}
          </div>
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

function RuleModal({ packageId, rule, categories, allItems, onSave, onClose }) {
  const existingItemIds = rule?.allowedItems?.map(ai => ai.menuItemId) || []
  const [form, setForm] = useState(rule
    ? { categoryId: rule.categoryId || 'MIXED', label: rule.label, minChoices: rule.minChoices, maxChoices: rule.maxChoices, extraItemPrice: rule.extraItemPrice ?? 0 }
    : { categoryId: '', label: '', minChoices: 1, maxChoices: '', extraItemPrice: 0 }
  )
  const [selectedItemIds, setSelectedItemIds] = useState(existingItemIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)

  let categoryItems = form.categoryId === 'MIXED' ? allItems : allItems.filter(i => i.categoryId === parseInt(form.categoryId))
  if (searchQuery) categoryItems = categoryItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))

  function toggleItem(id) {
    setSelectedItemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleSave() {
    if (!form.categoryId || !form.label || !form.maxChoices) { toast.error('All fields required'); return }
    setSaving(true)
    try {
      const payload = { ...form, categoryId: form.categoryId === 'MIXED' ? '' : form.categoryId, itemIds: selectedItemIds }
      if (rule) {
        await api.put(`/admin/packages/${packageId}/rules/${rule.id}`, payload)
        toast.success('Rule updated')
      } else {
        await api.post(`/admin/packages/${packageId}/rules`, payload)
        toast.success('Rule created')
      }
      onSave()
    } catch { toast.error('Failed to save rule') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 460 }}>
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
          <select value={form.categoryId} onChange={e => { setForm(f => ({ ...f, categoryId: e.target.value })); setSelectedItemIds([]) }} className="booking-input">
            <option value="">Select…</option>
            <option value="MIXED">[Mixed Categories / Accompaniments]</option>
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
        <div className="field-block">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--text-warm)', margin: '16px 0 20px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.extraItemPrice > 0} onChange={e => setForm(f => ({ ...f, extraItemPrice: e.target.checked ? 1 : 0 }))} />
            Allow extra items (uses individual item prices)
          </label>
        </div>

        {form.categoryId && (
          <div className="field-block">
            <label className="field-label">
              Allowed Items in this rule
              <span style={{ color: 'var(--text-faint)', fontWeight: 400, marginLeft: 6 }}>(leave all unchecked = show entire category)</span>
            </label>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="booking-input"
              style={{ marginBottom: 8 }}
            />
            {categoryItems.length === 0
              ? <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>No items found</p>
              : (
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--gold-line)', borderRadius: 8, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {categoryItems.map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-warm)' }}>
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                      />
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: '0.72rem', color: item.type === 'VEG' ? '#2ea843' : '#c0392b' }}>{item.type}</span>
                    </label>
                  ))}
                </div>
              )
            }
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Rule</>}
        </button>
      </div>
    </div>
  )
}

function PackageEditPanel({ pkg, categories, allItems, onReload, onClose }) {
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
            <div key={rule.id} style={{ background: 'var(--dark-3)', borderRadius: 8, marginBottom: 6, padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--white)' }}>{rule.label}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {rule.category ? rule.category.name : 'Accompaniments / Mixed'} · Pick {rule.minChoices}–{rule.maxChoices}
                    {rule.extraItemPrice > 0 && <span style={{ color: 'var(--gold)', marginLeft: 6 }}>+ individual item extras</span>}
                  </p>
                  {rule.allowedItems?.length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {rule.allowedItems.map(ai => (
                        <span key={ai.menuItemId} style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {ai.menuItem?.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                  <button onClick={() => setRuleModal(rule)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                  <button onClick={() => deleteRule(rule.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                </div>
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
          allItems={allItems}
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
  const [catModal, setCatModal] = useState(null)
  const [editingPkg, setEditingPkg] = useState(null)
  const [openCategories, setOpenCategories] = useState({})
  const fileRef = useRef()

  function load() {
    setLoading(true)
    Promise.all([
      api.get('/admin/menu/items'),
      api.get('/admin/menu/packages'),
      api.get('/admin/menu/categories'),
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
    } catch { toast.error('Failed to delete package') }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? Items will be moved to the Uncategorized bin section.')) return
    try {
      await api.delete(`/admin/menu/categories/${id}`)
      toast.success('Category deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category')
    }
  }

  async function handleExcel(e) {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/admin/menu/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(`Imported ${res.data.imported} items!`)
      load()
    } catch { toast.error('Failed to import Excel') }
    e.target.value = ''
  }

  function handleExportExcel() {
    api.get('/admin/menu/export', { responseType: 'blob' })
      .then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'menu_items.xlsx')
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      })
      .catch(() => toast.error('Failed to export Excel'))
  }

  async function updateItemInline(id, data) {
    setItems(items.map(i => i.id === id ? { ...i, ...data } : i))
    try {
      await api.put(`/admin/menu/items/${id}`, data)
    } catch {
      toast.error('Failed to update item')
      load() // revert optimistic update
    }
  }

  if (loading) return <div className="admin-loading"><i className="fa-solid fa-spinner fa-spin" /></div>

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
              <input type="file" ref={fileRef} accept=".xlsx, .xls" onChange={handleExcel} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-file-excel" /> Import Excel
              </button>
              <button onClick={handleExportExcel} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-download" /> Export Excel
              </button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {categories.map(cat => {
                const catItems = items.filter(i => i.categoryId === cat.id)
                if (catItems.length === 0) return null
                const isOpen = openCategories[cat.id] !== false // Default open
                return (
                  <div key={cat.id} style={{ marginBottom: 16, background: 'var(--dark-3)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--gold-line)' }}>
                    <div onClick={() => setOpenCategories(o => ({ ...o, [cat.id]: !isOpen }))} style={{ padding: '12px 16px', background: 'var(--dark-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <h4 style={{ color: 'var(--gold)', margin: 0, fontSize: '0.9rem' }}>{cat.name} ({catItems.length} items) {!cat.active && <span style={{ color: 'var(--red)', fontSize: '0.7rem' }}>(Inactive)</span>}</h4>
                      <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {isOpen && (
                      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                        {catItems.map(item => (
                          <div key={item.id} style={{ position: 'relative', background: 'var(--dark-2)', padding: '16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* Veg / Non-Veg Dot */}
                            <div style={{ position: 'absolute', top: 12, left: 12, width: 10, height: 10, borderRadius: '50%', background: item.type === 'VEG' ? '#2ea843' : '#c0392b' }} />

                            {/* Card Header */}
                            <div style={{ paddingLeft: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, paddingRight: 8 }}>
                                <p style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px 0' }}>{item.name}</p>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.style.replace('_', ' ')}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => setModal(item)} className="action-btn edit" style={{ width: 28, height: 28 }}><i className="fa-solid fa-pen" style={{ fontSize: '0.75rem' }} /></button>
                                <button onClick={() => deleteItem(item.id)} className="action-btn del" style={{ width: 28, height: 28 }}><i className="fa-solid fa-trash" style={{ fontSize: '0.75rem' }} /></button>
                              </div>
                            </div>

                            {/* Inline Edit Area */}
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Price ₹:</label>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={e => updateItemInline(item.id, { price: parseFloat(e.target.value) || 0 })}
                                  style={{ width: 70, background: 'var(--dark-1)', border: '1px solid var(--gold-line)', color: 'var(--white)', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}
                                />
                              </div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={item.active}
                                  onChange={e => updateItemInline(item.id, { active: e.target.checked })}
                                />
                                {item.active ? 'Active' : 'Hidden'}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {items.length === 0 && <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '30px 0' }}>No items found</p>}
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
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gold-line)', display: 'flex', gap: 8 }}>
              <button onClick={() => setCatModal('add')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                <i className="fa-solid fa-plus" /> Add Category
              </button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>{['#', 'Name', 'Sort Order', 'Active', ''].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>{cat.id}</td>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>
                        {cat.name}
                        {!cat.active && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--red)', border: '1px solid var(--red)', padding: '2px 6px', borderRadius: 4 }}>Inactive</span>}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{cat.sortOrder}</td>
                      <td><span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: cat.active ? '#2ea843' : 'var(--text-faint)' }} /></td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setCatModal(cat)} className="action-btn edit"><i className="fa-solid fa-pen" /></button>
                        <button onClick={() => deleteCategory(cat.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '30px 0' }}>No categories yet</td></tr>
                  )}
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
          allItems={items}
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

      {/* Category modal */}
      {catModal && (
        <CategoryModal
          category={catModal === 'add' ? null : catModal}
          onSave={() => { setCatModal(null); load() }}
          onClose={() => setCatModal(null)}
        />
      )}
    </div>
  )
}
