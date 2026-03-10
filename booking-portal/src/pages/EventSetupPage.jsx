import { useState, useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'
import { useCartStore } from '../store/useCartStore'

const CATEGORIES = [
  { key: 'ALL', label: 'All' },
  { key: 'BOX', label: 'Meal Box' },
  { key: 'BULK', label: 'Bulk' },
  { key: 'CATERING', label: 'Catering' },
]

const EVENT_TYPES = [
  { key: 'ALL', label: 'All' },
  { key: 'Wedding', label: 'Wedding' },
  { key: 'Engagement', label: 'Engagement' },
  { key: 'Birthday', label: 'Birthday' },
  { key: 'Corporate', label: 'Office' },
  { key: 'Festival', label: 'Festival' },
  { key: 'Any', label: 'Other' },
]

const MEAL_TABS = [
  { key: 'All', label: 'All' },
  { key: 'Breakfast', label: 'Breakfast' },
  { key: 'Lunch', label: 'Lunch' },
  { key: 'Snacks', label: 'Snacks' },
  { key: 'Dinner', label: 'Dinner' },
]

const TIME_SLOT_GROUPS = [
  { label: 'Breakfast', slots: ['8:00 AM - 8:30 AM', '8:30 AM - 9:00 AM', '9:00 AM - 9:30 AM'] },
  { label: 'Snacks', slots: ['10:00 AM - 10:30 AM', '3:00 PM - 3:30 PM', '4:00 PM - 4:30 PM', '5:00 PM - 5:30 PM'] },
  { label: 'Lunch', slots: ['12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM', '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM'] },
  { label: 'Dinner', slots: ['6:30 PM - 7:00 PM', '7:00 PM - 7:30 PM', '7:30 PM - 8:00 PM', '8:00 PM - 8:30 PM'] },
]

const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const CAT_COLORS = { BOX: 'var(--primary)', BULK: '#FF9500', CATERING: '#007AFF' }
const CAT_LABELS = { BOX: 'Meal Box', BULK: 'Delivery Box', CATERING: 'Catering' }
const PKG_IMAGES = [
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546456073-ea246a7bd25f?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=280&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555244162-803834f87a4d?w=400&h=280&fit=crop&q=80',
]

function get90Days() {
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d
  })
}
function toDateStr(d) { return d.toISOString().split('T')[0] }
const TODAY = toDateStr(new Date())

export default function EventSetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { eventDetails, setEventDetails, setMenuPreferences } = useBookingStore()
  const { addToCart, isInCart } = useCartStore()

  // Pre-fill from wizard URL params (?pkgType=BOX&diet=VEG)
  const wizPkgType = searchParams.get('pkgType') || 'ALL'
  const wizDiet = searchParams.get('diet') || ''

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(wizPkgType)
  const [eventType, setEventType] = useState('ALL')
  const [mealTab, setMealTab] = useState('All')
  const [selectedDay, setSelectedDay] = useState(eventDetails.eventDate || TODAY)
  const [guestCount, setGuestCount] = useState(eventDetails.guestCount || 25)
  const [guestEditing, setGuestEditing] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [activeModalPkg, setActiveModalPkg] = useState(null)
  const [search, setSearch] = useState('')
  const [filterGroupOpen, setFilterGroupOpen] = useState('') // 'event' | 'category' | 'meal' | ''
  const dateRef = useRef(null)
  const calInputRef = useRef(null)
  const guestInputRef = useRef(null)
  const allDays = get90Days()

  const { user: authUser } = useAuthStore()
  const userName = authUser?.name?.split(' ')[0] || ''
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const monthGroups = allDays.reduce((acc, d) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!acc.find(g => g.key === key)) acc.push({ key, label: MONTHS_FULL[d.getMonth()], days: [] })
    acc.find(g => g.key === key).days.push(d)
    return acc
  }, [])

  useEffect(() => {
    api.get('/menu/packages')
      .then(r => setPackages(r.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setEventDetails({ ...eventDetails, guestCount, eventDate: selectedDay })
  }, [guestCount, selectedDay])

  useEffect(() => {
    if (!dateRef.current) return
    setTimeout(() => {
      const sel = dateRef.current?.querySelector('[data-today="true"]')
      if (sel) sel.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 200)
  }, [])

  function changeGuest(delta) {
    setGuestCount(v => {
      const step = v < 25 || (delta < 0 && v <= 25) ? 1 : 5
      return Math.min(1000, Math.max(10, v + delta * step))
    })
  }

  function commitGuestInput() {
    const parsed = parseInt(guestInput, 10)
    if (!isNaN(parsed)) setGuestCount(Math.min(1000, Math.max(10, parsed)))
    setGuestEditing(false)
  }

  const filteredPkgs = packages.filter(pkg => {
    if (search && !pkg.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'ALL') {
      if ((pkg.eventType || '').split(':')[0] !== category) return false
    }
    if (eventType !== 'ALL') {
      const raw = pkg.eventType || ''
      const evtPart = raw.includes(':') ? raw.split(':')[1] : raw
      if (evtPart !== eventType) return false
    }
    if (mealTab !== 'All' && pkg.mealTypes && !pkg.mealTypes.includes(mealTab)) return false
    // Diet filter from wizard
    if (wizDiet === 'VEG' && pkg.type !== 'VEG') return false
    const minG = pkg.pricingTiers?.length ? Math.min(...pkg.pricingTiers.map(t => t.minGuests)) : (pkg.servesMin || 50)
    if (guestCount < minG) return false
    return true
  })

  // Active filters count badge
  const activeFilterCount = [category !== 'ALL', eventType !== 'ALL', mealTab !== 'All'].filter(Boolean).length

  return (
    <div className="page-outer">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(40px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }

        .setup-pkgs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (min-width: 900px) {
          .setup-pkgs-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .setup-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
        }
        @media (min-width: 1200px) {
          .setup-pkgs-grid { grid-template-columns: repeat(4, 1fr); }
        }
        div::-webkit-scrollbar { display: none; }

        /* Apple-style filter pill */
        .filter-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 999px;
          border: 1.5px solid var(--separator-nm);
          background: var(--bg); cursor: pointer;
          font-size: 13.5px; font-weight: 500; font-family: inherit;
          color: var(--heading); white-space: nowrap;
          transition: all 0.15s ease;
          letter-spacing: -0.01em;
        }
        .filter-pill:hover { border-color: var(--primary); color: var(--primary); }
        .filter-pill.active {
          background: var(--primary); border-color: var(--primary);
          color: #fff;
        }
        .filter-pill .badge {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--primary); color: #fff;
          font-size: 9px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          margin-left: 2px;
        }

        /* Dropdown panel */
        .filter-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0; z-index: 200;
          background: var(--bg); border: 1px solid var(--separator-nm);
          border-radius: 14px; padding: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 240px;
          animation: fadeIn 0.18s ease;
          display: flex; flex-wrap: wrap; gap: 6px;
        }

        /* Google-style segmented chip inside dropdown */
        .seg-chip {
          padding: 6px 14px; border-radius: 999px; border: none; cursor: pointer;
          font-family: inherit; font-size: 13.5px; font-weight: 500;
          background: var(--fill-tertiary); color: var(--heading);
          transition: all 0.12s ease; letter-spacing: -0.01em;
        }
        .seg-chip:hover { background: var(--fill-secondary); }
        .seg-chip.on { background: var(--heading); color: #fff; font-weight: 600; }

        /* Event card (left sidebar) */
        .event-config-card {
          background: var(--bg);
          border-radius: 18px;
          border: 1px solid var(--separator-nm);
          overflow: hidden;
        }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ borderBottom: '0.5px solid var(--separator-nm)', padding: '18px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 2px' }}>{greeting}{userName ? `, ${userName}` : ''}!</p>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: 'var(--heading)', margin: 0, letterSpacing: '-0.03em' }}>What are you planning?</h2>
          </div>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fill-tertiary)', borderRadius: 12, padding: '10px 16px', minWidth: 200, maxWidth: 340, flex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 14.5, color: 'var(--heading)', background: 'transparent', fontFamily: 'inherit' }}
              placeholder="Search packages..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="page-inner">
        <div className="setup-layout">

          {/* ─── LEFT: Minimal "Your Event" card ─────────────────── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="event-config-card">

              {/* Section label */}
              <div style={{ padding: '16px 18px 0' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Your Event</p>
              </div>

              {/* Guest count — big and prominent */}
              <div style={{ padding: '14px 18px 0' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px', fontWeight: 500 }}>Guests</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => changeGuest(-1)}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--separator-nm)', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--heading)', fontFamily: 'inherit', flexShrink: 0 }}
                  >−</button>

                  {guestEditing ? (
                    <input
                      ref={guestInputRef}
                      type="number"
                      value={guestInput}
                      onChange={e => setGuestInput(e.target.value)}
                      onBlur={commitGuestInput}
                      onKeyDown={e => { if (e.key === 'Enter') commitGuestInput(); if (e.key === 'Escape') setGuestEditing(false) }}
                      style={{ width: 80, textAlign: 'center', fontWeight: 700, fontSize: 28, color: 'var(--heading)', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.03em' }}
                      min={10} max={1000} autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => { setGuestInput(String(guestCount)); setGuestEditing(true) }}
                      title="Click to edit"
                      style={{ fontWeight: 700, fontSize: 32, color: 'var(--heading)', textAlign: 'center', cursor: 'text', letterSpacing: '-0.04em', lineHeight: 1 }}
                    >{guestCount}</span>
                  )}

                  <button
                    onClick={() => changeGuest(1)}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: '#fff', fontFamily: 'inherit', flexShrink: 0 }}
                  >+</button>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', margin: '6px 0 0' }}>min 10 · max 1000</p>
              </div>

              <div style={{ height: 1, background: 'var(--separator-nm)', margin: '16px 0' }} />

              {/* Date picker */}
              <div style={{ padding: '0 18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, fontWeight: 500 }}>Event Date</p>
                  <button
                    onClick={() => calInputRef.current?.showPicker?.() || calInputRef.current?.click()}
                    title="Open calendar"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 999,
                      border: '1.5px solid var(--separator-nm)', background: 'var(--bg)',
                      color: 'var(--primary)', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 11.5, fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    Calendar
                  </button>
                  {/* Hidden calendar input */}
                  <input
                    ref={calInputRef}
                    type="date"
                    value={selectedDay}
                    min={TODAY}
                    onChange={e => e.target.value && setSelectedDay(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
                  />
                </div>
                <div ref={dateRef} style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                  <div style={{ display: 'flex', gap: 0, width: 'max-content', paddingBottom: 4 }}>
                    {monthGroups.map(group => (
                      <div key={group.key} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 20, flexShrink: 0 }}>
                          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 8, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>
                            {group.label.slice(0, 3)}
                          </span>
                        </div>
                        {group.days.map(d => {
                          const ds = toDateStr(d)
                          const isSel = ds === selectedDay
                          const isToday = ds === TODAY
                          const isPast = ds < TODAY
                          return (
                            <button
                              key={ds}
                              data-today={isToday}
                              onClick={() => !isPast && setSelectedDay(ds)}
                              disabled={isPast}
                              style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 52, flexShrink: 0, margin: '0 1px',
                                borderRadius: 10, border: 'none', cursor: isPast ? 'default' : 'pointer',
                                background: isSel ? 'var(--primary)' : 'transparent',
                                transition: 'all 0.15s', opacity: isPast ? 0.25 : 1,
                              }}
                            >
                              <span style={{ fontSize: 9, fontWeight: 500, color: isSel ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginBottom: 2 }}>
                                {DAY_SHORT[d.getDay()]}
                              </span>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: isToday && !isSel ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                              }}>
                                <span style={{ fontSize: 13.5, fontWeight: isSel || isToday ? 700 : 400, color: isSel ? '#fff' : isToday ? 'var(--primary)' : 'var(--heading)' }}>
                                  {d.getDate()}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Selected date display */}
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)', margin: '10px 0 0', letterSpacing: '-0.01em' }}>
                  {(() => { const [y, m, d] = selectedDay.split('-'); return new Date(+y, +m - 1, +d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) })()}
                </p>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ──────────────────────────────────────── */}
          <div>
            {/* ── Minimal filter bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>

              {/* Event type pill+dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`filter-pill ${eventType !== 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterGroupOpen(o => o === 'event' ? '' : 'event')}
                >
                  {eventType !== 'ALL' ? EVENT_TYPES.find(e => e.key === eventType)?.label : 'Event'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.6, marginLeft: 2 }}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {filterGroupOpen === 'event' && (
                  <div className="filter-dropdown">
                    {EVENT_TYPES.map(et => (
                      <button key={et.key} className={`seg-chip ${eventType === et.key ? 'on' : ''}`}
                        onClick={() => { setEventType(et.key); setFilterGroupOpen('') }}>
                        {et.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category pill+dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`filter-pill ${category !== 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterGroupOpen(o => o === 'cat' ? '' : 'cat')}
                >
                  {category !== 'ALL' ? CATEGORIES.find(c => c.key === category)?.label : 'Type'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.6, marginLeft: 2 }}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {filterGroupOpen === 'cat' && (
                  <div className="filter-dropdown">
                    {CATEGORIES.map(cat => (
                      <button key={cat.key} className={`seg-chip ${category === cat.key ? 'on' : ''}`}
                        onClick={() => { setCategory(cat.key); setFilterGroupOpen('') }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal pill+dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className={`filter-pill ${mealTab !== 'All' ? 'active' : ''}`}
                  onClick={() => setFilterGroupOpen(o => o === 'meal' ? '' : 'meal')}
                >
                  {mealTab !== 'All' ? mealTab : 'Meal'}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.6, marginLeft: 2 }}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {filterGroupOpen === 'meal' && (
                  <div className="filter-dropdown">
                    {MEAL_TABS.map(tab => (
                      <button key={tab.key} className={`seg-chip ${mealTab === tab.key ? 'on' : ''}`}
                        onClick={() => { setMealTab(tab.key); setFilterGroupOpen('') }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear all — only when filters active */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setCategory('ALL'); setEventType('ALL'); setMealTab('All'); setFilterGroupOpen('') }}
                  style={{ padding: '6px 14px', borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, color: 'var(--muted)', fontFamily: 'inherit', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  Clear
                </button>
              )}

              {/* Result count — pushed right */}
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
                {filteredPkgs.length} package{filteredPkgs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* ── Packages grid ── */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: 36, height: 36, border: '2.5px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading packages...</p>
              </div>
            ) : filteredPkgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--separator-nm)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <p style={{ fontWeight: 600, fontSize: 17, color: 'var(--heading)', marginBottom: 6 }}>No packages found</p>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 18 }}>Try adjusting filters or increasing guest count.</p>
                <button onClick={() => { setSearch(''); setCategory('ALL'); setEventType('ALL'); setMealTab('All') }}
                  style={{ padding: '9px 24px', borderRadius: 999, background: 'var(--heading)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="setup-pkgs-grid">
                {filteredPkgs.map((pkg, idx) => {
                  const pkgCat = (pkg.eventType || '').split(':')[0]
                  const tier = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests)
                    .find(t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests))
                    || pkg.pricingTiers?.[0]
                  const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image
                  const accentColor = CAT_COLORS[pkgCat] || 'var(--primary)'
                  const inCart = isInCart(pkg.id)

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setActiveModalPkg(pkg)}
                      style={{
                        background: 'var(--bg)', borderRadius: 14,
                        overflow: 'hidden', cursor: 'pointer',
                        border: '1px solid var(--separator-nm)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {/* Image */}
                      <div style={{ height: 130, background: accentColor, position: 'relative', overflow: 'hidden' }}>
                        <img src={img || PKG_IMAGES[idx % PKG_IMAGES.length]} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {/* Veg dot */}
                        <span style={{ position: 'absolute', top: 9, right: 9, width: 10, height: 10, borderRadius: '50%', background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', border: '2px solid #fff' }} />
                        {/* Category badge */}
                        <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999 }}>
                          {CAT_LABELS[pkgCat] || 'Package'}
                        </span>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '11px 13px 13px' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--heading)', margin: '0 0 3px', lineHeight: 1.25, letterSpacing: -0.1 }}>{pkg.name}</p>
                        <p style={{ color: 'var(--muted)', fontSize: 12.5, margin: '0 0 10px', lineHeight: 1.4 }}>
                          {(pkg.description || 'Customizable catering package').slice(0, 52)}{(pkg.description || '').length > 52 ? '…' : ''}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 15.5, color: accentColor, letterSpacing: -0.2 }}>
                            {tier ? `₹${tier.pricePerPerson}` : '—'}<span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--muted)', marginLeft: 1 }}>/pp</span>
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (inCart) { toast('Already in cart'); return }
                              const added = addToCart(pkg, eventDetails, tier?.pricePerPerson || 0)
                              if (added) toast.success(`${pkg.name} added!`)
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 11px', borderRadius: 999,
                              background: inCart ? 'var(--primary-bg)' : 'var(--heading)',
                              color: inCart ? 'var(--primary-dark)' : '#fff',
                              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.15s', fontFamily: 'inherit',
                            }}
                          >
                            <i className={`fa-solid ${inCart ? 'fa-check' : 'fa-plus'}`} style={{ fontSize: 10 }} />
                            {inCart ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Package modal ── */}
      {activeModalPkg && (
        <PackageModal
          pkg={activeModalPkg}
          selectedDay={selectedDay}
          guestCount={guestCount}
          onClose={() => setActiveModalPkg(null)}
          onConfirm={(eventDate, timeSlot, newGuestCount, vegCount, nonVegCount) => {
            setGuestCount(newGuestCount)
            setEventDetails({ ...eventDetails, eventDate, timeSlot, guestCount: newGuestCount, vegCount, nonVegCount })
            setMenuPreferences({ selectedPackage: activeModalPkg, menuItems: [], dietPreference: activeModalPkg.type === 'VEG' ? 'VEG' : 'NON_VEG' })
            setActiveModalPkg(null)
            navigate('/menu')
          }}
        />
      )}
    </div>
  )
}

// ── Package Detail Modal ─────────────────────────────────────────────────────
function PackageModal({ pkg, selectedDay, guestCount, onClose, onConfirm }) {
  const pkgMin = pkg.pricingTiers?.length
    ? Math.min(...pkg.pricingTiers.map(t => t.minGuests))
    : (pkg.servesMin || 25)

  const [eventDate, setEventDate] = useState(selectedDay)
  const [timeSlot, setTimeSlot] = useState('')
  const [localGuests, setLocalGuests] = useState(Math.max(guestCount, pkgMin))
  const [guestEditing, setGuestEditing] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [vegGuests, setVegGuests] = useState(0)
  const isNonVeg = pkg.type !== 'VEG'
  const todayStr = new Date().toISOString().split('T')[0]
  const pkgCat = (pkg.eventType || '').split(':')[0]
  const accentColor = CAT_COLORS[pkgCat] || 'var(--primary)'

  function changeGuest(delta) {
    setLocalGuests(v => {
      const step = v <= pkgMin || (delta < 0 && v <= pkgMin + 5) ? 1 : 5
      return Math.min(1000, Math.max(pkgMin, v + delta * step))
    })
  }

  function commitGuestInput() {
    const parsed = parseInt(guestInput, 10)
    if (!isNaN(parsed)) setLocalGuests(Math.min(1000, Math.max(pkgMin, parsed)))
    setGuestEditing(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid var(--separator-nm)', fontSize: 15.5, color: 'var(--heading)',
    background: 'var(--bg)', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div style={{ background: 'var(--bg)', borderRadius: '22px 22px 0 0', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s var(--ease-spring)', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--fill-secondary)' }} />
        </div>

        {/* Compact header — no wasted image space */}
        <div style={{ padding: '14px 18px 14px', borderBottom: '1px solid var(--separator-nm)', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 36 }}>
            {/* Veg/non-veg indicator dot */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2,
              background: pkg.type === 'VEG' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', display: 'block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: 'var(--heading)', margin: 0, letterSpacing: -0.3, lineHeight: 1.2 }}>{pkg.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, background: `${accentColor}18`, padding: '2px 8px', borderRadius: 999 }}>
                  {CAT_LABELS[pkgCat] || 'Package'}
                </span>
              </div>
              {pkg.description && (
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0', lineHeight: 1.45, letterSpacing: -0.1 }}>
                  {pkg.description.slice(0, 90)}{pkg.description.length > 90 ? '…' : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, width: 28, height: 28,
            borderRadius: '50%', background: 'var(--fill-tertiary)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)', fontSize: 14, fontWeight: 700,
          }}>×</button>
        </div>

        <div style={{ padding: '18px 18px 0', overflowY: 'auto', flex: 1 }}>

          {/* Pricing tiers */}
          {pkg.pricingTiers?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Pricing</p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {pkg.pricingTiers.sort((a, b) => a.minGuests - b.minGuests).map(t => {
                  const isMatch = localGuests >= t.minGuests && (t.maxGuests == null || localGuests <= t.maxGuests)
                  return (
                    <div key={t.id} style={{ padding: '8px 12px', borderRadius: 10, background: isMatch ? 'var(--primary-bg)' : 'var(--fill-tertiary)', border: `1.5px solid ${isMatch ? 'var(--primary)' : 'transparent'}`, textAlign: 'center', minWidth: 76 }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 2 }}>{t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} guests</div>
                      <div style={{ fontWeight: 700, color: isMatch ? 'var(--primary)' : 'var(--heading)', fontSize: 16 }}>₹{t.pricePerPerson}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)' }}>/pp</span></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Date + time */}
          <div style={{ background: 'var(--fill-tertiary)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--separator-nm)' }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Event Date</p>
              <input type="date" value={eventDate} min={todayStr} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Time Slot</p>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} style={inputStyle}>
                <option value="">Select time slot…</option>
                {TIME_SLOT_GROUPS
                  .filter(g => !pkg.mealTypes?.length || pkg.mealTypes.includes(g.label))
                  .map(g => (
                    <optgroup key={g.label} label={g.label}>
                      {g.slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
              </select>
            </div>
          </div>

          {/* Guest counter */}
          <div style={{ background: 'var(--fill-tertiary)', borderRadius: 12, padding: '13px 15px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--heading)' }}>Guests <span style={{ fontSize: 11, color: 'var(--muted)' }}>min {pkgMin}</span></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => changeGuest(-1)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--separator-nm)', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--heading)' }}>−</button>
              {guestEditing ? (
                <input type="number" value={guestInput} onChange={e => setGuestInput(e.target.value)}
                  onBlur={commitGuestInput}
                  onKeyDown={e => { if (e.key === 'Enter') commitGuestInput(); if (e.key === 'Escape') setGuestEditing(false) }}
                  style={{ width: 56, textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--heading)', background: 'var(--bg)', border: '1.5px solid var(--primary)', borderRadius: 8, outline: 'none', padding: '3px 4px', fontFamily: 'inherit' }}
                  min={10} max={1000} autoFocus />
              ) : (
                <span onClick={() => { setGuestInput(String(localGuests)); setGuestEditing(true) }}
                  title="Click to type"
                  style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', minWidth: 36, textAlign: 'center', cursor: 'text', letterSpacing: -0.5 }}>{localGuests}</span>
              )}
              <button onClick={() => changeGuest(1)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: '#fff' }}>+</button>
            </div>
          </div>

          {/* Veg split */}
          {isNonVeg && (
            <div style={{ background: 'var(--fill-tertiary)', borderRadius: 12, padding: '13px 15px', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#34C759', display: 'inline-block' }} /> Veg Guests
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setVegGuests(v => Math.max(0, v - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--separator-nm)', background: 'var(--bg)', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: 'var(--heading)' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 19, color: 'var(--heading)', minWidth: 32, textAlign: 'center' }}>{vegGuests}</span>
                  <button onClick={() => setVegGuests(v => Math.min(localGuests, v + 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#34C759', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, color: '#fff' }}>+</button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Non-veg: {localGuests - vegGuests} guests</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => {
              if (!eventDate) { toast.error('Please select an event date'); return }
              if (!timeSlot) { toast.error('Please select a time slot'); return }
              const vc = isNonVeg ? vegGuests : localGuests
              const nvc = isNonVeg ? localGuests - vegGuests : 0
              onConfirm(eventDate, timeSlot, localGuests, vc, nvc)
            }}
            style={{ width: '100%', padding: '16px', borderRadius: 999, background: 'var(--heading)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 28, letterSpacing: -0.2 }}
          >
            Build Your Menu →
          </button>
        </div>
      </div>
    </div>
  )
}
