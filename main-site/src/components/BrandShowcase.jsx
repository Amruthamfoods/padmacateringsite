export default function BrandShowcase({ onBookNow }) {
  return (
    <section id="brands" className="section brands-section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">Two Distinct Experiences</span>
          <h2 className="section-title">One Family, Two <em>Brands</em></h2>
          <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 56px' }}>
            <div className="dot" />
          </div>
        </div>

        <div className="brands-grid">

          {/* Padma Catering */}
          <div className="brand-card reveal-l">
            <div className="brand-card-img">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=900&auto=format&q=80"
                alt="Padma Catering"
              />
              <div className="brand-card-overlay" />
            </div>
            <div className="brand-card-body">
              <div className="brand-logo-wrap">
                <img src={`${import.meta.env.BASE_URL}img/logo-large.png`} alt="Padma Catering" className="brand-logo" />
              </div>
              <div className="brand-tag standard">Standard Service</div>
              <h3 className="brand-name">Padma Catering</h3>
              <p className="brand-since">Est. 1993</p>
              <p className="brand-desc">
                Our flagship catering service trusted by Visakhapatnam for over 30 years.
                From intimate family gatherings to large-scale weddings and corporate events,
                Padma Catering delivers authentic flavours, generous portions and dependable
                service — every single time.
              </p>
              <ul className="brand-features">
                <li><i className="fa-solid fa-check" />Multi-cuisine buffets & live counters</li>
                <li><i className="fa-solid fa-check" />Weddings, corporate & social events</li>
                <li><i className="fa-solid fa-check" />25 to 2500+ guests</li>
                <li><i className="fa-solid fa-check" />Full event turnkey service</li>
              </ul>
              <button className="btn btn-outline brand-btn" onClick={onBookNow}>
                <i className="fa-solid fa-calendar-check" /> Book Padma Catering
              </button>
            </div>
          </div>

          {/* Amrutham */}
          <div className="brand-card brand-card-premium reveal-r">
            <div className="brand-card-img">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&q=80"
                alt="Amrutham Premium Catering"
              />
              <div className="brand-card-overlay" />
            </div>
            <div className="brand-card-body">
              <div className="brand-logo-wrap">
                <img src={`${import.meta.env.BASE_URL}img/amrutham-logo.png`} alt="Amrutham" className="brand-logo" />
              </div>
              <div className="brand-tag premium">Premium Format</div>
              <h3 className="brand-name">Amrutham</h3>
              <p className="brand-since">Est. 2019</p>
              <p className="brand-desc">
                Amrutham — meaning <em>divine nectar</em> — is our elevated catering format
                for those who seek an extraordinary dining experience. Crafted for discerning
                hosts who want refined presentation, curated menus, and white-glove hospitality
                at their most special occasions.
              </p>
              <ul className="brand-features">
                <li><i className="fa-solid fa-check" />Curated bespoke menus</li>
                <li><i className="fa-solid fa-check" />Fine dining presentation & plating</li>
                <li><i className="fa-solid fa-check" />Luxury weddings & elite events</li>
                <li><i className="fa-solid fa-check" />Dedicated event concierge</li>
              </ul>
              <button className="btn btn-primary brand-btn" onClick={onBookNow}>
                <i className="fa-solid fa-star" /> Book Amrutham
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
