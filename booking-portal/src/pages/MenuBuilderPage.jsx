import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import BookingSteps from '../components/BookingSteps'

const ADDONS = [
  { id: 'cutlery', name: 'Dining Kit (Plate, Cutlery, Tissues)', price: 20, unit: 'per person', icon: '🍽️' },
  { id: 'water',   name: 'Water Bottle (500ml)',                  price: 10, unit: 'per person', icon: '💧' },
  { id: 'spoon',   name: 'Serving Spoon',                         price: 20, unit: 'per spoon',  icon: '🥄', qty: true },
]

function getTierPrice(tiers, guestCount) {
  if (!tiers?.length) return null
  const sorted = [...tiers].sort((a, b) => b.minGuests - a.minGuests)
  return sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
}

export default function MenuBuilderPage() {
  const { pkgId } = useParams()
  const navigate  = useNavigate()

  const [pkg, setPkg]           = useState(null)
  const [allItems, setAllItems] = useState([])
  const [selected, setSelected] = useState({})
  const [openRules, setOpenRules] = useState({})
  const [loading, setLoading]   = useState(true)
  const [showAddons, setShowAddons] = useState(false)
  const [addonState, setAddonState] = useState({ cutlery: false, water: false, spoon: 0 })

  const guestCount = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('bookingStep1') || '{}').guestCount || 100 } catch { return 100 }
  }, [])

  const dietPref = sessionStorage.getItem('dietPreference') || 'NON_VEG'

  useEffect(() => {
    Promise.all([api.get('/menu/packages'), api.get('/menu/items')])
      .then(([pkgs, items]) => {
        const found = pkgs.data.find(p => p.id === parseInt(pkgId))
        if (!found) { toast.error('Package not found'); navigate('/packages'); return }
        setPkg(found)
        const dietItems = items.data.filter(item =>
          dietPref === 'VEG' ? item.type === 'VEG' : true
        )
        setAllItems(dietItems)
        const init = {}
        const openInit = {}
        found.categoryRules.forEach((r, i) => { init[r.id] = new Set(); openInit[r.id] = i === 0 })
        setSelected(init)
        setOpenRules(openInit)
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [pkgId, navigate, dietPref])

  const activeTier    = pkg ? getTierPrice(pkg.pricingTiers, guestCount) : null
  const pricePerPerson = activeTier?.pricePerPerson || 0
  const baseTotal      = pricePerPerson * guestCount

  const packageItemIds = useMemo(() => {
    if (!pkg) return new Set()
    return new Set(pkg.items.map(pi => pi.menuItemId || pi.menuItem?.id).filter(Boolean))
  }, [pkg])

  function toggleItem(ruleId, itemId, maxChoices) {
    setSelected(prev => {
      const next = { ...prev }
      const set  = new Set(prev[ruleId] || [])
      if (set.has(itemId)) {
        set.delete(itemId)
      } else {
        if (set.size >= maxChoices) {
          toast.error(`Max ${maxChoices} items for this category`)
          return prev
        }
        set.add(itemId)
      }
      next[ruleId] = set
      return next
    })
  }

  function allSatisfied() {
    if (!pkg) return false
    return pkg.categoryRules.every(r => (selected[r.id]?.size || 0) >= r.minChoices)
  }

  function handleContinue() {
    if (!allSatisfied()) { toast.error('Please complete all menu selections'); return }
    setShowAddons(true)
  }

  function handleAddonsDone() {
    const allSelectedIds = new Set()
    Object.values(selected).forEach(s => s.forEach(id => allSelectedIds.add(id)))
    const selectedItems = allItems.filter(i => allSelectedIds.has(i.id)).map(i => ({
      id: i.id, name: i.name, price: i.price, type: i.type, category: i.category?.name || '',
    }))
    const addonCost =
      (addonState.cutlery ? 20 * guestCount : 0) +
      (addonState.water   ? 10 * guestCount : 0) +
      (addonState.spoon   * 20)

    sessionStorage.setItem('bookingStep2', JSON.stringify({
      items: selectedItems, tierPrice: pricePerPerson,
      packageId: pkg.id, packageName: pkg.name, addonCost, addonState,
    }))
    navigate('/details')
  }

  if (loading || !pkg) return (
    <div className="booking-page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <i className="fa-solid fa-circle-notch" style={{ fontSize: '2rem', color: 'var(--red)', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const totalSelectedCount = Object.values(selected).reduce((a, s) => a + s.size, 0)
  const totalMaxCount = pkg.categoryRules.reduce((a, r) => a + r.maxChoices, 0)

  return (
    <div className="booking-page-wrap">
      <BookingSteps current="menu" />

      <div className="booking-center" style={{ paddingBottom: 100, maxWidth: '1100px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 className="booking-page-title">Create Your Menu</h1>
            <p className="booking-page-sub">{pkg.name} · {dietPref === 'VEG' ? '🟢 Pure Veg' : '🔴 Non-Veg'}</p>
          </div>
        </div>

        <div className="menu-layout">
          {/* Left: Accordion sections */}
          <div>
            {pkg.categoryRules.map(rule => {
              const categoryItems = allItems.filter(i => i.categoryId === rule.categoryId && packageItemIds.has(i.id))
              const selCount = selected[rule.id]?.size || 0
              const isDone   = selCount >= rule.minChoices
              const isOver   = selCount > rule.maxChoices
              const isOpen   = openRules[rule.id]
              const selectedHere = allItems.filter(i => selected[rule.id]?.has(i.id))

              return (
                <div key={rule.id} className="menu-accordion-section">
                  {/* Header */}
                  <div
                    className="menu-accordion-header"
                    onClick={() => setOpenRules(o => ({ ...o, [rule.id]: !o[rule.id] }))}
                  >
                    <div className="menu-accordion-title">
                      <h4>{rule.label}</h4>
                      <span className={`menu-count-badge ${isDone ? 'done' : ''} ${isOver ? 'over' : ''}`}>
                        {selCount}/{rule.maxChoices}
                      </span>
                      {isDone && <i className="fa-solid fa-circle-check" style={{ color: '#28a745', fontSize: '0.85rem' }} />}
                    </div>
                    <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }} />
                  </div>

                  {isOpen && (
                    <div className="menu-accordion-body">
                      {/* Selected chips */}
                      {selectedHere.length > 0 && (
                        <div className="selected-chips">
                          {selectedHere.map(item => (
                            <span key={item.id} className="selected-chip">
                              <span className={`diet-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                              {item.name}
                              <button onClick={() => toggleItem(rule.id, item.id, rule.maxChoices)}>×</button>
                            </span>
                          ))}
                        </div>
                      )}

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                        Choose {rule.minChoices}–{rule.maxChoices} items
                      </p>

                      {categoryItems.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>No items available in this category.</p>
                      ) : (
                        <div className="menu-items-grid">
                          {categoryItems.map(item => {
                            const isSelected = selected[rule.id]?.has(item.id)
                            return (
                              <div
                                key={item.id}
                                className={`menu-item-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleItem(rule.id, item.id, rule.maxChoices)}
                              >
                                <div className="menu-item-thumb">
                                  {item.image
                                    ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    : <span style={{ fontSize: '1.8rem' }}>🍛</span>
                                  }
                                  <div className="menu-item-check">
                                    <i className="fa-solid fa-check" />
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                                  <span className={`diet-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                                  <span className="menu-item-name">{item.name}</span>
                                </div>
                                {item.price > 0 && (
                                  <span style={{ fontSize: '0.67rem', color: 'var(--red)', fontWeight: 600 }}>+₹{item.price}/plate</span>
                                )}
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

          {/* Right: Sidebar summary */}
          <div className="menu-sidebar">
            <div className="menu-sidebar-card">
              <div className="menu-sidebar-header">Menu Summary</div>
              <div className="menu-sidebar-body">
                {pkg.categoryRules.map(rule => {
                  const selCount = selected[rule.id]?.size || 0
                  const isDone   = selCount >= rule.minChoices
                  return (
                    <div key={rule.id} className="sidebar-rule-row">
                      <span className="sidebar-rule-label">{rule.label}</span>
                      <span className={`sidebar-rule-count ${isDone ? 'done' : selCount > 0 ? '' : ''}`}>
                        {isDone && <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: '0.7rem' }} />}
                        {selCount}/{rule.maxChoices}
                      </span>
                    </div>
                  )
                })}
              </div>

              {pricePerPerson > 0 && (
                <div className="menu-sidebar-total">
                  <span>Estimated Total</span>
                  <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ padding: '12px 16px 16px' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
                  ₹{pricePerPerson}/person × {guestCount} guests
                </p>
                <button
                  className="btn-primary"
                  style={{ width: '100%', opacity: allSatisfied() ? 1 : 0.45 }}
                  onClick={handleContinue}
                  disabled={!allSatisfied()}
                >
                  Add Event Details <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }} />
                </button>
              </div>
            </div>

            {/* Info box */}
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#EFF6FF', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', fontSize: '0.8rem', color: '#1D4ED8' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
              Items shown are included in your package. Select your preferred choices.
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: 20 }}>
          <Link to="/diet" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back
          </Link>
        </div>
      </div>

      {/* Addons Modal */}
      {showAddons && (
        <div className="sheet-overlay" onClick={() => setShowAddons(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '90%', borderRadius: 'var(--radius-lg)', padding: 0, bottom: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}>
            <div style={{ padding: '20px 20px 0' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)', marginBottom: 4 }}>Cutlery & Essentials</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 16 }}>Add optional items to your order</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }}>
              {/* Cutlery */}
              {[
                { key: 'cutlery', icon: '🍽️', name: 'Dining Kit (Plate, Cutlery, Tissues)', price: `₹20/person = ₹${20 * guestCount}` },
                { key: 'water',   icon: '💧', name: 'Water Bottle (500ml)',                  price: `₹10/person = ₹${10 * guestCount}` },
              ].map(addon => (
                <div key={addon.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{addon.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{addon.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{addon.price}</p>
                  </div>
                  <button
                    onClick={() => setAddonState(a => ({ ...a, [addon.key]: !a[addon.key] }))}
                    style={{
                      padding: '7px 16px', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                      background: addonState[addon.key] ? '#D4EDDA' : 'var(--red)',
                      color: addonState[addon.key] ? '#155724' : '#fff',
                    }}
                  >
                    {addonState[addon.key] ? '✓ Added' : 'Add'}
                  </button>
                </div>
              ))}

              {/* Spoon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '1.5rem' }}>🥄</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-dark)' }}>Serving Spoon</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--red)' }}>₹20/spoon = ₹{20 * addonState.spoon}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="counter-btn" onClick={() => setAddonState(a => ({ ...a, spoon: Math.max(0, a.spoon - 1) }))}>
                    <i className="fa-solid fa-minus" style={{ fontSize: '0.65rem' }} />
                  </button>
                  <span style={{ fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{addonState.spoon}</span>
                  <button className="counter-btn" onClick={() => setAddonState(a => ({ ...a, spoon: a.spoon + 1 }))}>
                    <i className="fa-solid fa-plus" style={{ fontSize: '0.65rem' }} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddons(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleAddonsDone}>
                {addonState.cutlery || addonState.water || addonState.spoon > 0 ? 'Continue with Add-ons' : 'Skip & Continue'}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem', marginLeft: 6 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
