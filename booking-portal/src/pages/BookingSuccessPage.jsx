import { useSearchParams, Link } from 'react-router-dom'

export default function BookingSuccessPage() {
  const [params] = useSearchParams()
  const bookingId = params.get('id')

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--bg-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', width: '100%', maxWidth: 520, textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>

        {/* Success icon */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#D4EDDA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#28a745' }} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 10 }}>
          Booking Confirmed!
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
          Thank you for choosing Padma Catering. Our team will contact you within 2 hours to confirm your booking details.
        </p>

        {/* Booking ID */}
        {bookingId && (
          <div style={{ padding: '14px 24px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', marginBottom: 24, display: 'inline-block' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Booking ID</p>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-dark)', letterSpacing: '0.04em' }}>#{String(bookingId).padStart(6, '0')}</p>
          </div>
        )}

        {/* Contact */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', marginBottom: 24, overflow: 'hidden' }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-dark)' }}>
            Need help? Call us directly
          </p>
          <a href="tel:+918686622722" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-light)', color: 'var(--text-dark)', textDecoration: 'none' }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
              <i className="fa-solid fa-phone" style={{ fontSize: '0.85rem' }} />
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>+91 86866 22722</span>
          </a>
          <a href="tel:+919849915468" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: 'var(--text-dark)', textDecoration: 'none' }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
              <i className="fa-solid fa-phone" style={{ fontSize: '0.85rem' }} />
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>+91 98499 15468</span>
          </a>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/" style={{ flex: 1, padding: '13px', borderRadius: 50, background: 'var(--red)', color: '#fff', fontWeight: 700, fontSize: '0.92rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
            Book Another Event
          </Link>
          <a href="https://padmacatering.com" style={{ flex: 1, padding: '13px', borderRadius: 50, border: '1.5px solid var(--border)', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.92rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
            Back to Site
          </a>
        </div>

        <p style={{ marginTop: 24, fontSize: '0.78rem', color: 'var(--text-faint)' }}>
          🍛 Padma Catering · 📍 Visakhapatnam · Serving since 1993
        </p>
      </div>
    </div>
  )
}
