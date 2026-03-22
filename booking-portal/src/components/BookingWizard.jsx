/**
 * BookingWizard — multi-step onboarding popup shown when "Book Now" is clicked.
 * Collects: location → date → guests → package type → diet preference
 * Uses Google Places Autocomplete (Maps already loaded in index.html)
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/useBookingStore'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

const STEPS = [
    { id: 'location', label: 'Location' },
    { id: 'date', label: 'Date' },
    { id: 'guests', label: 'Guests' },
    { id: 'type', label: 'Service' },
    { id: 'diet', label: 'Diet' },
]

const PACKAGE_TYPES = [
    { key: 'BOX',      icon: '🍱', title: 'Meal Box',      color: '#007AFF', desc: 'Individually curated meals, elegantly packed for one. A perfect blend of taste, hygiene, and convenience.' },
    { key: 'BULK',     icon: '📦', title: 'Delivery Box',  color: '#34C759', desc: 'Carefully packed bulk orders for safe and seamless transport. Designed to retain freshness, quality, and presentation.' },
    { key: 'CATERING', icon: '🍛', title: 'Full Catering', color: '#FF6B35', desc: 'Exquisite culinary experiences crafted for every occasion. Flawless service, refined presentation, and exceptional taste.' },
]

function toDateStr(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}
const TODAY = toDateStr(new Date())
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMinDate(hours) { return toDateStr(new Date(Date.now() + hours * 60 * 60 * 1000)) }

function get60Days(minAdvanceHours) {
    return Array.from({ length: 60 }, (_, i) => {
        const d = new Date(Date.now() + minAdvanceHours * 60 * 60 * 1000)
        d.setDate(d.getDate() + i)
        return d
    })
}

export default function BookingWizard({ onClose }) {
    const navigate = useNavigate()
    const { setEventDetails } = useBookingStore()
    const { token: authToken } = useAuthStore()
    const [step, setStep] = useState(0)
    const [leaving, setLeaving] = useState(false)
    const [direction, setDirection] = useState(1)

    // Form state
    const [city, setCity] = useState('')
    const [date, setDate] = useState(getMinDate(48))
    const [showCal, setShowCal] = useState(false)
    const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
    const [guests, setGuests] = useState(50)
    const [guestEditing, setGe] = useState(false)
    const [guestInput, setGi] = useState('')
    const [pkgType, setPkgType] = useState('')
    const [mealType, setMealType] = useState('')
    const [diet, setDiet] = useState('')
    const [cityLat, setCityLat] = useState(null)
    const [cityLng, setCityLng] = useState(null)
    const [locationError, setLocationError] = useState('')
    const [checkingRange, setCheckingRange] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState([])
    const [addressLabel, setAddressLabel] = useState('')
    const [minAdvanceHours, setMinAdvanceHours] = useState(48)


    // Fetch public settings on mount
    useEffect(() => {
        api.get('/api/settings/public')
            .then(r => {
                const hrs = r.data?.minAdvanceHours ?? 48
                setMinAdvanceHours(hrs)
                setDate(getMinDate(hrs))
            })
            .catch(() => {})
    }, [])

    // Fetch saved addresses when logged in
    useEffect(() => {
        if (!authToken) return
        api.get('/booking/my-addresses', { headers: { Authorization: `Bearer ${authToken}` } })
            .then(r => { if (Array.isArray(r.data)) setSavedAddresses(r.data) })
            .catch(() => {})
    }, [authToken])
    const dateRef = useRef(null)
    const cityInputRef = useRef(null)
    const acRef = useRef(null) // Google Places Autocomplete instance
    const allDays = get60Days(minAdvanceHours)
    const monthGroups = allDays.reduce((acc, d) => {
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!acc.find(g => g.key === key)) acc.push({ key, label: MONTHS_FULL[d.getMonth()], days: [] })
        acc.find(g => g.key === key).days.push(d)
        return acc
    }, [])

    // Init Google Places Autocomplete on step 0
    useEffect(() => {
        if (step !== 0 || !cityInputRef.current) return
        const tryInit = () => {
            if (!window.google?.maps?.places) { setTimeout(tryInit, 300); return }
            if (acRef.current) return // already initialized
            acRef.current = new window.google.maps.places.Autocomplete(cityInputRef.current, {
                componentRestrictions: { country: 'in' },
                fields: ['formatted_address', 'geometry', 'name'],
                types: ['establishment', 'geocode'],
            })
            acRef.current.addListener('place_changed', () => {
                const place = acRef.current.getPlace()
                const addr = place.formatted_address || place.name || ''
                const lat = place.geometry?.location?.lat()
                const lng = place.geometry?.location?.lng()
                setCity(addr)
                setCityLat(lat || null)
                setCityLng(lng || null)
                setLocationError('')
                if (lat && lng) {
                  setCheckingRange(true)
                  api.post('/delivery/calculate', { lat, lng, guestCount: 50 })
                    .then(({ data }) => {
                      if (data.outOfRange) {
                        setLocationError('Sorry, we only serve within 30 km of Visakhapatnam. Please choose a closer location. We serve in Andhra, Telangana & Odisha. Contact +91 86 86 622 722 for bookings outside Visakhapatnam.')
                        setCityLat(null); setCityLng(null)
                      }
                    })
                    .catch(() => {})
                    .finally(() => setCheckingRange(false))
                }
            })
        }
        setTimeout(tryInit, 200)
        return () => {
            if (acRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(acRef.current)
                acRef.current = null
            }
        }
    }, [step])

    // Scroll today into view on date step
    useEffect(() => {
        if (step !== 1 || !dateRef.current) return
        setTimeout(() => {
            const el = dateRef.current?.querySelector('[data-today="true"]')
            if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        }, 300)
    }, [step])

    function changeGuests(delta) {
        setGuests(v => {
            const s = v < 25 || (delta < 0 && v <= 25) ? 1 : 5
            return Math.min(1000, Math.max(10, v + delta * s))
        })
    }
    function commitGuest() {
        const p = parseInt(guestInput, 10)
        if (!isNaN(p)) setGuests(Math.min(1000, Math.max(10, p)))
        setGe(false)
    }
    async function pickSavedAddress(addr) {
        setCity(addr.address)
        setAddressLabel(addr.label || '')
        setLocationError('')
        if (addr.lat && addr.lng) {
            setCityLat(addr.lat); setCityLng(addr.lng)
            setCheckingRange(true)
            try {
                const { data } = await api.post('/delivery/calculate', { lat: addr.lat, lng: addr.lng, guestCount: 50 })
                if (data.outOfRange) {
                    setLocationError('Sorry, we only serve within 30 km of Visakhapatnam. Please choose a closer location. We serve in Andhra, Telangana & Odisha. Contact +91 86 86 622 722 for bookings outside Visakhapatnam.')
                    setCityLat(null); setCityLng(null); setCity('')
                }
            } catch {} finally { setCheckingRange(false) }
        } else {
            setCityLat(null); setCityLng(null)
        }
    }

    function canNext() {
        if (step === 0) return city.trim().length > 0 && !locationError && !checkingRange
        if (step === 1) return !!date
        if (step === 2) return guests >= 10
        if (step === 3) return !!pkgType && !!mealType
        if (step === 4) return !!diet
        return true
    }
    function goTo(nextStep) {
        setDirection(nextStep > step ? 1 : -1)
        setLeaving(true)
        setTimeout(() => { setStep(nextStep); setLeaving(false) }, 220)
    }
    function finish() {
        setEventDetails({ city, eventDate: date, guestCount: guests, serviceType: pkgType, mealType, dietPreference: diet })
        onClose({ pkgType, mealType, diet, guests, date, city })
    }

    const slideStyle = {
        animation: leaving
            ? `wizLeave${direction > 0 ? 'L' : 'R'} 0.22s ease forwards`
            : `wizEnter${direction > 0 ? 'R' : 'L'} 0.28s ease forwards`,
    }

    // Primary orange for wizard
    const P = 'var(--primary)'
    const PD = 'var(--primary-dark)'
    const PBG = 'var(--primary-bg)'

    return (
        <>
            <style>{`
        @keyframes wizEnterR { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
        @keyframes wizEnterL { from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:translateX(0)} }
        @keyframes wizLeaveL { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-28px)} }
        @keyframes wizLeaveR { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(28px)} }
        @keyframes wizBgIn   { from{opacity:0} to{opacity:1} }
        .wiz-pkg-card { cursor:pointer; border-radius:14px; padding:18px 16px; border:2px solid var(--separator-nm); background:var(--bg); transition:all 0.15s; text-align:left; width:100%; font-family:inherit; }
        .wiz-pkg-card:hover { border-color:var(--primary); }
        .wiz-pkg-card.sel   { border-color:var(--primary); background:var(--primary); }
        .wiz-diet-card { cursor:pointer; border-radius:14px; padding:22px 18px; border:2px solid var(--separator-nm); background:var(--bg); transition:all 0.15s; text-align:center; font-family:inherit; flex:1; }
        .wiz-diet-card:hover { border-color:var(--primary); }
        .wiz-diet-card.sel   { border-color:var(--primary); background:var(--primary); }
        .wiz-next-btn { width:100%; padding:16px; border-radius:999px; background:var(--primary); border:none; color:#fff; font-weight:700; font-size:16px; cursor:pointer; font-family:inherit; transition:opacity 0.15s, background 0.15s; letter-spacing:-0.02em; box-shadow:var(--shadow-green); }
        .wiz-next-btn:hover:not(:disabled) { background:var(--primary-dark); }
        .wiz-next-btn:disabled { opacity:0.35; cursor:default; }
        .wiz-date-btn { flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; width:44px; height:60px; border-radius:12px; border:none; cursor:pointer; background:transparent; transition:all 0.15s; margin:0 1px; }
        .wiz-date-btn.sel { background:var(--primary); }
        .wiz-date-btn:disabled { opacity:0.25; cursor:default; }
        /* Google Places PAC dropdown z-index fix */
        .pac-container { z-index: 9999 !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.14) !important; border: 1px solid var(--separator-nm) !important; margin-top: 4px !important; font-family: var(--font) !important; }
        .pac-item { padding: 10px 14px !important; font-size: 14px !important; cursor: pointer !important; border-top: 1px solid var(--separator-nm) !important; }
        .pac-item:hover, .pac-item-selected { background: var(--fill-tertiary) !important; }
        .pac-matched { color: var(--primary) !important; font-weight: 600 !important; }
      `}</style>

            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                animation: 'wizBgIn 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}>
                {/* Modal card */}
                <div onClick={e => e.stopPropagation()} style={{
                    background: 'var(--bg-page)', borderRadius: 24,
                    width: '100%', maxWidth: 480,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
                    overflow: 'hidden',
                }}>
                    {/* Progress bar — orange */}
                    <div style={{ height: 3, background: 'var(--separator-nm)' }}>
                        <div style={{
                            height: '100%', background: P,
                            width: `${((step + 1) / STEPS.length) * 100}%`,
                            transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                    </div>

                    {/* Header dots */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {STEPS.map((s, i) => (
                                <div key={s.id} style={{
                                    width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                                    background: i <= step ? P : 'var(--separator-nm)',
                                    transition: 'all 0.3s', cursor: i < step ? 'pointer' : 'default',
                                }} onClick={() => i < step && goTo(i)} />
                            ))}
                            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4, fontWeight: 500 }}>
                                {step + 1} of {STEPS.length}
                            </span>
                        </div>
                        <button onClick={onClose} style={{
                            width: 30, height: 30, borderRadius: '50%',
                            border: '1.5px solid var(--separator-nm)', background: 'var(--bg)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, color: 'var(--muted)', fontFamily: 'inherit',
                        }}>✕</button>
                    </div>

                    {/* Step content */}
                    <div style={{ padding: '20px 22px 24px', minHeight: 300 }}>
                        <div style={slideStyle}>

                            {/* ── STEP 0: Location with Google Places ── */}
                            {step === 0 && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 1</p>
                                    <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Where's the event?</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 14px' }}>We'll show packages available for your area.</p>

                                    {/* Address label — shown after address is selected */}
                                    {city && !locationError && (
                                    <input
                                        type="text"
                                        value={addressLabel}
                                        onChange={e => setAddressLabel(e.target.value)}
                                        placeholder="Address name (e.g. Home, Wedding Hall, Office)"
                                        style={{
                                            width: '100%', padding: '11px 14px', borderRadius: 10,
                                            border: '1.5px solid var(--separator-nm)', fontSize: 14,
                                            color: 'var(--heading)', background: 'var(--bg)',
                                            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                                            marginBottom: 8,
                                        }}
                                        onFocus={e => e.target.style.borderColor = P}
                                        onBlur={e => e.target.style.borderColor = 'var(--separator-nm)'}
                                    />
                                    )}

                                    {/* Address search */}
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <input
                                            ref={cityInputRef}
                                            type="text"
                                            defaultValue={city}
                                            onKeyDown={e => e.key === 'Enter' && canNext() && goTo(1)}
                                            onInput={e => { setCity(e.target.value); setLocationError(''); setCityLat(null); setCityLng(null); setAddressLabel('') }}
                                            placeholder="Search venue, area or city…"
                                            autoComplete="off"
                                            style={{
                                                width: '100%', padding: '13px 16px 13px 42px',
                                                borderRadius: 12, border: `1.5px solid var(--separator-nm)`,
                                                fontSize: 15, color: 'var(--heading)', background: 'var(--bg)',
                                                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.15s',
                                            }}
                                            onFocus={e => e.target.style.borderColor = P}
                                            onBlur={e => e.target.style.borderColor = 'var(--separator-nm)'}
                                        />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' }}>e.g. Vizag, Gajuwaka, MVP Colony, Rushikonda…</p>

                                    {checkingRange && (
                                        <p style={{ fontSize: 12.5, color: 'var(--primary)', margin: '8px 0 0' }}>
                                            <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 6 }} />
                                            Checking delivery range...
                                        </p>
                                    )}
                                    {locationError && (
                                        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(244,67,54,0.07)', borderRadius: 10, border: '1.5px solid rgba(244,67,54,0.25)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <i className="fa-solid fa-circle-exclamation" style={{ color: '#d32f2f', marginTop: 1, flexShrink: 0 }} />
                                            <p style={{ fontSize: 13, color: '#c62828', margin: 0, lineHeight: 1.5 }}>{locationError}</p>
                                        </div>
                                    )}

                                    {/* Saved addresses (logged-in users) */}
                                    {savedAddresses.length > 0 && (
                                        <div style={{ marginTop: 18 }}>
                                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Saved Addresses</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {savedAddresses.map(addr => (
                                                    <button key={addr.id} onClick={() => pickSavedAddress(addr)} style={{
                                                        display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                                                        padding: '10px 12px', background: city === addr.address ? 'var(--primary-bg)' : 'var(--fill-tertiary)',
                                                        border: city === addr.address ? '1.5px solid var(--primary-light)' : '1.5px solid transparent',
                                                        borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                                    }}>
                                                        <i className="fa-solid fa-location-dot" style={{ color: city === addr.address ? 'var(--primary)' : 'var(--muted)', marginTop: 2, flexShrink: 0, fontSize: 13 }} />
                                                        <div style={{ minWidth: 0 }}>
                                                            {addr.label && <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>{addr.label}</p>}
                                                            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addr.address}</p>
                                                        </div>
                                                        {addr.isDefault && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>DEFAULT</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── STEP 1: Date strip + inline calendar ── */}
                            {step === 1 && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 2</p>
                                    <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>When's your event?</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 16px' }}>Tap a date to pick — or scroll for more.</p>

                                    {/* Horizontal date strip */}
                                    <div ref={dateRef} style={{ overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12 }}>
                                        <div style={{ display: 'flex', gap: 0, width: 'max-content', paddingBottom: 4 }}>
                                            {monthGroups.map(group => (
                                                <div key={group.key} style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: 22, flexShrink: 0 }}>
                                                        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 8, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                                                            {group.label.slice(0, 3)}
                                                        </span>
                                                    </div>
                                                    {group.days.map(d => {
                                                        const ds = toDateStr(d)
                                                        const isSel = ds === date
                                                        const isToday = ds === TODAY
                                                        const isPast = ds < getMinDate(minAdvanceHours)
                                                        return (
                                                            <button key={ds} data-today={isToday} disabled={isPast}
                                                                onClick={() => {
                                                                    if (isPast) return
                                                                    setDate(ds)
                                                                    setCalMonth({ y: d.getFullYear(), m: d.getMonth() })
                                                                    setShowCal(true)
                                                                }}
                                                                className={`wiz-date-btn${isSel ? ' sel' : ''}`}>
                                                                <span style={{ fontSize: 9, fontWeight: 500, color: isSel ? 'rgba(255,255,255,0.7)' : 'var(--muted)', marginBottom: 2 }}>
                                                                    {DAY_SHORT[d.getDay()]}
                                                                </span>
                                                                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isToday && !isSel ? `2px solid ${P}` : '2px solid transparent' }}>
                                                                    <span style={{ fontSize: 14, fontWeight: isSel || isToday ? 700 : 400, color: isSel ? '#fff' : isToday ? P : 'var(--heading)' }}>
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

                                    {/* Selected date pill */}
                                    {date && (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, background: P, color: '#fff', marginBottom: 12, cursor: 'pointer' }}
                                            onClick={() => setShowCal(v => !v)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                                                {(() => { const [y, m, dd] = date.split('-'); return new Date(+y, +m - 1, +dd).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) })()}
                                            </span>
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.7 }}><polyline points={showCal ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} /></svg>
                                        </div>
                                    )}

                                    {/* Inline month calendar */}
                                    {showCal && (() => {
                                        const { y, m } = calMonth
                                        const firstDay = new Date(y, m, 1).getDay()
                                        const daysInMonth = new Date(y, m + 1, 0).getDate()
                                        const cells = []
                                        for (let i = 0; i < firstDay; i++) cells.push(null)
                                        for (let i = 1; i <= daysInMonth; i++) cells.push(i)
                                        const todayParts = TODAY.split('-').map(Number)
                                        return (
                                            <div style={{ borderRadius: 14, border: `1.5px solid ${P}40`, overflow: 'hidden', background: 'var(--bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                                                {/* Month nav */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: P, color: '#fff' }}>
                                                    <button onClick={() => setCalMonth(({ y, m }) => m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 })}
                                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                                                    <span style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS_FULL[m]} {y}</span>
                                                    <button onClick={() => setCalMonth(({ y, m }) => m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 })}
                                                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                                                </div>
                                                {/* Day headers */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 10px 4px' }}>
                                                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                                        <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', padding: '2px 0' }}>{d}</div>
                                                    ))}
                                                </div>
                                                {/* Dates */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px 12px', gap: 2 }}>
                                                    {cells.map((day, idx) => {
                                                        if (!day) return <div key={idx} />
                                                        const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                                        const isPast = ds < getMinDate(minAdvanceHours)
                                                        const isSel = ds === date
                                                        const isToday = y === todayParts[0] && (m + 1) === todayParts[1] && day === todayParts[2]
                                                        return (
                                                            <button key={ds} disabled={isPast} onClick={() => { if (!isPast) { setDate(ds); setShowCal(false) } }}
                                                                style={{
                                                                    height: 36, borderRadius: 8, border: 'none', cursor: isPast ? 'default' : 'pointer',
                                                                    background: isSel ? P : isToday ? `${P}20` : 'transparent',
                                                                    color: isSel ? '#fff' : isPast ? 'var(--separator-nm)' : isToday ? P : 'var(--heading)',
                                                                    fontWeight: isSel || isToday ? 700 : 400, fontSize: 14, fontFamily: 'inherit',
                                                                    transition: 'background 0.15s',
                                                                }}>
                                                                {day}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}


                            {/* ── STEP 2: Guests ── */}
                            {step === 2 && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 3</p>
                                    <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>How many guests?</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 32px' }}>We'll match packages that fit your party size.</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                                        <button onClick={() => changeGuests(-1)} style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid var(--separator-nm)', background: 'var(--bg)', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, color: 'var(--heading)', fontFamily: 'inherit' }}>−</button>
                                        {guestEditing ? (
                                            <input type="number" value={guestInput} onChange={e => setGi(e.target.value)}
                                                onBlur={commitGuest} onKeyDown={e => e.key === 'Enter' && commitGuest()}
                                                style={{ width: 120, textAlign: 'center', fontWeight: 700, fontSize: 52, color: 'var(--heading)', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.04em' }}
                                                min={10} max={1000} autoFocus />
                                        ) : (
                                            <span onClick={() => { setGi(String(guests)); setGe(true) }} title="Click to type"
                                                style={{ fontWeight: 700, fontSize: 64, color: 'var(--heading)', minWidth: 120, textAlign: 'center', cursor: 'text', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                                {guests}
                                            </span>
                                        )}
                                        <button onClick={() => changeGuests(1)} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', background: P, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, color: '#fff', fontFamily: 'inherit' }}>+</button>
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 14 }}>guests · min 10 · max 1000</p>
                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                                        {[25, 50, 100, 200, 500].map(n => (
                                            <button key={n} onClick={() => setGuests(n)} style={{
                                                padding: '7px 16px', borderRadius: 999,
                                                border: `1.5px solid ${guests === n ? P : 'var(--separator-nm)'}`,
                                                background: guests === n ? PBG : 'var(--bg)',
                                                color: guests === n ? PD : 'var(--heading)',
                                                fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                            }}>{n}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 3: Package Type ── */}
                            {step === 3 && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 4</p>
                                    <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>What type of service?</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 20px' }}>Choose how you'd like to serve your guests.</p>

                                    {/* 3-button segmented control */}
                                    <div style={{
                                        display: 'flex', gap: 8,
                                        borderRadius: 14,
                                        padding: 5,
                                    }}>
                                        {PACKAGE_TYPES.map(pt => (
                                            <button key={pt.key} onClick={() => setPkgType(pt.key)} style={{
                                                flex: 1, display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                                gap: 5, padding: '12px 8px',
                                                borderRadius: 10, border: `1.5px solid ${pkgType === pt.key ? pt.color : pt.color + "40"}`,
                                                cursor: 'pointer', fontFamily: 'inherit',
                                                background: pkgType === pt.key ? pt.color : 'var(--bg)',
                                                color: pkgType === pt.key ? '#fff' : 'var(--heading)',
                                                transition: 'all 0.18s',
                                                boxShadow: pkgType === pt.key ? `0 2px 8px ${pt.color}55` : 'none',
                                            }}>
                                                <span style={{ fontSize: 22, lineHeight: 1 }}>{pt.icon}</span>
                                                <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: -0.2 }}>{pt.title}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Meal type */}

                                    {/* Selected service description */}
                                    {pkgType && (() => {
                                        const pt = PACKAGE_TYPES.find(t => t.key === pkgType)
                                        return pt ? (
                                            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: pt.color + '12', border: '1.5px solid ' + pt.color + '40', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 18 }}>{pt.icon}</span>
                                                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--heading)', lineHeight: 1.4 }}>{pt.desc}</p>
                                            </div>
                                        ) : null
                                    })()}
                                    <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '22px 0 10px' }}>Meal Type</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                        {[
                                            { key: 'BREAKFAST', emoji: '🌅', label: 'Breakfast' },
                                            { key: 'LUNCH', emoji: '☀️', label: 'Lunch' },
                                            { key: 'SNACK', emoji: '🍿', label: 'Snack' },
                                            { key: 'DINNER', emoji: '🌙', label: 'Dinner' },
                                        ].map(m => (
                                            <button key={m.key} onClick={() => setMealType(m.key)} style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                padding: '10px 16px', borderRadius: 12, fontFamily: 'inherit', justifyContent: 'center',
                                                border: `1.5px solid ${mealType === m.key ? P : 'var(--separator-nm)'}`,
                                                background: mealType === m.key ? P : 'var(--bg)',
                                                color: mealType === m.key ? '#fff' : 'var(--heading)',
                                                fontWeight: 600, fontSize: 13.5, cursor: 'pointer', transition: 'all 0.15s',
                                            }}>
                                                <span style={{ fontSize: 16 }}>{m.emoji}</span> {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 4: Diet ── */}
                            {step === 4 && (
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Step 5</p>
                                    <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: '-0.03em' }}>Veg or Non-Veg?</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 24px' }}>We'll prioritise the right packages for your guests.</p>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {[
                                            { key: 'VEG', emoji: '🥗', label: 'Pure Veg', color: '#34C759', desc: 'Only vegetarian options' },
                                            { key: 'NON_VEG', emoji: '🍗', label: 'Non-Veg', color: '#FF3B30', desc: 'Includes non-veg options' },
                                        ].map(d => (
                                            <button key={d.key} className={`wiz-diet-card${diet === d.key ? ' sel' : ''}`} onClick={() => setDiet(d.key)}>
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: '50%',
                                                    background: diet === d.key ? 'rgba(255,255,255,0.2)' : `${d.color}18`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto 12px', fontSize: 24,
                                                }}>{d.emoji}</div>
                                                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 17, color: diet === d.key ? '#fff' : 'var(--heading)', letterSpacing: -0.2 }}>{d.label}</p>
                                                <p style={{ margin: 0, fontSize: 12.5, color: diet === d.key ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>{d.desc}</p>
                                                {diet === d.key && (
                                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px auto 0' }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Footer nav */}
                    <div style={{ padding: '0 22px 22px', display: 'flex', gap: 10 }}>
                        {step > 0 && (
                            <button onClick={() => goTo(step - 1)} style={{
                                padding: '15px 20px', borderRadius: 999,
                                border: '1.5px solid var(--separator-nm)', background: 'var(--bg)',
                                color: 'var(--heading)', fontWeight: 600, fontSize: 15,
                                cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                            }}>←</button>
                        )}
                        <button className="wiz-next-btn" disabled={!canNext()}
                            onClick={() => step < STEPS.length - 1 ? goTo(step + 1) : finish()}>
                            {step === STEPS.length - 1 ? 'Show me packages →' : 'Continue →'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
