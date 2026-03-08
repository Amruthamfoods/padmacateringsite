const REVIEWS = [
  { name: 'Priya Lakshmi Raju', event: 'Wedding Reception — 450 guests', avatar: 'PL', color: '#9AD983', text: "Amrutham catered our daughter's wedding and it was absolutely flawless. The food was fresh, piping hot and the variety was incredible. Our guests are still talking about the biryani! The serving staff were professional and courteous. Highly recommend!", rating: 5 },
  { name: 'Venkata Rao Manduri', event: 'Corporate Event — 200 guests', avatar: 'VR', color: '#5BA3F0', text: "We have been using Amrutham for our company events for 3 years now. Consistent quality, always on time and the meal trays are perfect for our office lunches. The team is responsive and makes bulk ordering very easy. Five stars without hesitation.", rating: 5 },
  { name: 'Sushma Devi Potti', event: 'Housewarming — 120 guests', avatar: 'SD', color: '#F5A623', text: "I was worried about managing food for 120 people but Padma Catering made it effortless. The South Indian spread was authentic and delicious. They handled setup, serving and cleanup so we could enjoy the celebration. Truly stress-free!", rating: 5 },
]
export default function Testimonials() {
  return (
    <section style={{ background: 'var(--bg-light)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 14 }}>Testimonials</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 12 }}>Customer Thoughts</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>What our happy customers in Visakhapatnam are saying about us</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(r.rating)].map((_, j) => <i key={j} className="fa-solid fa-star" style={{ color: 'var(--star)', fontSize: '0.85rem' }} />)}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--body-text)', lineHeight: 1.7, marginBottom: 20 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>{r.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--heading)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
