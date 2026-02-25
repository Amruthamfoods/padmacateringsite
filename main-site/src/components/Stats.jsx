import { useEffect, useRef } from 'react'

function Counter({ target, suffix, label, delay }) {
  const ref = useRef(null)
  const ran = useRef(false)

  useEffect(() => {
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ran.current) {
          ran.current = true
          observer.unobserve(el)
          const dur = 2200
          const fps = 60
          const steps = dur / (1000 / fps)
          const inc = target / steps
          let val = 0
          const tick = () => {
            val = Math.min(val + inc, target)
            el.textContent = Math.floor(val).toLocaleString('en-IN') + suffix
            if (val < target) requestAnimationFrame(tick)
          }
          setTimeout(() => requestAnimationFrame(tick), delay)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, suffix, delay])

  return (
    <div className="stat-num" ref={ref}>0{suffix}</div>
  )
}

const stats = [
  { target: 100, suffix: 'L+', label: 'Plates Served', delay: 0 },
  { target: 5000, suffix: '+', label: 'Events Catered', delay: 100 },
  { target: null, display: '30+', label: 'Years of Excellence', delay: 200 },
  { target: null, display: '100%', label: 'Fresh Ingredients', delay: 300 },
]

export default function Stats() {
  return (
    <section id="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className={`stat-item reveal d${i + 1}`} key={s.label}>
              {s.target != null
                ? <Counter target={s.target} suffix={s.suffix} label={s.label} delay={s.delay} />
                : <div className="stat-num">{s.display}</div>
              }
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
