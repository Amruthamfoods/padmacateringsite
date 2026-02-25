import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import api from '../../lib/api'

const STATUS_COLORS = {
  PENDING: { bg: 'rgba(212,175,55,0.15)', color: '#d4af37' },
  REVIEWED: { bg: 'rgba(30,144,255,0.15)', color: '#1e90ff' },
  QUOTED: { bg: 'rgba(46,160,67,0.15)', color: '#2ea843' },
  REJECTED: { bg: 'rgba(192,57,43,0.15)', color: '#c0392b' },
}

export default function QuotesAdminPage() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    api.get(`/admin/quotes${params}`).then(r => setQuotes(r.data.quotes || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  async function saveQuote() {
    if (!selected) return
    setSaving(true)
    try {
      await api.patch(`/admin/quotes/${selected.id}`, { status: selected.status, adminNotes: selected.adminNotes })
      toast.success('Quote updated')
      load()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const parsedItems = useMemo(() => {
    if (!selected?.selectedItemsJson) return []
    try { return JSON.parse(selected.selectedItemsJson) } catch { return [] }
  }, [selected])

  const groupedItems = useMemo(() => {
    const map = {}
    parsedItems.forEach(item => {
      const cat = item.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(item)
    })
    return map
  }, [parsedItems])

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', position: 'relative' }}>
      {/* Main table */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Quote Requests</h1>
            <p className="admin-page-sub">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['ALL', 'PENDING', 'REVIEWED', 'QUOTED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                background: filter === s ? 'var(--gold)' : 'transparent',
                color: filter === s ? 'var(--dark-1)' : 'var(--text-muted)',
              }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: 'var(--gold)' }} />
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>{['#', 'Name', 'Phone', 'Event', 'Date', 'Guests', 'Status', 'Submitted', ''].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {quotes.map(q => (
                    <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => setSelected({ ...q })}>
                      <td style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>{q.id}</td>
                      <td style={{ color: 'var(--white)', fontWeight: 500 }}>{q.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{q.phone}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{q.eventType}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {q.eventDate ? format(new Date(q.eventDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{q.guestCount}</td>
                      <td>
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                          ...(STATUS_COLORS[q.status] || { bg: 'transparent', color: 'var(--text-muted)' }),
                          background: STATUS_COLORS[q.status]?.bg,
                          color: STATUS_COLORS[q.status]?.color,
                        }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-faint)', fontSize: '0.72rem' }}>
                        {q.createdAt ? format(new Date(q.createdAt), 'dd MMM, HH:mm') : '—'}
                      </td>
                      <td>
                        <button className="action-btn edit" onClick={e => { e.stopPropagation(); setSelected({ ...q }) }}>
                          <i className="fa-solid fa-pen" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '40px 0' }}>No quote requests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-in panel */}
      {selected && (
        <div style={{
          width: 360, flexShrink: 0, background: 'var(--dark-2)', border: '1px solid var(--gold-line)',
          borderRadius: 14, padding: 20, overflowY: 'auto', maxHeight: '80vh',
          position: 'sticky', top: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '1rem' }}>
              Quote #{selected.id}
            </h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {/* Contact info */}
          {[['Name', selected.name], ['Phone', selected.phone], ['Email', selected.email || '—']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gold-line)', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: 'var(--white)' }}>{v}</span>
            </div>
          ))}

          {/* Event info */}
          <div style={{ marginTop: 12 }}>
            {[
              ['Event', selected.eventType],
              ['Date', selected.eventDate ? format(new Date(selected.eventDate), 'dd MMMM yyyy') : '—'],
              ['Guests', selected.guestCount],
              ['Venue', selected.venueAddress || '—'],
              ['Serving Style', selected.servingStyle],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ color: 'var(--text-warm)', textAlign: 'right', maxWidth: '55%' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Menu items by category */}
          {Object.keys(groupedItems).length > 0 && (
            <div style={{ marginTop: 14, borderTop: '1px solid var(--gold-line)', paddingTop: 12 }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Selected Menu</p>
              {Object.entries(groupedItems).map(([cat, catItems]) => (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{cat}</p>
                  {catItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.type === 'VEG' ? '#4caf70' : '#e05c5c', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-warm)' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Special instructions */}
          {selected.specialInstructions && (
            <div style={{ marginTop: 12, background: 'var(--dark-3)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-faint)', marginBottom: 4 }}>SPECIAL INSTRUCTIONS</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-warm)' }}>{selected.specialInstructions}</p>
            </div>
          )}

          {/* Status dropdown */}
          <div className="field-block" style={{ marginTop: 16 }}>
            <label className="field-label">Status</label>
            <select
              value={selected.status}
              onChange={e => setSelected(s => ({ ...s, status: e.target.value }))}
              className="booking-input"
            >
              {['PENDING', 'REVIEWED', 'QUOTED', 'REJECTED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Admin notes */}
          <div className="field-block">
            <label className="field-label">Admin Notes</label>
            <textarea
              value={selected.adminNotes || ''}
              onChange={e => setSelected(s => ({ ...s, adminNotes: e.target.value }))}
              rows={3} className="booking-input" placeholder="Internal notes…" style={{ resize: 'vertical' }}
            />
          </div>

          <button onClick={saveQuote} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  )
}
