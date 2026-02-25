import { useState } from 'react'
import PageHero  from '../components/PageHero'
import CTABanner from '../components/CTABanner'
import useScrollReveal from '../hooks/useScrollReveal'

const categories = ['All', 'Weddings', 'Corporate', 'Live Counters', 'Food & Cuisine', 'Setups']

const images = [
  { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=900&auto=format&q=80', alt: 'Grand catering buffet', cat: 'Setups' },
  { src: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&auto=format&q=80', alt: 'Indian food spread', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80', alt: 'Biryani', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&q=80', alt: 'Sweets and desserts', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&q=80', alt: 'North Indian cuisine', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&q=80', alt: 'Wedding reception', cat: 'Weddings' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&q=80', alt: 'Fine dining setup', cat: 'Setups' },
  { src: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80', alt: 'Indian starters', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80', alt: 'South Indian breakfast', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&q=80', alt: 'Corporate event', cat: 'Corporate' },
  { src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&auto=format&q=80', alt: 'Celebration dinner', cat: 'Weddings' },
  { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&q=80', alt: 'Live counter', cat: 'Live Counters' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&q=80', alt: 'Food platter', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&q=80', alt: 'Event decoration', cat: 'Weddings' },
  { src: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&q=80', alt: 'Conference catering', cat: 'Corporate' },
  { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&q=80', alt: 'Catering spread', cat: 'Setups' },
  { src: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&q=80', alt: 'Dessert table', cat: 'Food & Cuisine' },
  { src: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&q=80', alt: 'Beverages station', cat: 'Live Counters' },
]

export default function GalleryPage({ onBookNow }) {
  useScrollReveal()
  const [active, setActive] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const filtered = active === 'All' ? images : images.filter(img => img.cat === active)

  return (
    <>
      <PageHero
        label="Our Gallery"
        title="Feasts We Have"
        em="Created"
        bg="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&auto=format&q=80"
      />

      <section className="section">
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">Visual Stories</span>
            <h2 className="section-title">Every Frame a <em>Memory</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 36px' }}>
              <div className="dot" />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="gallery-filters reveal">
            {categories.map(cat => (
              <button
                key={cat}
                className={`gallery-filter-btn${active === cat ? ' active' : ''}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="gallery-page-grid">
            {filtered.map((img, i) => (
              <div className={`gallery-page-item reveal d${(i % 4) + 1}`} key={img.src} onClick={() => setLightbox(img)}>
                <img src={img.src} alt={img.alt} loading="lazy" />
                <div className="gallery-page-overlay">
                  <i className="fa-solid fa-magnifying-glass-plus" />
                  <span>{img.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>
            <i className="fa-solid fa-xmark" />
          </button>
          <img src={lightbox.src.replace('w=600', 'w=1200').replace('w=900', 'w=1400')} alt={lightbox.alt} onClick={e => e.stopPropagation()} />
          <p className="lightbox-caption">{lightbox.alt}</p>
        </div>
      )}

      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
