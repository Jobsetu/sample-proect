import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const Stats = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { number: "10,000+", label: "Active Job Listings", icon: "💼" },
    { number: "50,000+", label: "Happy Job Seekers", icon: "😊" },
    { number: "2,500+", label: "Companies Hiring", icon: "🏢" },
    { number: "95%", label: "Success Rate", icon: "🎯" },
  ]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trusted by <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join the community of successful job seekers who found their dream careers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center space-y-4"
            >
              <div className="text-6xl mb-4">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-bold gradient-text">
                {stat.number}
              </div>
              <div className="text-gray-300 text-lg font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
