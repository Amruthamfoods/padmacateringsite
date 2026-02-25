export default function MenuModal({ onClose }) {
  return (
    <div className="menu-modal-overlay" onClick={onClose}>
      <div className="menu-modal" onClick={e => e.stopPropagation()}>
        <button className="menu-modal-close" onClick={onClose} aria-label="Close menu">
          <i className="fa-solid fa-xmark" />
        </button>
        <div className="menu-modal-header">
          <span className="section-label" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>Padma Catering</span>
          <h3 className="menu-modal-title">Our Menu</h3>
        </div>
        <div className="menu-modal-frame">
          <iframe
            src="https://heyzine.com/flip-book/2ac739c577.html"
            title="Padma Catering Menu"
            allowFullScreen
          />
        </div>
        <div className="menu-modal-footer">
          <a
            href="https://heyzine.com/flip-book/2ac739c577.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            <i className="fa-solid fa-up-right-from-square" /> Open Full Screen
          </a>
        </div>
      </div>
    </div>
  )
}
