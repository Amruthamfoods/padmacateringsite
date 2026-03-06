const STATS = [
  { icon: 'fa-solid fa-utensils', value: '5,000+', label: 'Events Catered', color: '#E8F5E9', iconColor: '#2E7D32' },
  { icon: 'fa-solid fa-plate-wheat', value: '1 Crore+', label: 'Plates Served', color: '#FFF8E1', iconColor: '#E65100' },
  { icon: 'fa-solid fa-users', value: '3,000+', label: 'Happy Families', color: '#E3F2FD', iconColor: '#1565C0' },
  { icon: 'fa-solid fa-award', value: '15+ Yrs', label: 'Experience', color: '#F3E5F5', iconColor: '#6A1B9A' },
]
export default function Stats() {
  return (
    <section style={{ background: 'var(--heading)', padding: '72px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 'var(--r)', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={s.icon} style={{ color: s.iconColor, fontSize: '1.3rem' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'white', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
