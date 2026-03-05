import HeroSlider      from '../components/HeroSlider'
import Services        from '../components/Services'
import CuisineShowcase from '../components/CuisineShowcase'
import Stats           from '../components/Stats'
import About           from '../components/About'
import BrandShowcase   from '../components/BrandShowcase'
import Gallery         from '../components/Gallery'
import Testimonials    from '../components/Testimonials'
import CTABanner       from '../components/CTABanner'
export default function HomePage({ onBookNow }) {
  return (
    <>
      <HeroSlider onBookNow={onBookNow} />
      <Services />
      <CuisineShowcase onBookNow={onBookNow} />
      <Stats />
      <About />
      <BrandShowcase onBookNow={onBookNow} />
      <Gallery />
      <Testimonials />
      <CTABanner onBookNow={onBookNow} />
    </>
  )
}
