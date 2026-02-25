import { useSearchParams, Link } from 'react-router-dom'

export default function BookingSuccessPage() {
  const [params] = useSearchParams()
  const bookingId = params.get('id')

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <i className="fa-solid fa-circle-check" />
        </div>

        <h1 className="success-title">Booking Confirmed!</h1>
        <p className="success-text">Thank you for choosing Padma Catering. Your event is in safe hands.</p>

        {bookingId && (
          <div className="success-id-box">
            <p className="success-id-label">Booking Reference</p>
            <p className="success-id-val">#{bookingId}</p>
          </div>
        )}

        <div className="success-info-list">
          <div className="success-info-item">
            <i className="fa-solid fa-phone success-info-icon" />
            <div>
              <p className="success-info-title">We'll call you within 24 hours</p>
              <p className="success-info-sub">Our team will confirm your booking and finalize menu details.</p>
            </div>
          </div>
          <div className="success-info-item">
            <i className="fa-solid fa-envelope success-info-icon" />
            <div>
              <p className="success-info-title">Confirmation email sent</p>
              <p className="success-info-sub">Check your inbox for the booking summary.</p>
            </div>
          </div>
          <div className="success-info-item">
            <i className="fa-solid fa-location-dot success-info-icon" />
            <div>
              <p className="success-info-title">Padma Catering, Visakhapatnam</p>
              <p className="success-info-sub">+91 86 86 622 722 · +91 98 49 915 468</p>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/account" className="btn btn-primary">
            <i className="fa-solid fa-list-check" /> My Bookings
          </Link>
          <Link to="/booking" className="btn btn-outline">
            <i className="fa-solid fa-plus" /> Book Another
          </Link>
        </div>

        <p style={{ marginTop: 20 }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
