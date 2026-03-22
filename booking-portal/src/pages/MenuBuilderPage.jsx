import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'
import { getAutoQuantity } from '../lib/quantityHelper'
import ServicePreferenceModal from '../components/ServicePreferenceModal'

export default function MenuBuilderPage() {
  const navigate = useNavigate()
  const { eventDetails, menuPreferences, setMenuPreferences } = useBookingStore()

  const pkg = menuPreferences.selectedPackage
  const dietPref = eventDetails.dietPreference || 'NON_VEG'
  const guestCount = eventDetails.guestCount || 100

  const location = useLocation()
  const livePkgRef = useRef(pkg)   // always current — avoids stale closure in handleContinue
  const [allItems, setAllItems] = useState([])
  const [selected, setSelected] = useState({}) // ruleId → Set<itemId>
  const [openRules, setOpenRules] = useState({})
  const [search, setSearch] = useState({}) // ruleId → string
  const [dietFilter, setDietFilter] = useState({}) // ruleId → 'ALL' | 'VEG' | 'NONVEG'
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    if (location.state?.openServiceModal) setShowReviewModal(true)
  }, [location.state])

  useEffect(() => {
    if (!pkg) { navigate('/setup'); return }
    // Fetch fresh package (gets latest qtyPerPerson) + items in parallel
    Promise.all([
      api.get('/menu/packages'),
      api.get('/menu/items'),
    ]).then(([pkgRes, itemsRes]) => {
      const freshPkg = pkgRes.data.find(p => p.id === pkg.id) || pkg
      livePkgRef.current = freshPkg

      const items = dietPref === 'VEG'
        ? itemsRes.data.filter(i => i.type === 'VEG')
        : itemsRes.data
      setAllItems(items)

      const initSelected = {}
      const initOpen = {}
      const initDiet = {}
      const initSearch = {}
      const savedMenuItems = menuPreferences.menuItems || []
      freshPkg.categoryRules.forEach((rule, idx) => {
        // Restore previously saved selections if they exist and are still valid
        const savedForRule = savedMenuItems
          .filter(si => si.ruleId === rule.id && items.some(it => it.id === si.id))
          .map(si => si.id)

        if (savedForRule.length >= rule.minChoices) {
          initSelected[rule.id] = new Set(savedForRule)
        } else {
          const defaultItems = freshPkg.items
            .filter(pi => {
              const i = items.find(it => it.id === (pi.menuItemId || pi.menuItem?.id))
              if (rule.allowedItems?.length > 0) {
                return rule.allowedItems.some(ai => ai.menuItemId === (i?.id))
              }
              return i && (rule.categoryId ? i.categoryId === rule.categoryId : true)
            })
            .map(pi => pi.menuItemId || pi.menuItem?.id)
            .slice(0, rule.maxChoices)
          initSelected[rule.id] = new Set(defaultItems)
        }
        initOpen[rule.id] = true
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
  }, [pkg?.id, navigate, dietPref])

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
    return livePkgRef.current.categoryRules.every(r => (selected[r.id]?.size || 0) >= r.minChoices)
  }

  function handleContinue() {
    if (!allSatisfied()) {
      const missing = livePkgRef.current.categoryRules.filter(r => (selected[r.id]?.size || 0) < r.minChoices)
      toast.error(`Complete: ${missing.map(r => r.label).join(', ')}`)
      return
    }

    // Build menu items with auto-quantities
    const menuItems = []
    livePkgRef.current.categoryRules.forEach(rule => {
      const ruleItems = allItems.filter(i => selected[rule.id]?.has(i.id))
      ruleItems.forEach(item => {
        const fallback = getAutoQuantity(rule.label, guestCount)

        // Rule-level qty overrides item-level servingSize
        const srcQty = rule.qtyPerPerson || item.servingSize
        const srcUnit = rule.qtyPerPerson ? (rule.qtyUnit || 'gm') : item.servingUnit
        let finalQuantity, finalUnit;
        if (srcQty && srcUnit) {
          const raw = srcQty * guestCount
          if (srcUnit === 'gm') {
            // round to nearest 100g, display as kg
            finalQuantity = Math.round(raw / 100) * 100 / 1000
            finalUnit = 'kg'
          } else if (srcUnit === 'kg') {
            // round to nearest 0.1 kg
            finalQuantity = Math.round(raw * 10) / 10
            finalUnit = 'kg'
          } else {
            // pcs — round to nearest whole number
            finalQuantity = Math.round(raw)
            finalUnit = 'pcs'
          }
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
          baseQuantity: finalQuantity,
          pricePerUnit: item.price || 0,
          ruleId: rule.id,
          extraCharge: 0,
        })
      })
    })

    setMenuPreferences({ menuItems })
    setShowReviewModal(true)
  }

  const totalSelected = Object.values(selected).reduce((a, s) => a + s.size, 0)
  const rulesComplete = livePkgRef.current ? livePkgRef.current.categoryRules.filter(r => (selected[r.id]?.size || 0) >= r.minChoices).length : 0
  const totalRules = livePkgRef.current ? livePkgRef.current.categoryRules.length : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: 'var(--bg-page)' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  if (!pkg) return null

  const dietLabel = dietPref === 'VEG' ? 'Pure Veg' : dietPref === 'SEPARATE' ? 'Mixed' : 'Non-Veg'
  const dietDot = dietPref === 'VEG' ? '#34C759' : dietPref === 'SEPARATE' ? '#FF9500' : '#FF3B30'

  return (
    <div className="page-outer" style={{ paddingBottom: 80 }}>
      <style>{'@media(min-width:900px){.menu-items-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important;}}'}</style>

      {/* Page header */}
      <div style={{ borderBottom: '0.5px solid var(--separator-nm)', padding: '20px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>{pkg.name}</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', margin: 0, letterSpacing: '-0.02em' }}>Build Your Menu</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--fill-tertiary)', borderRadius: 'var(--r-pill)', padding: '6px 12px', fontSize: 13, fontWeight: 500, color: 'var(--body-text)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dietDot, flexShrink: 0 }} />
              {dietLabel}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--fill-tertiary)', borderRadius: 'var(--r-pill)', padding: '6px 12px', fontSize: 13, fontWeight: 500, color: 'var(--body-text)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              {guestCount} guests
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: rulesComplete === totalRules ? 'var(--primary-bg)' : 'var(--fill-tertiary)', borderRadius: 'var(--r-pill)', padding: '6px 12px', fontSize: 13, fontWeight: 600, color: rulesComplete === totalRules ? 'var(--primary)' : 'var(--muted)' }}>
              {rulesComplete}/{totalRules} complete
            </span>
          </div>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 24 }}>

        {/* Category accordions */}
        {(livePkgRef.current?.categoryRules || []).map((rule, ruleIdx) => {
          const allowedIds = rule.allowedItems?.length
            ? new Set(rule.allowedItems.map(ai => ai.menuItemId))
            : null

          let categoryItems = allItems.filter(i =>
            (rule.categoryId ? i.categoryId === rule.categoryId : true) &&
            (allowedIds ? allowedIds.has(i.id) : packageItemIds.has(i.id))
          )

          const q = (search[rule.id] || '').toLowerCase()
          if (q) categoryItems = categoryItems.filter(i => i.name.toLowerCase().includes(q))

          const df = dietFilter[rule.id] || 'ALL'
          if (df === 'VEG') categoryItems = categoryItems.filter(i => i.type === 'VEG')
          if (df === 'NONVEG') categoryItems = categoryItems.filter(i => i.type !== 'VEG')

          const selCount = selected[rule.id]?.size || 0
          const isDone = selCount >= rule.minChoices
          const isOpen = openRules[rule.id]
          const selectedHere = allItems.filter(i => selected[rule.id]?.has(i.id))

          // Extra cost: sort selected premiumPrices asc, first minChoices are free, rest are charged
          const selectedPrices = selectedHere
            .map(item => (rule.allowedItems || []).find(a => a.menuItemId === item.id)?.premiumPrice || 0)
            .sort((a, b) => a - b)
          const extraCount = Math.max(0, selCount - rule.minChoices)
          const extraCost = selectedPrices.slice(rule.minChoices).reduce((s, p) => s + p, 0)

          return (
            <div key={rule.id} style={{ marginBottom: 16 }}>

              {/* iOS section label */}
              <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 4px', marginBottom: 8 }}>
                {ruleIdx + 1}. {rule.label}
              </p>

              {/* iOS card */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

                {/* Accordion header */}
                <div
                  onClick={() => setOpenRules(o => ({ ...o, [rule.id]: !o[rule.id] }))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', cursor: 'pointer', minHeight: 44 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isDone ? 'var(--primary)' : 'var(--fill-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isDone
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>{ruleIdx + 1}</span>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)', margin: 0, lineHeight: 1.3 }}>{rule.label}</p>

                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Selection counter */}
                    <span style={{
                      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                      color: extraCount > 0 ? 'var(--ios-orange)' : selCount > 0 ? 'var(--primary)' : 'var(--muted)',
                    }}>
                      {selCount}/{rule.minChoices}
                      {extraCount > 0 && extraCost > 0 && ` +₹${extraCost}`}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '0.5px solid var(--separator-nm)', padding: '14px 16px' }}>

                    {/* Selected chips */}
                    {selectedHere.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {selectedHere.map(item => (
                          <span key={item.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'var(--primary-bg)', border: '1px solid var(--primary-light)',
                            borderRadius: 'var(--r-pill)', padding: '4px 8px 4px 6px',
                            fontSize: 12, fontWeight: 500, color: 'var(--primary)',
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'VEG' ? '#34C759' : '#FF3B30', flexShrink: 0 }} />
                            {item.name}
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); toggleItem(rule.id, item.id, rule) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, lineHeight: 1, fontSize: 14, marginLeft: 2 }}
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search + diet filter */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'var(--fill-tertiary)', borderRadius: 'var(--r)', padding: '8px 10px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                          placeholder={`Search ${rule.label}`}
                          value={search[rule.id] || ''}
                          onChange={e => setSearch(s => ({ ...s, [rule.id]: e.target.value }))}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--heading)', flex: 1, minWidth: 0 }}
                        />
                      </div>
                      {/* iOS segmented control for diet */}
                      <div style={{ display: 'flex', background: 'var(--fill-tertiary)', borderRadius: 'var(--r)', padding: 2, gap: 2, flexShrink: 0 }}>
                        {[{ key: 'ALL', label: 'All' }, { key: 'VEG', label: '🟢' }, { key: 'NONVEG', label: '🔴' }].map(f => {
                          const isActive = (dietFilter[rule.id] || 'ALL') === f.key
                          return (
                            <button
                              key={f.key}
                              type="button"
                              onClick={e => { e.stopPropagation(); setDietFilter(d => ({ ...d, [rule.id]: f.key })) }}
                              style={{
                                padding: '5px 9px', borderRadius: 'calc(var(--r) - 2px)',
                                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                                fontSize: 12, fontWeight: isActive ? 600 : 500,
                                background: isActive ? 'var(--bg)' : 'transparent',
                                color: 'var(--heading)',
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                                transition: 'all 0.15s',
                              }}
                            >{f.label}</button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Items grid */}
                    {categoryItems.length === 0 ? (
                      <p style={{ color: 'var(--muted)', fontSize: 14, padding: '8px 0', textAlign: 'center' }}>
                        {q ? 'No items match search.' : 'No items in this category.'}
                      </p>
                    ) : (
                      <div className="menu-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6 }}>
                        {categoryItems.map(item => {
                          const isSelected = selected[rule.id]?.has(item.id)


                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItem(rule.id, item.id, rule)}
                              style={{
                                cursor: 'pointer',
                                background: isSelected ? 'var(--primary-bg)' : 'var(--bg)',
                                borderRadius: 'var(--r)',
                                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--separator-nm)'}`,
                                boxShadow: isSelected ? '0 0 0 1px var(--primary-glow)' : 'none',
                                transition: 'all 0.12s var(--ease)',
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 10px', minHeight: 40,
                              }}
                            >
                              {/* Diet dot */}
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: item.type === 'VEG' ? '#34C759' : '#FF3B30',
                              }} />
                              {/* Name */}
                              <span style={{
                                flex: 1, fontSize: 13, fontWeight: 500,
                                color: isSelected ? 'var(--primary-dark)' : 'var(--heading)',
                                lineHeight: 1.3, minWidth: 0,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{item.name}</span>
                              {/* Right side */}
                              {isSelected ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                              ) : (
                                <>
                                  {item.price > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ios-orange)', flexShrink: 0 }}>+₹{item.price}</span>
                                  )}
                                  <div style={{
                                    width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky bottom bar */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 100,
        background: 'rgba(249,249,249,0.94)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '0.5px solid rgba(60,60,67,0.18)',
        padding: '12px 24px 16px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/setup" style={{
            flexShrink: 0, padding: '10px 20px',
            borderRadius: 'var(--r-pill)', background: 'var(--fill-tertiary)',
            color: 'var(--body-text)', textDecoration: 'none',
            fontWeight: 500, fontSize: 15, fontFamily: 'var(--font)',
          }}>← Back</Link>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)', margin: 0 }}>
              {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
            </p>
            <p style={{ fontSize: 13, color: rulesComplete === totalRules ? 'var(--primary)' : 'var(--muted)', margin: '1px 0 0' }}>
              {rulesComplete}/{totalRules} categories complete
            </p>
          </div>

          <button
            onClick={handleContinue}
            disabled={!allSatisfied()}
            style={{
              flexShrink: 0, padding: '12px 28px',
              borderRadius: 'var(--r-pill)',
              background: allSatisfied() ? 'var(--primary)' : 'var(--primary-light)',
              color: '#fff', border: 'none',
              fontWeight: 600, fontSize: 16, cursor: allSatisfied() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font)', transition: 'all 0.15s var(--ease)',
              boxShadow: allSatisfied() ? 'var(--shadow-green)' : 'none',
            }}
          >Review Menu →</button>
        </div>
      </div>

      {showReviewModal && (
        <ServicePreferenceModal onClose={() => setShowReviewModal(false)} />
      )}

      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
