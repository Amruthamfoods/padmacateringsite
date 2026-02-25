const cuisines = [
  {
    name: 'South Indian',
    img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80',
    desc: 'Idly, Dosa, Vada, Sambar & more',
  },
  {
    name: 'North Indian',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&q=80',
    desc: 'Paneer, Dal Makhani, Naan & more',
  },
  {
    name: 'Biryani & Rice',
    img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80',
    desc: 'Hyderabadi, Dum, Veg & Non-Veg',
  },
  {
    name: 'Sweets & Desserts',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&q=80',
    desc: 'Gulab Jamun, Halwa, Kheer & more',
  },
  {
    name: 'Starters & Snacks',
    img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80',
    desc: 'Kebabs, Pakoras, Chaat & more',
  },
  {
    name: 'Beverages',
    img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&q=80',
    desc: 'Fresh Juices, Lassi, Thandai & more',
  },
  {
    name: 'Live Counters',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&q=80',
    desc: 'Dosa, Chaat, Ice Cream & Juice bars',
  },
  {
    name: 'Chinese & Indo-Chinese',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&q=80',
    desc: 'Noodles, Manchurian, Fried Rice',
  },
  {
    name: 'Breakfast Specials',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&q=80',
    desc: 'Upma, Poha, Puri, Tea & Coffee',
  },
]

export default function CuisineShowcase() {
  return (
    <section id="cuisine" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">From the Kitchen</span>
          <h2 className="section-title">A World of <em>Flavours</em></h2>
          <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 48px' }}>
            <div className="dot" />
          </div>
        </div>

        <div className="cuisine-grid">
          {cuisines.map((c, i) => (
            <div className={`cuisine-card reveal d${Math.min(i % 4 + 1, 4)}`} key={c.name}>
              <div className="cuisine-img-wrap">
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="cuisine-overlay" />
              </div>
              <div className="cuisine-info">
                <h3 className="cuisine-name">{c.name}</h3>
                <p className="cuisine-desc">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="centered" style={{ marginTop: 44 }}>
          <a href="/menu.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-outline reveal">
            <i className="fa-solid fa-file-pdf" /> Download Full Menu PDF
          </a>
        </div>
      </div>
    </section>
  )
}
