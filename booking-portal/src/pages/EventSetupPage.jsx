import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'

const CATEGORIES = [
  { key: 'ALL',      label: 'All',          icon: '🍽️' },
  { key: 'BOX',      label: 'Meal Box',     icon: '🥡' },
  { key: 'BULK',     label: 'Bulk',         icon: '📦' },
  { key: 'CATERING', label: 'Full Catering',icon: '🍛' },
]

const EVENT_TYPES = [
  { key: 'ALL',        label: 'All',          icon: '✨' },
  { key: 'Wedding',    label: 'Wedding',      icon: '💒' },
  { key: 'Engagement', label: 'Engagement',   icon: '💍' },
  { key: 'Birthday',   label: 'Birthday',     icon: '🎂' },
  { key: 'Corporate',  label: 'Office',       icon: '🏢' },
  { key: 'Festival',   label: 'Festival',     icon: '🎊' },
  { key: 'Any',        label: 'Other',        icon: '🌟' },
]

const MEAL_TABS = [
  { key: 'All',       label: 'All',       icon: '🍽️' },
  { key: 'Breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'Lunch',     label: 'Lunch',     icon: '☀️' },
  { key: 'Snacks',    label: 'Snacks',    icon: '🫙' },
  { key: 'Dinner',    label: 'Dinner',    icon: '🌙' },
]

const TIME_SLOT_GROUPS = [
  { label: 'Breakfast', slots: ['8:00 AM - 8:30 AM', '8:30 AM - 9:00 AM', '9:00 AM - 9:30 AM'] },
  { label: 'Snacks',    slots: ['10:00 AM - 10:30 AM', '3:00 PM - 3:30 PM', '4:00 PM - 4:30 PM', '5:00 PM - 5:30 PM'] },
  { label: 'Lunch',     slots: ['12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM', '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM'] },
  { label: 'Dinner',    slots: ['6:30 PM - 7:00 PM', '7:00 PM - 7:30 PM', '7:30 PM - 8:00 PM', '8:00 PM - 8:30 PM'] },
]


const CAT_COLORS = { BOX: '#34C759', BULK: '#FF9500', CATERING: '#007AFF' }
const CAT_LABELS = { BOX: 'Meal Box', BULK: 'Bulk Delivery', CATERING: 'Full Catering' }
const EMOJIS     = ['🍛', '🍱', '🥘', '🍲', '🫕', '🥗', '🍜', '🍝']

function toDateStr(d) { return d.toISOString().split('T')[0] }

const TODAY = toDateStr(new Date())

export default function EventSetupPage() {
  const navigate = useNavigate()
  const { eventDetails, setEventDetails, setMenuPreferences } = useBookingStore()

  const [packages,       setPackages]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [category,       setCategory]       = useState('ALL')
  const [eventType,      setEventType]      = useState('ALL')
  const [mealTab,        setMealTab]        = useState('All')
  const [selectedDay]                        = useState(eventDetails.eventDate || TODAY)
  const [guestCount,     setGuestCount]     = useState(eventDetails.guestCount || 25)
  const [activeModalPkg, setActiveModalPkg] = useState(null)
  const [search,         setSearch]         = useState('')
  const [editingGuests,  setEditingGuests]  = useState(false)
  const [guestInput,     setGuestInput]     = useState('')
  const userName = (() => { try { return JSON.parse(localStorage.getItem('padma_user') || '{}').name?.split(' ')[0] || '' } catch { return '' } })()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    api.get('/menu/packages')
      .then(r => setPackages(r.data))
      .catch(() => toast.error('Failed to load packages'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setEventDetails({ ...eventDetails, guestCount, eventDate: selectedDay })
  }, [guestCount, selectedDay])

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
    const minG = pkg.pricingTiers?.length ? Math.min(...pkg.pricingTiers.map(t => t.minGuests)) : (pkg.servesMin || 50)
    if (guestCount < minG) return false
    return true
  })

  // ── Helpers ──────────────────────────────────────────────────────────────
  const S = { // inline style helpers
    page: { background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 0 },

    // Offers strip
    offerBar: { background: 'var(--heading)', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    offerText: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 500, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
    offerRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    locationLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 },
    cartBtn: { background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

    // Hero
    hero: { background: 'linear-gradient(160deg, #34C759 0%, #28A745 100%)', padding: '20px 20px 32px', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 500, margin: '0 0 4px', letterSpacing: -0.1 },
    heroTitle: { color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 18px', lineHeight: 1.2, letterSpacing: -0.5 },
    searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '11px 16px' },
    searchIcon: { color: 'rgba(255,255,255,0.7)', fontSize: 15, flexShrink: 0 },
    searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 17, color: '#fff', background: 'transparent', fontFamily: 'inherit' },

    // Section
    sectionWrap: { padding: '0 16px' },
    sectionLabel: { fontSize: 13, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '20px 0 10px' },

    // Chips
    chipRow: { display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 },
    chip: (active) => ({
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '8px 14px', borderRadius: 999, flexShrink: 0,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      fontWeight: active ? 600 : 500, fontSize: 15, whiteSpace: 'nowrap',
      background: active ? 'var(--primary)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--heading)',
      boxShadow: active ? 'var(--shadow-green)' : 'var(--shadow-sm)',
      transition: 'all 0.15s',
    }),
    mealChip: (active) => ({
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 16px', borderRadius: 999, flexShrink: 0,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      fontWeight: active ? 600 : 500, fontSize: 15, whiteSpace: 'nowrap',
      background: active ? 'var(--heading)' : 'var(--bg)',
      color: active ? '#fff' : 'var(--heading)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.15s',
    }),

    // Guest counter card
    guestCard: { background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-sm)', flexShrink: 0, minWidth: 100 },
    guestLabel: { color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', textAlign: 'center' },
    guestRow: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' },
    guestBtn: (active) => ({ width: 28, height: 28, borderRadius: '50%', border: 'none', background: active ? 'var(--primary)' : 'var(--fill-tertiary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: active ? '#fff' : 'var(--heading)', lineHeight: 1, fontFamily: 'inherit' }),
    guestNum: { fontWeight: 700, fontSize: 17, color: 'var(--heading)', minWidth: 30, textAlign: 'center' },
  }

  return (
    <div className="page-outer">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(40px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        .setup-filters { padding: 20px 0; }
        .setup-pkgs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (min-width: 900px) {
          .setup-hero { border-radius: 16px; }
          .setup-pkgs-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
          .setup-filters { padding: 0; }
        }
        @media (min-width: 1200px) {
          .setup-pkgs-grid { grid-template-columns: repeat(4, 1fr); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Hero / page header ── */}
      <div className="setup-hero" style={{ background: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)', padding: '28px 24px 36px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>
              {greeting}{userName ? `, ${userName}` : ''}!
            </p>
            <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: '0 0 18px', lineHeight: 1.15, letterSpacing: -0.5 }}>
              What are you planning today?
            </h2>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '11px 16px', maxWidth: 520 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: 16, color: '#fff', background: 'transparent', fontFamily: 'inherit' }}
                placeholder="Search packages, events..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>✕</button>
              )}
            </div>
          </div>
          {/* Stats row */}
          <div className="desktop-only" style={{ display: 'flex', gap: 24, flexShrink: 0, paddingBottom: 4 }}>
            {[['5,000+', 'Events'], ['15+', 'Years'], ['Vizag', 'Based']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main: sidebar + packages ── */}
      <div className="page-inner">
        <div className="d-grid-sidebar">

          {/* LEFT SIDEBAR — sticky filters */}
          <div className="d-sticky setup-filters">

            {/* Event type */}
            <p style={S.sectionLabel}>Event Type</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {EVENT_TYPES.map(et => (
                <button key={et.key} onClick={() => setEventType(et.key)} style={S.chip(eventType === et.key)}>
                  <span style={{ fontSize: 15 }}>{et.icon}</span>{et.label}
                </button>
              ))}
            </div>

            {/* Package category */}
            <p style={S.sectionLabel}>Package Type</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 13px', borderRadius: 999, border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: category === cat.key ? 600 : 500,
                    fontSize: 14, whiteSpace: 'nowrap',
                    background: category === cat.key ? 'var(--heading)' : 'var(--bg)',
                    color: category === cat.key ? '#fff' : 'var(--heading)',
                    boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s',
                  }}>
                  <span style={{ fontSize: 15 }}>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>

            {/* Guest counter */}
            <p style={S.sectionLabel}>Guest Count</p>
            <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>Guests</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setGuestCount(v => Math.max(1, v > 25 ? v - 5 : v - 1))} style={S.guestBtn(false)}>−</button>
                {editingGuests ? (
                  <input
                    autoFocus
                    type="number"
                    value={guestInput}
                    onChange={e => setGuestInput(e.target.value)}
                    onBlur={() => { const n = parseInt(guestInput); if (!isNaN(n) && n > 0) setGuestCount(n); setEditingGuests(false) }}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                    style={{ fontWeight: 700, fontSize: 18, color: 'var(--heading)', width: 52, textAlign: 'center', border: '1.5px solid var(--primary)', borderRadius: 8, padding: '2px 4px', outline: 'none', fontFamily: 'inherit' }}
                  />
                ) : (
                  <span
                    onClick={() => { setGuestInput(String(guestCount)); setEditingGuests(true) }}
                    title="Click to edit"
                    style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', minWidth: 36, textAlign: 'center', cursor: 'text', borderBottom: '1.5px dashed var(--primary)' }}
                  >{guestCount}</span>
                )}
                <button onClick={() => setGuestCount(v => v >= 25 ? v + 5 : v + 1)} style={S.guestBtn(true)}>+</button>
              </div>
            </div>

            {/* Meal time */}
            <p style={{ ...S.sectionLabel, marginTop: 18 }}>Meal Time</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MEAL_TABS.map(tab => (
                <button key={tab.key} onClick={() => setMealTab(tab.key)} style={S.mealChip(mealTab === tab.key)}>
                  <span style={{ fontSize: 15 }}>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — packages */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading)', letterSpacing: -0.3 }}>Available Packages</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '4px 12px', borderRadius: 999 }}>{filteredPkgs.length} found</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--muted)', fontSize: 15 }}>Loading packages...</p>
              </div>
            ) : filteredPkgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
                <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--heading)', marginBottom: 8 }}>No packages found</p>
                <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20 }}>Try adjusting filters or guest count.</p>
                <button onClick={() => { setSearch(''); setCategory('ALL'); setEventType('ALL'); setMealTab('All') }}
                  style={{ padding: '10px 28px', borderRadius: 999, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
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
                  const accentColor = CAT_COLORS[pkgCat] || '#34C759'
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setActiveModalPkg(pkg)}
                      style={{ background: 'var(--bg)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                    >
                      <div style={{ height: 140, background: img ? 'transparent' : accentColor, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {img
                          ? <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 52, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}>{EMOJIS[idx % EMOJIS.length]}</span>
                        }
                        <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>
                          {CAT_LABELS[pkgCat] || 'Package'}
                        </span>
                        <span style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: '50%', background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', border: '1.5px solid #fff' }} />
                      </div>
                      <div style={{ padding: '12px 14px 14px' }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--heading)', margin: '0 0 4px', lineHeight: 1.25, letterSpacing: -0.1 }}>{pkg.name}</p>
                        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 12px', lineHeight: 1.4 }}>
                          {(pkg.description || 'Customizable catering package').slice(0, 55)}{(pkg.description || '').length > 55 ? '…' : ''}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 16, color: accentColor, letterSpacing: -0.2 }}>
                            {tier ? `₹${tier.pricePerPerson}` : '—'}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginLeft: 1 }}>/pp</span>
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            {pkg.servesMin}+
                          </span>
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
          onConfirm={(eventDate, timeSlot) => {
            setEventDetails({ ...eventDetails, eventDate, timeSlot, guestCount, vegCount: guestCount, nonVegCount: 0 })
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
  const [eventDate, setEventDate] = useState(selectedDay)
  const [timeSlot,  setTimeSlot]  = useState('')
  const todayStr = new Date().toISOString().split('T')[0]
  const pkgCat   = (pkg.eventType || '').split(':')[0]
  const accentColor = CAT_COLORS[pkgCat] || '#34C759'

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: 'none', fontSize: 17, color: 'var(--heading)',
    background: 'var(--fill-tertiary)', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, animation: 'slideUp 0.32s var(--ease-spring)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 5, borderRadius: 999, background: 'var(--fill-secondary)' }} />
        </div>

        {/* Hero image */}
        <div style={{ height: 200, position: 'relative', background: accentColor, flexShrink: 0, overflow: 'hidden' }}>
          {(() => {
            const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image
            return img
              ? <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>🍛</div>
          })()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 54 }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: -0.3, lineHeight: 1.2 }}>{pkg.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: '5px 0 0' }}>{(pkg.description || '').slice(0, 65)}{pkg.description?.length > 65 ? '…' : ''}</p>
          </div>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>×</button>
        </div>

        <div style={{ padding: '20px 20px 0', overflowY: 'auto', flex: 1 }}>

          {/* Pricing tiers */}
          {pkg.pricingTiers?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Pricing Tiers</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {pkg.pricingTiers.sort((a, b) => a.minGuests - b.minGuests).map(t => {
                  const isMatch = guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests)
                  return (
                    <div key={t.id} style={{ padding: '9px 14px', borderRadius: 12, background: isMatch ? 'var(--primary-bg)' : 'var(--fill-tertiary)', border: `1.5px solid ${isMatch ? 'var(--primary)' : 'transparent'}`, textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} guests</div>
                      <div style={{ fontWeight: 700, color: isMatch ? 'var(--primary)' : 'var(--heading)', fontSize: 17, letterSpacing: -0.3 }}>₹{t.pricePerPerson}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>/pp</span></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Included categories */}
          {pkg.categoryRules?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>What's Included</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pkg.categoryRules.map(r => (
                  <span key={r.id} style={{ padding: '5px 12px', borderRadius: 999, background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 13, fontWeight: 600, letterSpacing: -0.1 }}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date + time */}
          <div style={{ background: 'var(--bg-page)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--separator-nm)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Event Date</p>
              <input type="date" value={eventDate} min={todayStr} onChange={e => setEventDate(e.target.value)} onClick={e => { try { e.target.showPicker() } catch(_) {} }} style={{ ...inputStyle, cursor: 'pointer' }} />
            </div>
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Time Slot</p>
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

          {/* Guests */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: 'var(--fill-tertiary)', borderRadius: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)', fontSize: 16 }} /> Guests
            </span>
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--heading)' }}>{guestCount}</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (!eventDate) { toast.error('Please select an event date'); return }
              if (!timeSlot) { toast.error('Please select a time slot'); return }
              onConfirm(eventDate, timeSlot)
            }}
            style={{ width: '100%', padding: '17px', borderRadius: 999, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-green)', marginBottom: 28, letterSpacing: -0.2 }}
          >
            Build Your Menu →
          </button>
        </div>
      </div>
    </div>
  )
}
