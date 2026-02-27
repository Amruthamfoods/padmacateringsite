import { useLocation } from 'react-router-dom'

const STEPS = [
  { path: '/setup',   label: 'Event Setup',    icon: 'fa-calendar' },
  { path: '/menu',    label: 'Build Menu',     icon: 'fa-utensils' },
  { path: '/review',  label: 'Review & Price', icon: 'fa-tag' },
  { path: '/payment', label: 'Payment',        icon: 'fa-credit-card' },
]

export default function BookingSteps() {
  const { pathname } = useLocation()
  const currentIdx = STEPS.findIndex(s => pathname === s.path || pathname.startsWith(s.path + '/'))

  return (
    <div className="booking-steps-bar">
      <div className="booking-steps-inner">
        {STEPS.map((step, idx) => {
          const done   = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.path} className="bstep-wrap">
              <div className={`bstep ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                <div className="bstep-icon-box">
                  {done
                    ? <i className="fa-solid fa-check" />
                    : <i className={`fa-solid ${step.icon}`} />
                  }
                </div>
                <span className="bstep-label-text">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`bstep-connector ${done ? 'done' : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
