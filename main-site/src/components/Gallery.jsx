const images = [
  { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=900&auto=format&q=80', alt: 'Grand catering buffet' },
  { src: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&auto=format&q=80', alt: 'Indian food spread' },
  { src: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80', alt: 'Biryani' },
  { src: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&q=80', alt: 'Sweets and desserts' },
  { src: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&q=80', alt: 'North Indian cuisine' },
  { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&q=80', alt: 'Wedding reception' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&q=80', alt: 'Fine dining setup' },
  { src: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80', alt: 'Indian starters' },
  { src: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80', alt: 'South Indian breakfast' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">Our Gallery</span>
          <h2 className="section-title">Feasts We Have <em>Created</em></h2>
          <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
            <div className="dot" />
          </div>
        </div>

        <div className="gallery-grid">
          {images.map((img, i) => (
            <div className={`g-item reveal d${Math.min(i % 4 + 1, 4)}`} key={img.src}>
              <img src={img.src} alt={img.alt} loading="lazy" />
              <div className="g-overlay">
                <i className="fa-solid fa-magnifying-glass-plus" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
