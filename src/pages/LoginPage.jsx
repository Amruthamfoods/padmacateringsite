import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import { loginSchema } from '../lib/validators'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const next = location.state?.next || '/booking'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const result = loginSchema.safeParse({ ...form })
    if (!result.success) {
      const errs = {}
      result.error.errors.forEach(err => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(data.user.role === 'ADMIN' ? '/admin' : next)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-circle">
            <i className="fa-solid fa-utensils" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Padma Catering account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-block">
            <label className="field-label">Email Address</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className={`booking-input${errors.email ? ' error' : ''}`}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field-block">
            <label className="field-label">Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className={`booking-input${errors.password ? ' error' : ''}`}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Signing in…</>
              : <><i className="fa-solid fa-right-to-bracket" /> Sign In</>
            }
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 28 }}>
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 10 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
