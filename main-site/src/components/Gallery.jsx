const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1555244162-803834f87a4d?w=700&h=400&fit=crop&q=80', label: 'Wedding Buffet', span: 'wide' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop&q=80', label: 'Corporate Event' },
  { src: 'https://images.unsplash.com/photo-1579691769318-e08b41a2f52c?w=400&h=400&fit=crop&q=80', label: 'Live Counter' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=400&fit=crop&q=80', label: 'South Indian Thali', span: 'wide' },
  { src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop&q=80', label: 'Dessert Station' },
]
export default function Gallery() {
  return (
    <section style={{ background: 'var(--bg)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 14 }}>Gallery</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 12 }}>Events We Have Served</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 440, margin: '0 auto' }}>A glimpse of the memories we helped create across Visakhapatnam</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {IMAGES.map((img, i) => (
            <div key={i} style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', position: 'relative', gridColumn: img.span === 'wide' ? 'span 2' : 'span 1', aspectRatio: img.span === 'wide' ? '2.1/1' : '1/1' }}>
              <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', display: 'block' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', borderRadius: 'var(--r-sm)', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>{img.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <a href="/gallery" className="site-btn site-btn-outline">View Full Gallery <i className="fa-solid fa-arrow-right" /></a>
        </div>
      </div>
    </section>
  )
}
