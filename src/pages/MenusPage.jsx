import { useState } from 'react'
import PageHero  from '../components/PageHero'
import CTABanner from '../components/CTABanner'
import useScrollReveal from '../hooks/useScrollReveal'

const menus = [
  {
    id: 'standard',
    name: 'Standard Veg Menu',
    price: '₹200',
    unit: 'per person',
    badge: 'Veg',
    badgeColor: '#4caf50',
    note: '*Below 100 plates — serving & transportation extra. Below 50 plates — ₹30 extra.',
    img: `${import.meta.env.BASE_URL}img/menu-200.webp`,
    sections: [
      {
        title: 'Sweets', qty: '1 choice',
        items: ['Gulab Jamun', 'Bobattu', 'Boori', 'Chum Chum', 'Kaja', 'Rasgulla', 'Bread Halwa', 'Jangiri', 'Payasam', 'Kala Jamun', 'Rava Kesari', 'Jilebi'],
      },
      {
        title: 'Flavoured Rice', qty: '1 choice',
        items: ['Veg Biryani', 'Pudina Rice', 'Coconut Rice', 'Jeera Rice', 'Peas Pulao', 'Chinese Rice'],
      },
      {
        title: 'Special Veg Curry', qty: '1 choice',
        items: ['Paneer Mutter', 'Paneer Kadai', 'Mushroom Masala', 'Phool Makhana Curry', 'Cashew Drumstick', 'Baby Corn Masala'],
      },
      {
        title: 'Veg Curry / Fry', qty: '2 choices',
        items: ['Guti Vankay', 'Drumstick Tomato', 'Vankay Tomato Curry', 'Mix Veg Curry', 'Vadiyala Pulusu', 'Gobi Mutter', 'Chana Masala', 'Aloo 65', 'Bendi 65', 'Vankay Pakodi', 'Bendi Pakodi Nut', 'Dondakay Pakodi Nut', 'Carrot Beans Poriyal', 'Aloo Puttu'],
      },
      {
        title: 'Common Items', qty: 'Included',
        items: ['White Rice', 'Dal', 'Raitha', 'Sambar / Rasam', 'Curd', 'Roti Pachadi / Pickle', 'Papad', 'Mineral Water Bottle', 'Ice Cream (complimentary above 80 guests)'],
      },
    ],
  },
  {
    id: 'deluxe',
    name: 'Deluxe Veg Menu',
    price: '₹300',
    unit: 'per person',
    badge: 'Veg',
    badgeColor: '#4caf50',
    note: '*Below 100 plates — serving & transportation extra. Below 50 plates — ₹30 extra.',
    img: `${import.meta.env.BASE_URL}img/menu-300.webp`,
    sections: [
      {
        title: 'Sweets', qty: '2 choices',
        items: ['Gulab Jamun', 'Bobattu', 'Boori', 'Chum Chum', 'Spl Mothichoor Ladoo', 'Rasgulla', 'Malai Puri', 'Bread Halwa', 'Pala Thalikelu', 'Payasam', 'Chandra Kala', 'Kala Jamun', 'Malai Roll', 'Kaju Katli', 'Gajar Ka Halwa', 'Shahi Gajar Ka Kheer', 'Gummadikay Halwa', 'Rava Kesari', 'Jilebi'],
      },
      {
        title: 'Hots', qty: '1 choice',
        items: ['Mirchi Bajji', 'Banana Bajji', 'Aloo Bajji', 'Vada', 'Masala Vada', 'Cutlet', 'Spring Roll', 'Veg Bullet', 'Corn Samosa'],
      },
      {
        title: 'Flavoured Rice', qty: '2 choices',
        items: ['Pulihora', 'Veg Biryani', 'Panasakay Biryani', 'Sweet Corn Biryani', 'Pudina Rice', 'Coconut Rice', 'Tomato Rice', 'Jeera Rice', 'Peas Pulao', 'Veg Dum Biryani', 'Lemon Rice'],
      },
      {
        title: 'Special Veg Curry', qty: '1 choice',
        items: ['Paneer Mutter', 'Paneer Kadai', 'Cashew Paneer', 'Paneer Phool Makhana', 'Paneer Butter Masala', 'Phool Makhana Curry', 'Mushroom Masala', 'Babycorn Masala', 'Panasapottu', 'Methi Chaman'],
      },
      {
        title: 'Veg Curry', qty: '1 choice',
        items: ['Guti Vankay', 'Drumstick Tomato', 'Vankay Tomato Curry', 'Mix Veg Curry', 'Vadiyala Pulusu', 'Gobi Mutter', 'Chana Masala', 'Gongura Seanagapappu', 'Gongura Macroni', 'Gobi Mutter Curry', 'Chikudu Kay Tomato', 'Potlakay Perugu', 'Dosakay Tomato'],
      },
      {
        title: 'Veg Fry', qty: '2 choices',
        items: ['Aloo 65', 'Bendi 65', 'Gobi 65', 'Cabbage 65', 'Dondakay Pakodi Nut', 'Bendakay Pakodi Nut', 'Vankay Pakodi', 'Vankay Methi Karam', 'Kanda Pusa', 'Aloo Pusa', 'Carrot Beans Poriyal', 'Cabbage Senagapappu', 'Aloo Puttu', 'Carrot Vepudu'],
      },
      {
        title: 'Common Items', qty: 'Included',
        items: ['White Rice', 'Dal', 'Raitha', 'Sambar', 'Rasam', 'Curd', 'Roti Pachadi', 'Pickle', 'Papad', 'Ghee', 'Podi', 'Mineral Water Bottle', 'Premium Ice Cream (complimentary above 80 guests)'],
      },
    ],
  },
]

export default function MenusPage({ onBookNow }) {
  useScrollReveal()
  const [activeMenu, setActiveMenu] = useState('standard')
  const [lightbox, setLightbox] = useState(null)
  const menu = menus.find(m => m.id === activeMenu)

  return (
    <>
      <PageHero
        label="Our Menus"
        title="Crafted with"
        em="Love & Flavour"
        bg="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1920&auto=format&q=80"
      />

      <section className="section">
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">Menu Packages</span>
            <h2 className="section-title">Choose Your <em>Package</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 40px' }}>
              <div className="dot" />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="menu-tabs reveal">
            {menus.map(m => (
              <button
                key={m.id}
                className={`menu-tab-btn${activeMenu === m.id ? ' active' : ''}`}
                onClick={() => setActiveMenu(m.id)}
              >
                <span className="mtb-name">{m.name}</span>
                <span className="mtb-price">{m.price} / person</span>
              </button>
            ))}
            <button className="menu-tab-btn" onClick={onBookNow}>
              <span className="mtb-name">Custom / Amrutham</span>
              <span className="mtb-price">Quote on request</span>
            </button>
          </div>

          {/* Menu detail */}
          <div className="menu-detail-wrap">
            {/* Left — menu card image */}
            <div className="menu-img-col reveal-l">
              <div className="menu-img-card" onClick={() => setLightbox(menu.img)}>
                <img src={menu.img} alt={menu.name} />
                <div className="menu-img-overlay">
                  <i className="fa-solid fa-magnifying-glass-plus" />
                  <span>View Full Menu</span>
                </div>
              </div>
              <div className="menu-price-badge">
                <span className="mpb-price">{menu.price}</span>
                <span className="mpb-unit">{menu.unit}</span>
              </div>
              <p className="menu-note">{menu.note}</p>
              <button className="btn btn-primary" onClick={onBookNow} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                <i className="fa-solid fa-calendar-check" /> Book This Menu
              </button>
            </div>

            {/* Right — sections */}
            <div className="menu-sections-col reveal-r">
              <h3 className="menu-sections-title">{menu.name} — Full Details</h3>
              <div className="menu-sections-grid">
                {menu.sections.map(sec => (
                  <div className="menu-section-card" key={sec.title}>
                    <div className="msc-header">
                      <span className="msc-title">{sec.title}</span>
                      <span className="msc-qty">{sec.qty}</span>
                    </div>
                    <ul className="msc-items">
                      {sec.items.map(item => (
                        <li key={item}><i className="fa-solid fa-circle-dot" />{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <i className="fa-solid fa-xmark" />
          </button>
          <img src={lightbox} alt="Full menu" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
