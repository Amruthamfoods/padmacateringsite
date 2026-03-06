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

export default function MenuAdminPage() {
  const [tab, setTab] = useState('items')
  const [items, setItems] = useState([])
  const [packages, setPackages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
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
        <div className="admin-card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gold-line)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{packages.length} packages seeded — edit via database for now</p>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>{['Name', 'Style', 'Type', 'Min Serves', 'Base Price/pp', 'Items', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td style={{ color: 'var(--white)', fontWeight: 500 }}>{pkg.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{pkg.style.replace('_', ' ')}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                        background: pkg.type === 'VEG' ? 'rgba(46,160,67,0.15)' : 'rgba(192,57,43,0.15)',
                        color: pkg.type === 'VEG' ? '#2ea843' : '#c0392b',
                      }}>{pkg.type.replace('_', '-')}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{pkg.servesMin}+</td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>₹{pkg.basePrice}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{pkg.items?.length || 0}</td>
                    <td>
                      <button onClick={() => deletePackage(pkg.id)} className="action-btn del"><i className="fa-solid fa-trash" /></button>
                    </td>
                  </tr>
                ))}
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

      {modal && (
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
