import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Small delay so new page elements are in the DOM
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.reveal, .reveal-l, .reveal-r')
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              observer.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
      els.forEach(el => {
        el.classList.remove('in')
        observer.observe(el)
      })
      return () => observer.disconnect()
    }, 80)
    return () => clearTimeout(timer)
  }, [pathname])
}
