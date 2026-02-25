export default function Story() {
  return (
    <section id="story" className="section">
      <div className="container">
        <div className="story-wrap">
          <div className="story-img-wrap reveal-l">
            <img src={`${import.meta.env.BASE_URL}img/pics/img-10.jpg`} alt="Padma Catering — Our Story" />
            <div className="story-img-accent" />
            <div className="story-badge">
              <span className="yr">1993</span>
              <span className="yr-lbl">Est.</span>
            </div>
          </div>

          <div className="reveal-r">
            <span className="section-label">Our Story</span>
            <h2 className="section-title">Love for <em>Food</em></h2>
            <div className="section-divider"><div className="dot" /></div>

            <blockquote className="story-quote">
              &ldquo;There is no sincerer love than the love of food&rdquo;
              <span className="auth">&mdash; George Bernard Shaw</span>
            </blockquote>

            <p className="story-p">
              Welcome to Padma Catering. Since 1993, we have been a dedicated catering house
              combining innovative cuisine with superior customer service across Greater Vizag
              and its surrounding areas. We understand how important your dream event is to you
              &mdash; celebration is all about great food and a good time.
            </p>

            <p className="story-p">
              When it comes to food, we believe taste, quality and choice are paramount. We
              ensure our customers a first-class gourmet food experience that will leave your
              taste buds zinging with joy. We serve both vegetarian and non-vegetarian foods
              with one singular goal: to make your event truly special. We have served over
              1 Crore+ plates across 3800+ events.
            </p>

            <a href="/about.html" className="btn btn-marigold" style={{ marginTop: 14 }}>
              Our Full Story <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
