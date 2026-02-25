const BASE = import.meta.env.BASE_URL

const offers = [
  {
    img: `${BASE}img/pics/menu-item-08.png`,
    price: '₹149',
    name: 'Corporate Basic Lunch',
    desc: 'Gulab Jamun, Veg Pulao, Raitha, Paneer Kadai, Veg Curry, Veg Fry, White Rice, Sambar, Rasam, Curd, Pickles, Frymus',
    badge: 'veg',
    badgeLabel: '🟢 Vegetarian',
  },
  {
    img: `${BASE}img/pics/menu-item-02.png`,
    price: '₹199',
    name: 'Budget Hangout (Non-Veg)',
    desc: 'Chum Chum, Bagara Rice, Raitha, Chicken Curry, Paneer Curry, Veg Fry, White Rice, Sambar, Rasam, Curd, Pickles, Frymus',
    badge: 'non-veg',
    badgeLabel: '🔴 Non-Vegetarian',
  },
  {
    img: `${BASE}img/pics/menu-item-03.png`,
    price: '₹99',
    name: 'Basic Breakfast',
    desc: 'Idly, Vada, Tomato Bath, Coconut Chutney, Allam Chutney, Tea / Coffee, Water Bottle',
    badge: 'veg',
    badgeLabel: '🟢 Vegetarian',
  },
]

export default function Offers() {
  return (
    <section id="offers" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">From the Kitchen</span>
          <h2 className="section-title">Special <em>Offers</em></h2>
          <div className="section-divider" style={{ maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="dot" />
          </div>
        </div>

        <div className="offers-grid">
          {offers.map((o, i) => (
            <div className={`offer-card reveal d${i + 1}`} key={o.name}>
              <img src={o.img} alt={o.name} className="offer-card-img" />
              <div className="offer-card-body">
                <div className="offer-price">{o.price}</div>
                <h3 className="offer-name">{o.name}</h3>
                <p className="offer-desc">{o.desc}</p>
                <span className={`offer-badge ${o.badge}`}>{o.badgeLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="offers-note reveal">
          <i className="fa-solid fa-circle-info" />
          Introductory prices valid for orders under 25 members (70 min for Breakfast).
          5% tax applicable. Delivery charges vary by area. Contact us for exclusive offers on larger orders.
        </p>

        <div className="centered" style={{ marginTop: 38 }}>
          <a href="/menu.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline reveal">
            <i className="fa-solid fa-file-pdf" /> Download Full Menu
          </a>
        </div>
      </div>
    </section>
  )
}
