import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-solid fa-gauge', end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: 'fa-solid fa-calendar-check' },
  { to: '/admin/quotes', label: 'Quote Requests', icon: 'fa-solid fa-file-lines' },
  { to: '/admin/menu', label: 'Menu Manager', icon: 'fa-solid fa-bowl-rice' },
  { to: '/admin/coupons', label: 'Coupons', icon: 'fa-solid fa-tag' },
  { to: '/admin/customers', label: 'Customers', icon: 'fa-solid fa-users' },
  { to: '/admin/settings', label: 'Settings', icon: 'fa-solid fa-gear' },
]

function SidebarContent({ user, onLogout, onClose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="admin-sidebar-brand">
        <p className="admin-sidebar-brand-name">Padma Catering</p>
        <p className="admin-sidebar-brand-sub">Admin Panel</p>
      </div>
      <nav className="admin-nav">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={onClose}
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <i className={n.icon} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <p className="admin-sidebar-user-name">{user?.name}</p>
        <p className="admin-sidebar-user-email">{user?.email}</p>
        <button className="admin-sidebar-logout" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket" style={{ marginRight: 5 }} />Sign out
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() { logout(); navigate('/') }

  return (
    <div className="admin-wrap">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <SidebarContent user={user} onLogout={handleLogout} onClose={() => {}} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className={`admin-sidebar-overlay${mobileOpen ? ' open' : ''}`}>
          <div className="admin-sidebar-overlay-bg" onClick={() => setMobileOpen(false)} />
          <aside className="admin-sidebar-mobile" style={{ width: 220, background: 'var(--dark-2)', borderRight: '1px solid var(--gold-line)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SidebarContent user={user} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setMobileOpen(true)}>
            <i className="fa-solid fa-bars" />
          </button>
          <span className="admin-topbar-date">
            <i className="fa-solid fa-calendar" style={{ marginRight: 7, color: 'var(--gold)' }} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="admin-topbar-user">
            <i className="fa-solid fa-circle-user" style={{ marginRight: 6, color: 'var(--gold)' }} />
            {user?.name}
          </span>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
