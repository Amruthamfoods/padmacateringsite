import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'
import { getAutoQuantity } from '../lib/quantityHelper'

export default function MenuBuilderPage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences } = useBookingStore()

  const pkg        = menuPreferences.selectedPackage
  const dietPref   = eventDetails.dietPreference || 'NON_VEG'
  const guestCount = eventDetails.guestCount || 100

  const [allItems,   setAllItems]   = useState([])
  const [selected,   setSelected]   = useState({}) // ruleId → Set<itemId>
  const [openRules,  setOpenRules]  = useState({})
  const [search,     setSearch]     = useState({}) // ruleId → string
  const [dietFilter, setDietFilter] = useState({}) // ruleId → 'ALL' | 'VEG' | 'NONVEG'
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!pkg) { navigate('/setup'); return }
    api.get('/menu/items')
      .then(r => {
        const items = dietPref === 'VEG'
          ? r.data.filter(i => i.type === 'VEG')
          : r.data
        setAllItems(items)

        const initSelected  = {}
        const initOpen      = {}
        const initDiet      = {}
        const initSearch    = {}
        pkg.categoryRules.forEach((rule, idx) => {
          initSelected[rule.id] = new Set()
          initOpen[rule.id]     = idx === 0  // first category open by default
          initDiet[rule.id]     = 'ALL'
          initSearch[rule.id]   = ''
        })
        setSelected(initSelected)
        setOpenRules(initOpen)
        setDietFilter(initDiet)
        setSearch(initSearch)
      })
      .catch(() => toast.error('Failed to load menu items'))
      .finally(() => setLoading(false))
  }, [pkg, navigate, dietPref])

  const packageItemIds = useMemo(() => {
    if (!pkg) return new Set()
    return new Set(pkg.items.map(pi => pi.menuItemId || pi.menuItem?.id).filter(Boolean))
  }, [pkg])

  function toggleItem(ruleId, itemId, rule) {
    setSelected(prev => {
      const set = new Set(prev[ruleId] || [])
      if (set.has(itemId)) {
        set.delete(itemId)
      } else {
        if (set.size >= rule.maxChoices && rule.extraItemPrice <= 0) {
          toast.error(`Max ${rule.maxChoices} items allowed for ${rule.label}`)
          return prev
        }
        if (set.size >= rule.maxChoices && rule.extraItemPrice > 0) {
          toast(`Extra item: +₹${rule.extraItemPrice}/person`, { icon: '➕' })
        }
        set.add(itemId)
      }
      return { ...prev, [ruleId]: set }
    })
  }

  function allSatisfied() {
    if (!pkg) return false
    return pkg.categoryRules.every(r => (selected[r.id]?.size || 0) >= r.minChoices)
  }

  function handleContinue() {
    if (!allSatisfied()) {
      const missing = pkg.categoryRules.filter(r => (selected[r.id]?.size || 0) < r.minChoices)
      toast.error(`Complete: ${missing.map(r => r.label).join(', ')}`)
      return
    }

    // Build menu items with auto-quantities
    const menuItems = []
    pkg.categoryRules.forEach(rule => {
      const ruleItems = allItems.filter(i => selected[rule.id]?.has(i.id))
      ruleItems.forEach(item => {
        const { amount, unit } = getAutoQuantity(rule.label, guestCount)
        menuItems.push({
          id:          item.id,
          name:        item.name,
          categoryId:  item.categoryId,
          categoryName: rule.label,
          type:        item.type,
          quantity:    amount,
          unit,
          ruleId:      rule.id,
          extraCharge: item.price || 0,
        })
      })
    })

    setMenuPreferences({ menuItems })
    navigate('/review')
  }

  const totalSelected  = Object.values(selected).reduce((a, s) => a + s.size, 0)
  const rulesComplete  = pkg ? pkg.categoryRules.filter(r => (selected[r.id]?.size || 0) >= r.minChoices).length : 0
  const totalRules     = pkg ? pkg.categoryRules.length : 0

  if (loading) return (
    <div className="booking-page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <i className="fa-solid fa-circle-notch spin" style={{ fontSize: '2rem', color: 'var(--red)' }} />
    </div>
  )

  if (!pkg) return null

  const dietLabel = dietPref === 'VEG' ? '🟢 Pure Veg' : dietPref === 'SEPARATE' ? '🌿🍗 Separate' : '🔴 Non-Veg'

  return (
    <div className="booking-page-wrap">
      <BookingSteps />

      <div className="booking-center" style={{ maxWidth: 1100, paddingBottom: 100 }}>
        <h1 className="booking-page-title">Build Your Menu</h1>
        <p className="booking-page-sub">{pkg.name} · {dietLabel} · {guestCount} guests</p>

        {/* Category accordions */}
        {pkg.categoryRules.map(rule => {
          const allowedIds = rule.allowedItems?.length
            ? new Set(rule.allowedItems.map(ai => ai.menuItemId))
            : null

          let categoryItems = allItems.filter(i =>
            i.categoryId === rule.categoryId &&
            (allowedIds ? allowedIds.has(i.id) : packageItemIds.has(i.id))
          )

          // Apply search filter
          const q = (search[rule.id] || '').toLowerCase()
          if (q) categoryItems = categoryItems.filter(i => i.name.toLowerCase().includes(q))

          // Apply diet filter
          const df = dietFilter[rule.id] || 'ALL'
          if (df === 'VEG')    categoryItems = categoryItems.filter(i => i.type === 'VEG')
          if (df === 'NONVEG') categoryItems = categoryItems.filter(i => i.type !== 'VEG')

          const selCount      = selected[rule.id]?.size || 0
          const isDone        = selCount >= rule.minChoices
          const isOpen        = openRules[rule.id]
          const selectedHere  = allItems.filter(i => selected[rule.id]?.has(i.id))

          return (
            <div key={rule.id} className="menu-accordion-section" style={{ marginBottom: 12 }}>

              {/* Accordion header */}
              <div
                className="menu-accordion-header"
                onClick={() => setOpenRules(o => ({ ...o, [rule.id]: !o[rule.id] }))}
              >
                <div className="menu-accordion-title">
                  <h4>{rule.label}</h4>
                  <span className={`menu-count-badge ${isDone ? 'done' : selCount > 0 ? '' : ''}`}>
                    {selCount}/{rule.maxChoices}
                  </span>
                  {isDone && <i className="fa-solid fa-circle-check" style={{ color: '#28a745', fontSize: '0.85rem' }} />}
                </div>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }} />
              </div>

              {isOpen && (
                <div className="menu-accordion-body">

                  {/* Selected chips row */}
                  {selectedHere.length > 0 && (
                    <div className="selected-chips">
                      {selectedHere.map(item => (
                        <span key={item.id} className="selected-chip">
                          <span className={`diet-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                          {item.name}
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); toggleItem(rule.id, item.id, rule) }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search + diet filter row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                    <div className="search-input-bar" style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                      <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-faint)', fontSize: '0.78rem', flexShrink: 0 }} />
                      <input
                        placeholder={`Search ${rule.label}…`}
                        value={search[rule.id] || ''}
                        onChange={e => setSearch(s => ({ ...s, [rule.id]: e.target.value }))}
                      />
                    </div>

                    {/* Diet toggle buttons */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {[
                        { key: 'ALL',    label: 'All' },
                        { key: 'VEG',    label: '🟢' },
                        { key: 'NONVEG', label: '🔴' },
                      ].map(f => {
                        const isActive = (dietFilter[rule.id] || 'ALL') === f.key
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={e => { e.stopPropagation(); setDietFilter(d => ({ ...d, [rule.id]: f.key })) }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.72rem', fontWeight: 600,
                              border: `1.5px solid ${isActive ? 'var(--text-dark)' : 'var(--border)'}`,
                              background: isActive ? 'var(--text-dark)' : 'var(--surface)',
                              color: isActive ? '#fff' : 'var(--text-muted)',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            {f.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Hint */}
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    Choose {rule.minChoices}–{rule.maxChoices} items
                    {rule.extraItemPrice > 0 && (
                      <span style={{ color: 'var(--red)', marginLeft: 6 }}>
                        · +₹{rule.extraItemPrice}/person for extra items
                      </span>
                    )}
                  </p>

                  {/* Food cards */}
                  {categoryItems.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingBottom: 8 }}>
                      {q ? 'No items match your search.' : 'No items available for this category.'}
                    </p>
                  ) : (
                    <div className="food-cards-scroll-wrap">
                      <div className="food-cards-scroll">
                        {categoryItems.map(item => {
                          const isSelected = selected[rule.id]?.has(item.id)
                          return (
                            <div
                              key={item.id}
                              className={`food-card-circle ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleItem(rule.id, item.id, rule)}
                            >
                              <div className="food-card-thumb">
                                {item.image
                                  ? <img src={item.image} alt={item.name} />
                                  : <span className="food-card-emoji">🍛</span>
                                }
                                <div className="food-card-check">
                                  <i className="fa-solid fa-check" />
                                </div>
                                <span className={`food-card-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                              </div>
                              <p className="food-card-name">{item.name}</p>
                              {item.price > 0 && (
                                <p className="food-card-price">+₹{item.price}/plate</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky bottom bar */}
      <div className="booking-bottom-bar">
        <Link to="/setup" className="btn-secondary" style={{ flexShrink: 0 }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back
        </Link>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
          </p>
          <p style={{ fontSize: '0.75rem', color: rulesComplete === totalRules ? '#28a745' : 'var(--text-muted)' }}>
            {rulesComplete}/{totalRules} categories complete
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!allSatisfied()}
          style={{ flexShrink: 0 }}
        >
          Review My Menu <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
        </button>
      </div>
    </div>
  )
}
