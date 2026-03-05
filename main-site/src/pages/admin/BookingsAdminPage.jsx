import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

const STATUS_LABELS = {
  PENDING: 'RECEIVED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

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
  const [statusCounts, setStatusCounts] = useState({ ALL: 0, PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 })

  function fetchBookings(p = 1) {
    setLoading(true)
    const params = new URLSearchParams({ page: p, limit: 20 })
    if (filters.status) params.set('status', filters.status)
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.eventType) params.set('eventType', filters.eventType)
    api.get(`/admin/bookings?${params}`)
      .then(r => {
        setBookings(r.data.bookings)
        setTotal(r.data.total)
        setPages(r.data.pages)
        if (r.data.statusCounts) setStatusCounts(r.data.statusCounts)
      })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings(1) }, [filters])

  function openDetail(b) { setSelected(b); setEditStatus(b.status); setEditNotes(b.adminNotes || '') }

  async function saveDetail() {
    setSaving(true)
    try {
      const { data } = await api.patch(`/admin/bookings/${selected.id}`, { status: editStatus, adminNotes: editNotes })
      setSelected(null)
      toast.success('Booking updated')
      fetchBookings(page)
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
        {/* Tabs for Statuses */}
        <div style={{ display: 'flex', gap: 4, margin: '20px 20px 0 20px', background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {[{ id: '', label: 'All' }, ...STATUSES.map(s => ({ id: s, label: STATUS_LABELS[s] }))].map(tab => {
            const isActive = filters.status === tab.id;
            return (
              <button key={tab.id} onClick={() => { setFilters(f => ({ ...f, status: tab.id })); setPage(1) }}
                style={{
                  padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
                  background: isActive ? 'var(--gold)' : 'transparent',
                  color: isActive ? 'var(--dark-1)' : 'var(--text-muted)',
                }}>
                {tab.label}
                <span style={{
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700
                }}>
                  {statusCounts[tab.id || 'ALL']}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="admin-filters" style={{ borderTop: 'none', paddingTop: 16 }}>
          <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
            className="admin-input" style={{ colorScheme: 'dark' }} />
          <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
            className="admin-input" style={{ colorScheme: 'dark' }} />
          <button onClick={() => { setFilters({ status: '', from: '', to: '', eventType: '' }); setPage(1) }}
            className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '7px 14px' }}>
            Reset
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-faint)' }}>No bookings found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', gap: '20px', padding: '10px 0' }}>
            {bookings.map(b => (
              <div key={b.id} style={{ background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Header: ID & Status Stages */}
                <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--gold-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>#{b.id}</span>
                    <span className={`status-badge status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                  </div>
                  {/* Stages indicator */}
                  {b.status !== 'CANCELLED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <span style={{ color: 'var(--white)' }}>Received</span>
                      <i className="fa-solid fa-arrow-right" style={{ color: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'var(--gold)' : 'var(--text-faint)' }} />
                      <span style={{ color: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'var(--white)' : 'var(--text-faint)' }}>Confirmed</span>
                      <i className="fa-solid fa-arrow-right" style={{ color: b.status === 'COMPLETED' ? 'var(--gold)' : 'var(--text-faint)' }} />
                      <span style={{ color: b.status === 'COMPLETED' ? 'var(--white)' : 'var(--text-faint)' }}>Completed</span>
                    </div>
                  )}
                  {b.status === 'CANCELLED' && <span style={{ fontSize: '0.75rem', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px' }}>Cancelled</span>}
                </div>

                {/* Body: Top Part (Customer & Event) */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <h5 style={{ color: 'var(--text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Customer Info</h5>
                    <p style={{ color: 'var(--white)', margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{b.user?.name || b.guestName || 'Guest'}</p>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.8rem' }}>{b.user?.phone || b.guestPhone || 'No Phone'}</p>
                    {b.user?.email && <p style={{ color: 'var(--text-muted)', margin: '2px 0 0 0', fontSize: '0.8rem' }}>{b.user.email}</p>}
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Event & Dates</h5>
                    <p style={{ color: 'var(--white)', margin: 0, fontSize: '0.9rem' }}>{b.eventType}</p>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.8rem' }}>Event: <span style={{ color: 'var(--white)' }}>{b.eventDate ? format(new Date(b.eventDate), 'dd MMM yyyy') : '—'}</span></p>
                    <p style={{ color: 'var(--text-muted)', margin: '2px 0 0 0', fontSize: '0.8rem' }}>Booked: <span>{b.createdAt ? format(new Date(b.createdAt), 'dd MMM yyyy') : '—'}</span></p>
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--text-faint)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0' }}>Order Summary</h5>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>Guests: <span style={{ color: 'var(--white)' }}>{b.guestCount}</span></p>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0', fontSize: '0.8rem' }}>Total: <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginLeft: 4 }}>₹{Number(b.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                    <button onClick={() => openDetail(b)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', marginTop: 8, justifyContent: 'center' }}>
                      Update / Full Details
                    </button>
                  </div>
                </div>

                {/* Body: Bottom Part (Menu Items) */}
                <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)', flex: 1 }}>
                  <h5 style={{ color: 'var(--text-faint)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Selected Menu ({b.menuItems?.length || 0} items)</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {b.menuItems?.map(mi => (
                      <span key={mi.menuItemId} style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'var(--text-warm)' }}>
                        {mi.menuItem?.name}
                      </span>
                    ))}
                    {(!b.menuItems || b.menuItems.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>No items.</span>}
                  </div>
                </div>
              </div>
            ))}
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
                <h3 className="modal-title">{selected.eventType} — {selected.user?.name || 'Guest'}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><i className="fa-solid fa-xmark" /></button>
            </div>

            {[
              ['Date', selected.eventDate ? format(new Date(selected.eventDate), 'dd MMM yyyy') : '—'],
              ['Guests', selected.guestCount],
              ['Venue', selected.venueAddress || '—'],
              ['Phone', selected.user?.phone || '—'],
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
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
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
