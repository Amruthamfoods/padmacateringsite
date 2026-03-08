import { useState } from 'react'
import { Link } from 'react-router-dom'

const tabs = [
  { label: 'Our Story',  content: 'Since 1993, Padma Catering has been synonymous with exceptional food and flawless service in Visakhapatnam. What started as a humble home-catering venture has grown into two distinct brands — Padma Catering, our trusted standard service, and Amrutham, our premium format launched in 2019 for elite, curated dining experiences.' },
  { label: 'Our Vision', content: 'To be the premier catering house of Andhra Pradesh — where every event, regardless of scale, receives five-star quality cuisine, impeccable service and the warmth of a family celebration. We envision a future where Padma Catering is the name every host trusts without a second thought.' },
  { label: 'Our Mission', content: 'To deliver unforgettable dining experiences by combining the finest ingredients, culinary expertise, and heartfelt hospitality. We commit to continuous innovation in menu design, hygiene standards, and service excellence — event after event, guest after guest.' },
]

const milestones = [
  { year: '1993', text: 'Padma Catering was founded in Visakhapatnam by our visionary chef, starting with small family celebrations and local pujas.' },
  { year: '2000', text: "Expanded to corporate and large-scale events, serving Vizag's top businesses and institutions for the first time." },
  { year: '2008', text: 'Introduced a live counter concept to the region — bringing freshly prepared dosa, chaat and juice stations to events.' },
  { year: '2015', text: 'Crossed 1000+ events milestone. Our team expanded to 50+ trained culinary professionals and service staff.' },
  { year: '2019', text: "Launched Amrutham — our premium catering format for elite events. A new chapter in refined, white-glove hospitality for Vizag's most discerning hosts." },
  { year: '2020', text: 'Navigated the pandemic with safe, contactless serving formats — ensuring food reached families and essential gatherings without compromise.' },
  { year: '2023', text: 'Celebrated 30 years of culinary excellence — a landmark moment that reaffirmed our commitment to quality and heartfelt hospitality.' },
  { year: '2025', text: 'Crossed the historic milestone of 1 Crore+ plates served and 5000+ events catered — a testament to the trust Vizag has placed in us.' },
]

const values = [
  { icon: 'fa-solid fa-leaf',              title: 'Farm-Fresh Ingredients',  text: 'We source produce daily from trusted local vendors. Nothing frozen, nothing artificial.' },
  { icon: 'fa-solid fa-shield-halved',     title: 'Strict Hygiene Standards', text: 'FSSAI-certified kitchen, gloved service staff, and sanitised serving equipment at every event.' },
  { icon: 'fa-solid fa-sliders',           title: 'Full Customisation',       text: 'Your menu, your preferences — Jain, vegan, diabetic-friendly, regional — we accommodate all.' },
  { icon: 'fa-solid fa-clock',             title: 'Punctual Delivery',        text: 'We arrive early, set up completely, and have food ready before your first guest walks in.' },
  { icon: 'fa-solid fa-hand-holding-heart',title: 'White-Glove Service',      text: 'Our trained servers bring hospitality to every table, ensuring guests feel valued and well-served.' },
  { icon: 'fa-solid fa-rotate',            title: 'Full Event Turnkey',       text: 'Decor coordination, crockery, furniture rental — one call handles everything, start to finish.' },
]

const team = [
  { name: 'Padma Cherukuri',     role: 'Founder & Head Chef',                    img: '/booking/img/team/padma.png', bio: 'The heart and soul of Padma Catering. With 30+ years of culinary mastery, Padma built this brand on one simple belief — food should make people feel at home.' },
  { name: 'Dasaradh Cherukuri',  role: 'General Manager & Head of Operations',   img: '/booking/img/team/dasaradh.png', bio: 'Dasaradh ensures every event runs like clockwork — overseeing logistics, staffing, vendor coordination and flawless on-ground execution.' },
  { name: 'Rohit Cherukuri',     role: 'Client Relations Lead & Marketing Head', img: '/booking/img/team/rohit.jpg', bio: 'Rohit is your first point of contact — dedicated to understanding your vision and translating it into the perfect catering experience.' },
  { name: 'Nalluri Shravani',    role: 'Concept Designer & Creative Incharge',   img: '/booking/img/team/shravani.jpg', bio: 'Shravani brings creativity and elegance to every setup — crafting visual concepts, themes and presentation that make each event truly memorable.' },
]

const HL = [
  { icon: 'fa-solid fa-plate-wheat',     text: '1 Crore+ Plates Served' },
  { icon: 'fa-solid fa-calendar-check',  text: '5000+ Events Catered' },
  { icon: 'fa-solid fa-users',           text: '50+ Expert Team Members' },
]

const S = { label: { display: 'inline-block', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: 'var(--r-pill)', padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 14 } }

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div style={{ background: 'var(--bg-page)', paddingTop: 68 }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&q=80" alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <span style={{ ...S.label, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', marginBottom: 16 }}>Our Story</span>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
            Three Decades of <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Culinary Excellence</em>
          </h1>
        </div>
      </div>

      {/* ── Intro ── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="about-portal-intro">

            {/* Image col */}
            <div style={{ position: 'relative', paddingBottom: 32, paddingRight: 32 }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&auto=format&q=80" alt="Padma Catering kitchen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 170, borderRadius: 12, overflow: 'hidden', border: '4px solid var(--bg)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', aspectRatio: '4/3' }}>
                <img src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&q=80" alt="Indian cuisine" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', top: 20, left: 20, background: 'var(--primary)', color: '#fff', borderRadius: 12, padding: '14px 18px', textAlign: 'center', boxShadow: '0 8px 24px rgba(232,100,10,0.35)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>30+</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 4, opacity: 0.9 }}>Years of<br />Excellence</div>
              </div>
            </div>

            {/* Text col */}
            <div>
              <span style={S.label}>Every Flavour Tells a Story</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--heading)', margin: '0 0 8px', lineHeight: 1.2 }}>
                One of Vizag's Most<br /><em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Loved Caterers</em>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 24px' }}>
                <div style={{ height: 2, width: 48, background: 'var(--primary)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                <div style={{ height: 2, width: 48, background: 'var(--primary)' }} />
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {tabs.map((t, i) => (
                  <button key={t.label} onClick={() => setActiveTab(i)} style={{
                    padding: '7px 16px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s',
                    background: activeTab === i ? 'var(--primary)' : 'var(--fill-tertiary)',
                    color: activeTab === i ? '#fff' : 'var(--muted)',
                  }}>{t.label}</button>
                ))}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 24 }}>{tabs[activeTab].content}</p>

              {/* Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {HL.map(h => (
                  <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={h.icon} style={{ color: 'var(--primary)', fontSize: '0.7rem' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--body-text)', fontWeight: 500 }}>{h.text}</span>
                  </div>
                ))}
              </div>

              <Link to="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 'var(--r-pill)', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: 'var(--shadow-green)' }}>
                <i className="fa-solid fa-calendar-check" /> Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={S.label}>Our Journey</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--heading)', marginBottom: 0 }}>
              Milestones That <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Define Us</em>
            </h2>
          </div>
          <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--primary-light)' }} />
            {milestones.map((m, i) => (
              <div key={m.year} style={{ position: 'relative', marginBottom: 36, paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: -8, top: 4, width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)', border: '3px solid var(--bg)', boxShadow: '0 0 0 2px var(--primary)' }} />
                <div style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6 }}>{m.year}</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={S.label}>What We Stand For</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--heading)', marginBottom: 0 }}>
              Our Core <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Values</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="values-portal-grid">
            {values.map(v => (
              <div key={v.title} style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '28px 24px', boxShadow: 'var(--shadow-sm)', border: '0.5px solid var(--separator-nm)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <i className={v.icon} style={{ color: 'var(--primary)', fontSize: '1.1rem' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={S.label}>The People Behind the Magic</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--heading)', marginBottom: 0 }}>
              Meet Our <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Team</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }} className="team-portal-grid">
            {team.map(m => (
              <div key={m.name} style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '0.5px solid var(--separator-nm)' }}>
                <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                  <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
                <div style={{ padding: '16px 16px 20px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--heading)', margin: '0 0 3px' }}>{m.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{m.role}</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, margin: '10px 0 0' }}>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '64px 24px', background: 'var(--primary)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to Create Memories?</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 28 }}>Let us handle the food — you enjoy the celebration.</p>
        <Link to="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--r-pill)', background: '#fff', color: 'var(--primary)', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          Start Booking <i className="fa-solid fa-arrow-right" />
        </Link>
      </section>

      <style>{`
        @media(max-width:900px){.about-portal-intro{grid-template-columns:1fr!important}}
        @media(max-width:700px){.values-portal-grid{grid-template-columns:1fr 1fr!important}.team-portal-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:480px){.values-portal-grid{grid-template-columns:1fr!important}.team-portal-grid{grid-template-columns:1fr 1fr!important}}
      `}</style>
    </div>
  )
}
