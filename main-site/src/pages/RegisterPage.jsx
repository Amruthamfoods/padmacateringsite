import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import { registerSchema } from '../lib/validators'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const result = registerSchema.safeParse({ ...form })
    if (!result.success) {
      const errs = {}
      result.error.errors.forEach(err => { errs[err.path[0]] = err.message })
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.user, data.token)
      toast.success(`Welcome, ${data.user.name}! Account created.`)
      navigate('/booking')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', icon: 'fa-user' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', icon: 'fa-envelope' },
    { name: 'phone', label: 'Mobile Number', type: 'tel', placeholder: '9876543210', icon: 'fa-phone' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', icon: 'fa-lock' },
  ]

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-circle">
            <i className="fa-solid fa-utensils" />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start booking with Padma Catering</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div className="field-block" key={field.name}>
              <label className="field-label">{field.label}</label>
              <input
                name={field.name} type={field.type} value={form[field.name]}
                onChange={handleChange} placeholder={field.placeholder}
                className={`booking-input${errors[field.name] ? ' error' : ''}`}
              />
              {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> Creating account…</>
              : <><i className="fa-solid fa-user-plus" /> Create Account</>
            }
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 28 }}>
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 10 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
