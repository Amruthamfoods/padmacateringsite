export default function Hero({ onBookNow }) {
  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      {/* Orbs hidden in refined mode via CSS */}

      <div className="hero-content">
        <p className="hero-tag">Visakhapatnam&apos;s Premier Catering Since 1993</p>
        <h1 className="hero-title">
          Discover
          <em>True Indian Flavours</em>
        </h1>
        <p className="hero-sub">&ldquo;There is no sincerer love than the love of food&rdquo;</p>

        <div className="hero-rule">
          <span className="ln" />
          <span className="star"><i className="fa-solid fa-star" /></span>
          <span className="ln r" />
        </div>

        <div className="hero-btns">
          <button className="btn btn-primary" onClick={onBookNow}>
            <i className="fa-solid fa-calendar-check" /> Book Your Event
          </button>
          <a href="/menu.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <i className="fa-solid fa-utensils" /> View Full Menu
          </a>
        </div>
      </div>

      <div className="hero-info-bar">
        <div className="hero-info-bar-inner">
          <div className="hero-info-item">
            <div className="ico"><i className="fa-regular fa-clock" /></div>
            <div>
              <span className="hil">Mon &ndash; Fri</span>
              <span className="hiv">08:00 AM &ndash; 10:00 PM</span>
            </div>
          </div>
          <div className="hero-info-item">
            <div className="ico"><i className="fa-regular fa-clock" /></div>
            <div>
              <span className="hil">Sat &ndash; Sun</span>
              <span className="hiv">10:00 AM &ndash; 11:00 PM</span>
            </div>
          </div>
          <div className="hero-info-item">
            <div className="ico"><i className="fa-solid fa-phone" /></div>
            <div>
              <span className="hil">Reservations</span>
              <span className="hiv">+91 86 86 622 722</span>
            </div>
          </div>
          <div className="hero-info-item">
            <div className="ico"><i className="fa-solid fa-location-dot" /></div>
            <div>
              <span className="hil">Location</span>
              <span className="hiv">MVP Sector 8, Vizag</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
