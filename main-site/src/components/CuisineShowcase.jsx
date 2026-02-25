import { useState } from 'react'
import FullMenuModal from './FullMenuModal'

const cuisines = [
  {
    name: 'South Indian',
    img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80',
    desc: 'Idly, Dosa, Vada, Sambar & more',
    subs: [
      { label: 'Idly & Vada', items: ['Idly','Carrot Idly','Mix Veg Idly','Ragi Idly','Rava Idly','Thatte Idly','Vada','Cocktail Vada','Dahi Vada','Sabudana Vada','Punugulu','Gunta Pongadallu'] },
      { label: 'Dosas', items: ['Plain Dosa','Onion Dosa','Masala Dosa','Karam Dosa','Paneer Dosa','Mushroom Dosa','Pesaratu','Utappam','Ragi Dosa','Beetroot Dosa','Set Dosa','Rava Dosa','Millet Dosa','Spl Cheese Dosa'] },
      { label: 'Other', items: ['Hot Pongal','Poha','Vegetable Upma','Semiya Upma','Tomato Bath','Bisibela Bath','Kara Bath','Dhokla','Coconut Chutney','Peanut Chutney','Allam Chutney','Sambar','Rasam'] },
    ],
  },
  {
    name: 'North Indian',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&q=80',
    desc: 'Paneer, Dal Makhani, Naan & more',
    subs: [
      { label: 'Paneer Specials', items: ['Paneer Kadai','Paneer Mutter','Shahi Paneer','Kaju Paneer','Paneer Butter Masala','Malai Methi Paneer','Paneer Tikka Masala','Palak Paneer','Paneer Koftha','Paneer Burji'] },
      { label: 'Other Curries', items: ['Mushroom Masala','Navaratan Kurma','Aloo Capsicum','Aloo Mutter','Dhum Aloo','Chole Masala','Rajma Curry','Dal Makhani','Dal Fry','Mirchi Ka Salan','Bagara Baigan'] },
      { label: 'Breads', items: ['Butter Naan','Garlic Butter Naan','Dry Fruit Butter Naan','Kulcha','Paneer Kulcha','Parantha','Paneer Parantha','Bhatura','Rumali Roti','Malabar Parotha'] },
    ],
  },
  {
    name: 'Biryani & Rice',
    img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80',
    desc: 'Dum Biryani, Pulao, Pulihora & more',
    subs: [
      { label: 'Biryanis', items: ['Veg Biryani','Veg Dum Biryani','Sweet Corn Biryani','Baby Corn Biryani','Soya Biryani','Tiranga Biryani','Panasakay Biryani (Jackfruit)','Mushroom Biryani','Avakay Biryani','Vulavacharu Biryani'] },
      { label: 'Pulaos & Rice', items: ['Kaju Peas Pulao','Peas Pulao','Paneer Pulao','Kashmiri Pulav','Mutter Methi Pulao','Bagara Rice','Jeera Rice','Pulihora','Lemon Rice','Coconut Rice','Pudina Rice','Tomato Rice','Saffron Rice','Curd Rice'] },
    ],
  },
  {
    name: 'Sweets & Desserts',
    img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&q=80',
    desc: 'Gulab Jamun, Halwa, Kheer & more',
    subs: [
      { label: 'Traditional Sweets', items: ['Gulab Jamun','Chum Chum','Kala Jamun','Rasgulla','Boorellu','Bobbatllu','Kakinada Kaja','Kaju Katli','Putharekkulu','Jilebi','Jangeri','Mysore Pak','Motichoor Ladoo','Arisellu','Paramanam','Chekkara Pongali'] },
      { label: 'Premium Sweets', items: ['Rasmalai','Gajjar Ka Halwa','Double Ka Meetha','Malai Poori','Malai Roll','Basundi','Semiya Payasam','Rabidi','Dry Fruit Sandwich','Badam Roll','Kaju Roll','Coconut Burfi','Apricot Pudding','Sunnundalu'] },
    ],
  },
  {
    name: 'Starters & Snacks',
    img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80',
    desc: 'Kebabs, Pakoras, Chaat & more',
    subs: [
      { label: 'Paneer & Veg Starters', items: ['Paneer Tikka','Paneer Hariyali Tikka','Chilly Paneer','Paneer 65','Gobi 65','Aloo 65','Chilli Baby Corn','Hara Bara Tikka','Veg Wontons','Paneer Wontons','Corn Samosa','Cheese Samosa'] },
      { label: 'Veg Kebabs', items: ['Malai Paneer Kabab','Gobi Kabab','Soya Kabab','Corn Kabab','Tandoori Aloo','Mushroom Kabab','Veg Seekh Kabab','Malai Brocolli','Malai Chaap Kebab','Pineapple Tikka'] },
      { label: 'Rolls & Bytes', items: ['Veg Kathi Roll','Paneer Kathi Roll','Mushroom Kathi Roll','Paneer Sticks','Crispy Baby Corn Stick','Onion Rings','Banana Bytes','Potato Wedges','French Fries','Veg Cutlet','Aloo Tikki'] },
    ],
  },
  {
    name: 'Beverages',
    img: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&q=80',
    desc: 'Fresh Juices, Lassi, Mocktails & more',
    subs: [
      { label: 'Fresh Juices', items: ['Pine Apple Juice','Grape Juice','Water Melon Juice','Mango Juice','Orange Juice','Banana Juice','Sapota Juice','Sugar Cane Juice'] },
      { label: 'Milk Shakes', items: ['Mango Milk Shake','Strawberry Milk Shake','Chocolate Milk Shake','Vanilla Milk Shake','Butter Scotch Milk Shake','Oreo Milk Shake','Kesar Badam Milk Shake','Fruit Punch Milk Shake'] },
      { label: 'Mocktails & Traditional', items: ['Blue Sea','Virgin Mojito','Raspberry Mojito','Passion Punch','Strawberry Surprise','Lassi','Dry Fruit Lassi','Rose Milk','Badam Milk','Nimbu Pani','Aam Panna','Jaljeera','Coconut Water','Butter Milk'] },
    ],
  },
  {
    name: 'Live Counters',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&q=80',
    desc: 'Dosa, Chaat, BBQ & Pani Poori bars',
    subs: [
      { label: 'Chaats & Pani Poori', items: ['Aloo Tikki Chaat','Samosa Chaat','Papidi Chaat','Vada Pav Chaat','Dahi Wada','Delhi Dahi Gujiya Chaat','Pani Poori (Imli / Tomato / Garlic / Chocolate)','Bombay Moong Dal Pani Puri','Kolkata Pani Puri'] },
      { label: 'Pav Bhaji & BBQ', items: ['Butter Pav Bhaji','Cheese Pav Bhaji','Italian Pav Bhaji','Mexican Pav Bhaji','Paneer BBQ','Malai Paneer BBQ','Vegetable BBQ','Soya Chaap BBQ','Assorted BBQ'] },
      { label: 'Bhels & Tikkis', items: ['Normal Bhel','Papdi Bhel','Chinese Bhel','Mexican Bhel','Aloo Tikki','Beetroot Tikki','Dryfruit Tikki','Ragda Tikki','Veg Cutlet','Banana Cutlet'] },
    ],
  },
  {
    name: 'Chinese & Indo-Chinese',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&q=80',
    desc: 'Manchurian, Fried Rice, Noodles & more',
    subs: [
      { label: 'Manchurias', items: ['Veg Manchuria','Schezwan Manchuria','Paneer Manchuria','Baby Corn Manchuria','Gobi Manchuria','Mushroom Manchuria','Potato Manchuria','Paneer Lemon Zest Manchuria'] },
      { label: 'Rice & Noodles', items: ['Chinese Fried Rice','Schezwan Fried Rice','English Vegetable Fried Rice','Gobi Rice','Mexican Rice','Veg Noodle Soup','Hot & Sour Soup','Manchow Soup'] },
    ],
  },
  {
    name: 'Breakfast Specials',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&q=80',
    desc: 'Upma, Poha, Puri, Tea & Coffee',
    subs: [
      { label: 'Breakfast Staples', items: ['Vegetable Upma','Poha','Kichidi','Sabudana Kichidi','Dhokla','Besan Chilla','Waffles','Pancakes','Oat Meal','Corn Flakes'] },
      { label: 'Millets', items: ['Multi Millet Idly','Millet Dosa','Korrala Kichidi','Jowar Upma','Korra Pongal','Korra Payasam','Ragi Roti','Millet Pancakes','Millet Lemon Rice'] },
      { label: 'Beverages', items: ['Tea','Coffee','Black Coffee','Green Tea','Lemon Tea','Badam Milk','Badam Tea','Boost / Horlicks','Lemon Water','Butter Milk'] },
    ],
  },
]

export default function CuisineShowcase() {
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
              onClick={() => setSelected(c)}
              title={`View ${c.name} menu items`}
            >
              <div className="cuisine-img-wrap">
                <img src={c.img} alt={c.name} loading="lazy" />
                <div className="cuisine-overlay" />
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(212,175,55,0.2)', border: '1px solid var(--gold-line)', borderRadius: 20, padding: '3px 10px', fontSize: '0.6rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                  View Items
                </div>
              </div>
              <div className="cuisine-info">
                <h3 className="cuisine-name">{c.name}</h3>
                <p className="cuisine-desc">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="centered" style={{ marginTop: 44 }}>
          <button className="btn btn-outline reveal" onClick={() => setMenuOpen(true)}>
            <i className="fa-solid fa-book-open" /> View Full Menu
          </button>
        </div>
      </div>

      {/* Cuisine item modal */}
      {selected && (
        <div className="cuisine-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cuisine-modal" onClick={e => e.stopPropagation()}>
            <div className="cuisine-modal-header">
              <h3>{selected.name}</h3>
              <button className="cuisine-modal-close" onClick={() => setSelected(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="cuisine-modal-body">
              {selected.subs.map(sub => (
                <div className="cuisine-modal-sub" key={sub.label}>
                  <p className="cuisine-modal-sub-title">{sub.label}</p>
                  <div className="cuisine-modal-items">
                    {sub.items.map(item => <span key={item}>{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full menu modal */}
      {menuOpen && <FullMenuModal onClose={() => setMenuOpen(false)} />}
    </section>
  )
}
