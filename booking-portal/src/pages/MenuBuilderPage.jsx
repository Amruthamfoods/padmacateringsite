import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'
import { useBookingStore } from '../store/useBookingStore'
import { getAutoQuantity } from '../lib/quantityHelper'
import ServicePreferenceModal from '../components/ServicePreferenceModal'

export default function MenuBuilderPage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences } = useBookingStore()

  const pkg = menuPreferences.selectedPackage
  const dietPref = eventDetails.dietPreference || 'NON_VEG'
  const guestCount = eventDetails.guestCount || 100

  const [allItems, setAllItems] = useState([])
  const [selected, setSelected] = useState({}) // ruleId → Set<itemId>
  const [openRules, setOpenRules] = useState({})
  const [search, setSearch] = useState({}) // ruleId → string
  const [dietFilter, setDietFilter] = useState({}) // ruleId → 'ALL' | 'VEG' | 'NONVEG'
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    if (!pkg) { navigate('/setup'); return }
    api.get('/menu/items')
      .then(r => {
        const items = dietPref === 'VEG'
          ? r.data.filter(i => i.type === 'VEG')
          : r.data
        setAllItems(items)

        const initSelected = {}
        const initOpen = {}
        const initDiet = {}
        const initSearch = {}
        pkg.categoryRules.forEach((rule, idx) => {
          // Find default items for this rule from the package
          const defaultItems = pkg.items
            .filter(pi => {
              const i = items.find(it => it.id === (pi.menuItemId || pi.menuItem?.id))
              if (rule.allowedItems?.length > 0) {
                return rule.allowedItems.some(ai => ai.menuItemId === (i?.id))
              }
              return i && (rule.categoryId ? i.categoryId === rule.categoryId : true)
            })
            .map(pi => pi.menuItemId || pi.menuItem?.id)
            .slice(0, rule.maxChoices) // Respect max choices

          initSelected[rule.id] = new Set(defaultItems)
          initOpen[rule.id] = idx === 0  // first category open by default
          initDiet[rule.id] = 'ALL'
          initSearch[rule.id] = ''
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
        if (set.size >= rule.maxChoices) {
          if (rule.extraItemPrice <= 0) {
            toast.error(`Max ${rule.maxChoices} items allowed for ${rule.label}`)
            return prev
          } else {
            const itemObj = allItems.find(i => i.id === itemId)
            const extraCharge = itemObj?.price || 0
            if (extraCharge > 0) {
              const confirmMsg = `Adding this item will incur an extra charge of ₹${extraCharge} per person. Proceed?`
              if (!window.confirm(confirmMsg)) {
                return prev
              }
            } else {
              const confirmMsg = `You are adding an extra item beyond the included limit. Proceed?`
              if (!window.confirm(confirmMsg)) {
                return prev
              }
            }
          }
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
        const fallback = getAutoQuantity(rule.label, guestCount)

        let finalQuantity, finalUnit;
        if (item.servingSize && item.servingUnit) {
          finalQuantity = Number((item.servingSize * guestCount).toFixed(2))
          finalUnit = item.servingUnit
        } else {
          finalQuantity = fallback.amount
          finalUnit = fallback.unit
        }

        menuItems.push({
          id: item.id,
          name: item.name,
          categoryId: item.categoryId,
          categoryName: rule.label,
          type: item.type,
          quantity: finalQuantity,
          unit: finalUnit,
          ruleId: rule.id,
          extraCharge: item.price || 0,
        })
      })
    })

    setMenuPreferences({ menuItems })
    setShowReviewModal(true)
  }

  const totalSelected = Object.values(selected).reduce((a, s) => a + s.size, 0)
  const rulesComplete = pkg ? pkg.categoryRules.filter(r => (selected[r.id]?.size || 0) >= r.minChoices).length : 0
  const totalRules = pkg ? pkg.categoryRules.length : 0

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
            (rule.categoryId ? i.categoryId === rule.categoryId : true) &&
            (allowedIds ? allowedIds.has(i.id) : packageItemIds.has(i.id))
          )

          // Apply search filter
          const q = (search[rule.id] || '').toLowerCase()
          if (q) categoryItems = categoryItems.filter(i => i.name.toLowerCase().includes(q))

          // Apply diet filter
          const df = dietFilter[rule.id] || 'ALL'
          if (df === 'VEG') categoryItems = categoryItems.filter(i => i.type === 'VEG')
          if (df === 'NONVEG') categoryItems = categoryItems.filter(i => i.type !== 'VEG')

          const selCount = selected[rule.id]?.size || 0
          const isDone = selCount >= rule.minChoices
          const isOpen = openRules[rule.id]
          const selectedHere = allItems.filter(i => selected[rule.id]?.has(i.id))

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
                        { key: 'ALL', label: 'All' },
                        { key: 'VEG', label: '🟢' },
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
                        · + individual item extra charges apply beyond {rule.maxChoices}
                      </span>
                    )}
                  </p>

                  {/* Food cards (Grid Layout - Tile Style) */}
                  {categoryItems.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', paddingBottom: 8 }}>
                      {q ? 'No items match your search.' : 'No items available for this category.'}
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', paddingBottom: '12px' }}>
                      {categoryItems.map(item => {
                        const isSelected = selected[rule.id]?.has(item.id)
                        const fallback = getAutoQuantity(rule.label, guestCount)
                        const displayQty = item.servingSize && item.servingUnit
                          ? `${(item.servingSize * guestCount).toFixed(1).replace(/\.0$/, '')} ${item.servingUnit}`
                          : `${fallback.amount} ${fallback.unit}`

                        return (
                          <div
                            key={item.id}
                            className={`item-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleItem(rule.id, item.id, rule)}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                              background: isSelected ? '#fff0f0' : '#fff',
                              border: `1px solid ${isSelected ? 'var(--red)' : 'var(--border)'}`,
                              borderRadius: '8px',
                              boxShadow: isSelected ? '0 2px 6px rgba(230, 0, 0, 0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
                              transition: 'all 0.1s ease',
                              padding: '8px 10px',
                              minHeight: '48px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '8px' }}>
                              <span className={`item-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} style={{ flexShrink: 0, marginTop: '2px', alignSelf: 'flex-start' }} />
                              <div>
                                <h4 className="item-name" style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: isSelected ? 'var(--red)' : 'var(--text-dark)', lineHeight: 1.25 }}>
                                  {item.name}
                                </h4>
                                {item.price > 0 && (
                                  <p className="item-extra-charge" style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700, margin: '2px 0 0 0' }}>+₹{item.price}</p>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              {isSelected && (
                                <div style={{ background: '#fef2f2', border: '1px solid var(--red)', borderRadius: '4px', padding: '2px 4px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--red)', whiteSpace: 'nowrap' }}>
                                  {displayQty}
                                </div>
                              )}

                              <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                border: `1.5px solid ${isSelected ? 'var(--red)' : '#d1d5db'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isSelected ? 'var(--red)' : 'transparent',
                                color: '#fff', fontSize: '0.65rem', transition: 'all 0.15s'
                              }}>
                                {isSelected && <i className="fa-solid fa-check" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
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

      {showReviewModal && (
        <ServicePreferenceModal onClose={() => setShowReviewModal(false)} />
      )}
    </div>
  )
}
