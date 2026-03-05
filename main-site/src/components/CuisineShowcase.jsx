import { useState } from 'react'
const CATEGORIES = [
  { id: 'meal-tray', icon: 'fa-solid fa-box', title: 'Meal Tray', tag: 'Individual Packs', color: '#E8F5E9', iconColor: '#2E7D32', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&h=420&fit=crop&q=80', desc: 'Hygienic individual meal trays — order 10 trays, get 10 perfectly packed meals. Ideal for offices, workshops and small gatherings.', features: ['Breakfast / Lunch / Dinner trays', 'Min 10 trays per order', 'Fully packed & hygienic', 'Veg & Non-Veg options'] },
  { id: 'bulk-delivery', icon: 'fa-solid fa-truck', title: 'Bulk Delivery', tag: 'Large Quantities', color: '#E3F2FD', iconColor: '#1565C0', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=420&fit=crop&q=80', desc: 'Each dish delivered in its own large box — perfect for self-service events. Optional serving staff available as add-on.', features: ['Separate containers per dish', 'South & North Indian', 'Optional serving staff', 'Min 25 guests'] },
  { id: 'catering', icon: 'fa-solid fa-hat-chef', title: 'Full Catering', tag: 'Complete Service', color: '#F3E5F5', iconColor: '#6A1B9A', image: 'https://images.unsplash.com/photo-1555244162-803834f87a4d?w=600&h=420&fit=crop&q=80', desc: 'We handle everything — cooking, delivery, live setup, professional serving staff and complete cleanup after your event.', features: ['Full buffet setup', 'Trained serving staff', 'Live counters available', 'Weddings & large events'] },
]
export default function CuisineShowcase({ onBookNow }) {
  const [active, setActive] = useState('meal-tray')
  const cat = CATEGORIES.find(c => c.id === active)
  return (
    <section style={{ background: 'var(--bg)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 14 }}>Our Services</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 12 }}>Our Special Catering</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>Three ways to serve you — from individual meal trays to full-scale event catering</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActive(c.id)} style={{ padding: '10px 24px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', background: active === c.id ? 'var(--primary)' : 'var(--bg-light)', color: active === c.id ? 'var(--heading)' : 'var(--muted)', boxShadow: active === c.id ? 'var(--shadow-green)' : 'none' }}>
              <i className={c.icon} style={{ marginRight: 8 }} />{c.title}
            </button>
          ))}
        </div>
        {cat && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }} className="cat-grid">
            <div>
              <div style={{ display: 'inline-block', background: cat.color, borderRadius: 'var(--r-sm)', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: cat.iconColor, marginBottom: 16 }}>{cat.tag}</div>
              <h3 style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--heading)', marginBottom: 16 }}>{cat.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>{cat.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {cat.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-check" style={{ color: 'var(--primary-dark)', fontSize: '0.65rem' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--body-text)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onBookNow} className="site-btn site-btn-primary">Book {cat.title} <i className="fa-solid fa-arrow-right" /></button>
            </div>
            <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', aspectRatio: '4/3' }}>
              <img src={cat.image} alt={cat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}
      </div>
      <style>{`.cat-grid{} @media(max-width:900px){.cat-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
