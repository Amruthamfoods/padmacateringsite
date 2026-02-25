import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function MenuBuilderPage() {
  const navigate = useNavigate()
  const [step1, setStep1] = useState(null)
  const [categories, setCategories] = useState([])
  const [allItems, setAllItems] = useState([])
  const [packages, setPackages] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState(null)
  const [dietFilter, setDietFilter] = useState('ALL')
  const [styleFilter, setStyleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = sessionStorage.getItem('bookingStep1')
    if (!saved) { navigate('/booking'); return }
    setStep1(JSON.parse(saved))
    Promise.all([
      api.get('/menu/categories'),
      api.get('/menu/items'),
      api.get('/menu/packages'),
    ]).then(([cats, items, pkgs]) => {
      setCategories(cats.data)
      setAllItems(items.data)
      setPackages(pkgs.data)
      setActiveCategory(cats.data[0]?.id || null)
    }).catch(() => toast.error('Failed to load menu'))
    .finally(() => setLoading(false))
  }, [navigate])

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeCategory && item.categoryId !== activeCategory) return false
      if (dietFilter !== 'ALL' && item.type !== dietFilter) return false
      if (styleFilter !== 'ALL' && item.style !== styleFilter) return false
      return true
    })
  }, [allItems, activeCategory, dietFilter, styleFilter])

  const selectedItems = useMemo(() => allItems.filter(i => selectedIds.has(i.id)), [allItems, selectedIds])
  const guestCount = step1?.guestCount || 100
  const pricePerPerson = selectedItems.reduce((s, i) => s + i.price, 0)
  const estimatedTotal = pricePerPerson * guestCount

  function toggle(item) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(item.id) ? next.delete(item.id) : next.add(item.id)
      return next
    })
  }

  function loadPackage(pkg) {
    const ids = pkg.items.map(pi => pi.menuItemId || pi.menuItem?.id).filter(Boolean)
    setSelectedIds(new Set(ids))
    toast.success(`Loaded: ${pkg.name}`)
  }

  function handleFinalize() {
    if (selectedIds.size < 3) { toast.error('Please select at least 3 menu items'); return }
    sessionStorage.setItem('bookingStep2', JSON.stringify(selectedItems.map(i => ({
      id: i.id, name: i.name, price: i.price, type: i.type, style: i.style,
      category: i.category?.name || '',
    }))))
    navigate('/booking/summary')
  }

  if (loading) return (
    <div className="builder-page" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: 16, display: 'block' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading menu…</p>
      </div>
    </div>
  )

  return (
    <div className="builder-page">
      {/* Header */}
      <div className="booking-header">
        <Link to="/booking" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Build Your Menu</span>
        <span className="booking-step-label">Step 2 / 3</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '66%' }} />
      </div>

      {/* Preset packages */}
      <div className="builder-toolbar">
        <p className="builder-toolbar-label">Quick Start with a Package</p>
        <div className="builder-packages">
          {packages.map(pkg => (
            <button key={pkg.id} onClick={() => loadPackage(pkg)} className="builder-pkg-btn">
              {pkg.name} — ₹{pkg.basePrice}/pp
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="builder-filters">
        <div className="filter-toggle">
          {[['ALL', 'All'], ['VEG', 'Veg'], ['NON_VEG', 'Non-Veg']].map(([val, lbl]) => (
            <button key={val} onClick={() => setDietFilter(val)} className={`filter-btn${dietFilter === val ? ' active' : ''}`}>
              {lbl}
            </button>
          ))}
        </div>
        <select value={styleFilter} onChange={e => setStyleFilter(e.target.value)} className="filter-select">
          <option value="ALL">All Cuisines</option>
          <option value="ANDHRA">Andhra</option>
          <option value="NORTH_INDIAN">North Indian</option>
          <option value="FUSION">Fusion</option>
        </select>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="builder-layout">
        {/* Category sidebar */}
        <div className="builder-cat-sidebar">
          {categories.map(cat => {
            const selCount = allItems.filter(i => i.categoryId === cat.id && selectedIds.has(i.id)).length
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`builder-cat-btn${activeCategory === cat.id ? ' active' : ''}`}>
                <span>{cat.name}</span>
                {selCount > 0 && <span className="builder-cat-count">{selCount}</span>}
              </button>
            )
          })}
        </div>

        {/* Items grid */}
        <div className="builder-items">
          {filteredItems.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: 'var(--text-faint)', marginBottom: 12, display: 'block' }} />
                No items match the filter
              </div>
            )
            : (
              <div className="builder-items-grid">
                {filteredItems.map(item => {
                  const selected = selectedIds.has(item.id)
                  return (
                    <div key={item.id} className={`item-card${selected ? ' selected' : ''}`}>
                      <span className={`item-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                      <div className="item-info">
                        <p className="item-name">{item.name}</p>
                        {item.description && <p className="item-desc">{item.description}</p>}
                        <p className="item-price">₹{item.price}/person</p>
                      </div>
                      <button onClick={() => toggle(item)} className={`item-btn ${selected ? 'remove' : 'add'}`}>
                        {selected ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
        </div>

        {/* Right order panel (desktop) */}
        <div className="builder-order-panel">
          <div className="builder-order-header">
            <p className="builder-order-title">Your Menu</p>
            <p className="builder-order-subtitle">{selectedIds.size} items · {guestCount} guests</p>
          </div>
          <div className="builder-order-list">
            {selectedItems.length === 0
              ? <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center', marginTop: 24 }}>No items selected yet</p>
              : selectedItems.map(item => (
                <div key={item.id} className="builder-order-item">
                  <span className="builder-order-item-name">{item.name}</span>
                  <span className="builder-order-item-price">₹{item.price}</span>
                </div>
              ))
            }
          </div>
          <div className="builder-order-footer">
            <div className="builder-order-row">
              <span className="lbl">Per person</span>
              <span className="val">₹{pricePerPerson}</span>
            </div>
            <div className="builder-order-row">
              <span className="lbl">Est. total</span>
              <span className="val">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handleFinalize} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Finalize Menu <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="builder-mobile-bar">
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedIds.size} items · ₹{pricePerPerson}/pp</p>
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.1rem' }}>
            Est. ₹{estimatedTotal.toLocaleString('en-IN')}
          </p>
        </div>
        <button onClick={handleFinalize} className="btn btn-primary">
          Finalize <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  )
}
