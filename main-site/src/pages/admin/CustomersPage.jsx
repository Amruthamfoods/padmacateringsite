import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const EVENT_TYPES = ['Wedding', 'Birthday', 'Reception', '1st Birthday', 'Engagement', 'Housewarming', 'Corporate', 'Ceremony', 'Social Gathering']
const SERVING_STYLES = ['BUFFET', 'BANANA_LEAF', 'BOX_LUNCH']

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [manualModal, setManualModal] = useState(false)
  const [manualForm, setManualForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    eventType: '', eventDate: '', guestCount: '100', venueAddress: '', servingStyle: 'BUFFET', notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/customers')
      .then(r => { setCustomers(r.data); setFiltered(r.data) })
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || '').includes(q)
    ))
  }, [search, customers])

  async function handleManualBooking() {
    if (!manualForm.eventType || !manualForm.eventDate || !manualForm.guestCount) {
      toast.error('Event type, date and guest count required'); return
    }
    setSaving(true)
    try {
      await api.post('/admin/customers/manual-booking', manualForm)
      toast.success('Manual booking created')
      setManualModal(false)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create booking') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-sub">{customers.length} registered customers</p>
        </div>
        <button onClick={() => setManualModal(true)} className="btn btn-primary">
          <i className="fa-solid fa-phone" /> Manual Booking
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-filters">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…" className="admin-input" style={{ flex: 1, minWidth: 200 }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>No customers found</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>{['Name', 'Email', 'Phone', 'Bookings', 'Last Booking', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const lastB = c.bookings?.[0]
                  return (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.email}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.phone || '—'}</td>
                      <td>
                        <span style={{ background: 'rgba(228,197,144,0.1)', color: 'var(--gold)', fontFamily: 'var(--font-display)', padding: '2px 10px', borderRadius: 20, fontSize: '0.82rem' }}>
                          {c.bookings?.length || 0}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {lastB ? format(new Date(lastB.createdAt), 'dd MMM yyyy') : '—'}
                      </td>
                      <td><button onClick={() => setSelected(c)} className="action-btn view">View</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selected.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{selected.email} · {selected.phone || 'No phone'}</p>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>
              Booking History ({selected.bookings?.length || 0})
            </p>
            {selected.bookings?.length === 0 ? (
              <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No bookings yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.bookings?.map(b => (
                  <div key={b.id} style={{ background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-warm)', fontWeight: 500 }}>#{b.id}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{format(new Date(b.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '0.95rem' }}>₹{Number(b.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {manualModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setManualModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title"><i className="fa-solid fa-phone" style={{ marginRight: 8, color: 'var(--gold)' }} />Manual / Phone Booking</h3>
              <button className="modal-close" onClick={() => setManualModal(false)}><i className="fa-solid fa-xmark" /></button>
            </div>
            {[
              ['Customer Name', 'customerName', 'text'],
              ['Email', 'customerEmail', 'email'],
              ['Phone', 'customerPhone', 'tel'],
              ['Venue', 'venueAddress', 'text'],
              ['Guest Count', 'guestCount', 'number'],
              ['Notes', 'notes', 'text'],
            ].map(([label, key, type]) => (
              <div className="field-block" key={key}>
                <label className="field-label">{label}</label>
                <input type={type} value={manualForm[key]} onChange={e => setManualForm(f => ({ ...f, [key]: e.target.value }))} className="booking-input" />
              </div>
            ))}
            <div className="field-block">
              <label className="field-label">Event Type *</label>
              <select value={manualForm.eventType} onChange={e => setManualForm(f => ({ ...f, eventType: e.target.value }))} className="booking-input">
                <option value="">Select…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field-block">
              <label className="field-label">Event Date *</label>
              <input type="date" value={manualForm.eventDate} onChange={e => setManualForm(f => ({ ...f, eventDate: e.target.value }))} className="booking-input" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="field-block">
              <label className="field-label">Serving Style</label>
              <select value={manualForm.servingStyle} onChange={e => setManualForm(f => ({ ...f, servingStyle: e.target.value }))} className="booking-input">
                {SERVING_STYLES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <button onClick={handleManualBooking} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Creating…</> : <><i className="fa-solid fa-plus" /> Create Booking</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
