import { useSearchParams, Link } from 'react-router-dom'

export default function BookingSuccessPage() {
  const [params] = useSearchParams()
  const bookingId = params.get('id')

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      {/* Success card */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
        {/* Animated check */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #9AD983, #7BC565)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(154,217,131,0.4)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{ color: '#323434', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 8px' }}>
          Booking Confirmed!
        </h2>
        <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.6 }}>
          Your catering order has been placed successfully. Our team will contact you shortly to confirm the details.
        </p>

        {bookingId && (
          <div style={{ background: '#F5F5F5', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
            <p style={{ color: '#888', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Booking ID</p>
            <p style={{ color: '#323434', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>#{bookingId}</p>
          </div>
        )}

        <div style={{ background: '#dcfce7', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 0100 1.18 2 2 0 014.11 2H7a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9a16 16 0 006.29 6.29l.61-1.09a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>
              We'll call you within 2 hours to confirm
            </span>
          </div>
        </div>

        {/* What's next steps */}
        <div style={{ textAlign: 'left', marginBottom: 28 }}>
          <p style={{ color: '#323434', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 14px' }}>What happens next?</p>
          {[
            { step: '1', text: 'Our team reviews your order', sub: 'Within 2 hours' },
            { step: '2', text: 'Confirmation call to finalize details', sub: 'Same day' },
            { step: '3', text: 'Fresh food delivered on your event day', sub: 'Guaranteed' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#9AD983', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>{item.step}</span>
              </div>
              <div>
                <p style={{ color: '#323434', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{item.text}</p>
                <p style={{ color: '#9AD983', fontSize: '0.75rem', margin: '2px 0 0', fontWeight: 600 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/setup" style={{
          display: 'block', width: '100%', padding: '14px 20px',
          background: '#9AD983', color: '#fff', textDecoration: 'none',
          borderRadius: 50, fontWeight: 800, fontSize: '0.95rem', textAlign: 'center',
          boxShadow: '0 8px 20px rgba(154,217,131,0.4)',
          marginBottom: 12,
        }}>
          Book Another Event
        </Link>
        <Link to="/my-orders" style={{
          display: 'block', width: '100%', padding: '14px 20px',
          background: '#F5F5F5', color: '#323434', textDecoration: 'none',
          borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', textAlign: 'center',
        }}>
          View My Orders
        </Link>
      </div>

      {/* Padma branding */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ color: '#9AD983', fontWeight: 800, fontSize: '1rem', margin: 0 }}>Amrutham</p>
        <p style={{ color: '#888', fontSize: '0.75rem', margin: '2px 0 0' }}>by Padma Catering · Visakhapatnam</p>
      </div>
    </div>
  )
}
