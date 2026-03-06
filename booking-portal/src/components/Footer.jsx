import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer style={{ background: 'var(--heading)', color: 'rgba(255,255,255,0.7)' }}>
      <div className="container" style={{ paddingTop: 64, paddingBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.3fr', gap: 40 }} className="footer-cols">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-bowl-rice" style={{ color: 'var(--heading)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', lineHeight: 1.1 }}>Amrutham</div>
                <div style={{ fontWeight: 400, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>by Padma Catering</div>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 280, marginBottom: 20 }}>Visakhapatnam's most trusted catering service since 1993. Serving 1 Crore+ plates with love, freshness and craftsmanship.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ href: 'https://wa.me/918686622722', icon: 'fa-brands fa-whatsapp' }, { href: '#', icon: 'fa-brands fa-instagram' }, { href: '#', icon: 'fa-brands fa-facebook-f' }].map(s => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', textDecoration: 'none' }}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/menus', 'Menus & Pricing'], ['/gallery', 'Gallery'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link key={to} to={to} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Meal Tray', 'Bulk Delivery', 'Full Catering', 'Weddings', 'Corporate Events', 'Religious Events'].map(s => (
                <span key={s} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'fa-solid fa-phone', text: '+91 86866 22722', href: 'tel:+918686622722' },
                { icon: 'fa-solid fa-envelope', text: 'amruthamfoodsvizag@gmail.com', href: 'mailto:amruthamfoodsvizag@gmail.com' },
                { icon: 'fa-brands fa-whatsapp', text: 'WhatsApp Us', href: 'https://wa.me/918686622722' },
                { icon: 'fa-solid fa-location-dot', text: 'MVP Circle, Visakhapatnam' },
              ].map(c => (
                <div key={c.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <i className={c.icon} style={{ color: 'var(--primary)', marginTop: 2, fontSize: '0.85rem', flexShrink: 0 }} />
                  {c.href ? <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{c.text}</a> : <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{c.text}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 48, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} Amrutham by Padma Catering Services. All rights reserved.</p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>Crafted with love in Visakhapatnam</p>
        </div>
      </div>
      <style>{`@media(max-width:900px){.footer-cols{grid-template-columns:1fr 1fr!important}}`}</style>
    </footer>
  )
}
