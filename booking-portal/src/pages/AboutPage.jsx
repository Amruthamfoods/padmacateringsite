import { Link } from 'react-router-dom'

export default function AboutPage() {
    return (
        <div className="booking-page-wrap" style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: 80 }}>
            <div className="booking-center" style={{ maxWidth: 900, padding: '40px 24px' }}>
                <h1 className="booking-page-title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: 16 }}>
                    About <span style={{ color: 'var(--red)' }}>PadmaCatering</span>
                </h1>
                <p className="booking-page-sub" style={{ textAlign: 'center', marginBottom: 48, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 48px auto' }}>
                    Delivering premium culinary experiences since 1993. We bring authentic flavors, exceptional service, and a memorable dining experience right to your doorstep.
                </p>

                <div className="summary-card" style={{ marginBottom: 32 }}>
                    <div className="summary-card-header" style={{ fontSize: '1.2rem' }}>
                        <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--red)' }} /> Our Legacy
                    </div>
                    <div className="summary-card-body" style={{ padding: '24px 32px' }}>
                        <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: 16 }}>
                            Founded in Vizag, Padma Catering has grown from a humble family kitchen into one of the region's most trusted premium catering services. Over the past three decades, we have catered to thousands of weddings, corporate events, and intimate family gatherings.
                        </p>
                        <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                            Our secret isn't just in the recipes passed down through generations—it's in our uncompromising commitment to sourcing the freshest local ingredients and our dedication to impeccable hygiene and presentation.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
                    <div className="summary-card" style={{ height: '100%' }}>
                        <div className="summary-card-body" style={{ padding: 32, textAlign: 'center' }}>
                            <i className="fa-solid fa-medal" style={{ fontSize: '2.5rem', color: 'var(--red)', marginBottom: 16 }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>Premium Quality</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>We never compromise on ingredients. From farm-fresh produce to premium spices, quality is our foundation.</p>
                        </div>
                    </div>
                    <div className="summary-card" style={{ height: '100%' }}>
                        <div className="summary-card-body" style={{ padding: 32, textAlign: 'center' }}>
                            <i className="fa-solid fa-users" style={{ fontSize: '2.5rem', color: 'var(--red)', marginBottom: 16 }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>Expert Team</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Our chefs and service staff are highly trained professionals who treat every event with utmost care and respect.</p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link to="/setup" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                        Explore Our Packages <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.9rem' }} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
