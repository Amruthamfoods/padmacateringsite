import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/api'

// Configurable category limits — admin can extend these
const CATEGORY_LIMITS = {
  'Sweets': { max: 2 },
  'Flavoured Rice': { max: 2 },
  'Curries': { max: 4 },
  'Starters': { max: 3 },
  'Breads': { max: 2 },
  'Dal': { max: 2 },
  'Salads': { max: 2 },
  'Chutneys': { max: 3 },
  'Beverages': { max: 2 },
}
const DEFAULT_MAX = 5

export default function CustomBuilderPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [allItems, setAllItems] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState(null)
  const [dietFilter, setDietFilter] = useState('ALL')
  const [styleFilter, setStyleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [step1, setStep1] = useState(null)

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    if (!s1) { navigate('/details'); return }
    setStep1(JSON.parse(s1))
    Promise.all([api.get('/menu/categories'), api.get('/menu/items')])
      .then(([cats, items]) => {
        setCategories(cats.data)
        setAllItems(items.data)
        setActiveCategory(cats.data[0]?.id || null)
      }).catch(() => toast.error('Failed to load menu')).finally(() => setLoading(false))
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

  function getCategoryMax(catName) {
    return CATEGORY_LIMITS[catName]?.max ?? DEFAULT_MAX
  }

  function toggle(item) {
    const catName = item.category?.name || ''
    const catMax = getCategoryMax(catName)
    const catSelected = allItems.filter(i => i.categoryId === item.categoryId && selectedIds.has(i.id)).length

    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(item.id)) {
        next.delete(item.id)
      } else {
        if (catSelected >= catMax) {
          toast.error(`Maximum ${catMax} items allowed for ${catName || 'this category'}`)
          return prev
        }
        next.add(item.id)
      }
      return next
    })
  }

  function handleContinue() {
    if (selectedIds.size < 5) { toast.error('Please select at least 5 menu items'); return }
    const grouped = {}
    selectedItems.forEach(item => {
      const cat = item.category?.name || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push({ id: item.id, name: item.name, type: item.type, style: item.style, category: cat })
    })
    sessionStorage.setItem('bookingStep2', JSON.stringify(selectedItems.map(i => ({
      id: i.id, name: i.name, type: i.type, style: i.style, category: i.category?.name || '',
    }))))
    navigate('/custom/quote')
  }

  if (loading) return (
    <div className="builder-page" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }} />
    </div>
  )

  const activecat = categories.find(c => c.id === activeCategory)
  const catMax = activecat ? getCategoryMax(activecat.name) : DEFAULT_MAX

  return (
    <div className="builder-page">
      <div className="booking-header">
        <Link to="/details" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Back
        </Link>
        <span className="booking-header-title">Build Your Menu</span>
        <span className="booking-step-label">Step 2</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '50%' }} />
      </div>

      <div style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, padding: '10px 16px', margin: '12px 16px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <i className="fa-solid fa-circle-info" style={{ color: 'var(--gold)', marginRight: 6 }} />
        This is a <strong style={{ color: 'var(--white)' }}>custom quote request</strong> — no prices shown. Our team will send you a personalised quote.
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
            const max = getCategoryMax(cat.name)
            const atMax = selCount >= max
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`builder-cat-btn${activeCategory === cat.id ? ' active' : ''}`}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>{cat.name}</span>
                  {selCount > 0 && (
                    <span style={{ fontSize: '0.68rem', color: atMax ? '#e05c5c' : '#4caf70' }}>
                      {selCount} / {max} {atMax ? '(max)' : ''}
                    </span>
                  )}
                </span>
                {selCount > 0 && <span className="builder-cat-count">{selCount}</span>}
              </button>
            )
          })}
        </div>

        {/* Items grid */}
        <div className="builder-items">
          {activecat && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gold-line)', background: 'var(--dark-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-warm)' }}>{activecat.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max {catMax} items</span>
            </div>
          )}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: 'var(--text-faint)', marginBottom: 12, display: 'block' }} />
              No items match the filter
            </div>
          ) : (
            <div className="builder-items-grid">
              {filteredItems.map(item => {
                const selected = selectedIds.has(item.id)
                const catSel = allItems.filter(i => i.categoryId === item.categoryId && selectedIds.has(i.id)).length
                const atMax = !selected && catSel >= getCategoryMax(item.category?.name || '')
                return (
                  <div key={item.id} className={`item-card${selected ? ' selected' : ''}${atMax ? ' disabled' : ''}`}
                    style={{ opacity: atMax ? 0.5 : 1 }}>
                    <span className={`item-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      {item.description && <p className="item-desc">{item.description}</p>}
                    </div>
                    <button onClick={() => toggle(item)} disabled={atMax} className={`item-btn ${selected ? 'remove' : 'add'}`}>
                      {selected ? 'Remove' : atMax ? 'Max' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="builder-order-panel">
          <div className="builder-order-header">
            <p className="builder-order-title">Your Menu</p>
            <p className="builder-order-subtitle">{selectedIds.size} items · {step1?.guestCount || 100} guests</p>
          </div>
          <div className="builder-order-list">
            {selectedItems.length === 0
              ? <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center', marginTop: 24 }}>No items selected yet</p>
              : selectedItems.map(item => (
                <div key={item.id} className="builder-order-item">
                  <span className={`item-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0 }} />
                  <span className="builder-order-item-name">{item.name}</span>
                </div>
              ))
            }
          </div>
          <div className="builder-order-footer">
            <div style={{ padding: '10px 0', borderTop: '1px solid var(--gold-line)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} />
              Pricing will be provided in your quote
            </div>
            <button onClick={handleContinue} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Continue to Quote <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
            </button>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textAlign: 'center', marginTop: 6 }}>
              Min. 5 items required
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="builder-mobile-bar">
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedIds.size} items selected</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-warm)' }}>Custom quote request</p>
        </div>
        <button onClick={handleContinue} className="btn btn-primary">
          Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  )
}
