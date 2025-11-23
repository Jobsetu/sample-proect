import Hero from '../components/sections/Hero'
import Features from '../components/sections/Features'
import Stats from '../components/sections/Stats'
import Testimonials from '../components/sections/Testimonials'
import CTA from '../components/sections/CTA'

const LandingPage = () => {
  return (
    <div className="pt-16">
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CTA />
    </div>
  )
}

export default LandingPage
