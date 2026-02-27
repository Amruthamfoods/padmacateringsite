import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [filters, setFilters] = useState({ status: '', from: '', to: '', eventType: '' })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')

  function fetchBookings(p = 1) {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (filters.status) params.set('status', filters.status)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.eventType) params.set('eventType', filters.eventType)
    api.get(`/admin/bookings?${params}`)
      .then(r => { setBookings(r.data.bookings); setTotal(r.data.total); setPages(r.data.pages) })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings(1) }, [filters])

  function openDetail(b) { setSelected(b); setEditStatus(b.status); setEditNotes(b.adminNotes || '') }

  async function saveDetail() {
    setSaving(true)
    try {
      const { data } = await api.patch(`/admin/bookings/${selected.id}`, { status: editStatus, adminNotes: editNotes })
      setBookings(bs => bs.map(b => b.id === selected.id ? { ...b, ...data } : b))
      setSelected(s => ({ ...s, ...data }))
      toast.success('Booking updated')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bookings</h1>
          <p className="admin-page-sub">{total} total records</p>
        </div>
        <button onClick={() => fetchBookings(page)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
          <i className="fa-solid fa-rotate-right" /> Refresh
        </button>
      </div>

      <div className="admin-card">
        {/* Filters */}
        <div className="admin-filters">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="admin-select">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
            className="admin-input" style={{ colorScheme: 'dark' }} />
          <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
            className="admin-input" style={{ colorScheme: 'dark' }} />
          <button onClick={() => { setFilters({ status: '', from: '', to: '', eventType: '' }); setPage(1) }}
            className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>
            Reset
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>No bookings found</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['ID', 'Customer', 'Event', 'Date', 'Guests', 'Total', 'Status', ''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="id-cell">#{b.id}</td>
                    <td>{b.user?.name || b.guestName || '—'}</td>
                    <td>{b.eventType}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.eventDate ? format(new Date(b.eventDate), 'dd MMM yyyy') : '—'}</td>
                    <td>{b.guestCount}</td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--white)' }}>₹{Number(b.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                    <td><button onClick={() => openDetail(b)} className="action-btn view">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="admin-pagination">
            <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchBookings(page - 1) }} className="admin-pag-btn">← Prev</button>
            <span className="admin-pag-info">{page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => { setPage(p => p + 1); fetchBookings(page + 1) }} className="admin-pag-btn">Next →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Booking #{selected.id}</p>
                <h3 className="modal-title">{selected.eventType} — {selected.user?.name || selected.guestName || 'Guest'}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark" /></button>
            </div>

            {[
              ['Date', selected.eventDate ? format(new Date(selected.eventDate), 'dd MMM yyyy') : '—'],
              ['Guests', selected.guestCount],
              ['Venue', selected.venueAddress || '—'],
              ['Phone', selected.user?.phone || selected.guestPhone || '—'],
              ['Email', selected.user?.email || selected.guestEmail || '—'],
              ['Total', `₹${Number(selected.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
            ].map(([lbl, val]) => (
              <div key={lbl} className="summary-row">
                <span className="summary-lbl">{lbl}</span>
                <span className="summary-val">{val}</span>
              </div>
            ))}

            {selected.menuItems?.length > 0 && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Menu ({selected.menuItems.length} items)</p>
                {selected.menuItems.map(mi => (
                  <div key={mi.menuItemId} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '3px 0' }}>• {mi.menuItem?.name}</div>
                ))}
              </div>
            )}

            <div className="field-block" style={{ marginTop: 20 }}>
              <label className="field-label">Update Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="booking-input">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="field-block">
              <label className="field-label">Internal Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} className="booking-input" style={{ resize: 'vertical' }} />
            </div>

            <button onClick={saveDetail} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
