import { Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success('Message sent successfully! Our team will contact you soon.')
            setFormData({ name: '', email: '', phone: '', message: '' })
        }, 1000)
    }

    return (
        <div className="booking-page-wrap" style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: 80 }}>
            <div className="booking-center" style={{ maxWidth: 900, padding: '40px 24px' }}>
                <h1 className="booking-page-title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 16 }}>
                    Contact <span style={{ color: 'var(--red)' }}>PadmaCatering</span>
                </h1>
                <p className="booking-page-sub" style={{ textAlign: 'center', marginBottom: 48, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 48px auto' }}>
                    Have a question or need a custom quote? We're here to help make your event unforgettable.
                </p>

                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {/* Contact Details */}
                    <div style={{ flex: '1 1 300px' }}>
                        <div className="summary-card" style={{ height: '100%' }}>
                            <div className="summary-card-header" style={{ fontSize: '1.2rem' }}>
                                <i className="fa-solid fa-address-card" style={{ color: 'var(--red)' }} /> Get In Touch
                            </div>
                            <div className="summary-card-body" style={{ padding: '24px 32px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                                    <i className="fa-solid fa-phone" style={{ color: 'var(--red)', fontSize: '1.2rem', marginTop: 4 }} />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)' }}>Phone</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}><a href="tel:+918686622722" style={{ color: 'inherit', textDecoration: 'none' }}>+91 86866 22722</a></p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                                    <i className="fa-solid fa-envelope" style={{ color: 'var(--red)', fontSize: '1.2rem', marginTop: 4 }} />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)' }}>Email</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)' }}><a href="mailto:info@padmacatering.com" style={{ color: 'inherit', textDecoration: 'none' }}>info@padmacatering.com</a></p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--red)', fontSize: '1.2rem', marginTop: 4 }} />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-dark)' }}>Address</h4>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                            Padma Catering Services,<br />
                                            Visakhapatnam, Andhra Pradesh
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ flex: '2 1 400px' }}>
                        <div className="summary-card">
                            <div className="summary-card-header" style={{ fontSize: '1.2rem' }}>
                                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--red)' }} /> Send Us a Message
                            </div>
                            <div className="summary-card-body" style={{ padding: '24px 32px' }}>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <input type="text" className="form-input" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        <input type="tel" className="form-input" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <input type="email" className="form-input" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    <textarea className="form-input" placeholder="Tell us about your event..." rows={4} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ resize: 'vertical' }} />
                                    <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '12px 32px', minWidth: 150 }}>
                                        {loading ? <i className="fa-solid fa-circle-notch spin" /> : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
