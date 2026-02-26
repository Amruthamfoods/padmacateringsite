const STEPS = [
  { key: 'event',   label: 'Event Details', icon: 'fa-calendar' },
  { key: 'menu',    label: 'Select Menu',   icon: 'fa-utensils' },
  { key: 'price',   label: 'Get Price',     icon: 'fa-tag' },
  { key: 'payment', label: 'Payment',       icon: 'fa-credit-card' },
]

export default function BookingSteps({ current }) {
  const currentIdx = STEPS.findIndex(s => s.key === current)

  return (
    <div className="booking-steps-bar">
      <div className="booking-steps-inner">
        {STEPS.map((step, idx) => {
          const done   = idx < currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.key} className="bstep-wrap">
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
