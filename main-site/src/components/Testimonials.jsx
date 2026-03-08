import { useState } from 'react'

const testimonials = [
  {
    text: '"Delicious food and prompt service! We ordered for 100 guests and the food was outstanding — especially the biryani. Everything was fresh, well-portioned, and served on time. Our guests couldn\'t stop complimenting the spread. Padma Catering truly delivered beyond our expectations. Highly recommended for any event in Vizag!"',
    name: 'Neelesh Ch',
    role: 'Private Event, 100 Guests',
    source: 'Google Review',
  },
  {
    text: '"The Prasadams supplied by you were awesome — loaded with authentic taste and you never compromised on quality even for a moment. Every dish carried the same care and warmth that home-cooked food does. It\'s rare to find a caterer who truly understands the sanctity of festival and religious occasions. Absolutely the best choice for prasadam catering in Vizag!"',
    name: 'Venkata R',
    role: 'Festival Catering',
    source: 'Google Review',
  },
  {
    text: '"Padma Catering is hands down Vizag\'s best caterer. Their millet-based and healthy menu options are unmatched — something very few caterers even attempt. They customised the entire menu to our preferences with zero fuss. The food quality was consistently excellent from first course to last. Will never go to anyone else for our events!"',
    name: 'Varun Visarapu',
    role: 'Corporate Event',
    source: 'Google Review',
  },
  {
    text: '"One of the best catering services in Visakhapatnam — brilliant variety, excellent taste, and genuinely happy guests! Every dish was flavourful and freshly prepared. The staff were courteous and ensured everyone was served well. We\'ve received so many compliments from our relatives about the food. Padma Catering made our function truly special."',
    name: 'Surekha',
    role: 'Family Celebration',
    source: 'Justdial Review',
  },
  {
    text: '"Food is absolutely delicious. We ordered for 200 guests and the aritikaya chepala pulusu was extremely delicious — something you rarely get at catered events. The variety was impressive and every dish was cooked to perfection. Portion sizes were generous and the service was smooth throughout. A truly memorable dining experience for all our guests!"',
    name: 'B. Prasad',
    role: 'Large Event, 200 Guests',
    source: 'Google Review',
  },
  {
    text: '"Thank you and your entire team for the incredible catering at our wedding. The appetisers and main course were both spectacular — guests were raving about the food long after the event. Mr. Dasaradh was extremely polite, professional and responsive throughout the planning process. Quality like this is hard to find. We will definitely book again!"',
    name: 'Karteek Bunny',
    role: 'Wedding Reception',
    source: 'Justdial Review',
  },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const total = testimonials.length

  const prev = () => setCurrent(c => (c - 1 + total) % total)
  const next = () => setCurrent(c => (c + 1) % total)

  const t = testimonials[current]

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">Happy Clients</span>
          <h2 className="section-title">What Our Guests <em>Say</em></h2>
          <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
            <div className="dot" />
          </div>
        </div>

        <div className="testi-slider reveal">
          <div className="testi-quote-icon">❝</div>
          <p className="testi-slide-text">{t.text}</p>

          <div className="testi-stars">
            {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star" />)}
          </div>

          <div className="testi-slide-author">
            <div className="testi-avatar">
              {t.name.charAt(0)}
            </div>
            <div>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
              <div className="testi-source">
                <i className="fa-brands fa-google" /> {t.source}
              </div>
            </div>
          </div>

          <div className="testi-controls">
            <button className="testi-arrow" onClick={prev} aria-label="Previous">
              <i className="fa-solid fa-chevron-left" />
            </button>
            <div className="testi-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testi-dot${i === current ? ' active' : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
            <button className="testi-arrow" onClick={next} aria-label="Next">
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
