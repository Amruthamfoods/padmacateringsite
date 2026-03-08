const PLANS = [
  { id: 'tray', name: 'Meal Tray', price: '₹180', unit: 'per tray', tag: 'Min 10 trays', active: false, features: ['Veg / Non-Veg options', 'Breakfast, Lunch or Dinner', 'Individual hygienic packs', 'Delivery included'] },
  { id: 'bulk', name: 'Delivery Box', price: '₹250', unit: 'per person', tag: 'Min 25 guests', active: true, features: ['Separate container per dish', 'South & North Indian', 'Optional serving staff', 'On-time delivery'] },
  { id: 'catering', name: 'Catering', price: '₹450', unit: 'per person', tag: 'Min 50 guests', active: false, features: ['Full buffet setup', 'Trained serving staff', 'Live counter options', 'Post-event cleanup'] },
]
export default function BrandShowcase({ onBookNow }) {
  return (
    <section style={{ background: 'var(--bg)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 14 }}>Pricing</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 12 }}>Choose the Plan That Works Best for You</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto' }}>Flexible pricing for every event size</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 920, margin: '0 auto' }}>
          {PLANS.map(p => (
            <div key={p.id} style={{ borderRadius: 'var(--r-xl)', padding: '32px 28px', background: p.active ? 'var(--primary)' : 'white', boxShadow: p.active ? 'var(--shadow-green)' : 'var(--shadow-sm)', border: p.active ? 'none' : '1px solid var(--border-light)', position: 'relative' }}>
              {p.active && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--heading)', color: 'white', borderRadius: 'var(--r-pill)', padding: '4px 16px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <div style={{ fontWeight: 700, fontSize: '0.72rem', color: p.active ? 'rgba(0,0,0,0.5)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{p.tag}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--heading)', marginBottom: 4 }}>{p.name}</h3>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontWeight: 800, fontSize: '2.4rem', color: 'var(--heading)' }}>{p.price}</span>
                <span style={{ fontSize: '0.88rem', color: p.active ? 'rgba(0,0,0,0.5)' : 'var(--muted)', marginLeft: 4 }}>{p.unit}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.88rem', color: p.active ? 'var(--heading)' : 'var(--body-text)' }}>
                    <i className="fa-solid fa-check" style={{ color: p.active ? 'var(--heading)' : 'var(--primary-dark)', fontSize: '0.75rem', flexShrink: 0 }} />{f}
                  </div>
                ))}
              </div>
              <button onClick={onBookNow} style={{ width: '100%', padding: '12px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', background: p.active ? 'var(--heading)' : 'var(--primary-bg)', color: p.active ? 'white' : 'var(--primary-dark)', transition: 'all 0.2s' }}>
                Get Started <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
