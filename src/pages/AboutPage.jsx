import { motion } from 'framer-motion'

const AboutPage = () => {
  return (
    <div className="pt-20 min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="gradient-text">JobSetu</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're building the future of job searching with AI-powered matching and a seamless user experience.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AboutPage
