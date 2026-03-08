const STEPS = [
  { n: '01', icon: 'fa-solid fa-box-open', title: 'Choose Package', desc: 'Browse Meal Tray, Delivery Box or Catering options that suit your event size and budget.' },
  { n: '02', icon: 'fa-solid fa-utensils', title: 'Build Your Menu', desc: 'Pick items across Breakfast, Lunch, Snacks & Dinner. Veg, Non-Veg, South Indian or North Indian.' },
  { n: '03', icon: 'fa-solid fa-calendar-days', title: 'Pick Date & Guests', desc: 'Select your event date, time slot and exact guest count so we can prepare perfectly.' },
  { n: '04', icon: 'fa-solid fa-truck-fast', title: 'We Deliver', desc: 'We handle cooking, packaging, delivery and serving if you choose Catering.' },
]
export default function Services() {
  return (
    <section style={{ background: 'var(--bg-light)', padding: '96px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '5px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 14 }}>How It Works</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--heading)', marginBottom: 12 }}>Simple Steps to a Perfect Event</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>From browsing to booking in minutes</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: '32px 24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, fontWeight: 800, fontSize: '2.5rem', color: 'var(--border)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r)', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <i className={s.icon} style={{ color: 'var(--primary-dark)', fontSize: '1.2rem' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--heading)', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
