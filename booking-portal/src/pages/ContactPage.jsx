import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const contactInfo = [
  { icon: 'fa-solid fa-phone',        label: 'Call Us',      value: '+91 86 86 622 722', link: 'tel:+918686622722' },
  { icon: 'fa-solid fa-envelope',     label: 'Email Us',     value: 'amruthamfoodsvizag@gmail.com', link: 'mailto:amruthamfoodsvizag@gmail.com' },
  { icon: 'fa-brands fa-whatsapp',    label: 'WhatsApp',     value: '+91 86 86 622 722', link: 'https://wa.me/918686622722' },
  { icon: 'fa-solid fa-location-dot', label: 'Our Location', value: 'Amrutham, Opp Dictionary Kids, TTD to Ushodaya Rd, MVP Circle, Visakhapatnam – 530017', link: 'https://maps.app.goo.gl/TapquGe9cj6hSCNn8' },
]

const HOURS = [
  { day: 'Monday – Friday',   time: '08:00 AM – 10:00 PM' },
  { day: 'Saturday – Sunday', time: '10:00 AM – 11:00 PM' },
]

const S = { label: { display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 14 } }

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setStatus('sent'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }
      else throw new Error()
    } catch {
      const body = `Name: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`
      window.open(`mailto:amruthamfoodsvizag@gmail.com?subject=${encodeURIComponent(form.subject || 'Enquiry from Amrutham')}&body=${encodeURIComponent(body)}`)
      setStatus('sent')
    }
  }

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 'var(--r)', border: '1px solid var(--separator-nm)', background: 'var(--fill-tertiary)', fontSize: 14, color: 'var(--heading)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ background: 'var(--bg-page)', paddingTop: 68 }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1488992783499-418eb1f62d08?w=1920&auto=format&q=80" alt="Contact" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ ...S.label, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', marginBottom: 16 }}>Get in Touch</span>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
            Let's Plan Your <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Perfect Event</em>
          </h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <section style={{ padding: '72px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 56, alignItems: 'start' }} className="contact-portal-wrap">

            {/* Left — info */}
            <div>
              <span style={S.label}>Contact Information</span>
              <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)', fontWeight: 800, color: 'var(--heading)', margin: '0 0 8px', lineHeight: 1.25 }}>
                We'd Love to <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Hear from You</em>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 20px' }}>
                <div style={{ height: 2, width: 48, background: 'var(--primary)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                <div style={{ height: 2, width: 48, background: 'var(--primary)' }} />
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 28 }}>
                Whether you have a specific date in mind or just want to explore what we can offer, reach out to us. Our team typically responds within a few hours.
              </p>

              {/* Contact cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {contactInfo.map(c => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)', border: '0.5px solid var(--separator-nm)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={c.icon} style={{ color: 'var(--primary)', fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.label}</div>
                      {c.link
                        ? <a href={c.link} target={c.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--heading)', textDecoration: 'none' }}>{c.value}</a>
                        : <span style={{ fontSize: '0.875rem', color: 'var(--heading)' }}>{c.value}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Working Hours */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)', border: '0.5px solid var(--separator-nm)', marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--heading)', marginBottom: 10 }}>
                  <i className="fa-solid fa-clock" style={{ color: 'var(--primary)', marginRight: 8 }} />Working Hours
                </div>
                {HOURS.map(h => (
                  <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid var(--separator-nm)' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>{h.day}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{h.time}</span>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { href: 'https://wa.me/918686622722', icon: 'fa-brands fa-whatsapp' },
                  { href: '#', icon: 'fa-brands fa-instagram' },
                  { href: '#', icon: 'fa-brands fa-facebook-f' },
                ].map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                    <i className={s.icon} />
                  </a>
                ))}
              </div>

              <Link to="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '12px 24px', borderRadius: 'var(--r-pill)', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: 'var(--shadow-green)' }}>
                <i className="fa-solid fa-calendar-check" /> Book a Free Consultation
              </Link>
            </div>

            {/* Right — form */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-sm)', border: '0.5px solid var(--separator-nm)', overflow: 'hidden' }}>
              {status === 'sent' ? (
                <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.5rem' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>Message Sent!</h3>
                  <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Thank you for reaching out. Our team will get back to you shortly.</p>
                  <button onClick={() => setStatus(null)} style={{ padding: '10px 24px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading)', margin: '0 0 4px' }}>Send Us a Message</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="contact-form-row">
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Your Name *</label>
                      <input type="text" placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Phone Number *</label>
                      <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Email Address</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Subject *</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)} required style={inputStyle}>
                      <option value="">Select an enquiry type</option>
                      <option>Wedding Catering Enquiry</option>
                      <option>Corporate Event Catering</option>
                      <option>Birthday / Social Event</option>
                      <option>Bulk / Institutional Catering</option>
                      <option>Live Counter Enquiry</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Your Message *</label>
                    <textarea rows={5} placeholder="Tell us about your event — date, guest count, location, and any special requirements..." value={form.message} onChange={e => set('message', e.target.value)} required style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <button type="submit" disabled={status === 'sending'} style={{
                    padding: '14px', borderRadius: 'var(--r-pill)',
                    background: status === 'sending' ? 'var(--primary-light)' : 'var(--primary)',
                    border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    boxShadow: 'var(--shadow-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    {status === 'sending'
                      ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending...</>
                      : <><i className="fa-solid fa-paper-plane" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <div style={{ height: 360, overflow: 'hidden' }}>
        <iframe
          title="Amrutham Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.5!2d83.3388!3d17.7384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ0JzE4LjIiTiA4M8KwMjAnMTkuNyJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=Amrutham,+opp+Dictionary+kids,+TTD+to+Ushodaya+Road,+8,+MVP+Cir,+Visakhapatnam,+Andhra+Pradesh+530017"
          width="100%" height="360"
          style={{ border: 0, display: 'block', filter: 'grayscale(0.2)' }}
          allowFullScreen loading="lazy"
        />
      </div>

      <style>{`
        @media(max-width:900px){.contact-portal-wrap{grid-template-columns:1fr!important}}
        @media(max-width:500px){.contact-form-row{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  )
}
