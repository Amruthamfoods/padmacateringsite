import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
        {pkg.categoryRules.map((rule, ruleIdx) => {
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
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>{ruleIdx + 1}</span>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)', margin: 0, lineHeight: 1.3 }}>{rule.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                        {selCount > 0 ? `${selCount} of ${rule.maxChoices} selected` : `Choose ${rule.minChoices}–${rule.maxChoices}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {rule.extraItemPrice > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ios-orange)', background: 'rgba(255,149,0,0.1)', padding: '2px 7px', borderRadius: 'var(--r-pill)' }}>+₹{rule.extraItemPrice}</span>
                    )}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
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
                            background: 'rgba(52,199,89,0.10)', border: '1px solid rgba(52,199,89,0.30)',
                            borderRadius: 'var(--r-pill)', padding: '4px 8px 4px 6px',
                            fontSize: 12, fontWeight: 500, color: 'var(--primary-dark)',
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
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
                      <div className="menu-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                        {categoryItems.map(item => {
                          const isSelected = selected[rule.id]?.has(item.id)
                          const fallback = getAutoQuantity(rule.label, guestCount)
                          const displayQty = item.servingSize && item.servingUnit
                            ? `${(item.servingSize * guestCount).toFixed(1).replace(/\.0$/, '')} ${item.servingUnit}`
                            : `${fallback.amount} ${fallback.unit}`

                          const palettes = [
                            { bg: '#E8F5E9', accent: '#1B5E20' },
                            { bg: '#FFF3E0', accent: '#E65100' },
                            { bg: '#F3E5F5', accent: '#6A1B9A' },
                            { bg: '#E3F2FD', accent: '#0D47A1' },
                            { bg: '#FFF8E1', accent: '#F57F17' },
                            { bg: '#FCE4EC', accent: '#B71C1C' },
                            { bg: '#E0F7FA', accent: '#006064' },
                            { bg: '#F9FBE7', accent: '#33691E' },
                          ]
                          const pal = palettes[item.name.charCodeAt(0) % palettes.length]

                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItem(rule.id, item.id, rule)}
                              style={{
                                cursor: 'pointer',
                                background: isSelected ? 'rgba(52,199,89,0.08)' : 'var(--bg)',
                                borderRadius: 'var(--r-md)',
                                overflow: 'hidden',
                                border: `1.5px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                                boxShadow: isSelected ? '0 2px 10px rgba(52,199,89,0.18)' : 'var(--shadow-sm)',
                                transition: 'all 0.15s var(--ease)',
                              }}
                            >
                              {/* Image area */}
                              <div style={{
                                background: isSelected ? 'var(--primary)' : pal.bg,
                                height: 72,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                              }}>
                                {/* Diet dot */}
                                <span style={{
                                  position: 'absolute', top: 6, left: 6,
                                  width: 9, height: 9, borderRadius: '50%',
                                  background: item.type === 'VEG' ? '#34C759' : '#FF3B30',
                                  border: '1.5px solid white',
                                }} />
                                {isSelected
                                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  : <span style={{ fontSize: 28, fontWeight: 800, color: pal.accent, fontFamily: 'var(--font)' }}>{item.name.charAt(0)}</span>
                                }
                              </div>
                              {/* Info area */}
                              <div style={{ padding: '8px 9px 10px' }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--heading)', margin: '0 0 5px', lineHeight: 1.3 }}>{item.name}</p>
                                {isSelected ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-dark)', background: 'rgba(52,199,89,0.15)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                                    {displayQty}
                                  </span>
                                ) : (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {item.price > 0
                                      ? <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ios-orange)' }}>+₹{item.price}</span>
                                      : <span />
                                    }
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    </div>
                                  </div>
                                )}
                              </div>
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
