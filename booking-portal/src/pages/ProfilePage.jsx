import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Header from '../components/Header'
import AddressAutocomplete from '../components/AddressAutocomplete'
import useAuthStore from '../store/authStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { token, setAuth } = useAuthStore()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', gstName: '', gstNumber: '' })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Addresses
  const [addresses, setAddresses] = useState([])
  const [addingAddr, setAddingAddr] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: '', address: '', lat: null, lng: null, isDefault: false })
  const [addrLoading, setAddrLoading] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/auth/me').then(res => {
      setUser(res.data)
      const rawPhone = (res.data.phone || '').replace(/^91/, '')
      setForm({ name: res.data.name || '', phone: rawPhone, gstName: res.data.gstName || '', gstNumber: res.data.gstNumber || '' })
    }).catch(() => navigate('/login'))
    fetchAddresses()
  }, [token])

  function fetchAddresses() {
    api.get('/auth/addresses').then(r => setAddresses(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', { name: form.name, phone: form.phone, gstName: form.gstName || null, gstNumber: form.gstNumber || null })
      const updated = res.data.user
      setUser(u => ({ ...u, ...updated }))
      setAuth(updated, token)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally { setLoading(false) }
  }

  async function handleAddAddress(e) {
    e.preventDefault()
    if (!addrForm.address.trim()) return toast.error('Please search and select an address')
    setAddrLoading(true)
    try {
      const r = await api.post('/auth/addresses', addrForm)
      setAddresses(prev => {
        const updated = addrForm.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev]
        return [r.data, ...updated.filter(a => a.id !== r.data.id)]
      })
      toast.success('Address saved!')
      setAddrForm({ label: '', address: '', lat: null, lng: null, isDefault: false })
      setAddingAddr(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save address')
    } finally { setAddrLoading(false) }
  }

  async function handleDeleteAddress(id) {
    try {
      await api.delete(`/auth/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Address removed')
    } catch {
      toast.error('Failed to remove address')
    }
  }

  async function handleSetDefault(id) {
    try {
      await api.post('/auth/addresses', {
        ...addresses.find(a => a.id === id),
        isDefault: true,
      })
      fetchAddresses()
      toast.success('Default address updated')
    } catch { toast.error('Failed') }
  }

  if (!user) return null

  function copyReferral() {
    if (!user.referralCode) return
    navigator.clipboard.writeText(user.referralCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const ioInput = {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    fontSize: 16, color: 'var(--heading)', fontFamily: 'var(--font)',
    padding: '4px 0', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="My Profile" />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)',
            color: '#fff', fontSize: '1.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
          }}>
            {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading)', margin: 0 }}>{user.name}</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '3px 0 0' }}>{user.email}</p>
        </div>

        {/* Padma Coins */}
        {user.points > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            borderRadius: 14, padding: '16px 18px', color: '#fff', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 12, opacity: 0.8 }}>Padma Coins</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{user.points.toLocaleString('en-IN')}</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.7 }}>Worth ₹{(user.points * 0.25).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <i className="fa-solid fa-coins" style={{ fontSize: 32, opacity: 0.4 }} />
          </div>
        )}

        {/* Referral Code */}
        {user.referralCode && (
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 18px', boxShadow: 'var(--shadow-sm)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>YOUR REFERRAL CODE</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.06em' }}>{user.referralCode}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>Share &amp; earn coins when friends book</p>
            </div>
            <button onClick={copyReferral} style={{
              padding: '8px 14px', background: copied ? '#34C759' : 'var(--primary-bg)',
              color: copied ? '#fff' : 'var(--primary)', border: '1px solid var(--primary-light)',
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}>
              <i className={'fa-solid ' + (copied ? 'fa-check' : 'fa-copy')} style={{ marginRight: 5 }} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {/* Account Details */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Details</p>
        {!editing ? (
          <>
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
              {[
                ['Full Name', user.name],
                ['Email', user.email],
                ['Mobile', user.phone ? '+' + user.phone : null],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? '0.5px solid var(--separator-nm)' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>{value || '—'}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Member Since</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{
              width: '100%', padding: 14, background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 32,
            }}>Edit Profile</button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ marginBottom: 32 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Mobile Number', key: 'phone', type: 'tel', placeholder: '10-digit number' },
                { label: 'GST Name', key: 'gstName', type: 'text', placeholder: 'Business name for GST invoice' },
                { label: 'GST Number', key: 'gstNumber', type: 'text', placeholder: 'e.g. 37AAAAA0000A1Z5' },
              ].map((f, i, arr) => (
                <div key={f.key} style={{ padding: '10px 18px', borderBottom: i < arr.length - 1 ? '0.5px solid var(--separator-nm)' : 'none' }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                    style={ioInput} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setEditing(false)} style={{
                flex: 1, padding: 14, background: 'var(--bg)', color: 'var(--heading)',
                border: '1px solid var(--border-light)', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, padding: 14, background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1,
              }}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}

        {/* Saved Addresses */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Saved Addresses</p>
          {!addingAddr && (
            <button onClick={() => setAddingAddr(true)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', background: 'var(--primary-bg)', color: 'var(--primary)',
              border: '1px solid var(--primary-light)', borderRadius: 20,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> Add New
            </button>
          )}
        </div>

        {/* Address list */}
        {addresses.length > 0 && (
          <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
            {addresses.map((addr, i) => (
              <div key={addr.id} style={{
                padding: '14px 18px',
                borderBottom: i < addresses.length - 1 ? '0.5px solid var(--separator-nm)' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  background: addr.isDefault ? 'var(--primary)' : 'var(--fill-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="fa-solid fa-location-dot" style={{ fontSize: 14, color: addr.isDefault ? '#fff' : 'var(--muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading)' }}>
                      {addr.label || 'Address'}
                    </span>
                    {addr.isDefault && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-light)' }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{addr.address}</p>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} style={{
                      marginTop: 6, fontSize: 12, color: 'var(--primary)', background: 'none',
                      border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600,
                    }}>Set as default</button>
                  )}
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ios-red)', padding: '4px 6px', flexShrink: 0,
                }}>
                  <i className="fa-solid fa-trash" style={{ fontSize: 14 }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {addresses.length === 0 && !addingAddr && (
          <div style={{ background: 'var(--bg)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', padding: '24px 18px', textAlign: 'center', marginBottom: 12 }}>
            <i className="fa-solid fa-map-location-dot" style={{ fontSize: 28, color: 'var(--muted)', display: 'block', marginBottom: 8 }} />
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>No saved addresses yet</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Add your venue or delivery address for faster checkout</p>
          </div>
        )}

        {/* Add address form */}
        {addingAddr && (
          <form onSubmit={handleAddAddress} style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
            <div style={{ padding: '12px 18px 8px', borderBottom: '0.5px solid var(--separator-nm)' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>Add New Address</p>
            </div>
            <div style={{ padding: '10px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. Home, Office, Wedding Hall"
                value={addrForm.label}
                onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))}
                style={ioInput}
              />
            </div>
            <div style={{ padding: '10px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
              <AddressAutocomplete
                label="Address"
                value={addrForm.address}
                placeholder="Search your address..."
                onSelect={({ address, lat, lng }) => setAddrForm(f => ({ ...f, address, lat, lng }))}
                style={{ ...ioInput }}
              />
            </div>
            <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--separator-nm)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="isDefault"
                checked={addrForm.isDefault}
                onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="isDefault" style={{ fontSize: 14, color: 'var(--heading)', cursor: 'pointer' }}>Set as default address</label>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '12px 18px' }}>
              <button type="button" onClick={() => { setAddingAddr(false); setAddrForm({ label: '', address: '', lat: null, lng: null, isDefault: false }) }} style={{
                flex: 1, padding: '11px 0', background: 'var(--bg)', color: 'var(--heading)',
                border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={addrLoading || !addrForm.address} style={{
                flex: 2, padding: '11px 0', background: 'var(--primary)', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: addrLoading || !addrForm.address ? 'not-allowed' : 'pointer',
                opacity: addrLoading || !addrForm.address ? 0.6 : 1,
              }}>{addrLoading ? 'Saving...' : 'Save Address'}</button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
