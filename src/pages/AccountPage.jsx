import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/booking/my')
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() { logout(); navigate('/') }

  async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return
    try {
      await api.patch(`/booking/${id}/cancel`)
      setBookings(b => b.map(bk => bk.id === id ? { ...bk, status: 'CANCELLED' } : bk))
      setSelected(s => s?.id === id ? { ...s, status: 'CANCELLED' } : s)
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel')
    }
  }

  function reBook(booking) {
    const items = booking.menuItems?.map(mi => ({
      id: mi.menuItem.id, name: mi.menuItem.name, price: mi.menuItem.price,
      type: mi.menuItem.type, style: mi.menuItem.style,
      category: mi.menuItem.category?.name || '',
    })) || []
    sessionStorage.setItem('bookingStep2', JSON.stringify(items))
    navigate('/booking/menu-builder')
  }

  return (
    <div className="account-page">
      {/* Header */}
      <div className="booking-header">
        <Link to="/" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Home
        </Link>
        <span className="booking-header-title">My Account</span>
        <button onClick={handleLogout} className="booking-header-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <i className="fa-solid fa-right-from-bracket" style={{ marginRight: 5 }} />Logout
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        {/* User greeting */}
        <div style={{ marginBottom: 32 }}>
          <span className="section-label">Account</span>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>
            Welcome, <em>{user?.name}</em>
          </h1>
        </div>

        {/* Tabs */}
        <div className="account-tabs">
          {[['bookings', 'My Bookings', 'fa-solid fa-list-check'], ['profile', 'Profile', 'fa-solid fa-user']].map(([key, lbl, icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`account-tab${tab === key ? ' active' : ''}`}>
              <i className={icon} style={{ marginRight: 6 }} />{lbl}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }} />
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--dark-3)', border: '1px solid var(--gold-line)', borderRadius: 10 }}>
                <i className="fa-solid fa-bowl-rice" style={{ fontSize: '2.5rem', color: 'var(--text-faint)', marginBottom: 16, display: 'block' }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No bookings yet</p>
                <Link to="/booking" className="btn btn-primary">
                  <i className="fa-solid fa-calendar-plus" /> Book Your First Event
                </Link>
              </div>
            ) : (
              bookings.map(bk => (
                <div key={bk.id} className="booking-row" onClick={() => setSelected(bk)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '0.9rem' }}>#{bk.id}</span>
                      <span className={`status-badge status-${bk.status}`}>{bk.status}</span>
                    </div>
                    <p style={{ color: 'var(--white)', fontSize: '0.95rem', fontWeight: 500, marginBottom: 2 }}>{bk.eventType}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {bk.eventDate ? format(new Date(bk.eventDate), 'dd MMM yyyy') : '—'} · {bk.guestCount} guests
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.1rem' }}>
                      ₹{Number(bk.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                      {format(new Date(bk.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="profile-card">
            <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-detail"><i className="fa-solid fa-envelope" style={{ marginRight: 8, color: 'var(--gold)' }} />{user?.email}</p>
            {user?.phone && <p className="profile-detail"><i className="fa-solid fa-phone" style={{ marginRight: 8, color: 'var(--gold)' }} />{user.phone}</p>}
            <button onClick={() => toast('Profile editing coming soon!')} className="btn btn-outline" style={{ marginTop: 24 }}>
              <i className="fa-solid fa-pen" /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
                  Booking #{selected.id}
                </p>
                <h3 className="modal-title">{selected.eventType}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div>
              <span className={`status-badge status-${selected.status}`} style={{ marginBottom: 20, display: 'inline-block' }}>{selected.status}</span>

              {/* Details */}
              {[
                ['Date', selected.eventDate ? format(new Date(selected.eventDate), 'dd MMM yyyy') : '—'],
                ['Guests', `${selected.guestCount} guests`],
                ['Venue', selected.venueAddress || '—'],
                ['Style', selected.servingStyle],
              ].map(([lbl, val]) => (
                <div key={lbl} className="summary-row">
                  <span className="summary-lbl">{lbl}</span>
                  <span className="summary-val">{val}</span>
                </div>
              ))}

              {/* Menu */}
              {selected.menuItems?.length > 0 && (
                <div style={{ marginTop: 20, marginBottom: 16 }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Menu Items</p>
                  {selected.menuItems.map(mi => (
                    <div key={mi.menuItemId} className="summary-row" style={{ padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: mi.menuItem?.type === 'VEG' ? '#4caf70' : '#e05c5c', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-warm)', fontSize: '0.85rem' }}>{mi.menuItem?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              <div style={{ background: 'var(--dark-2)', border: '1px solid var(--gold-line)', borderRadius: 8, padding: '16px 20px', marginTop: 16 }}>
                {[
                  ['Base Total', `₹${Number(selected.baseTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
                  selected.discount > 0 ? ['Discount', `−₹${Number(selected.discount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`] : null,
                  ['GST (5%)', `₹${Number(selected.gst).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
                ].filter(Boolean).map(([lbl, val]) => (
                  <div key={lbl} className="price-row">
                    <span className="lbl">{lbl}</span>
                    <span className="val" style={{ color: lbl === 'Discount' ? '#4caf70' : undefined }}>{val}</span>
                  </div>
                ))}
                <div className="price-total">
                  <span className="lbl">Total</span>
                  <span className="val">₹{Number(selected.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
                <button onClick={() => reBook(selected)} className="btn btn-primary">
                  <i className="fa-solid fa-rotate-right" /> Re-book
                </button>
                {selected.status === 'PENDING' && (
                  <button onClick={() => cancelBooking(selected.id)} className="btn btn-outline" style={{ borderColor: '#e05c5c', color: '#e05c5c' }}>
                    <i className="fa-solid fa-xmark" /> Cancel
                  </button>
                )}
                <button onClick={() => toast('Invoice download coming soon!')} className="btn btn-outline">
                  <i className="fa-solid fa-file-invoice" /> Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
