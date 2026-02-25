import { useState } from 'react'

const tabs = [
  {
    label: 'Our Story',
    content: 'Since 1993, Padma Catering has been a dedicated catering house combining innovative cuisine with superior customer service across Greater Vizag and surrounding areas. We understand how important your dream event is — celebration is all about great food and a good time. We have served over 1 Crore+ plates across 5000+ events, building memories one plate at a time.',
  },
  {
    label: 'Why Choose Us',
    content: 'We bring over 30 years of experience, a vast multi-cuisine menu, and a team of dedicated culinary professionals. Our commitment to freshness, quality, and punctual delivery sets us apart. From pre-event planning to post-event cleanup, we handle everything so you can enjoy your celebration stress-free.',
  },
  {
    label: 'Our Promise',
    content: 'Every ingredient is sourced fresh daily. Our kitchen follows strict hygiene standards. We offer complete customisation — your menu, your way. Whether it is 25 guests or 2500, every plate receives the same love and attention. Our word is our bond: if you are not happy, we are not done.',
  },
]

export default function About() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about-wrap">
          {/* Image side */}
          <div className="about-img-col reveal-l">
            <div className="about-img-main">
              <img
                src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&auto=format&q=80"
                alt="Padma Catering kitchen"
              />
            </div>
            <div className="about-img-secondary">
              <img
                src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&q=80"
                alt="Indian cuisine"
              />
            </div>
            <div className="about-badge">
              <span className="ab-num">30+</span>
              <span className="ab-lbl">Years of<br />Excellence</span>
            </div>
          </div>

          {/* Text side */}
          <div className="about-text-col reveal-r">
            <span className="section-label">Every Flavour Tells a Story</span>
            <h2 className="section-title">One of Vizag's Most<br /><em>Loved Caterers</em></h2>
            <div className="section-divider"><div className="dot" /></div>

            {/* Tabs */}
            <div className="about-tabs">
              {tabs.map((t, i) => (
                <button
                  key={t.label}
                  className={`about-tab${i === activeTab ? ' active' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="about-body">{tabs[activeTab].content}</p>

            <div className="about-highlights">
              {[
                { icon: 'fa-solid fa-leaf', text: '100% Fresh Ingredients' },
                { icon: 'fa-solid fa-award', text: 'Award-Winning Service' },
                { icon: 'fa-solid fa-users', text: 'Expert Culinary Team' },
              ].map(h => (
                <div className="about-hl" key={h.text}>
                  <i className={h.icon} />
                  <span>{h.text}</span>
                </div>
              ))}
            </div>

            <a href="/menu.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 28 }}>
              <i className="fa-solid fa-file-pdf" /> Download Full Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
