const BASE = import.meta.env.BASE_URL

const types = [
  {
    img: `${BASE}img/pics/img-01.jpg`,
    lbl: 'Catering',
    title: 'Special Events',
    tags: ['Weddings', 'Anniversaries', 'Baby Showers'],
    text: 'Celebrate your special event with exquisite & creative cuisine, a friendly atmosphere and highly professional staff. Select from pre-made menus or work with us to create your own perfect menu.',
    href: '/catering-single-page-2.html',
  },
  {
    img: `${BASE}img/pics/img-09.jpg`,
    lbl: 'Catering',
    title: 'Corporate Events',
    tags: ['Meetings', 'Team Building', 'Corporate Parties'],
    text: 'Impress your partners with our tailor-made menus. From business lunches to corporate parties, our specialist will plan your event to meet every need regardless of party size or occasion.',
    href: '/catering-single-page-2.html',
  },
  {
    img: `${BASE}img/pics/img-10.jpg`,
    lbl: 'Catering',
    title: 'Social Events',
    tags: ['Birthdays', 'Family Reunions', 'Celebrations'],
    text: "Whether you're celebrating a birthday or hosting a family reunion, our experts will ensure a delicious and memorable event for you and all your guests. Time to put your party hat on!",
    href: '/catering-single-page.html',
  },
]

export default function Catering() {
  return (
    <section id="catering" className="section">
      <div className="container">
        <div className="centered reveal">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">
            A Party Without Good Food<br />
            <em>Is Really Just a Meeting</em>
          </h2>
          <div className="section-divider" style={{ maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="dot" />
          </div>
        </div>
      </div>

      <div className="catering-cards">
        {types.map((t, i) => (
          <div className={`catering-card reveal d${i + 1}`} key={t.title}>
            <img src={t.img} alt={t.title} />
            <div className="catering-overlay">
              <span className="cat-lbl">{t.lbl}</span>
              <h3 className="cat-title">{t.title}</h3>
              <div className="cat-tags">
                {t.tags.map(tag => <span key={tag}>{tag}</span>)}
              </div>
              <p className="cat-text">{t.text}</p>
              <a href={t.href} className="cat-link">
                More Details <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
