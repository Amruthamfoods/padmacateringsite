import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon, sub }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon"><i className={icon} /></div>
      <div>
        <p className="admin-stat-value">{value}</p>
        <p className="admin-stat-label">{label}</p>
        {sub && <p className="admin-stat-sub">{sub}</p>}
      </div>
    </div>
  )
}

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const chartData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'dd MMM'),
    revenue: Math.floor(Math.random() * 50000) + 10000,
  }))

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/bookings?limit=5')])
      .then(([s, b]) => { setStats(s.data); setBookings(b.data.bookings || []) })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--gold)' }} />
    </div>
  )

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Overview of bookings and revenue</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-grid">
        <StatCard icon="fa-solid fa-calendar-day" label="Today's Bookings" value={stats?.today?.bookings || 0} sub={fmt(stats?.today?.revenue)} />
        <StatCard icon="fa-solid fa-calendar-week" label="This Week" value={stats?.week?.bookings || 0} sub={fmt(stats?.week?.revenue)} />
        <StatCard icon="fa-solid fa-indian-rupee-sign" label="Month Revenue" value={fmt(stats?.month?.revenue)} sub={`${stats?.month?.bookings || 0} bookings`} />
        <StatCard icon="fa-solid fa-trophy" label="Total Bookings" value={stats?.total?.bookings || 0} sub={fmt(stats?.total?.revenue)} />
      </div>

      {/* Revenue Chart */}
      <div className="admin-card">
        <div className="admin-card-head">
          <p className="admin-card-title"><i className="fa-solid fa-chart-line" style={{ marginRight: 8, color: 'var(--gold)' }} />Revenue — Last 7 Days</p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(228,197,144,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--dark-3)', border: '1px solid var(--gold-line)', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: 'var(--gold)' }}
                itemStyle={{ color: 'var(--text-warm)' }}
                formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} dot={{ fill: 'var(--gold)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="admin-card">
        <div className="admin-card-head">
          <p className="admin-card-title"><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: 'var(--gold)' }} />Recent Bookings</p>
        </div>
        {bookings.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-faint)' }}>No bookings yet</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['ID', 'Customer', 'Event', 'Date', 'Total', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td className="id-cell">#{b.id}</td>
                    <td>{b.user?.name || '—'}</td>
                    <td>{b.eventType}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.eventDate ? format(new Date(b.eventDate), 'dd MMM yyyy') : '—'}</td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--white)' }}>{fmt(b.total)}</td>
                    <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
