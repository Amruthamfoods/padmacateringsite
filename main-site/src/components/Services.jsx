const services = [
  {
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&q=80',
    lbl: 'Special Events',
    title: 'Weddings &\nCelebrations',
    tags: ['Weddings', 'Anniversaries', 'Baby Showers', 'Engagements'],
    text: 'Make your wedding day truly unforgettable with exquisite cuisine crafted for your special occasion. From intimate ceremonies to grand receptions — we deliver perfection on every plate.',
  },
  {
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&q=80',
    lbl: 'Corporate Catering',
    title: 'Corporate &\nBusiness Events',
    tags: ['Meetings', 'Team Lunches', 'Product Launches', 'Conferences'],
    text: 'Impress clients and motivate teams with professional catering tailored for corporate environments. Punctual delivery, impeccable presentation, and flavours that leave a lasting impression.',
  },
  {
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&q=80',
    lbl: 'Social Gatherings',
    title: 'Social &\nFamily Events',
    tags: ['Birthdays', 'Pujas', 'Family Reunions', 'Kitty Parties'],
    text: 'Whether it is a birthday bash or a family pooja, we bring warmth, flavour and festivity to every gathering. Let us handle the food while you create the memories.',
  },
]

export default function Services({ onBookNow }) {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">We Cater to <em>Every Occasion</em></h2>
          <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
            <div className="dot" />
          </div>
        </div>
      </div>

      <div className="services-grid">
        {services.map((s, i) => (
          <div className={`service-card reveal d${i + 1}`} key={s.title}>
            <img src={s.img} alt={s.title} loading="lazy" />
            <div className="service-overlay">
              <span className="service-lbl">{s.lbl}</span>
              <h3 className="service-title">{s.title}</h3>
              <div className="service-tags">
                {s.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <p className="service-text">{s.text}</p>
              <button className="service-btn" onClick={onBookNow}>
                Book Now <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
