import { useState, useEffect, useCallback } from 'react'

const slides = [
  {
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&auto=format&q=80',
    tag: "Visakhapatnam's Premier Catering Since 1993",
    title: 'Occasion for Today',
    em: 'Memories for Lifetime',
    sub: 'Bringing the finest flavours to your most cherished moments',
  },
  {
    img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1920&auto=format&q=80',
    tag: '1 Crore+ Plates Served · 3800+ Events',
    title: 'True Indian Flavours',
    em: 'Crafted with Love',
    sub: 'From intimate gatherings to grand weddings — we make every plate count',
  },
  {
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&auto=format&q=80',
    tag: 'Wedding · Corporate · Social Events',
    title: 'Excellence in',
    em: 'Every Single Plate',
    sub: 'Three decades of culinary mastery, served with passion and pride',
  },
  {
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&auto=format&q=80',
    tag: 'MVP Sector 8, Visakhapatnam',
    title: 'Your Dream Event',
    em: 'Perfectly Catered',
    sub: 'Let us transform your celebration into an unforgettable experience',
  },
]

export default function HeroSlider({ onBookNow }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [next])

  return (
    <section id="hero-slider">
      {slides.map((s, i) => (
        <div key={i} className={`hs-slide${i === current ? ' active' : ''}`}>
          <div className="hs-bg" style={{ backgroundImage: `url(${s.img})` }} />
          <div className="hs-overlay" />
          <div className="hs-content">
            <p className="hs-tag">{s.tag}</p>
            <h1 className="hs-title">
              {s.title}<br /><em>{s.em}</em>
            </h1>
            <div className="hs-ornament">
              <span className="hs-line" />
              <span className="hs-gem">✦</span>
              <span className="hs-line" />
            </div>
            <p className="hs-sub">{s.sub}</p>
            <div className="hs-btns">
              <button className="btn btn-primary" onClick={onBookNow}>
                <i className="fa-solid fa-calendar-check" /> Book Your Event
              </button>
              <a href="#cuisine" className="btn btn-outline">
                <i className="fa-solid fa-utensils" /> Explore Menu
              </a>
            </div>
          </div>
        </div>
      ))}

      <button className="hs-arrow hs-prev" onClick={prev} aria-label="Previous">
        <i className="fa-solid fa-chevron-left" />
      </button>
      <button className="hs-arrow hs-next" onClick={next} aria-label="Next">
        <i className="fa-solid fa-chevron-right" />
      </button>

      <div className="hs-dots">
        {slides.map((_, i) => (
          <button key={i} className={`hs-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>

      <div className="hs-info-bar">
        <div className="hs-info-inner">
          {[
            { icon: 'fa-regular fa-clock', lbl: 'Mon – Fri', val: '08:00 AM – 10:00 PM' },
            { icon: 'fa-regular fa-clock', lbl: 'Sat – Sun', val: '10:00 AM – 11:00 PM' },
            { icon: 'fa-solid fa-phone', lbl: 'Reservations', val: '+91 86 86 622 722' },
            { icon: 'fa-solid fa-location-dot', lbl: 'Location', val: 'MVP Sector 8, Vizag' },
          ].map(item => (
            <div className="hs-info-item" key={item.lbl}>
              <i className={item.icon} />
              <div>
                <span className="hil">{item.lbl}</span>
                <span className="hiv">{item.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
