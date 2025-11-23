import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "TechCorp",
      content: "JobSetu helped me find my dream job in just 2 weeks! The AI matching was incredibly accurate and the application process was so smooth.",
      rating: 5,
      avatar: "👩‍💻"
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "StartupXYZ",
      content: "I've tried many job platforms, but JobSetu stands out. The quality of job listings and the user experience is unmatched.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      company: "DesignStudio",
      content: "The job alerts feature saved me so much time. I got notified about perfect opportunities I would have missed otherwise.",
      rating: 5,
      avatar: "👩‍🎨"
    },
    {
      name: "David Kim",
      role: "Data Scientist",
      company: "DataCorp",
      content: "The community support and career advice I received through JobSetu was invaluable. Highly recommend to anyone job hunting.",
      rating: 5,
      avatar: "👨‍🔬"
    },
    {
      name: "Lisa Thompson",
      role: "Marketing Director",
      company: "BrandAgency",
      content: "From creating my profile to landing interviews, JobSetu made the entire process effortless. Found my perfect role in 3 weeks!",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Alex Morgan",
      role: "DevOps Engineer",
      company: "CloudTech",
      content: "The platform's interface is intuitive and the job matching algorithm is spot-on. I've recommended it to all my friends.",
      rating: 5,
      avatar: "👨‍💻"
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our <span className="gradient-text">Users Say</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what real job seekers have to say about their experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-effect p-6 rounded-2xl h-full card-hover relative">
                <Quote className="w-8 h-8 text-primary-400/30 absolute top-4 right-4" />
                
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
