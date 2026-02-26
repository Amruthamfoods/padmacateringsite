import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [user, setUser]         = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('padma_user')
    if (!stored) { navigate('/login'); return }
    setUser(JSON.parse(stored))

    const token = localStorage.getItem('padma_token')
    api.get('/booking/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBookings(r.data))
      .catch(err => {
        if (err.response?.status === 401) { navigate('/login'); return }
        toast.error('Failed to load orders')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  async function cancelBooking(id) {
    if (!window.confirm('Cancel this booking?')) return
    const token = localStorage.getItem('padma_token')
    try {
      await api.patch(`/booking/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Booking cancelled')
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
    } catch {
      toast.error('Failed to cancel')
    }
  }

  const statusLabel = { PENDING: 'Pending Confirmation', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }

  return (
    <div className="orders-page-wrap">
      <div className="orders-center">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 4 }}>
              My Bookings
            </h1>
            {user && <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>}
          </div>
          <Link to="/packages" className="btn-primary" style={{ textDecoration: 'none' }}
            onClick={() => sessionStorage.setItem('bookingService', 'catering')}>
            <i className="fa-solid fa-plus" /> New Booking
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-circle-notch" style={{ fontSize: '2rem', color: 'var(--red)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>Your booking history will appear here.</p>
            <Link to="/packages" className="btn-primary" style={{ textDecoration: 'none' }}
              onClick={() => sessionStorage.setItem('bookingService', 'catering')}>
              Make Your First Booking
            </Link>
          </div>
        ) : (
          <>
            {bookings.map(b => {
              const menuNames = b.menuItems?.map(mi => mi.menuItem?.name).filter(Boolean).slice(0, 3) || []
              return (
                <div key={b.id} className="order-card">
                  {/* ID badge */}
                  <div className="order-id-badge">
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Booking</div>
                    <div>#{String(b.id).padStart(4, '0')}</div>
                  </div>

                  {/* Info */}
                  <div className="order-info">
                    <h4>{b.eventType} — {b.guestCount} Guests</h4>
                    <p style={{ marginBottom: 4 }}>
                      <i className="fa-solid fa-calendar" style={{ marginRight: 6, color: 'var(--red)', fontSize: '0.75rem' }} />
                      {formatDate(b.eventDate)}
                      {b.venueAddress && (
                        <> &nbsp;·&nbsp;
                          <i className="fa-solid fa-location-dot" style={{ marginRight: 4, color: 'var(--red)', fontSize: '0.75rem' }} />
                          {b.venueAddress.length > 40 ? b.venueAddress.slice(0, 40) + '…' : b.venueAddress}
                        </>
                      )}
                    </p>
                    {menuNames.length > 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                        {menuNames.join(', ')}{b.menuItems?.length > 3 ? ` +${b.menuItems.length - 3} more` : ''}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 3 }}>
                      Booked on {formatDate(b.createdAt)}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="order-right">
                    <div className="order-total">₹{Number(b.total).toLocaleString('en-IN')}</div>
                    <span className={`order-status status-${b.status}`}>
                      {statusLabel[b.status] || b.status}
                    </span>
                    {b.status === 'PENDING' && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          style={{ fontSize: '0.78rem', color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 24 }}>
              Questions? Call us at{' '}
              <a href="tel:+918686622722" style={{ color: 'var(--red)', fontWeight: 600 }}>+91 86866 22722</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
