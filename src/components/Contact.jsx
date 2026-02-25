export default function Contact({ onBookNow }) {
  return (
    <section id="contact-band">
      <div className="container">
        <div className="contact-grid">
          <div className="reveal-l">
            <span className="section-label">Get In Touch</span>
            <h2 className="contact-title">
              Ready to Make Your<br />
              <em style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                background: 'var(--grad-accent)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Event Unforgettable?
              </em>
            </h2>
            <p className="contact-desc">
              Planning a wedding, corporate event, birthday, or any special occasion? Let Padma
              Catering turn your celebration into an experience your guests will remember forever.
              Contact us today for a custom quote.
            </p>
            <button className="btn btn-primary" onClick={onBookNow}>
              Get a Free Quote <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className="reveal d1">
            <span className="section-label" style={{ marginBottom: 22 }}>Contact Info</span>
            <div className="c-info">
              <div className="ico"><i className="fa-solid fa-location-dot" /></div>
              <div>
                <div className="c-info-lbl">Address</div>
                <div className="c-info-val">
                  Amrutham, TTD Kalyana Mandapam to Ushodaya Road,<br />
                  Opp Vinayaka Temple, MVP Sector 8, Vizag-17
                </div>
              </div>
            </div>
            <div className="c-info">
              <div className="ico"><i className="fa-solid fa-phone" /></div>
              <div>
                <div className="c-info-lbl">Reservations</div>
                <div className="c-info-val">+91 86 86 622 722</div>
                <div className="c-info-val">+91 98 49 915 468</div>
              </div>
            </div>
            <div className="c-info">
              <div className="ico"><i className="fa-solid fa-envelope" /></div>
              <div>
                <div className="c-info-lbl">Email</div>
                <div className="c-info-val">amruthamfoodsvizag@gmail.com</div>
              </div>
            </div>
          </div>

          <div className="reveal d2">
            <span className="section-label" style={{ marginBottom: 22 }}>Working Hours</span>
            <div className="hours-row">
              <span className="day">Monday &ndash; Friday</span>
              <span className="time">08:00 AM &ndash; 10:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day">Saturday &ndash; Sunday</span>
              <span className="time">10:00 AM &ndash; 11:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
