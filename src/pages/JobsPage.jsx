import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Clock, DollarSign, Users, Star, ExternalLink, Briefcase, User, Settings, Bell, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'

const JobsPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: ''
  })
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // Sample job data (replace with actual Supabase query)
  const sampleJobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120k - $180k',
      type: 'Full-time',
      experience: 'Senior',
      posted: '2 hours ago',
      applicants: 45,
      match: 95,
      description: 'We are looking for a senior software engineer to join our team...',
      tags: ['React', 'Node.js', 'AWS', 'TypeScript']
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary: '$90k - $130k',
      type: 'Full-time',
      experience: 'Mid-level',
      posted: '4 hours ago',
      applicants: 23,
      match: 87,
      description: 'Join our fast-growing startup as a full stack developer...',
      tags: ['JavaScript', 'Python', 'Docker', 'PostgreSQL']
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'DesignStudio',
      location: 'Remote',
      salary: '$80k - $120k',
      type: 'Full-time',
      experience: 'Mid-level',
      posted: '1 day ago',
      applicants: 67,
      match: 92,
      description: 'We need a creative frontend developer to build amazing UIs...',
      tags: ['React', 'Vue.js', 'CSS', 'Figma']
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setJobs(sampleJobs)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchesType = !filters.jobType || job.type === filters.jobType
    const matchesExperience = !filters.experience || job.experience === filters.experience

    return matchesSearch && matchesLocation && matchesType && matchesExperience
  })

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-dark-800/80 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-white">JobSetu</Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/jobs" className="flex items-center space-x-2 text-primary-400 font-medium">
                  <Briefcase className="w-5 h-5" />
                  <span>Jobs</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Resume</span>
                </Link>
                <Link to="/settings" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <Avatar 
                  name={user?.user_metadata?.full_name || user?.email}
                  email={user?.email}
                  size={32}
                  style="avataaars"
                />
                <span className="text-gray-300 text-sm">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
                <button
                  onClick={signOut}
                  className="ml-2 px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your <span className="gradient-text">Dream Job</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover opportunities that match your skills and career goals
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
                <option value="hyderabad">Hyderabad</option>
              </select>

              <select
                value={filters.jobType}
                onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>

              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Levels</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid-level">Mid Level</option>
                <option value="Senior">Senior Level</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-effect rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-white/20 rounded mb-4"></div>
                  <div className="h-3 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/20 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-white/20 rounded w-16"></div>
                    <div className="h-6 bg-white/20 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-2xl p-6 card-hover group cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-300 text-lg">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{job.posted}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-yellow-400 font-medium">{job.match}% Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{job.type} • {job.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span>{job.applicants} applicants</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="flex-1 btn-primary text-center"
                      onClick={() => {
                        // Handle apply now action
                        console.log('Apply to job:', job.id)
                      }}
                    >
                      Apply Now
                    </button>
                    <button 
                      className="px-4 py-2 glass-effect rounded-lg text-white hover:bg-white/20 transition-colors"
                      onClick={() => {
                        // Handle external link action
                        console.log('View external job:', job.id)
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No jobs found</h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobsPage