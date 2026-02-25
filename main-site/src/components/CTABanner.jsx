export default function CTABanner({ onBookNow }) {
  return (
    <section id="cta-banner">
      <div className="cta-bg" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1488992783499-418eb1f62d08?w=1920&auto=format&q=80)'
      }} />
      <div className="cta-overlay" />
      <div className="cta-content container reveal">
        <span className="section-label" style={{ textAlign: 'center', display: 'block' }}>
          Let's Create Something Special
        </span>
        <h2 className="cta-title">What Are You<br /><em>Waiting For?</em></h2>
        <div className="cta-ornament">
          <span className="hs-line" />
          <span className="hs-gem">✦</span>
          <span className="hs-line" />
        </div>
        <p className="cta-sub">
          Get in touch today and let us plan a menu that makes your event extraordinary.
          <br />Your celebration deserves nothing but the finest.
        </p>
        <div className="cta-btns">
          <button className="btn btn-primary" onClick={onBookNow}>
            <i className="fa-solid fa-calendar-check" /> Book a Free Consultation
          </button>
          <a href="tel:+918686622722" className="btn btn-outline">
            <i className="fa-solid fa-phone" /> +91 86 86 622 722
          </a>
        </div>
      </div>
    </section>
  )
}
