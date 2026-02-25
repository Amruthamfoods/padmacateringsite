import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/api'

function getTierPrice(tiers, guestCount) {
  if (!tiers || tiers.length === 0) return null
  const sorted = [...tiers].sort((a, b) => b.minGuests - a.minGuests)
  return sorted.find(t => guestCount >= t.minGuests) || sorted[sorted.length - 1]
}

export default function PackageBuilderPage() {
  const navigate = useNavigate()
  const { pkgId } = useParams()
  const [pkg, setPkg] = useState(null)
  const [allItems, setAllItems] = useState([])
  const [selectedByRule, setSelectedByRule] = useState({}) // ruleId -> Set of item ids
  const [activeRuleIdx, setActiveRuleIdx] = useState(0)
  const [step1, setStep1] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s1 = sessionStorage.getItem('bookingStep1')
    if (!s1) { navigate('/details'); return }
    setStep1(JSON.parse(s1))

    Promise.all([api.get('/menu/packages'), api.get('/menu/items')]).then(([pkgs, items]) => {
      const found = pkgs.data.find(p => p.id === parseInt(pkgId))
      if (!found) { toast.error('Package not found'); navigate('/preset/packages'); return }
      setPkg(found)
      setAllItems(items.data)
      // Init selection map
      const init = {}
      found.categoryRules.forEach(r => { init[r.id] = new Set() })
      setSelectedByRule(init)
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [pkgId, navigate])

  const guestCount = step1?.guestCount || 100
  const activeTier = pkg ? getTierPrice(pkg.pricingTiers, guestCount) : null

  // Package item IDs for filtering
  const packageItemIds = useMemo(() => {
    if (!pkg) return new Set()
    return new Set(pkg.items.map(pi => pi.menuItemId || pi.menuItem?.id).filter(Boolean))
  }, [pkg])

  const activeRule = pkg?.categoryRules?.[activeRuleIdx]

  // Items for the active rule's category that are in the package
  const ruleItems = useMemo(() => {
    if (!activeRule) return []
    return allItems.filter(item => item.categoryId === activeRule.categoryId && packageItemIds.has(item.id))
  }, [activeRule, allItems, packageItemIds])

  function toggleItem(ruleId, itemId, maxChoices) {
    setSelectedByRule(prev => {
      const next = { ...prev }
      const set = new Set(prev[ruleId] || [])
      if (set.has(itemId)) {
        set.delete(itemId)
      } else {
        if (set.size >= maxChoices) {
          toast.error(`Maximum ${maxChoices} items for this category`)
          return prev
        }
        set.add(itemId)
      }
      next[ruleId] = set
      return next
    })
  }

  // Validate all rules meet minChoices
  function allRulesSatisfied() {
    if (!pkg) return false
    return pkg.categoryRules.every(rule => {
      const sel = selectedByRule[rule.id]
      return sel && sel.size >= rule.minChoices
    })
  }

  function handleContinue() {
    if (!allRulesSatisfied()) {
      toast.error('Please complete all required selections')
      return
    }
    // Collect all selected items
    const allSelectedIds = new Set()
    Object.values(selectedByRule).forEach(s => s.forEach(id => allSelectedIds.add(id)))
    const selectedItems = allItems.filter(i => allSelectedIds.has(i.id)).map(i => ({
      id: i.id, name: i.name, price: i.price, type: i.type, style: i.style,
      category: i.category?.name || '',
    }))
    sessionStorage.setItem('bookingStep2', JSON.stringify({
      items: selectedItems,
      tierPrice: activeTier?.pricePerPerson || 0,
      packageId: pkg.id,
      packageName: pkg.name,
    }))
    navigate('/preset/summary')
  }

  if (loading || !pkg) return (
    <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }} />
    </div>
  )

  return (
    <div className="builder-page">
      <div className="booking-header">
        <Link to="/preset/packages" className="booking-header-link">
          <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Packages
        </Link>
        <span className="booking-header-title">{pkg.name}</span>
        <span className="booking-step-label">Step 3</span>
      </div>
      <div className="booking-progress">
        <div className="booking-progress-fill" style={{ width: '75%' }} />
      </div>

      <div className="builder-layout">
        {/* Category sidebar (rules) */}
        <div className="builder-cat-sidebar">
          {pkg.categoryRules.map((rule, idx) => {
            const sel = selectedByRule[rule.id] || new Set()
            const satisfied = sel.size >= rule.minChoices
            return (
              <button key={rule.id} onClick={() => setActiveRuleIdx(idx)}
                className={`builder-cat-btn${activeRuleIdx === idx ? ' active' : ''}`}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span>{rule.label}</span>
                  <span style={{ fontSize: '0.68rem', color: satisfied ? '#4caf70' : 'var(--text-faint)' }}>
                    {sel.size} / {rule.maxChoices} {satisfied ? '✓' : ''}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Items grid */}
        <div className="builder-items">
          {activeRule && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gold-line)', background: 'var(--dark-2)' }}>
              <p style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: '0.95rem' }}>{activeRule.label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pick {activeRule.minChoices}–{activeRule.maxChoices} · {(selectedByRule[activeRule.id]?.size || 0)} selected
              </p>
            </div>
          )}
          {ruleItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-utensils" style={{ fontSize: '2rem', color: 'var(--text-faint)', marginBottom: 12, display: 'block' }} />
              No items in this category for the selected package
            </div>
          ) : (
            <div className="builder-items-grid">
              {ruleItems.map(item => {
                const selected = selectedByRule[activeRule.id]?.has(item.id)
                return (
                  <div key={item.id} className={`item-card${selected ? ' selected' : ''}`}>
                    <span className={`item-dot ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      {item.description && <p className="item-desc">{item.description}</p>}
                    </div>
                    <button onClick={() => toggleItem(activeRule.id, item.id, activeRule.maxChoices)}
                      className={`item-btn ${selected ? 'remove' : 'add'}`}>
                      {selected ? 'Remove' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right summary panel */}
        <div className="builder-order-panel">
          <div className="builder-order-header">
            <p className="builder-order-title">{pkg.name}</p>
            <p className="builder-order-subtitle">{guestCount} guests</p>
          </div>

          {/* Rule progress */}
          <div style={{ padding: '12px 0' }}>
            {pkg.categoryRules.map(rule => {
              const sel = selectedByRule[rule.id] || new Set()
              const pct = Math.min(100, (sel.size / rule.maxChoices) * 100)
              const satisfied = sel.size >= rule.minChoices
              return (
                <div key={rule.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>{rule.label}</span>
                    <span style={{ color: satisfied ? '#4caf70' : 'var(--text-faint)' }}>{sel.size}/{rule.maxChoices}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--dark-3)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: satisfied ? '#4caf70' : 'var(--gold)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="builder-order-footer">
            {activeTier ? (
              <>
                <div className="builder-order-row">
                  <span className="lbl">Rate ({guestCount} guests)</span>
                  <span className="val">₹{activeTier.pricePerPerson}/pp</span>
                </div>
                <div className="builder-order-row">
                  <span className="lbl">Est. total</span>
                  <span className="val">₹{(activeTier.pricePerPerson * guestCount).toLocaleString('en-IN')}</span>
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 2 }}>+ 5% GST</p>
              </>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No pricing tiers configured for this package yet.</p>
            )}
            <button onClick={handleContinue} disabled={!allRulesSatisfied()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12, opacity: allRulesSatisfied() ? 1 : 0.5 }}>
              Continue to Summary <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
            </button>
            {!allRulesSatisfied() && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textAlign: 'center', marginTop: 6 }}>Complete all selections to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="builder-mobile-bar">
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {pkg.categoryRules.filter(r => (selectedByRule[r.id]?.size || 0) >= r.minChoices).length}/{pkg.categoryRules.length} categories done
          </p>
          {activeTier && (
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: '1.1rem' }}>
              ₹{(activeTier.pricePerPerson * guestCount).toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <button onClick={handleContinue} disabled={!allRulesSatisfied()} className="btn btn-primary" style={{ opacity: allRulesSatisfied() ? 1 : 0.5 }}>
          Continue <i className="fa-solid fa-arrow-right" style={{ marginLeft: 4 }} />
        </button>
      </div>
    </div>
  )
}
