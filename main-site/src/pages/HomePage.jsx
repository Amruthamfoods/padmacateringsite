import HeroSlider      from '../components/HeroSlider'
import Stats           from '../components/Stats'
import About           from '../components/About'
import BrandShowcase   from '../components/BrandShowcase'
import CuisineShowcase from '../components/CuisineShowcase'
import Services        from '../components/Services'
import Gallery         from '../components/Gallery'
import Testimonials    from '../components/Testimonials'
import CTABanner       from '../components/CTABanner'

export default function HomePage({ onBookNow }) {
  return (
    <>
      <HeroSlider onBookNow={onBookNow} />
      <Stats />
      <About />
      <BrandShowcase onBookNow={onBookNow} />
      <CuisineShowcase />
      <Services onBookNow={onBookNow} />
      <Gallery />
      <Testimonials />
      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
