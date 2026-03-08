import { useEffect, useRef } from 'react'

export default function AddressAutocomplete({ value, onSelect, placeholder, style, label, required }) {
  const inputRef = useRef(null)
  const acRef = useRef(null)
  const initRef = useRef(false)

  useEffect(() => {
    function init() {
      if (initRef.current || !inputRef.current) return
      if (!window.google?.maps?.places) return
      initRef.current = true
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry'],
      })
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace()
        if (!place.geometry) return
        onSelect({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
      })
    }

    // Try immediately, then poll for google to load
    init()
    if (!initRef.current) {
      const interval = setInterval(() => {
        init()
        if (initRef.current) clearInterval(interval)
      }, 300)
      return () => clearInterval(interval)
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 4 }}>
          {label}{required && <span style={{ color: 'var(--ios-red)' }}> *</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || 'Search address...'}
        defaultValue={value || ''}
        style={style}
        autoComplete="off"
      />
    </div>
  )
}
