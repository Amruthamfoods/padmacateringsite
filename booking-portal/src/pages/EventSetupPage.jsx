import { useState, useEffect, useRef } from 'react'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'
import { useCartStore } from '../store/useCartStore'

const CATEGORIES = [
  { key: 'ALL', label: 'All', icon: '🍽️' },
  { key: 'BOX', label: 'Meal Box', icon: '🥡' },
  { key: 'BULK', label: 'Bulk', icon: '📦' },
  { key: 'CATERING', label: 'Catering', icon: '🍛' },
]

const EVENT_TYPES = [
  { key: 'ALL', label: 'All', icon: '✨' },
  { key: 'Wedding', label: 'Wedding', icon: '💒' },
  { key: 'Engagement', label: 'Engagement', icon: '💍' },
  { key: 'Birthday', label: 'Birthday', icon: '🎂' },
  { key: 'Corporate', label: 'Office', icon: '🏢' },
  { key: 'Festival', label: 'Festival', icon: '🎊' },
  { key: 'Any', label: 'Other', icon: '🌟' },
]

const MEAL_TABS = [
  { key: 'All', label: 'All', icon: '🍽️' },
  { key: 'Breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'Lunch', label: 'Lunch', icon: '☀️' },
  { key: 'Snacks', label: 'Snacks', icon: '🫙' },
  { key: 'Dinner', label: 'Dinner', icon: '🌙' },
]

const TIME_SLOT_GROUPS = [
  { label: 'Breakfast', slots: ['8:00 AM - 8:30 AM', '8:30 AM - 9:00 AM', '9:00 AM - 9:30 AM'] },
  { label: 'Snacks', slots: ['10:00 AM - 10:30 AM', '3:00 PM - 3:30 PM', '4:00 PM - 4:30 PM', '5:00 PM - 5:30 PM'] },
  { label: 'Lunch', slots: ['12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM', '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM'] },
  { label: 'Dinner', slots: ['6:30 PM - 7:00 PM', '7:00 PM - 7:30 PM', '7:30 PM - 8:00 PM', '8:00 PM - 8:30 PM'] },
]

const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const CAT_COLORS = { BOX: 'var(--primary)', BULK: '#FF9500', CATERING: '#007AFF' }
const CAT_LABELS = { BOX: 'Meal Box', BULK: 'Delivery Box', CATERING: 'Catering' }
const PKG_IMAGES = [
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=280&fit=crop&q=80', // biryani
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=280&fit=crop&q=80', // south indian thali
  'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=280&fit=crop&q=80', // curry bowls
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=280&fit=crop&q=80', // indian meal
  'https://images.unsplash.com/photo-1546456073-ea246a7bd25f?w=400&h=280&fit=crop&q=80',   // dal/curry
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&h=280&fit=crop&q=80', // south indian
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=280&fit=crop&q=80', // indian plate
  'https://images.unsplash.com/photo-1555244162-803834f87a4d?w=400&h=280&fit=crop&q=80',   // catering spread
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
  const { eventDetails, setEventDetails, setMenuPreferences } = useBookingStore()
  const { addToCart, isInCart } = useCartStore()

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const [eventType, setEventType] = useState('ALL')
  const [mealTab, setMealTab] = useState('All')
  const [selectedDay, setSelectedDay] = useState(eventDetails.eventDate || TODAY)
  const [guestCount, setGuestCount] = useState(eventDetails.guestCount || 25)
  const [guestEditing, setGuestEditing] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [activeModalPkg, setActiveModalPkg] = useState(null)
  const [search, setSearch] = useState('')
  const dateRef = useRef(null)
  const guestInputRef = useRef(null)
  const allDays = get90Days()

  const { user: authUser } = useAuthStore()
  const userName = authUser?.name?.split(' ')[0] || ''
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  // Group 90 days by month
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
      boxShadow: active ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
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

  // ── Date picker strip (shared between sidebar and mobile) ──
  const DateStrip = () => (
    <div style={{ overflowX: 'auto', scrollbarWidth: 'none', marginLeft: -4, paddingLeft: 4 }}>
      <div ref={dateRef} style={{ display: 'flex', gap: 0, width: 'max-content', paddingBottom: 4 }}>
        {monthGroups.map(group => (
          <div key={group.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 24, flexShrink: 0 }}>
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 9, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
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
                    width: 40, height: 56, flexShrink: 0, margin: '0 1px',
                    borderRadius: 10, border: 'none', cursor: isPast ? 'default' : 'pointer',
                    background: isSel ? 'var(--primary)' : 'transparent',
                    transition: 'all 0.15s var(--ease)', opacity: isPast ? 0.28 : 1,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, color: isSel ? 'rgba(255,255,255,0.8)' : 'var(--muted)', marginBottom: 2 }}>
                    {DAY_SHORT[d.getDay()]}
                  </span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSel ? 'rgba(255,255,255,0.22)' : isToday ? 'var(--fill-tertiary)' : 'transparent',
                    border: isToday && !isSel ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: isSel || isToday ? 700 : 400, color: isSel ? '#fff' : isToday ? 'var(--primary)' : 'var(--heading)' }}>
                      {d.getDate()}
                    </span>

                    {/* Veg/NonVeg dot */}
                    <span style={{ position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: '50%', background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', border: '1.5px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

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

      {/* ── Page header ── */}
      <div style={{ borderBottom: '0.5px solid var(--separator-nm)', padding: '20px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 2px' }}>{greeting}{userName ? `, ${userName}` : ''}!</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading)', margin: 0, letterSpacing: '-0.02em' }}>What are you planning today?</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fill-tertiary)', borderRadius: 12, padding: '10px 16px', minWidth: 220, maxWidth: 380, flex: 1 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: 'var(--heading)', background: 'transparent', fontFamily: 'inherit' }}
              placeholder="Search packages, events..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'var(--fill-secondary)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>✕</button>
            )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => changeGuest(-1)} style={S.guestBtn(false)}>−</button>
                {guestEditing ? (
                  <input
                    ref={guestInputRef}
                    type="number"
                    value={guestInput}
                    onChange={e => setGuestInput(e.target.value)}
                    onBlur={commitGuestInput}
                    onKeyDown={e => { if (e.key === 'Enter') commitGuestInput(); if (e.key === 'Escape') setGuestEditing(false) }}
                    style={{ width: 54, textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--heading)', background: 'var(--fill-tertiary)', border: '1.5px solid var(--primary)', borderRadius: 8, outline: 'none', padding: '2px 4px', fontFamily: 'inherit' }}
                    min={10} max={1000}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => { setGuestInput(String(guestCount)); setGuestEditing(true) }}
                    title="Click to type a number"
                    style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', minWidth: 36, textAlign: 'center', cursor: 'text', borderBottom: '1.5px dashed var(--separator-nm)', paddingBottom: 1 }}
                  >{guestCount}</span>
                )}
                <button onClick={() => changeGuest(1)} style={S.guestBtn(true)}>+</button>
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
                  const accentColor = CAT_COLORS[pkgCat] || 'var(--primary)'
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
                          : <img src={PKG_IMAGES[idx % PKG_IMAGES.length]} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (isInCart(pkg.id)) { toast('Already in cart'); return }
                              const added = addToCart(pkg, eventDetails, tier?.pricePerPerson || 0)
                              if (added) toast.success(`${pkg.name} added to cart`)
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '5px 10px', borderRadius: 'var(--r-pill)',
                              background: isInCart(pkg.id) ? 'var(--primary-bg)' : 'var(--primary)',
                              color: isInCart(pkg.id) ? 'var(--primary-dark)' : '#fff',
                              border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <i className={`fa-solid ${isInCart(pkg.id) ? 'fa-check' : 'fa-cart-plus'}`} style={{ fontSize: 11 }} />
                            {isInCart(pkg.id) ? 'In Cart' : 'Add'}
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
                  const isMatch = localGuests >= t.minGuests && (t.maxGuests == null || localGuests <= t.maxGuests)
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
              <input type="date" value={eventDate} min={todayStr} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
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

          {/* Guests — interactive counter */}
          <div style={{ background: 'var(--fill-tertiary)', borderRadius: 12, padding: '13px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)', fontSize: 16 }} /> Guests
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>(min {pkgMin})</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => changeGuest(-1)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--heading)', boxShadow: 'var(--shadow-sm)' }}
              >−</button>
              {guestEditing ? (
                <input
                  type="number"
                  value={guestInput}
                  onChange={e => setGuestInput(e.target.value)}
                  onBlur={commitGuestInput}
                  onKeyDown={e => { if (e.key === 'Enter') commitGuestInput(); if (e.key === 'Escape') setGuestEditing(false) }}
                  style={{ width: 58, textAlign: 'center', fontWeight: 700, fontSize: 18, color: 'var(--heading)', background: 'var(--bg)', border: '1.5px solid var(--primary)', borderRadius: 8, outline: 'none', padding: '3px 4px', fontFamily: 'inherit' }}
                  min={10} max={1000} autoFocus
                />
              ) : (
                <span
                  onClick={() => { setGuestInput(String(localGuests)); setGuestEditing(true) }}
                  title="Click to type"
                  style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', minWidth: 38, textAlign: 'center', cursor: 'text', borderBottom: '1.5px dashed var(--separator-nm)', paddingBottom: 1 }}
                >{localGuests}</span>
              )}
              <button
                onClick={() => changeGuest(1)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--primary)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', boxShadow: 'var(--shadow-green)' }}
              >+</button>
            </div>
          </div>

          {/* Veg guests counter — NON_VEG packages only */}
          {isNonVeg && (
            <div style={{ background: 'var(--fill-tertiary)', borderRadius: 12, padding: '13px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34C759', display: 'inline-block' }} />
                  Veg Guests
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setVegGuests(v => Math.max(0, v - 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--heading)', boxShadow: 'var(--shadow-sm)' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', minWidth: 38, textAlign: 'center' }}>{vegGuests}</span>
                  <button onClick={() => setVegGuests(v => Math.min(localGuests, v + 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#34C759', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(52,199,89,0.3)' }}>+</button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                Non-veg: {localGuests - vegGuests} guests
              </p>
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
            style={{ width: '100%', padding: '17px', borderRadius: 999, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 17, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-green)', marginBottom: 28, letterSpacing: -0.2 }}
          >
            Build Your Menu →
          </button>
        </div>
      </div>
    </div>
  )
}
