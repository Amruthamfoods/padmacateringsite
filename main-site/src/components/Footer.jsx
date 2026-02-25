import { Link } from 'react-router-dom'

export default function Footer({ onViewMenu }) {
  return (
    <footer>
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <img src={`${import.meta.env.BASE_URL}img/logo-large.png`} alt="Padma Catering Services" className="footer-logo" />
              <p className="footer-about">
                Visakhapatnam's most trusted catering service since 1993. Serving 1 Crore+ plates with love, freshness and craftsmanship.
              </p>
              <div className="footer-social">
                <a href="https://wa.me/918686622722" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp" /></a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/menus">Menus &amp; Pricing</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><button className="footer-link-btn" onClick={onViewMenu}>View Menu</button></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-col">
              <h4 className="footer-col-title">Our Services</h4>
              <ul className="footer-links">
                <li><Link to="/services">Weddings & Celebrations</Link></li>
                <li><Link to="/services">Corporate Events</Link></li>
                <li><Link to="/services">Social Gatherings</Link></li>
                <li><Link to="/services">Live Counters</Link></li>
                <li><Link to="/services">Religious Events</Link></li>
                <li><Link to="/services">Institutional Catering</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-col-title">Contact Us</h4>
              <ul className="footer-contact-list">
                <li>
                  <i className="fa-solid fa-phone" />
                  <a href="tel:+918686622722">+91 86 86 622 722</a>
                </li>
                <li>
                  <i className="fa-solid fa-envelope" />
                  <a href="mailto:amruthamfoodsvizag@gmail.com">amruthamfoodsvizag@gmail.com</a>
                </li>
                <li>
                  <i className="fa-brands fa-whatsapp" />
                  <a href="https://wa.me/918686622722" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
                </li>
                <li>
                  <i className="fa-solid fa-location-dot" />
                  <span>Amrutham, Opp Dictionary Kids, MVP Circle, Visakhapatnam – 530017</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Padma Catering Services. All rights reserved.</p>
          <p className="footer-copy" style={{ fontSize: '0.78rem', opacity: 0.5, marginTop: 4 }}>
            Crafted with ♥ in Visakhapatnam
          </p>
        </div>
      </div>
    </footer>
  )
}
