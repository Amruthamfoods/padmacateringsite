import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useBookingStore } from '../store/useBookingStore'

const EVENT_TYPES = [
  { key: 'ALL',        label: 'All Events'  },
  { key: 'Wedding',    label: 'Wedding'     },
  { key: 'Engagement', label: 'Engagement'  },
  { key: 'Birthday',   label: 'Birthday'    },
  { key: 'Corporate',  label: 'Corporate'   },
  { key: 'Festival',   label: 'Festival'    },
  { key: 'Any',        label: 'Other'       },
]

const CATEGORIES = [
  { key: 'ALL',      label: 'All Types'     },
  { key: 'BOX',      label: 'Meal Box'      },
  { key: 'BULK',     label: 'Bulk'          },
  { key: 'CATERING', label: 'Full Catering' },
]

const MEAL_TABS = [
  { key: 'All',       label: 'Any Meal'  },
  { key: 'Breakfast', label: 'Breakfast' },
  { key: 'Lunch',     label: 'Lunch'     },
  { key: 'Snacks',    label: 'Snacks'    },
  { key: 'Dinner',    label: 'Dinner'    },
]

const TIME_SLOT_GROUPS = [
  { label: 'Breakfast', slots: ['8:00 AM - 8:30 AM', '8:30 AM - 9:00 AM', '9:00 AM - 9:30 AM'] },
  { label: 'Snacks',    slots: ['10:00 AM - 10:30 AM', '3:00 PM - 3:30 PM', '4:00 PM - 4:30 PM', '5:00 PM - 5:30 PM'] },
  { label: 'Lunch',     slots: ['12:00 PM - 12:30 PM', '12:30 PM - 1:00 PM', '1:00 PM - 1:30 PM', '1:30 PM - 2:00 PM'] },
  { label: 'Dinner',    slots: ['6:30 PM - 7:00 PM', '7:00 PM - 7:30 PM', '7:30 PM - 8:00 PM', '8:00 PM - 8:30 PM'] },
]

const CAT_COLORS = { BOX: '#34C759', BULK: '#FF9500', CATERING: '#007AFF' }
const CAT_LABELS = { BOX: 'Meal Box', BULK: 'Bulk Delivery', CATERING: 'Full Catering' }

// Thali & Indian food fallback images (Unsplash)
const THALI_IMGS = [
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&q=80', // thali spread
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&q=80', // biryani
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&q=80', // Indian curry bowls
  'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&q=80', // South Indian thali
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&q=80', // dal & roti
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&q=80', // Indian food spread
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&q=80', // veg thali
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&q=80', // breakfast platter
  'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&auto=format&q=80', // dosa
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&q=80', // feast spread
]

function toDateStr(d) { return d.toISOString().split('T')[0] }
const TODAY = toDateStr(new Date())

// Minimal SVG icons (Apple/Google style)
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

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
  const [searchOpen,     setSearchOpen]     = useState(false)

  const userName = (() => { try { return JSON.parse(localStorage.getItem('padma_user') || '{}').name?.split(' ')[0] || '' } catch { return '' } })()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

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
    if (category !== 'ALL' && (pkg.eventType || '').split(':')[0] !== category) return false
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

  // Apple-style chip on green background
  const heroChip = (active) => ({
    padding: '6px 14px', borderRadius: 999, flexShrink: 0,
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: active ? 600 : 500, fontSize: 13, whiteSpace: 'nowrap',
    background: active ? '#fff' : 'rgba(255,255,255,0.15)',
    color: active ? '#1a7a33' : 'rgba(255,255,255,0.92)',
    transition: 'all 0.18s',
    letterSpacing: '-0.01em',
  })

  return (
    <div className="page-outer">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(40px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @keyframes fadeIn  { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }

        .setup-pkgs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pkg-card { background: var(--bg); border-radius: 18px; overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06); }
        .pkg-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.13); }
        .pkg-card:active { transform: scale(0.98); }

        .hero-filters { display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 0 20px 20px; scrollbar-width: none; }
        .hero-filters::-webkit-scrollbar { display: none; }
        .hero-filter-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.25); flex-shrink: 0; margin: 0 2px; }

        .hero-search-pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border-radius: 999px; padding: 7px 14px; flex-shrink: 0; border: none; cursor: pointer; color: rgba(255,255,255,0.85); font-family: inherit; font-size: 13px; font-weight: 500; transition: background 0.15s; }
        .hero-search-pill:hover { background: rgba(255,255,255,0.22); }
        .hero-search-open { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); border-radius: 999px; padding: 7px 14px; flex-shrink: 0; animation: fadeIn 0.15s ease; }
        .hero-search-open input { border: none; outline: none; background: transparent; font-size: 13px; color: #fff; font-family: inherit; width: 140px; }
        .hero-search-open input::placeholder { color: rgba(255,255,255,0.6); }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .results-badge { font-size: 12px; font-weight: 600; color: var(--primary); background: var(--primary-bg); padding: '3px 10px'; border-radius: 999px; padding: 3px 10px; }

        @media (min-width: 600px) {
          .setup-pkgs-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (min-width: 900px) {
          .setup-pkgs-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }
        @media (min-width: 1200px) {
          .setup-pkgs-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── Hero with filters inside ── */}
      <div className="setup-hero" style={{ background: 'linear-gradient(150deg, #3dd068 0%, #28A745 55%, #1e8a38 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Top row: greeting + stats */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 20px 18px', gap: 24 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 400, margin: '0 0 6px', letterSpacing: '0.01em' }}>
                {greeting}{userName ? `, ${userName}` : ''}
              </p>
              <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                What are you planning?
              </h2>
            </div>
            <div className="desktop-only" style={{ display: 'flex', gap: 24, flexShrink: 0, paddingTop: 4 }}>
              {[['5,000+', 'Events'], ['15+', 'Years'], ['Vizag', 'Based']].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{v}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter row — all options inside the green bar */}
          <div className="hero-filters">
            {/* Event type */}
            {EVENT_TYPES.map(et => (
              <button key={et.key} onClick={() => setEventType(et.key)} style={heroChip(eventType === et.key)}>
                {et.label}
              </button>
            ))}

            <div className="hero-filter-sep" />

            {/* Package type */}
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={heroChip(category === cat.key)}>
                {cat.label}
              </button>
            ))}

            <div className="hero-filter-sep" />

            {/* Meal time */}
            {MEAL_TABS.map(tab => (
              <button key={tab.key} onClick={() => setMealTab(tab.key)} style={heroChip(mealTab === tab.key)}>
                {tab.label}
              </button>
            ))}

            <div className="hero-filter-sep" />

            {/* Search — compact, always on the right of the scroll */}
            {searchOpen ? (
              <div className="hero-search-open">
                <IconSearch />
                <input
                  autoFocus
                  placeholder="Search packages..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setSearchOpen(false) }}
                />
                {search && (
                  <button onClick={() => { setSearch(''); setSearchOpen(false) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                )}
              </div>
            ) : (
              <button className="hero-search-pill" onClick={() => setSearchOpen(true)}>
                <IconSearch />
                Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Packages ── */}
      <div className="page-inner">
        <div className="section-header">
          <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--heading)', margin: 0, letterSpacing: '-0.2px' }}>
            {filteredPkgs.length === packages.length
              ? 'All Packages'
              : `${filteredPkgs.length} package${filteredPkgs.length !== 1 ? 's' : ''} found`}
          </p>
          {(eventType !== 'ALL' || category !== 'ALL' || mealTab !== 'All' || search) && (
            <button
              onClick={() => { setSearch(''); setCategory('ALL'); setEventType('ALL'); setMealTab('All'); setSearchOpen(false) }}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '2.5px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>Loading packages…</p>
          </div>
        ) : filteredPkgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg)', borderRadius: 20 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🍽️</div>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--heading)', margin: '0 0 8px' }}>No packages found</p>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>Try adjusting your filters.</p>
            <button onClick={() => { setSearch(''); setCategory('ALL'); setEventType('ALL'); setMealTab('All') }}
              style={{ padding: '10px 24px', borderRadius: 999, background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="setup-pkgs-grid">
            {filteredPkgs.map((pkg, idx) => {
              const pkgCat = (pkg.eventType || '').split(':')[0]
              const tier = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests)
                .find(t => guestCount >= t.minGuests && (t.maxGuests == null || guestCount <= t.maxGuests))
                || pkg.pricingTiers?.[0]
              const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image || THALI_IMGS[idx % THALI_IMGS.length]
              const accent = CAT_COLORS[pkgCat] || '#34C759'
              return (
                <div key={pkg.id} className="pkg-card" onClick={() => setActiveModalPkg(pkg)}>
                  {/* Image */}
                  <div style={{ height: 148, position: 'relative', overflow: 'hidden' }}>
                    <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 55%)' }} />

                    {/* Category badge */}
                    <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.01em' }}>
                      {CAT_LABELS[pkgCat] || 'Package'}
                    </span>

                    {/* Veg/NonVeg dot */}
                    <span style={{ position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: '50%', background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', border: '1.5px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: '13px 14px 15px' }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--heading)', margin: '0 0 3px', lineHeight: 1.25, letterSpacing: '-0.2px' }}>{pkg.name}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12.5, margin: '0 0 12px', lineHeight: 1.45 }}>
                      {(pkg.description || 'Customizable catering package').slice(0, 52)}{(pkg.description || '').length > 52 ? '…' : ''}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: accent, letterSpacing: '-0.3px' }}>
                        {tier ? `₹${tier.pricePerPerson}` : '—'}
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginLeft: 2 }}>/person</span>
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconUsers />
                        {pkg.servesMin}+ guests
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Package modal ── */}
      {activeModalPkg && (
        <PackageModal
          pkg={activeModalPkg}
          selectedDay={selectedDay}
          initialGuests={guestCount}
          onClose={() => setActiveModalPkg(null)}
          onConfirm={(eventDate, timeSlot, guests) => {
            setGuestCount(guests)
            setEventDetails({ ...eventDetails, eventDate, timeSlot, guestCount: guests, vegCount: guests, nonVegCount: 0 })
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
function PackageModal({ pkg, selectedDay, initialGuests, onClose, onConfirm }) {
  const [eventDate,     setEventDate]     = useState(selectedDay)
  const [timeSlot,      setTimeSlot]      = useState('')
  const [guests,        setGuests]        = useState(initialGuests)
  const [editingGuests, setEditingGuests] = useState(false)
  const [guestInput,    setGuestInput]    = useState('')

  const todayStr    = new Date().toISOString().split('T')[0]
  const pkgCat      = (pkg.eventType || '').split(':')[0]
  const accent      = CAT_COLORS[pkgCat] || '#34C759'

  const activeTier = pkg.pricingTiers?.slice().sort((a, b) => a.minGuests - b.minGuests)
    .find(t => guests >= t.minGuests && (t.maxGuests == null || guests <= t.maxGuests))
    || pkg.pricingTiers?.[0]

  const fieldStyle = {
    width: '100%', padding: '13px 15px', borderRadius: 12,
    border: 'none', fontSize: 15, color: 'var(--heading)',
    background: 'var(--fill-tertiary)', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none', fontWeight: 500,
  }

  const counterBtn = (plus) => ({
    width: 34, height: 34, borderRadius: '50%', border: 'none',
    background: plus ? accent : 'var(--fill-secondary)',
    color: plus ? '#fff' : 'var(--heading)',
    fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 500, lineHeight: 1, fontFamily: 'inherit',
    flexShrink: 0,
  })

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
    >
      <div style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 32, height: 4, borderRadius: 999, background: 'var(--fill-secondary)' }} />
        </div>

        {/* Hero */}
        <div style={{ height: 210, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
          {(() => {
            const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image || THALI_IMGS[0]
            return <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          })()}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 18, left: 20, right: 54 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>{CAT_LABELS[pkgCat] || 'Package'}</p>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{pkg.name}</h3>
          </div>
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 400 }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 20px 8px' }}>

          {/* Pricing tiers */}
          {pkg.pricingTiers?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Pricing</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {pkg.pricingTiers.sort((a, b) => a.minGuests - b.minGuests).map(t => {
                  const isMatch = guests >= t.minGuests && (t.maxGuests == null || guests <= t.maxGuests)
                  return (
                    <div key={t.id} style={{ padding: '8px 14px', borderRadius: 12, background: isMatch ? `${accent}18` : 'var(--fill-tertiary)', border: `1.5px solid ${isMatch ? accent : 'transparent'}`, textAlign: 'center', minWidth: 88 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, marginBottom: 3, letterSpacing: '0.02em' }}>{t.minGuests}{t.maxGuests ? `–${t.maxGuests}` : '+'} guests</div>
                      <div style={{ fontWeight: 700, color: isMatch ? accent : 'var(--heading)', fontSize: 16, letterSpacing: '-0.3px' }}>₹{t.pricePerPerson}<span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)' }}>/pp</span></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Included categories */}
          {pkg.categoryRules?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>What's Included</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pkg.categoryRules.map(r => (
                  <span key={r.id} style={{ padding: '4px 11px', borderRadius: 999, background: `${accent}15`, color: accent, fontSize: 13, fontWeight: 600, letterSpacing: '-0.1px' }}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Menu items */}
          {pkg.items?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                Menu Items · {pkg.items.length}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {pkg.items.map((pi, i) => (
                  <div key={pi.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--heading)', padding: '5px 0', borderBottom: '0.5px solid var(--separator-nm)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: pkg.type === 'VEG' ? '#34C759' : '#FF3B30', border: '1px solid rgba(0,0,0,0.08)' }} />
                    {pi.menuItem?.name || pi.name || 'Item'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date + Time */}
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Event Details</p>
          <div style={{ background: 'var(--fill-tertiary)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--separator-nm)' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', margin: '0 0 7px' }}>Date</p>
              <input type="date" value={eventDate} min={todayStr} onChange={e => setEventDate(e.target.value)} onClick={e => { try { e.target.showPicker() } catch(_) {} }}
                style={{ ...fieldStyle, background: 'transparent', padding: '0', fontSize: 15, cursor: 'pointer', fontWeight: 600 }} />
            </div>
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', margin: '0 0 7px' }}>Time Slot</p>
              <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
                style={{ ...fieldStyle, background: 'transparent', padding: '0', fontSize: 15, fontWeight: 600 }}>
                <option value="">Select a time slot…</option>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--fill-tertiary)', borderRadius: 14, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading)', margin: '0 0 2px', letterSpacing: '-0.1px' }}>Guests</p>
              {activeTier && (
                <p style={{ fontSize: 12, color: accent, fontWeight: 600, margin: 0 }}>
                  ₹{activeTier.pricePerPerson}/pp · ₹{(activeTier.pricePerPerson * guests).toLocaleString('en-IN')} est.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setGuests(v => Math.max(1, v > 25 ? v - 5 : v - 1))} style={counterBtn(false)}>−</button>
              {editingGuests ? (
                <input
                  autoFocus type="number" value={guestInput}
                  onChange={e => setGuestInput(e.target.value)}
                  onBlur={() => { const n = parseInt(guestInput); if (!isNaN(n) && n > 0) setGuests(n); setEditingGuests(false) }}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
                  style={{ fontWeight: 700, fontSize: 19, color: 'var(--heading)', width: 58, textAlign: 'center', border: `1.5px solid ${accent}`, borderRadius: 10, padding: '2px 4px', outline: 'none', fontFamily: 'inherit' }}
                />
              ) : (
                <span onClick={() => { setGuestInput(String(guests)); setEditingGuests(true) }} title="Tap to edit"
                  style={{ fontWeight: 700, fontSize: 22, color: 'var(--heading)', minWidth: 38, textAlign: 'center', cursor: 'text', borderBottom: `1.5px dashed ${accent}` }}>
                  {guests}
                </span>
              )}
              <button onClick={() => setGuests(v => v >= 25 ? v + 5 : v + 1)} style={counterBtn(true)}>+</button>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (!eventDate) { toast.error('Please select a date'); return }
              if (!timeSlot)  { toast.error('Please select a time slot'); return }
              onConfirm(eventDate, timeSlot, guests)
            }}
            style={{ width: '100%', padding: '16px', borderRadius: 999, background: accent, border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', marginBottom: 28, boxShadow: `0 4px 20px ${accent}55` }}
          >
            Build Your Menu →
          </button>
        </div>
      </div>
    </div>
  )
}
