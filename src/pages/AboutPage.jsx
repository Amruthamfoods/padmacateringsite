import { useState } from 'react'
import PageHero   from '../components/PageHero'
import CTABanner  from '../components/CTABanner'
import useScrollReveal from '../hooks/useScrollReveal'

const milestones = [
  { year: '1993', text: 'Padma Catering was founded in Visakhapatnam by our visionary chef, starting with small family celebrations and local pujas.' },
  { year: '2000', text: 'Expanded to corporate and large-scale events, serving Vizag\'s top businesses and institutions for the first time.' },
  { year: '2008', text: 'Introduced a live counter concept to the region — bringing freshly prepared dosa, chaat and juice stations to events.' },
  { year: '2015', text: 'Crossed 1000+ events milestone. Our team expanded to 50+ trained culinary professionals and service staff.' },
  { year: '2019', text: 'Launched Amrutham — our premium catering format for elite events. A new chapter in refined, white-glove hospitality for Vizag\'s most discerning hosts.' },
  { year: '2020', text: 'Navigated the pandemic with safe, contactless serving formats — ensuring food reached families and essential gatherings without compromise.' },
  { year: '2023', text: 'Celebrated 30 years of culinary excellence — a landmark moment that reaffirmed our commitment to quality and heartfelt hospitality.' },
  { year: '2025', text: 'Crossed the historic milestone of 1 Crore+ plates served and 5000+ events catered — a testament to the trust Vizag has placed in us.' },
]

const team = [
  { name: 'Padma Cherukuri', role: 'Founder & Head Chef', img: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&auto=format&q=80', bio: 'The heart and soul of Padma Catering. With 30+ years of culinary mastery, Padma built this brand on one simple belief — food should make people feel at home.' },
  { name: 'Dasaradh Cherukuri', role: 'General Manager & Head of Operations', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&q=80', bio: 'Dasaradh ensures every event runs like clockwork — overseeing logistics, staffing, vendor coordination and flawless on-ground execution.' },
  { name: 'Rohit Cherukuri', role: 'Client Relations Lead & Marketing Head', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&q=80', bio: 'Rohit is your first point of contact — dedicated to understanding your vision and translating it into the perfect catering experience.' },
  { name: 'Nalluri Shravani', role: 'Concept Designer & Creative Incharge', img: 'https://images.unsplash.com/photo-1494790108755-2616b332c3c9?w=400&auto=format&q=80', bio: 'Shravani brings creativity and elegance to every setup — crafting visual concepts, themes and presentation that make each event truly memorable.' },
]

const values = [
  { icon: 'fa-solid fa-leaf', title: 'Farm-Fresh Ingredients', text: 'We source produce daily from trusted local vendors. Nothing frozen, nothing artificial.' },
  { icon: 'fa-solid fa-shield-halved', title: 'Strict Hygiene Standards', text: 'FSSAI-certified kitchen, gloved service staff, and sanitised serving equipment at every event.' },
  { icon: 'fa-solid fa-sliders', title: 'Full Customisation', text: 'Your menu, your preferences — Jain, vegan, diabetic-friendly, regional — we accommodate all.' },
  { icon: 'fa-solid fa-clock', title: 'Punctual Delivery', text: 'We arrive early, set up completely, and have food ready before your first guest walks in.' },
  { icon: 'fa-solid fa-hand-holding-heart', title: 'White-Glove Service', text: 'Our trained servers bring hospitality to every table, ensuring guests feel valued and well-served.' },
  { icon: 'fa-solid fa-rotate', title: 'Full Event Turnkey', text: 'Decor coordination, crockery, furniture rental — one call handles everything, start to finish.' },
]

export default function AboutPage({ onBookNow }) {
  useScrollReveal()
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { label: 'Our Story', content: 'Since 1993, Padma Catering has been synonymous with exceptional food and flawless service in Visakhapatnam. What started as a humble home-catering venture has grown into two distinct brands — Padma Catering, our trusted standard service, and Amrutham, our premium format launched in 2019 for elite, curated dining experiences.' },
    { label: 'Our Vision', content: 'To be the premier catering house of Andhra Pradesh — where every event, regardless of scale, receives five-star quality cuisine, impeccable service and the warmth of a family celebration. We envision a future where Padma Catering is the name every host trusts without a second thought.' },
    { label: 'Our Mission', content: 'To deliver unforgettable dining experiences by combining the finest ingredients, culinary expertise, and heartfelt hospitality. We commit to continuous innovation in menu design, hygiene standards, and service excellence — event after event, guest after guest.' },
  ]

  return (
    <>
      <PageHero
        label="Our Story"
        title="Three Decades of"
        em="Culinary Excellence"
        bg="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&q=80"
      />

      {/* Introduction */}
      <section className="section">
        <div className="container">
          <div className="about-wrap">
            <div className="about-img-col reveal-l">
              <div className="about-img-main">
                <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&auto=format&q=80" alt="Padma Catering kitchen" />
              </div>
              <div className="about-img-secondary">
                <img src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&q=80" alt="Indian cuisine" />
              </div>
              <div className="about-badge">
                <span className="ab-num">30+</span>
                <span className="ab-lbl">Years of<br />Excellence</span>
              </div>
            </div>

            <div className="about-text-col reveal-r">
              <span className="section-label">Every Flavour Tells a Story</span>
              <h2 className="section-title">One of Vizag's Most<br /><em>Loved Caterers</em></h2>
              <div className="section-divider"><div className="dot" /></div>

              <div className="about-tabs">
                {tabs.map((t, i) => (
                  <button key={t.label} className={`about-tab${i === activeTab ? ' active' : ''}`} onClick={() => setActiveTab(i)}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="about-body">{tabs[activeTab].content}</p>

              <div className="about-highlights">
                {[
                  { icon: 'fa-solid fa-plate-wheat', text: '1 Crore+ Plates Served' },
                  { icon: 'fa-solid fa-calendar-check', text: '5000+ Events Catered' },
                  { icon: 'fa-solid fa-users', text: '50+ Expert Team Members' },
                ].map(h => (
                  <div className="about-hl" key={h.text}>
                    <i className={h.icon} />
                    <span>{h.text}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" onClick={onBookNow} style={{ marginTop: 28 }}>
                <i className="fa-solid fa-calendar-check" /> Book a Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--dark-3)' }}>
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">Our Journey</span>
            <h2 className="section-title">Milestones That <em>Define Us</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
              <div className="dot" />
            </div>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div className={`timeline-item reveal d${(i % 4) + 1}`} key={m.year}>
                <div className="tl-year">{m.year}</div>
                <div className="tl-dot" />
                <div className="tl-text">{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">What We Stand For</span>
            <h2 className="section-title">Our Core <em>Values</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
              <div className="dot" />
            </div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className={`value-card reveal d${(i % 4) + 1}`} key={v.title}>
                <div className="value-icon"><i className={v.icon} /></div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{ background: 'var(--dark-3)' }}>
        <div className="container">
          <div className="centered reveal">
            <span className="section-label">The People Behind the Magic</span>
            <h2 className="section-title">Meet Our <em>Team</em></h2>
            <div className="section-divider" style={{ maxWidth: 300, margin: '0 auto 52px' }}>
              <div className="dot" />
            </div>
          </div>
          <div className="team-grid">
            {team.map((m, i) => (
              <div className={`team-card reveal d${(i % 4) + 1}`} key={m.name}>
                <div className="team-img">
                  <img src={m.img} alt={m.name} loading="lazy" />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{m.name}</h3>
                  <span className="team-role">{m.role}</span>
                  <p className="team-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
