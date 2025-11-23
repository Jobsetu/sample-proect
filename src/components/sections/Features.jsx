import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Search, Filter, Bell, Shield, Zap, Users } from 'lucide-react'

const Features = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Search,
      title: "Smart Job Search",
      description: "AI-powered search that understands your skills and preferences to find the perfect match.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Filter,
      title: "Advanced Filters",
      description: "Filter by location, salary, company size, and more to narrow down your search.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Bell,
      title: "Job Alerts",
      description: "Get notified instantly when new jobs matching your criteria are posted.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Verified Companies",
      description: "All companies are verified to ensure you're applying to legitimate opportunities.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Quick Apply",
      description: "Apply to multiple jobs with one click using our streamlined application process.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other job seekers and get advice from career experts.",
      color: "from-indigo-500 to-purple-500"
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="gradient-text">JobSetu</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We've built the most comprehensive job search platform with features designed to make your job hunt effortless and successful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-effect p-8 rounded-2xl h-full card-hover">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
