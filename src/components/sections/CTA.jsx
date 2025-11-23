import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Ready to get started?</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Dream Job is
            <br />
            <span className="text-shadow-lg">Just One Click Away</span>
          </h2>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Join thousands of successful job seekers who found their perfect career match. 
            Start your journey today and discover opportunities that align with your goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-600 font-bold text-lg px-8 py-4 rounded-full flex items-center space-x-2 hover:shadow-xl transition-all duration-300"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white text-white font-semibold text-lg px-8 py-4 rounded-full hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Setup in 2 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
