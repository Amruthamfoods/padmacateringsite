import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/useCartStore'
import { useBookingStore } from '../store/useBookingStore'

const CAT_COLORS = { Wedding: '#E91E63', Corporate: '#1565C0', Social: '#F57C00', Religious: '#7B1FA2', Birthday: '#00897B' }

function InProgressCard({ pkg, pricing, label, step, onContinue, onDiscard, compact }) {
  const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image || pkg.image
  return (
    <div style={{
      borderRadius: 16, background: 'var(--bg)',
      border: '2px solid var(--primary-light)',
      boxShadow: 'var(--shadow-green)',
      overflow: 'hidden',
      marginBottom: compact ? 20 : 0,
    }}>
      <div style={{ background: 'var(--primary)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className="fa-solid fa-clock-rotate-left" style={{ color: '#fff', fontSize: 13 }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Incomplete booking — {label}</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {img && (
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--heading)' }}>{pkg.name}</p>
          {pricing?.total > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>Est. ₹{pricing.total.toLocaleString('en-IN')} total</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={onDiscard} style={{ padding: '9px 14px', borderRadius: 'var(--r-pill)', background: 'var(--fill-tertiary)', color: 'var(--muted)', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Discard
          </button>
          <button onClick={onContinue} style={{ padding: '9px 18px', borderRadius: 'var(--r-pill)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: 'var(--shadow-green)' }}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeFromCart, clearCart } = useCartStore()
  const { menuPreferences, pricing, guestInfo, setMenuPreferences, setEventDetails, resetBooking } = useBookingStore()
  const [selected, setSelected] = useState(new Set())

  const inProgressPkg = menuPreferences?.selectedPackage
  const inProgressStep = inProgressPkg
    ? (guestInfo?.name ? '/payment' : (pricing?.total || 0) > 0 ? '/details' : (menuPreferences?.menuItems?.length || 0) > 0 ? '/service' : '/menu')
    : null
  const inProgressLabel = inProgressStep === '/payment' ? 'Payment pending'
    : inProgressStep === '/details' ? 'Fill in your details'
    : inProgressStep === '/service' ? 'Choose service preference'
    : 'Build your menu'

  function toggleSelect(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function bookPackage(item) {
    setEventDetails(item.eventDetails)
    setMenuPreferences({ selectedPackage: item.pkg, menuItems: [], servicePreference: null })
    navigate('/menu')
  }

  function bookSelected() {
    const toBook = items.filter(i => selected.has(i.id))
    if (!toBook.length) { toast.error('Select at least one package'); return }
    bookPackage(toBook[0])
  }

  if (!items.length && !inProgressPkg) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--fill-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-cart-shopping" style={{ fontSize: 32, color: 'var(--muted)' }} />
      </div>
      <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--heading)', margin: 0 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--muted)', margin: 0, textAlign: 'center' }}>Browse packages and add them here to compare before booking.</p>
      <button onClick={() => navigate('/setup')} style={{ marginTop: 8, padding: '12px 28px', borderRadius: 'var(--r-pill)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
        Browse Packages
      </button>
    </div>
  )

  if (!items.length && inProgressPkg) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <InProgressCard pkg={inProgressPkg} pricing={pricing} label={inProgressLabel} step={inProgressStep}
        onContinue={() => navigate(inProgressStep)}
        onDiscard={() => { resetBooking(); navigate('/setup') }}
      />
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button onClick={() => navigate('/setup')} style={{ padding: '10px 24px', borderRadius: 'var(--r-pill)', background: 'var(--fill-tertiary)', color: 'var(--muted)', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Browse Other Packages
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* In-progress booking banner */}
      {inProgressPkg && (
        <InProgressCard pkg={inProgressPkg} pricing={pricing} label={inProgressLabel} step={inProgressStep}
          onContinue={() => navigate(inProgressStep)}
          onDiscard={() => resetBooking()}
          compact
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: 'var(--heading)', margin: 0, letterSpacing: -0.5 }}>
            Compare Packages
            <span style={{ marginLeft: 10, background: 'var(--primary)', color: '#fff', borderRadius: 'var(--r-pill)', padding: '2px 10px', fontSize: 13, fontWeight: 700 }}>{items.length}</span>
          </h1>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 14 }}>Select packages below and book the ones you need.</p>
        </div>
        <button onClick={() => { clearCart(); setSelected(new Set()) }} style={{ padding: '9px 16px', borderRadius: 'var(--r-pill)', background: 'var(--fill-tertiary)', color: 'var(--muted)', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Clear All
        </button>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {items.map(item => {
          const { pkg, eventDetails, pricePerPerson } = item
          const guests = eventDetails?.guestCount || pkg.servesMin || 50
          const estimate = pricePerPerson * guests
          const catColor = CAT_COLORS[pkg.eventType?.split(':')[0]] || 'var(--primary)'
          const isSelected = selected.has(item.id)
          const img = pkg.items?.find(pi => pi.menuItem?.image)?.menuItem?.image || pkg.image

          return (
            <div key={item.id} style={{
              borderRadius: 16, overflow: 'hidden', background: 'var(--bg)',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
              boxShadow: isSelected ? 'var(--shadow-green)' : 'var(--shadow)',
              transition: 'all 0.18s', position: 'relative',
            }}>
              {/* Checkbox */}
              <button onClick={() => toggleSelect(item.id)} style={{
                position: 'absolute', top: 10, left: 10, zIndex: 10,
                width: 26, height: 26, borderRadius: 8,
                background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
                border: isSelected ? 'none' : '2px solid rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                {isSelected && <i className="fa-solid fa-check" style={{ color: '#fff', fontSize: 11 }} />}
              </button>

              {/* Remove */}
              <button onClick={() => { removeFromCart(item.id); setSelected(s => { const n = new Set(s); n.delete(item.id); return n }) }} style={{
                position: 'absolute', top: 10, right: 10, zIndex: 10,
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                <i className="fa-solid fa-xmark" style={{ fontSize: 11, color: '#e53e3e' }} />
              </button>

              {/* Image */}
              <div style={{ height: 150, position: 'relative', overflow: 'hidden', background: catColor }}>
                {img
                  ? <img src={img} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-utensils" style={{ fontSize: 40, color: 'var(--primary-light)' }} />
                    </div>
                }
                <span style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>
                  {pkg.type === 'VEG' ? '🟢 Veg' : '🔴 Non-Veg'}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px 16px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--heading)', margin: '0 0 6px', letterSpacing: -0.2 }}>{pkg.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px', lineHeight: 1.45 }}>
                  {(pkg.description || 'Customizable catering package').slice(0, 70)}{(pkg.description || '').length > 70 ? '…' : ''}
                </p>

                {/* Price breakdown */}
                <div style={{ background: 'var(--fill-tertiary)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Price per person</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)' }}>₹{pricePerPerson}/pp</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Guests</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{guests}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--separator-nm)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>Est. Total</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>₹{estimate.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'var(--primary-bg)', color: 'var(--primary-dark)', fontWeight: 600 }}>
                    Min {pkg.servesMin}+ guests
                  </span>
                  {pkg.serviceType && pkg.serviceType.split(',').slice(0, 2).map(s => (
                    <span key={s} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'var(--fill-tertiary)', color: 'var(--muted)', fontWeight: 500 }}>{s.trim()}</span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleSelect(item.id)} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--r-pill)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--fill-tertiary)',
                    border: isSelected ? '1.5px solid var(--primary-light)' : '1.5px solid transparent',
                    color: isSelected ? 'var(--primary-dark)' : 'var(--muted)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}>
                    {isSelected ? '✓ Selected' : 'Select'}
                  </button>
                  <button onClick={() => bookPackage(item)} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--r-pill)',
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}>
                    Book Now →
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add more */}
        <div onClick={() => navigate('/setup')} style={{
          borderRadius: 16, border: '2px dashed var(--border-light)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, minHeight: 280, cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: 28 }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Add More Packages</span>
        </div>
      </div>

      {/* Sticky bottom bar */}
      {selected.size > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: '#fff', borderTop: '1px solid var(--separator-nm)',
          padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--heading)' }}>{selected.size} package{selected.size > 1 ? 's' : ''} selected</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
              Est. ₹{items.filter(i => selected.has(i.id)).reduce((s, i) => s + i.pricePerPerson * (i.eventDetails?.guestCount || i.pkg.servesMin || 50), 0).toLocaleString('en-IN')} total
            </p>
          </div>
          <button onClick={bookSelected} style={{ padding: '12px 28px', borderRadius: 'var(--r-pill)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: 'var(--shadow-green)' }}>
            Book Selected ({selected.size}) →
          </button>
        </div>
      )}
    </div>
  )
}
