import { useSearchParams } from 'react-router-dom'

export default function BookingSuccessPage() {
  const [params] = useSearchParams()
  const type = params.get('type') || 'booking'
  const id = params.get('id')
  const isQuote = type === 'quote'

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <i className={isQuote ? 'fa-solid fa-envelope-circle-check' : 'fa-solid fa-circle-check'} />
        </div>

        <h1 className="success-title">
          {isQuote ? 'Quote Request Received!' : 'Booking Confirmed!'}
        </h1>
        <p className="success-text">
          {isQuote
            ? 'Thank you for your interest in Padma Catering. We\'ll review your custom menu and get back to you shortly.'
            : 'Thank you for choosing Padma Catering. Your event is in safe hands.'
          }
        </p>

        {id && (
          <div className="success-id-box">
            <p className="success-id-label">{isQuote ? 'Quote Reference' : 'Booking Reference'}</p>
            <p className="success-id-val">#{id}</p>
          </div>
        )}

        <div className="success-info-list">
          {isQuote ? (
            <>
              <div className="success-info-item">
                <i className="fa-solid fa-clock success-info-icon" />
                <div>
                  <p className="success-info-title">Quote within 24 hours</p>
                  <p className="success-info-sub">Our team will review your menu and send a personalised price quote.</p>
                </div>
              </div>
              <div className="success-info-item">
                <i className="fa-solid fa-phone success-info-icon" />
                <div>
                  <p className="success-info-title">We'll contact you directly</p>
                  <p className="success-info-sub">+91 86 86 622 722 · +91 98 49 915 468</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="success-info-item">
                <i className="fa-solid fa-phone success-info-icon" />
                <div>
                  <p className="success-info-title">We'll call you within 24 hours</p>
                  <p className="success-info-sub">Our team will confirm your booking and finalise menu details.</p>
                </div>
              </div>
              <div className="success-info-item">
                <i className="fa-solid fa-envelope success-info-icon" />
                <div>
                  <p className="success-info-title">Confirmation email sent</p>
                  <p className="success-info-sub">Check your inbox for the booking summary.</p>
                </div>
              </div>
            </>
          )}
          <div className="success-info-item">
            <i className="fa-solid fa-location-dot success-info-icon" />
            <div>
              <p className="success-info-title">Padma Catering, Visakhapatnam</p>
              <p className="success-info-sub">+91 86 86 622 722 · +91 98 49 915 468</p>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <a href="/padmacateringsite/booking/" className="btn btn-outline">
            <i className="fa-solid fa-plus" /> {isQuote ? 'New Request' : 'Book Another'}
          </a>
        </div>

        <p style={{ marginTop: 20 }}>
          <a href="/padmacateringsite/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Home</a>
        </p>
      </div>
    </div>
  )
}
