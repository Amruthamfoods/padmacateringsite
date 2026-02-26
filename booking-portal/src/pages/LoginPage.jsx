import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('login')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm]     = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })

  async function handleLogin(e) {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', loginForm)
      localStorage.setItem('padma_token', res.data.token)
      localStorage.setItem('padma_user', JSON.stringify(res.data.user))
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/my-orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!registerForm.name || !registerForm.email || !registerForm.password) return toast.error('Please fill in all required fields')
    if (registerForm.password !== registerForm.confirm) return toast.error('Passwords do not match')
    if (registerForm.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      })
      localStorage.setItem('padma_token', res.data.token)
      localStorage.setItem('padma_user', JSON.stringify(res.data.user))
      toast.success('Account created! Welcome to Padma Catering.')
      navigate('/my-orders')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-wrap">
      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">
          <div style={{ fontSize: '2rem', marginBottom: 6 }}>🍛</div>
          <div className="logo-text">Padma Catering</div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {tab === 'login' ? 'Sign in to manage your bookings' : 'Create your account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label">
                <i className="fa-solid fa-envelope" /> Email Address
              </label>
              <input
                type="email" className="form-input" placeholder="you@example.com"
                value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label">
                <i className="fa-solid fa-lock" /> Password
              </label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <><i className="fa-solid fa-circle-notch" style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label"><i className="fa-solid fa-user" /> Full Name *</label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={registerForm.name} onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label"><i className="fa-solid fa-envelope" /> Email Address *</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={registerForm.email} onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label"><i className="fa-solid fa-phone" /> Phone Number</label>
              <input type="tel" className="form-input" placeholder="+91 98765 43210"
                value={registerForm.phone} onChange={e => setRegisterForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label className="form-label"><i className="fa-solid fa-lock" /> Password *</label>
              <input type="password" className="form-input" placeholder="Min 6 characters"
                value={registerForm.password} onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="form-field" style={{ marginBottom: 20 }}>
              <label className="form-label"><i className="fa-solid fa-lock" /> Confirm Password *</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={registerForm.confirm} onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <><i className="fa-solid fa-circle-notch" style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-divider"><span>or</span></div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/packages" style={{ color: 'var(--red)', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 4 }} />
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  )
}
