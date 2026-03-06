import { useState } from 'react'

const cuisines = [
  {
    name: 'South Indian',
    img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80',
    desc: 'Idly, Dosa, Vada, Sambar & more',
    items: ['Idly', 'Medu Vada', 'Plain Dosa', 'Masala Dosa', 'Rava Dosa', 'Pesarattu', 'Upma', 'Pongal', 'Sambar', 'Coconut Chutney', 'Tomato Chutney', 'Rasam', 'Curd Rice', 'Lemon Rice', 'Pulihora', 'Bisi Bele Bath', 'Avakaya', 'Gongura Pachadi'],
  },
  {
    name: 'North Indian',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&q=80',
    desc: 'Paneer, Dal Makhani, Naan & more',
    items: ['Butter Naan', 'Tandoori Roti', 'Dal Makhani', 'Paneer Butter Masala', 'Shahi Paneer', 'Palak Paneer', 'Matar Paneer', 'Chole Bhature', 'Rajma', 'Jeera Rice', 'Pulao', 'Raita', 'Papad', 'Pickle', 'Mixed Veg Curry', 'Aloo Matar', 'Kadai Paneer'],
  },
  {
    name: 'Biryani & Rice',
    img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80',
    desc: 'Hyderabadi, Dum, Veg & Non-Veg',
    items: ['Chicken Dum Biryani', 'Mutton Biryani', 'Veg Biryani', 'Egg Biryani', 'Hyderabadi Biryani', 'Fried Rice', 'Coconut Rice', 'Tomato Rice', 'Vangi Bath', 'Jeera Rice', 'Ghee Rice'],
  },
  {
    name: 'Sweets & Desserts',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&q=80',
    desc: 'Gulab Jamun, Halwa, Kheer & more',
    items: ['Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Kheer', 'Sooji Halwa', 'Carrot Halwa', 'Moong Dal Halwa', 'Ladoo', 'Jalebi', 'Mysore Pak', 'Payasam', 'Semiya Payasam', 'Pala Munjalu', 'Ariselu', 'Bobbatlu'],
  },
  {
    name: 'Starters & Snacks',
    img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80',
    desc: 'Kebabs, Pakoras, Chaat & more',
    items: ['Veg Seekh Kebab', 'Paneer Tikka', 'Aloo Tikki', 'Samosa', 'Onion Pakora', 'Mirchi Bajji', 'Bread Pakora', 'Pani Puri', 'Bhel Puri', 'Sev Puri', 'Dahi Puri', 'Spring Roll', 'Hara Bhara Kebab'],
  },
  {
    name: 'Beverages',
    img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&q=80',
    desc: 'Fresh Juices, Lassi, Thandai & more',
    items: ['Sweet Lassi', 'Mango Lassi', 'Buttermilk', 'Fresh Lime Soda', 'Mango Juice', 'Orange Juice', 'Watermelon Juice', 'Thandai', 'Rose Milk', 'Badam Milk', 'Filter Coffee', 'Masala Chai'],
  },
  {
    name: 'Live Counters',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&q=80',
    desc: 'Dosa, Chaat, Ice Cream & Juice bars',
    items: ['Live Dosa Counter', 'Live Chaat Counter', 'Ice Cream Counter', 'Fresh Juice Counter', 'Pani Puri Counter', 'Omelette Counter', 'Noodles Counter', 'Live Halwa Counter'],
  },
  {
    name: 'Chinese & Indo-Chinese',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&q=80',
    desc: 'Noodles, Manchurian, Fried Rice',
    items: ['Veg Hakka Noodles', 'Veg Fried Rice', 'Gobi Manchurian', 'Veg Manchurian', 'Paneer Chilli', 'Mushroom Chilli', 'Spring Rolls', 'Corn Soup', 'Hot & Sour Soup', 'Veg Momos'],
  },
  {
    name: 'Breakfast Specials',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&q=80',
    desc: 'Upma, Poha, Puri, Tea & Coffee',
    items: ['Upma', 'Poha', 'Puri Bhaji', 'Paratha', 'Aloo Paratha', 'Poori Kurma', 'Sheera', 'Sabudana Khichdi', 'Oats Porridge', 'Cornflakes', 'Filter Coffee', 'Masala Chai'],
  },
]

export default function CuisineShowcase() {
  const [popup, setPopup] = useState(null)

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
            <div
              className={`cuisine-card reveal d${Math.min(i % 4 + 1, 4)}`}
              key={c.name}
              onClick={() => setPopup(c)}
              style={{ cursor: 'pointer' }}
            >
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
          <a href="https://heyzine.com/flip-book/2ac739c577.html#page/1" target="_blank" rel="noopener noreferrer" className="btn btn-outline reveal">
            <i className="fa-solid fa-file-pdf" /> Download Full Menu PDF
          </a>
        </div>
      </div>

      {popup && (
        <div
          className="modal-overlay"
          onClick={() => setPopup(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
        >
          <div
            className="cuisine-popup"
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--dark-1, #1a1a1a)' }}>{popup.name}</h3>
              <button
                onClick={() => setPopup(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: '#888', lineHeight: 1 }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 20 }}>{popup.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {popup.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.92rem', color: '#333' }}>
                  <i className="fa-solid fa-circle-dot" style={{ color: 'var(--gold, #c9a84c)', fontSize: '0.55rem' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
