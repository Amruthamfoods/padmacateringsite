import { useState } from 'react'

const FULL_MENU = [
  {
    name: 'Welcome Drinks',
    subs: [
      { label: 'Fresh Juices', items: ['Pine Apple Juice','Grape Juice','Water Melon Juice','Muskmelon Juice','Banana Juice','Papaya Juice','Sugar Cane Juice','Mango Juice','Sapota Juice','Seethaphal Juice','Orange Juice'] },
      { label: 'Milk Shakes', items: ['Pine Apple Milk Shake','Orange Milk Shake','Strawberry Milk Shake','Litchi Milk Shake','Mango Milk Shake','Vanilla Milk Shake','Banana Milk Shake','Chocolate Milk Shake','Seethaphal Milk Shake','Sapotha Milkshake','Butter Scotch Milk Shake','Oreo Milk Shake','Kitkat Milk Shake','Coffee Milk Shake','Caramel Milk Shake','Choco Peanut Milk Shake','Fruit Punch Milk Shake','Kesar Badam Milk Shake'] },
      { label: 'Mocktails', items: ['Blue sea','Raspberry Mojito','Virgin Mojito','Lime & Mint Mojito','Green Apple Mojito','Black Currant Mojito','Pink Lady','Mint Green','Peach Melba','Strawberry Surprise','Kiwi Kiss','Passion Punch'] },
      { label: 'Traditional', items: ['Lassi','Dry Fruit Lassi','Masala Chaas','Butter Milk','Rose Milk','Hot Rose Milk','Badam Milk','Hot Badam Milk','Dry Fruit Milk','Aam Panna','Coconut water','Jaljeera','Nimbu Pani'] },
    ],
  },
  {
    name: 'Salads',
    subs: [{ label: 'Veg Salads', items: ['Green Salad','Cucumber Salad','Sprouts Salad','Russian Salad','Pulses Salad','Macroni Salad','Aloo Channa Salad','Rajma Salad','Corn Cheese Salad','Pickled Onion Salad','Coleslaw Salad','Butter Tossed Paneer','Mushroom Salad','Mediterian Salad','Fresh Garden Salad','Chickpea Salad','Peanut Cucumber Tomato','Ceaser Salad'] }],
  },
  {
    name: 'Soups',
    subs: [{ label: 'Soups', items: ['Tomato Soup','Clear Soup','Sweet Corn Soup','Hot & Sour Soup','Mushroom Soup','Manchow Soup','Veg Noodle Soup','Thai Clear Soup','Thai Coconut Soup','Cream of Tomato / Brocolli'] }],
  },
  {
    name: 'Starters & Dips',
    subs: [
      { label: 'Manchurias', items: ['Veg Manchuria','Schezwan Manchuria','Dice cut Manchuria','Paneer Manchuria','Paneer Lemon Zest Manchuria','Potato Manchuria','Baby Corn Manchuria','Gobi Manchuria','Mushroom Manchuria'] },
      { label: 'Sticks', items: ['Tangy Chilli Stick','Paneer Sticks','Crispy Baby Corn Stick','Chilli Mushroom Stick','Veg Sticks','Thai stick with white sauce','Hot Garlic sauce sticks'] },
      { label: 'Bytes & Fries', items: ['Onion Rings','Banana Bytes','Capsicum Rings','Pudina Byte','Crispy Baby Corn Byte','Corn Cheese Byte','Veg Bytes','French Fries (Salted / Piri Piri)','Potato Wedges','Garlic Potato Bytes','Cheese Bytes','Veg Nuggets','Smilies','Veg Cutlet','Aloo Tikki'] },
      { label: 'Rolls', items: ['Veg Rolls','Noodle Roll','Sweet Corn Rolls','Mushroom Garlic Roll','Paneer Roll','Palak Cheese Roll','Corn Cheese Roll','Shangai Roll','Veg Kathi Roll','Paneer Kathi Roll','Mushroom Kathi Roll','Veg Greens Kathi Roll','Bread Roll'] },
      { label: 'Starters', items: ['Chilly Paneer','Chilli Mushroom','Chilli Baby Corn','Chilly Potato Finger','Chilly Gobi','Tread Paneer','Paneer Tikka','Paneer Hariyali Tikka','Hara Bara Tikka','Gobi 65','Paneer 65','Aloo 65','Gold Coin','Veg Wontons','Paneer Wontons','Corn Samosa','Cheese Samosa','Onion Samosa','Dry Fruit Samosa','Veg Momo','Fried Momo','Tawa Sizzler','Tangy Paneer','Veg Dumpling','Veg Panipoori Shots','Cheesey Panipoori Shots','Cajun Potato','Peri Peri Potato','Mexican Tostada'] },
      { label: 'Veg Kebabs', items: ['Malai Paneer Kabab','Gobi Kabab','Soya Kabab','Corn Kabab','Tandoori Aloo','Mushroom Kabab','Veg Seekh Kabab','Malai Vegetable','Achari Paneer','Pineapple Tikka','Hara Bara Tikka','Malai Brocolli','Malai Chaap Kebab','Malai Galouti Kebab'] },
      { label: 'Italian', items: ['Red Pasta','White Pasta','Garlic Bread','Pizza Counter','Bruschetta','Mushroom Risotto','Stuffed Ravioli','Spaghetti'] },
      { label: 'Mexican', items: ['Veg Burritos','Tacos with Salsa','Nachos','Burrito','Quesadilla','Chilaquiles','Tamales','Enchiladas'] },
      { label: 'Sauces & Dips', items: ['Tomato Ketchup','Honey Chilli Dip','Thousand Island Dip','Green Chutney','Schezwan Dip','Barbeque Dip','Mayonnaise Dip','Cheese and Jalapeño Dip','Thai Sweet Chilli Dip','Chocolate Dip','White Chocolate Dip','Salsa Dip'] },
    ],
  },
  {
    name: 'Indian Breads',
    subs: [{ label: 'Breads', items: ['Roti','Palak Roti','Carrot Roti','Masala Roti','Jeera Roti','Butter Roti','Rumali Roti','Palak Rumali Roti','Chapathi','Butter Naan','Garlic Butter Naan','Dry Fruit Butter Naan','Kulcha','Stuffed Kulcha','Paneer Kulcha','Cheese Kulcha','Parantha','Stuffed Parantha','Paneer Parantha','Malabar Parotha','Coin Malabar Parotha','Bhatura','Poori','Meetha Poori','Meetha Roti','Flavoured Poori','Besan Ki Poori','Biscuit Roti','Paneer Kottu Parotha','Mix veg Kothu Parotha'] }],
  },
  {
    name: 'Flavoured Rice',
    subs: [{ label: 'Rice Varieties', items: ['Pulihora (Tamarind Rice)','Lemon Rice','Mamidikay Pulihora','Veg Biryani','Bagara Rice','Veg Dum Biryani','Sweet Corn Biryani','Baby Corn Biryani','Soya Biryani','Tiranga Biryani','Kaju Peas Pulao','Peas Pulao','Paneer Pulao','Kashmiri Pulav','Mutter Methi Pulao','Tavva Pulao','Chinese Fried Rice','English Vegetable Fried Rice','Schezwan Fried Rice','Gobi Rice','Tomato Rice','Pudina Rice','Jeera Rice','Steamed Rice','Plain Rice','Saffron Rice','Basmati Rice','Pansakay Biryani (Jackfruit)','Pudina Corn Rice','Palak Rice','Raagi Sankati','Ragi Muddha','Avakay Biryani','Karvepaku Rice','Live Pickle Rice','Gongura Pandumirchi Rice','Avakai Mudapappu Annam','Mushroom Biryani','Mexican Rice','Seven Jewel Rice','Vulavacharu Biryani','Mango Pulihora','Coconut Rice','Hot Pongal','Dal Khichidi','Bisibela Bath','Kothimeera Rice','Vangi Bath','Gongura Rice','Daddojjanam','Spl Curd Rice'] }],
  },
  {
    name: 'Raithas',
    subs: [{ label: 'Raithas', items: ['Plain Beaten Curd','Onion Raitha','Mix Veg Raitha','Keera Raitha','Anar Ka Raitha','Keera Tomato Raitha','Pineapple Raitha','Tomato Raitha','Boondi Raitha','Jeera Raitha','Potlakay Raitha','Masala Raitha'] }],
  },
  {
    name: 'North Indian',
    subs: [{ label: 'North Indian Curries', items: ['Paneer Kadai','Paneer Mutter','Shahi Paneer','Kaju Paneer','Paneer Butter Masala','Malai Methi Paneer','Paneer Meethi Chaman','Paneer Tikka Masala','Chole Paneer','Soya Mutter','Mutter Baby Corn','Mutter Gobi','Palak Paneer','Paneer Koftha','Paneer Baby Corn','Paneer Burji','Paneer Mirchi Masala','Tawa Paneer','Mushroom Masala','Kadai Mushroom','Tawa Mushroom','Mushroom Cheese Delight','Mushroom Capsicum','Mushroom Mutter','Mix Vegetables Kadai','Navaratan Kurma','Aloo Capsicum','Aloo Gobi','Aloo Mutter','Dhum Aloo','Bagara Baigan','Tomato Bagara','Chole Masala','Capsicum Masala','Kaju Malai Mutter','Veg Koftha Curry','Cheese Kofta','Palak Koftha','Mirchi Ka Salan','Aloo Palak','Tawa Sabji','Dry Fruit Vegetables','Veg Dopiaza','Veg Jaipuri','Veg Jalfrize','Rajma Curry','Achari Sabzi','Kaju Makhana','Bendi Masala'] }],
  },
  {
    name: 'Veg Curries',
    subs: [{ label: 'Andhra Curries', items: ['Guthi Vankay Curry','Methi Vankay Curry','Aloo Tomato Curry','Aloo Gobi Curry','Aloo Kurma','Mix Vegetable','Malai Guti Vankay Curry','Vankay Tomato','Drumstick Tomato','Drumstick Cashew','Tomato Curry','Mamidikay Jeedipapu','Jeedigundu Velluli Curry','Vadiyala Pulsu','Pesara Punugula Curry','Guthi Dondakay Curry','Bendakay Pulusu','Kanda Pulusu Curry','Pallu Birakaya Curry','Pallu Potlakaya Curry','Gobi Curry','Chikudikay Curry','Natu Chikudikay Curry','Kanda Bachali','Mushroom Curry','Gongura Meal Mekhar','Gongura Senagapappu','Panasakay Jeedipapu Curry','Sorakay Pallu Curry','Beerakay Senagapappu Curry','Vankay Senagapappu Curry','Vankay Batani Curry','Artikay Curry','Phool Makani Gongura','Sorakay Chepala Pulusu','Artikay Chepala Pulusu','Bendakay Bomidaya Pulusu','Macroni Gongura Curry','Jeddigundlu Tomato Curry','Gumadikay Curry','Mamidikay Vankay Curry','Kalagalupu Curry','Sema Dumpa Pulusu','Gongura Keema Curry','Chikudikay Aloo Curry','Mango Small Onion Cashew Curry'] }],
  },
  {
    name: 'Veg Fries',
    subs: [{ label: 'Fries & Vepudu', items: ['Aloo 65','Gobi 65','Bendi 65','Dondakay 65','Totakkura 65','Cabbage 65','Kanda Pusa','Aloo Pusa','Veg Kheema','Banana Chips','Navaratan Fry','Dondakay Kobbari','Cabbage Carrot Beans Poriyal','Artikaya Pesarapappu','Totakkura Liver Fry','Aloo Boiled Puttu','Dondakay Boondi Nut Fry','Bendakay Boondi Nut Fry','Mix Veg 65','Chikudukay Fry','Vankay Methi Karam','Stuffed Vankay','Avial','Capsicum Fry','Baby Corn Fry','Panasa Pottu','Gutivankay Senagakaram','Kakarakay Fry','Carrot Boiled Fry','Potlakay Fry','Vulavacharu Mushroom Fry','Mushroom Liver Fry','Aloo Methi Fry','Aloo Gobi Fry','Aloo Capsicum Fry','Chammagadha Fry','Capsicum 65','Potlakay 65'] }],
  },
  {
    name: 'Dalls',
    subs: [{ label: 'Dal Varieties', items: ['Tomato Pappu','Anapakay Pappu','Chukkakura Pappu','Bachalikura Pappu','Gongoora Pappu','Mamidi Kaya Pappu','Mudda Pappu','Beerakaya Pappu','Tomato Pesara Pappu','Chinthakaya Pappu','Dosakaya Pappu','Nimmakaya Pappu','Thota Kura Pappu','Rajma Dal','Palak Dal','Dal Fry','Dal Makhani'] }],
  },
  {
    name: 'Sambar & Liquids',
    subs: [{ label: 'Sambar & Rasam', items: ['Drumstick Sambar','Sambar','Madras Sambar','Pappucharu','Veg Dhalcha','Mukkala Pulusu','Munakkaya Charu','Tomato Charu','Ulawa Charu','Bendakaya Charu','Tomato Rasam','Miryala Rasam','Beetroot Rasam','Udipi Rasam','Pachi Pulusu','Majjiga Pulusu','Kadi Pakoda','Ulavacharu with Cream'] }],
  },
  {
    name: 'Pickles & Podis',
    subs: [{ label: 'Pickles & Chutneys', items: ['Dosa Avakaya','Gobi Avakaya','Donda Avakaya','Mango Pickle','Lime Pickle','Mixed Veg Pickle','Gongoora Pickle','Gongoora Chutney','Tomato Pickle','Tomato Chutney','Cabbage Chutney','Carrot Chutney','Allam Chutney','Beerakaya Chutney','Dosakaya Chutney','Vankaya Dosakaya Chutney','Pudina Chutney','Pudina Coconut','Kobbari Pachadi','Chintakay Pickle','Amla Pickle','Red Chilly Pickle','Mango Turumu','Kothimeera Pickle','Kobbari Mamidi','Kandi Pachadi','Allam Pachadi','Carrot Pickle','Roti Pachadi','Dondakay Mukkala','Kandi Podi','Karam Podi','Ildy Karam','Nalla Karam','Putnala Podi','Karvepaku Podi','Velluli Karam'] }],
  },
  {
    name: 'Sweets',
    subs: [{ label: 'Sweet Varieties', items: ['Gulab Jamun','Chum Chum','Kala Jamun','Rasgulla','Boorellu','Bobbatllu','Kakinada Kaja','Kaju Katli','Putharekkulu','Jilebi','Jangeri','Mysore Pak','Milk Mysore Pak','Motichoor Ladoo','Bandhar Ladoo','Soan Papidi','Arisellu','Badhusha','Paramanam','Chekkara Pongali','Dood Peda','Double Ka Meetha','Triple Pudding','Paneer Jilebi','Badam Katli','Kaju Pan','Coconut Rabidi','Rabidi','Tiranga Burfi','Dry Fruit Sandwich','Badam Roll','Chocolate Roll','Kaju Roll','Coconut Burfi','Apple Sweet','Custard Apple Sweet','Chandra Kala','Kaja','Malai Poori','Malai Roll','Malai Chum Chum','Anjeer Coin','Dry Fruit Putharekulu','Gajjar Ka Halwa','Rasmalai','Boondi Ladoo','Kova Puri','Semiya Payasam','Kaddu Ka Halwa','Kadhu Ka Kheer','Gajjar Ka Kheer','Qurbani Ka Meetha','Basundi','Apricot Pudding','Tawa Sweet','Honey Malai','Chocolate Florentine','Chocolate Malai Boat','Coconut Malai Rabdi','Kiwi Rabdi','Red Velvet Temptation','Sunnundalu','Matka Rabdi Basanthi','Kova Bobbattu','Dry Fruit Halwa Mini','Mini Kaja','Mini Motichoor Ladoo'] }],
  },
  {
    name: 'Ice Creams',
    subs: [
      { label: 'Flavours', items: ['Vanilla','Strawberry','Orange','Pineapple','Mango','Chocolate','Seethapal','Choco Chips','Pista','Butter Scotch','Kulfi Malai','Honeymoon Delite','Honey Almond','Dry Fruit Temptation','Mello Jello','Fruit Ninja','Black Current','Anjeer Badam','Caramel Nuts','Belgium Dark Chocolate','Choco Fudge','Matka Kulfi','Dry Fruit Kulfi','Cassata','Sundaes'] },
      { label: 'Ice Cream Stalls', items: ['Ice Cream Mela Stall','Roller Ice Cream Stall','Cream Stone Stall','Natural Fruit Popsicles','Sizzling Brownie Stall','Fruit Ice Cream Stall','Sundaes Stall'] },
    ],
  },
  {
    name: 'Breakfast',
    subs: [
      { label: 'Idly & Vada', items: ['Idly','Carrot Idly','Mix Veg Idly','Ragi Idly','Aviri Kudumu','Potupappu Idly','Rava Idly','Thatte Idly','Vada','Cocktail Vada','Dahi Vada','Sabudana Vada'] },
      { label: 'Dosas', items: ['Plain Dosa','Onion Dosa','Masala Dosa','Upma Dosa','Karam Dosa','Pizza Dosa','Paneer Dosa','Mushroom Dosa','Cashew Dosa','Sponge Dosa','Pesaratu','Utappam','Ragi Dosa','Beetroot Dosa','Set Dosa','Rava Dosa','Millet Dosa','Spl Cheese Dosas'] },
      { label: 'Other Items', items: ['Poori','Chole Batura','Mysore Bajji','Punugulu','Gunta Pongadallu','Vegetable Upma','Yerra Rava Upma','Semiya Upma','Tomato Bath','Hot Pongal','Poha','Dhokla','Besan Chilla','Sabudana Kichidi','Kara Bath','Parotha','Mini Parotha','Kichidi','Roti','Butter Phulka','Waffles','Pancakes','Oat Meal','Fruit Salad'] },
    ],
  },
  {
    name: 'Millets',
    subs: [{ label: 'Millet Dishes', items: ['Multi Millet Idly','Millet Dosa','Korrala Kichidi','Jowar Upma','Korra Pongal','Korra Payasam','Ragi Roti','Ragi Dosa','Millet Pancakes','Mini Millet Uttapam','Millet Vadalu','Millet Lemon Rice'] }],
  },
  {
    name: 'Live Counters',
    subs: [
      { label: 'Tikkis & Cutlets', items: ['Aloo Tikki','Laccha Tikki','Coconut Tikki','Dryfruit Tikki','Beetroot Tikki','Vegetable Tikki','Corn Tikki','Chole Tikki','Ragda Tikki','Veg Cutlet','Khowa Paneer Cutlet','Banana Cutlet','Mutter Cutlet','Agra Bhalla'] },
      { label: 'Pav Bhaji', items: ['Butter Pav Bhaji','Cheese Pav Bhaji','Italian Pav Bhaji','Mexican Pav Bhaji','Thai Pav Bhaji','Garlic Pav Bhaji'] },
      { label: 'Barbeques', items: ['Paneer BBQ','Malai Paneer BBQ','Vegetable BBQ','Fruit BBQ','Soya Chaap BBQ','Malai Chaap BBQ','Assorted BBQ'] },
      { label: 'Bhels', items: ['Normal Bhel','Papdi Bhel','Ghee Garlic Bhel','Mixture Bhel','Navratan Bhel','Chinese Bhel','Panch Ratan Bhel','Mexican Bhel'] },
      { label: 'Dahi Wada Variants', items: ['Andhra Dahi Wada','Raj Bhog Dahi Wada','Malai Dahi Wada','Moong Dal Dahi Wada','Pineapple Dahi Wada','Strawberry Dahi Wada','Mini Dahi Wada','Dahi Komcha','Assorted Dahi Wada'] },
      { label: 'Chaats', items: ['Aloo Tikki Chaat','Mutter Chaat','Samosa Chaat','Paneer Kangna Chaat','Baby Corn Kangna Chaat','Aloo Basket Chaat','Delhi Tava Mix Chaat','Tava Sweet Corn Chaat','Vada Pav Chaat','Papidi Chaat','Delhi Dahi Gujiya Chaat','Bhala Papdi Chaat','Dahi Kachodi Chaat','Dahi Samosa Chaat','Delhi Raj Kachodi Chaat','Masala Paneer Tikka Chaat','Paneer Lifafa Chaat'] },
      { label: 'Pani Poori', items: ['Imli Pani Poori','Tomato Pani Poori','Garlic Pani Poori','Meetha Pani Poori','Hing Pani Poori','Chocolate Pani Poori','Pizza Panipoori','Delhi Rava Pani Puri','Bombay Moong Dal Pani Puri','Kolkata Pani Puri'] },
    ],
  },
  {
    name: 'Accompaniments',
    subs: [{ label: 'Accompaniments', items: ['Plain Papad Big','Masala Papad','Vadiyalu','Curd Chillies','Frymus','Curd','Rajula Perugu','Pot Curd','Mouth Freshener'] }],
  },
]

export default function FullMenuModal({ onClose }) {
  const [activeCat, setActiveCat] = useState(0)
  const cat = FULL_MENU[activeCat]

  return (
    <div className="flip-modal-overlay" onClick={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flip-modal-header">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 4 }}>Amrutham by Padma Catering</p>
            <h3>Full Menu · All Categories</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 16px' }}
              onClick={() => window.print()}
            >
              <i className="fa-solid fa-print" /> Print Menu
            </button>
            <button className="cuisine-modal-close" onClick={onClose}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flip-modal-body">
          {/* Sidebar */}
          <div className="flip-sidebar">
            {FULL_MENU.map((c, i) => (
              <div
                key={c.name}
                className={`flip-sidebar-item${activeCat === i ? ' active' : ''}`}
                onClick={() => setActiveCat(i)}
              >
                {c.name}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flip-content">
            <h2 className="flip-page-title">{cat.name}</h2>
            <div className="flip-page-divider" />
            {cat.subs.map(sub => (
              <div className="flip-sub-section" key={sub.label}>
                {cat.subs.length > 1 && <p className="flip-sub-label">{sub.label}</p>}
                <div className="flip-items-grid">
                  {sub.items.map(item => <span key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flip-modal-footer">
          <span className="flip-page-indicator">{activeCat + 1} / {FULL_MENU.length}</span>
          <div className="flip-nav">
            <button className="flip-nav-btn" disabled={activeCat === 0} onClick={() => setActiveCat(i => i - 1)}>
              <i className="fa-solid fa-chevron-left" /> Previous
            </button>
            <button className="flip-nav-btn" disabled={activeCat === FULL_MENU.length - 1} onClick={() => setActiveCat(i => i + 1)}>
              Next <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
