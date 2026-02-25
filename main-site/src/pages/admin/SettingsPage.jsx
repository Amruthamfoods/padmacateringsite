import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export default function SettingsPage() {
  const [blockedDates, setBlockedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [gstRate, setGstRate] = useState('5')
  const [minDays, setMinDays] = useState('3')

  useEffect(() => {
    api.get('/admin/blocked-dates')
      .then(r => setBlockedDates(r.data))
      .catch(() => toast.error('Failed to load blocked dates'))
      .finally(() => setLoading(false))
  }, [])

  async function addBlockedDate() {
    if (!newDate) { toast.error('Select a date'); return }
    setAdding(true)
    try {
      const { data } = await api.post('/admin/blocked-dates', { date: newDate, reason: newReason })
      setBlockedDates(d => [...d, data])
      setNewDate(''); setNewReason('')
      toast.success('Date blocked')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to block date')
    } finally {
      setAdding(false)
    }
  }

  async function removeBlockedDate(id) {
    try {
      await api.delete(`/admin/blocked-dates/${id}`)
      setBlockedDates(d => d.filter(bd => bd.id !== id))
      toast.success('Date unblocked')
    } catch {
      toast.error('Failed to unblock')
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub">Manage business info and booking settings</p>
        </div>
      </div>

      {/* Business Info */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-head">
          <p className="admin-card-title"><i className="fa-solid fa-building" style={{ marginRight: 8, color: 'var(--gold)' }} />Business Information</p>
        </div>
        <div style={{ padding: '4px 24px 20px' }}>
          {[
            ['Business Name', 'Padma Catering (Amrutham Foods)'],
            ['Phone', '+91 86 86 622 722 · +91 98 49 915 468'],
            ['Email', 'amruthamfoodsvizag@gmail.com'],
            ['Address', 'Opp Dictionary Kids, TTD to Ushodaya Rd, MVP Circle, Visakhapatnam – 530017'],
          ].map(([lbl, val]) => (
            <div key={lbl} className="summary-row">
              <span className="summary-lbl">{lbl}</span>
              <span className="summary-val" style={{ fontSize: '0.82rem' }}>{val}</span>
            </div>
          ))}
          <button onClick={() => toast('Business info editing coming soon!')} className="btn btn-outline" style={{ marginTop: 16, fontSize: '0.8rem', padding: '7px 16px' }}>
            <i className="fa-solid fa-pen" /> Edit Info
          </button>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-head">
          <p className="admin-card-title"><i className="fa-solid fa-sliders" style={{ marginRight: 8, color: 'var(--gold)' }} />Booking Settings</p>
        </div>
        <div style={{ padding: '4px 24px 24px' }}>
          <div className="field-block" style={{ maxWidth: 200 }}>
            <label className="field-label">GST Rate (%)</label>
            <input type="number" value={gstRate} onChange={e => setGstRate(e.target.value)} min="0" max="28" className="booking-input" />
          </div>
          <div className="field-block" style={{ maxWidth: 200 }}>
            <label className="field-label">Min Advance Booking Days</label>
            <input type="number" value={minDays} onChange={e => setMinDays(e.target.value)} min="0" max="60" className="booking-input" />
          </div>
          <button onClick={() => toast.success('Settings saved!')} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '9px 20px' }}>
            <i className="fa-solid fa-floppy-disk" /> Save Settings
          </button>
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="admin-card">
        <div className="admin-card-head">
          <p className="admin-card-title"><i className="fa-solid fa-calendar-xmark" style={{ marginRight: 8, color: 'var(--gold)' }} />Blocked Dates</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Customers cannot book on these dates</p>
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          {/* Add row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="admin-input" style={{ colorScheme: 'dark', width: 160 }} />
            <input type="text" value={newReason} onChange={e => setNewReason(e.target.value)}
              placeholder="Reason (optional)" className="admin-input" style={{ flex: 1, minWidth: 160 }} />
            <button onClick={addBlockedDate} disabled={adding} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              {adding ? <><i className="fa-solid fa-circle-notch fa-spin" /> Adding…</> : <><i className="fa-solid fa-ban" /> Block Date</>}
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1.5rem', color: 'var(--gold)' }} />
            </div>
          ) : blockedDates.length === 0 ? (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No blocked dates</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {blockedDates.map(bd => (
                <div key={bd.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 8, padding: '10px 14px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-warm)', fontWeight: 500 }}>{format(new Date(bd.date), 'dd MMMM yyyy')}</span>
                    {bd.reason && <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginLeft: 10 }}>— {bd.reason}</span>}
                  </div>
                  <button onClick={() => removeBlockedDate(bd.id)}
                    style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '2px 8px' }}>
                    <i className="fa-solid fa-trash" /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
