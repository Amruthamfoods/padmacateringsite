import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/setup'
  const { setAuth } = useAuthStore()

  const [view, setView] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })

  function saveAuth(data) {
    setAuth(data.user, data.token)
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', loginForm)
      saveAuth(res.data)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(returnTo)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!registerForm.name.trim()) return toast.error('Please enter your name')
    if (!registerForm.email.trim()) return toast.error('Please enter your email')
    if (!registerForm.phone.trim()) return toast.error('Please enter your mobile number')
    if (registerForm.phone.replace(/\D/g, '').length !== 10) return toast.error('Enter a valid 10-digit mobile number')
    if (!registerForm.password) return toast.error('Please enter a password')
    if (registerForm.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (registerForm.password !== registerForm.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone.replace(/\D/g, ''),
        password: registerForm.password,
      })
      saveAuth(res.data)
      toast.success('Account created! Welcome to Padma Catering.')
      navigate(returnTo)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const btnStyle = {
    background: '#E8640A', color: '#fff', width: '100%', padding: '13px',
    border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, opacity: loading ? 0.65 : 1,
    marginTop: 4,
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-box">

        {/* Logo */}
        <div className="auth-logo">
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🍛</div>
          <div className="logo-text">Padma Catering</div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {view === 'login' ? 'Sign in to manage your bookings' : 'Create your account'}
          </p>
        </div>

        {/* ── LOGIN ── */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-envelope" /> Email Address</label>
              <input
                type="email" className="form-input" placeholder="you@example.com"
                value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email" autoFocus
              />
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label"><i className="fa-solid fa-lock" /> Password</label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Signing in...</> : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => setView('register')}
                style={{ background: 'none', border: 'none', color: '#E8640A', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Register
              </button>
            </div>
          </form>
        )}

        {/* ── REGISTER ── */}
        {view === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-user" /> Full Name *</label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={registerForm.name} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                autoFocus />
            </div>
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-envelope" /> Email Address *</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-mobile-screen" /> Mobile Number *</label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <span style={{
                  padding: '10px 12px', background: 'var(--surface-2, #f3f3f3)',
                  border: '1.5px solid var(--border, #ddd)', borderRight: 'none',
                  borderRadius: '8px 0 0 8px', fontSize: '0.9rem', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}>+91</span>
                <input
                  type="tel" className="form-input" placeholder="98765 43210"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  maxLength={10} style={{ borderRadius: '0 8px 8px 0' }}
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label"><i className="fa-solid fa-lock" /> Password *</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label"><i className="fa-solid fa-lock" /> Confirm Password *</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={registerForm.confirm} onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Creating account...</> : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => setView('login')}
                style={{ background: 'none', border: 'none', color: '#E8640A', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Sign In
              </button>
            </div>
          </form>
        )}

        <div className="auth-divider"><span>or</span></div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/setup" style={{ color: '#E8640A', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} />
            Continue as Guest
          </Link>
        </div>

      </div>
    </div>
  )
}
