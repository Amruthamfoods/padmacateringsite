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
  const [form, setForm] = useState({ name: '', phone: '', address: '', addressLat: null, addressLng: null })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/auth/me').then(res => {
      setUser(res.data)
      const rawPhone = (res.data.phone || '').replace(/^91/, '')
      setForm({ name: res.data.name || '', phone: rawPhone, address: res.data.address || '', addressLat: res.data.addressLat || null, addressLng: res.data.addressLng || null })
    }).catch(() => { navigate('/login') })
  }, [token, navigate])

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', { name: form.name, phone: form.phone, address: form.address, addressLat: form.addressLat, addressLng: form.addressLng })
      const updated = res.data.user
      setUser({ ...user, ...updated })
      setAuth(updated, token)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>{value || '—'}</span>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <Header title="My Profile" />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>

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

        {!editing ? (
          <>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Account Details</p>
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
              {row('Full Name', user.name)}
              {row('Email', user.email)}
              {row('Mobile', user.phone ? '+' + user.phone : null)}
              {row('Address', user.address)}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Member Since</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--heading)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{
              width: '100%', padding: 14, background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer',
            }}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Edit Details</p>
            <div style={{ background: 'var(--bg)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                { label: 'Mobile Number', key: 'phone', type: 'tel', placeholder: '10-digit number' },
              ].map((f) => (
                <div key={f.key} style={{ padding: '10px 18px', borderBottom: '0.5px solid var(--separator-nm)' }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: 'var(--heading)', fontFamily: 'var(--font)', padding: '4px 0', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ padding: '10px 18px' }}>
                <AddressAutocomplete
                  label="Delivery Address"
                  value={form.address}
                  placeholder="Search your address…"
                  onSelect={({ address, lat, lng }) => setForm(fm => ({ ...fm, address, addressLat: lat, addressLng: lng }))}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: 'var(--heading)', fontFamily: 'var(--font)', padding: '4px 0', boxSizing: 'border-box' }}
                />
              </div>
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
              }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
