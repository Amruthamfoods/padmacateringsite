import { useState } from 'react'
import PageHero from '../components/PageHero'
import useScrollReveal from '../hooks/useScrollReveal'

const contactInfo = [
  { icon: 'fa-solid fa-phone', label: 'Call Us', value: '+91 86 86 622 722', link: 'tel:+918686622722' },
  { icon: 'fa-solid fa-envelope', label: 'Email Us', value: 'amruthamfoodsvizag@gmail.com', link: 'mailto:amruthamfoodsvizag@gmail.com' },
  { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', value: '+91 86 86 622 722', link: 'https://wa.me/918686622722' },
  { icon: 'fa-solid fa-location-dot', label: 'Our Location', value: 'Amrutham, Opp Dictionary Kids, TTD to Ushodaya Rd, MVP Circle, Visakhapatnam – 530017', link: 'https://maps.app.goo.gl/search?q=Amrutham+MVP+Circle+Visakhapatnam' },
]

export default function ContactPage({ onBookNow }) {
  useScrollReveal()

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'sent' | 'error'

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        throw new Error()
      }
    } catch {
      // Fallback — open mailto
      const body = `Name: ${form.name}\nPhone: ${form.phone}\n\n${form.message}`
      window.open(`mailto:amruthamfoodsvizag@gmail.com?subject=${encodeURIComponent(form.subject || 'Enquiry from Website')}&body=${encodeURIComponent(body)}`)
      setStatus('sent')
    }
  }

  return (
    <>
      <PageHero
        label="Get in Touch"
        title="Let's Plan Your"
        em="Perfect Event"
        bg="https://images.unsplash.com/photo-1488992783499-418eb1f62d08?w=1920&auto=format&q=80"
      />

      <section className="section">
        <div className="container">
          <div className="contact-wrap">
            {/* Left — info */}
            <div className="contact-info-col reveal-l">
              <span className="section-label">Contact Information</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)' }}>
                We'd Love to <em>Hear from You</em>
              </h2>
              <div className="section-divider"><div className="dot" /></div>
              <p className="about-body" style={{ marginBottom: 36 }}>
                Whether you have a specific date in mind or just want to explore what we can offer, reach out to us. Our team typically responds within a few hours.
              </p>

              <div className="contact-cards">
                {contactInfo.map(c => (
                  <div className="contact-card" key={c.label}>
                    <div className="contact-card-icon"><i className={c.icon} /></div>
                    <div>
                      <div className="contact-card-label">{c.label}</div>
                      {c.link
                        ? <a href={c.link} className="contact-card-value" target={c.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{c.value}</a>
                        : <span className="contact-card-value">{c.value}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-social">
                <a href="https://wa.me/918686622722" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp" /></a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              </div>

              <button className="btn btn-primary" onClick={onBookNow} style={{ marginTop: 32 }}>
                <i className="fa-solid fa-calendar-check" /> Book a Free Consultation
              </button>
            </div>

            {/* Right — form */}
            <div className="contact-form-col reveal-r">
              {status === 'sent' ? (
                <div className="contact-success">
                  <div className="contact-success-icon"><i className="fa-solid fa-circle-check" /></div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                  <button className="btn btn-outline" onClick={() => setStatus(null)}>Send Another Message</button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3 className="contact-form-title">Send Us a Message</h3>

                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label>Your Name *</label>
                      <input type="text" placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} required />
                    </div>
                    <div className="contact-field">
                      <label>Phone Number *</label>
                      <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} required />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label>Email Address</label>
                    <input type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>

                  <div className="contact-field">
                    <label>Subject *</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)} required>
                      <option value="">Select an enquiry type</option>
                      <option>Wedding Catering Enquiry</option>
                      <option>Corporate Event Catering</option>
                      <option>Birthday / Social Event</option>
                      <option>Bulk / Institutional Catering</option>
                      <option>Live Counter Enquiry</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>

                  <div className="contact-field">
                    <label>Your Message *</label>
                    <textarea rows={5} placeholder="Tell us about your event — date, guest count, location, and any special requirements..." value={form.message} onChange={e => set('message', e.target.value)} required />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'sending'}>
                    {status === 'sending'
                      ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending...</>
                      : <><i className="fa-solid fa-paper-plane" /> Send Message</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section style={{ height: 360, background: 'var(--dark-3)', position: 'relative', overflow: 'hidden' }}>
        <iframe
          title="Padma Catering Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.5!2d83.3388!3d17.7384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ0JzE4LjIiTiA4M8KwMjAnMTkuNyJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=Amrutham,+opp+Dictionary+kids,+TTD+to+Ushodaya+Road,+8,+MVP+Cir,+Visakhapatnam,+Andhra+Pradesh+530017"
          width="100%" height="360"
          style={{ border: 0, filter: 'grayscale(0.4) invert(0.05)', display: 'block' }}
          allowFullScreen
          loading="lazy"
        />
      </section>
    </>
  )
}
