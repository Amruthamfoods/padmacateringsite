import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../lib/api'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/booking/my')
      .then(r => setBookings(r.data))
      .catch(err => {
        if (err.response?.status === 401) { navigate('/login'); return }
        toast.error('Failed to load orders')
      })
      .finally(() => setLoading(false))
  }, [token, navigate])

  async function cancelBooking(e, id) {
    e.stopPropagation()
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api.patch(`/booking/${id}/cancel`, {})
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
          <Link to="/setup" className="btn-primary" style={{ textDecoration: 'none' }}>
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
            <Link to="/setup" className="btn-primary" style={{ textDecoration: 'none' }}>
              Make Your First Booking
            </Link>
          </div>
        ) : (
          <>
            {bookings.map(b => {
              const allMenuNames = b.menuItems?.map(mi => mi.menuItem?.name).filter(Boolean) || []
              const menuNames = allMenuNames.slice(0, 3)
              const isOpen = expanded === b.id
              return (
                <div key={b.id} style={{ marginBottom: 12, borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', overflow: 'hidden', background: '#fff', boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.08)' : 'none' }}>
                <div className="order-card" onClick={() => setExpanded(isOpen ? null : b.id)} style={{ cursor: 'pointer', marginBottom: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
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
                          onClick={(e) => cancelBooking(e, b.id)}
                          style={{ fontSize: '0.78rem', color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <i className={isOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6 }} />
                </div>
                {isOpen && (
                  <div style={{ borderTop: '1.5px solid var(--border-light)', padding: '18px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                      {[['Event Type', b.eventType], ['Date', formatDate(b.eventDate)], ['Guests', b.guestCount], ['Veg', b.vegCount||0], ['Non-Veg', b.nonVegCount||0], ['Serving', b.servingStyle||'-'], ['Delivery', b.deliveryType||'-'], ['Slot', b.timeSlot||'-'], ['Payment', b.paymentPlan||'-']].map(([lbl, val]) => (
                        <div key={lbl} style={{ background: 'var(--bg-pink)', borderRadius: 8, padding: '9px 11px' }}>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lbl}</div>
                          <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-dark)' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {b.venueAddress && <div style={{ background: 'var(--bg-pink)', borderRadius: 8, padding: '9px 11px', marginBottom: 10 }}><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Venue</div><div style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{b.venueAddress}</div></div>}
                    {allMenuNames.length > 0 && (
                      <div style={{ background: 'var(--bg-pink)', borderRadius: 8, padding: '9px 11px', marginBottom: 10 }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Items ({allMenuNames.length})</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {allMenuNames.map(n => <span key={n} style={{ fontSize: '0.76rem', background: '#fff', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 9px', color: 'var(--text-dark)' }}>{n}</span>)}
                        </div>
                      </div>
                    )}
                    <div style={{ background: 'var(--bg-pink)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Breakdown</div>
                      {[['Base Total', b.baseTotal], ['Delivery', b.deliveryCharge], ['Staff', b.staffCharge], ['Discount', -(b.discount||0)], ['GST', b.gst]].filter(r => r[1]).map(([lbl, val]) => (
                        <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                          <span>{lbl}</span><span style={{ color: val < 0 ? '#16A34A' : 'var(--text-dark)', fontWeight: 500 }}>{val < 0 ? '-' : ''}Rs.{Number(Math.abs(val)||0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.93rem', color: 'var(--text-dark)', borderTop: '1px solid var(--border)', paddingTop: 7, marginTop: 4 }}>
                        <span>Total</span><span>Rs.{Number(b.total||0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {b.status === 'PENDING' && <button onClick={(e) => cancelBooking(e, b.id)} style={{ fontSize: '0.83rem', color: '#DC2626', background: 'none', border: '1.5px solid #DC2626', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontWeight: 600 }}>Cancel Booking</button>}
                  </div>
                )}
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
