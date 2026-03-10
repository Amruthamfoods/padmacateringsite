import { useNavigate } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import Services from '../components/Services'
import CuisineShowcase from '../components/CuisineShowcase'
import Stats from '../components/Stats'
import About from '../components/About'
import BrandShowcase from '../components/BrandShowcase'
import Testimonials from '../components/Testimonials'
import CTABanner from '../components/CTABanner'
import Footer from '../components/Footer'

// onBookNow is passed from AppShell which controls the wizard globally
export default function LandingPage({ onBookNow }) {
  return (
    <>
      <HeroSlider onBookNow={onBookNow} />
      <Services />
      <CuisineShowcase onBookNow={onBookNow} />
      <Stats />
      <About />
      <BrandShowcase onBookNow={onBookNow} />
      <Testimonials />
      <CTABanner onBookNow={onBookNow} />
      <Footer />
    </>
  )
}
