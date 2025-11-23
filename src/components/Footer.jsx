import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-bold gradient-text">JobSetu</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your career journey starts here. Find the perfect job that matches your skills and aspirations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-gray-400 hover:text-white transition-colors text-sm">Find Jobs</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Career</a></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Post a Job</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Browse Candidates</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Resources</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 JobSetu. All rights reserved. Made with ❤️ for job seekers worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
