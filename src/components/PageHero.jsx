export default function PageHero({ label, title, em, bg }) {
  return (
    <section className="page-hero" style={{ backgroundImage: `url(${bg})` }}>
      <div className="page-hero-overlay" />
      <div className="page-hero-content container">
        <span className="section-label">{label}</span>
        <h1 className="page-hero-title">{title}{em && <><br /><em>{em}</em></>}</h1>
        <div className="cta-ornament" style={{ marginTop: 20 }}>
          <span className="hs-line" />
          <span className="hs-gem">✦</span>
          <span className="hs-line" />
        </div>
      </div>
    </section>
  )
}
