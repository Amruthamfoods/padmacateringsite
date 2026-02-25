import PageHero  from '../components/PageHero'
import CTABanner from '../components/CTABanner'
import useScrollReveal from '../hooks/useScrollReveal'

const services = [
  {
    img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&q=80',
    icon: 'fa-solid fa-heart',
    title: 'Weddings & Celebrations',
    desc: 'Your wedding day deserves culinary perfection. We craft bespoke menus — from the mehendi brunch to the grand wedding feast — tailored to your traditions, preferences, and guest list.',
    includes: ['Multi-cuisine buffet setups', 'Live dosa & chaat counters', 'Dessert and sweet stations', 'Customised welcome drinks', 'Traditional thaali service', 'Cocktail-style starters round'],
    occasions: ['Weddings', 'Engagements', 'Anniversaries', 'Baby Showers', 'Naming Ceremonies', 'Thread Ceremonies'],
  },
  {
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&q=80',
    icon: 'fa-solid fa-briefcase',
    title: 'Corporate Events',
    desc: 'Professional catering that makes an impression. Whether it is a quick team lunch or a 500-seat annual day, we deliver on time, every time, with presentation that matches your brand standards.',
    includes: ['Box meals and working lunches', 'Conference tea & coffee service', 'Product launch dinner setups', 'Buffet-style team lunches', 'Multi-course executive dinners', 'Branded serving setups'],
    occasions: ['Annual Days', 'Team Meetings', 'Product Launches', 'Conferences', 'Office Parties', 'Training Sessions'],
  },
  {
    img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&q=80',
    icon: 'fa-solid fa-users',
    title: 'Social & Family Events',
    desc: 'From intimate family gatherings to large festive celebrations, we bring warmth, colour and incredible food to every occasion. Let us handle the food while you enjoy the moment.',
    includes: ['Home-style comfort food menus', 'Puja prasadam preparations', 'Birthday cake cutting ceremony', 'Evening snacks & high tea', 'Full dinner buffets', 'Themed food stations'],
    occasions: ['Birthdays', 'Pujas & Havans', 'Family Reunions', 'Kitty Parties', 'Grihapravesh', 'Retirement Parties'],
  },
  {
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&q=80',
    icon: 'fa-solid fa-fire-burner',
    title: 'Live Counters & Stations',
    desc: 'An experience, not just a meal. Our live counters are crowd favourites — freshly prepared, visually engaging, and absolutely delicious. Add one (or many!) to any event package.',
    includes: ['Live dosa & uttapam counter', 'Pani puri & chaat station', 'Pasta & noodles live station', 'Fresh juice & mocktail bar', 'Ice cream & kulfi station', 'Pav bhaji live counter'],
    occasions: ['All Event Types', 'Weddings', 'Corporate Fairs', 'School Events', 'Birthday Parties', 'Festivals'],
  },
  {
    img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&auto=format&q=80',
    icon: 'fa-solid fa-church',
    title: 'Religious & Cultural Events',
    desc: 'Pure vegetarian, sattvic, and traditional preparations crafted with devotion. We understand the sanctity of religious events and provide Jain-friendly, prasadam-grade food with complete purity.',
    includes: ['Sattvic Jain-friendly menus', 'No onion / no garlic options', 'Full prasadam preparations', 'Annadanam (mass feeding) setups', 'Traditional leaf-plate service', 'Panakam, payasam & sweets'],
    occasions: ['Temple Events', 'Annadanam', 'Sathsang', 'Havan & Yagna', 'Festival Celebrations', 'Community Pujas'],
  },
  {
    img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&auto=format&q=80',
    icon: 'fa-solid fa-graduation-cap',
    title: 'College & Institutional Events',
    desc: 'Budget-friendly, high-volume catering without compromising on taste or hygiene. Trusted by schools, colleges, and institutions across Vizag for years.',
    includes: ['Bulk meal packages', 'Canteen-style service', 'Freshers & farewell dinners', 'Sports day refreshments', 'Snack boxes for events', 'Staff lunch programmes'],
    occasions: ['Freshers Day', 'Farewell Events', 'Sports Days', 'Cultural Fests', 'Staff Training', 'Alumni Meets'],
  },
]

const process = [
  { step: '01', icon: 'fa-solid fa-phone', title: 'Initial Consultation', text: 'Call or book online. We understand your event, guest count, preferences and budget.' },
  { step: '02', icon: 'fa-solid fa-utensils', title: 'Menu Planning', text: 'Our team curates a custom menu based on your requirements, occasion, and dietary preferences.' },
  { step: '03', icon: 'fa-solid fa-file-signature', title: 'Proposal & Booking', text: 'You receive a detailed proposal with menu, pricing, and all terms. Book with a simple advance.' },
  { step: '04', icon: 'fa-solid fa-truck', title: 'Setup & Service', text: 'We arrive early, set up completely, and serve your guests with impeccable hospitality.' },
  { step: '05', icon: 'fa-solid fa-star', title: 'Post-Event Cleanup', text: 'We handle all cleanup and removal after the event. You relax — we take care of everything.' },
]

export default function ServicesPage({ onBookNow }) {
  useScrollReveal()

  return (
    <>
      <PageHero
        label="What We Offer"
        title="Catering for Every"
        em="Occasion & Scale"
        bg="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&auto=format&q=80"
      />

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">Crafted for <em>Every Event</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
              <div className="dot" />
            </div>
          </div>

          <div className="svc-page-grid">
            {services.map((s, i) => (
              <div className={`svc-page-card reveal d${(i % 4) + 1}`} key={s.title}>
                <div className="svc-page-img">
                  <img src={s.img} alt={s.title} loading="lazy" />
                  <div className="svc-page-icon"><i className={s.icon} /></div>
                </div>
                <div className="svc-page-body">
                  <h3 className="svc-page-title">{s.title}</h3>
                  <p className="svc-page-desc">{s.desc}</p>
                  <div className="svc-page-two">
                    <div>
                      <p className="svc-col-label">Includes</p>
                      <ul className="svc-list">
                        {s.includes.map(item => <li key={item}><i className="fa-solid fa-check" />{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="svc-col-label">Occasions</p>
                      <div className="svc-tags">
                        {s.occasions.map(o => <span key={o}>{o}</span>)}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={onBookNow} style={{ marginTop: 20 }}>
                    <i className="fa-solid fa-calendar-check" /> Book This Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section" style={{ background: 'var(--dark-3)' }}>
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Our Simple <em>Process</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
              <div className="dot" />
            </div>
          </div>
          <div className="process-grid">
            {process.map((p, i) => (
              <div className={`process-step reveal d${i + 1}`} key={p.step}>
                <div className="process-num">{p.step}</div>
                <div className="process-icon"><i className={p.icon} /></div>
                <h3 className="process-title">{p.title}</h3>
                <p className="process-text">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
