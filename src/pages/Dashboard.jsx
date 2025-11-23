import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  User, 
  Settings, 
  Bell, 
  Search, 
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import JobTailor from '../components/JobTailor'
import Logo from '../components/Logo'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('recommended')

  useEffect(() => {
    getCurrentUser()
    fetchJobs()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error getting user:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        setJobs(data || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'recommended', label: 'Recommended', count: jobs.length },
    { id: 'liked', label: 'Liked', count: 0 },
    { id: 'applied', label: 'Applied', count: 0 },
    { id: 'external', label: 'External', count: 0 }
  ]

  const filterOptions = [
    'Backend Engineer', 'Full Stack Engineer', 'Frontend Engineer', 'React Developer',
    'India', 'Full-time', 'Onsite', 'Remote', 'Hybrid', 'Entry Level'
  ]

  const getMatchScore = (job) => {
    const score = Math.floor(Math.random() * 30) + 70
    return score
  }

  const getMatchLabel = (score) => {
    if (score >= 90) return 'STRONG MATCH'
    if (score >= 80) return 'GOOD MATCH'
    if (score >= 70) return 'FAIR MATCH'
    return 'WEAK MATCH'
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-dark-800/80 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard">
                <Logo size="md" />
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/jobs" className="flex items-center space-x-2 text-primary-400 font-medium">
                  <Briefcase className="w-5 h-5" />
                  <span>Jobs</span>
                </Link>
                <Link to="/tracker" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                  <span>Tracker</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link to="/resume?tab=builder" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Resume Builder</span>
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
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h2>
          <p className="text-gray-400 text-lg">
            Let's find your next opportunity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-4xl mb-12"
        >
          <JobTailor />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full"
        >
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Jobs Applied</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <Briefcase className="w-8 h-8 text-primary-400" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Views</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interviews</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Match Score</p>
                <p className="text-2xl font-bold text-white">85%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800/50 rounded-2xl p-6 w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Job Recommendations</h3>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Edit Filters</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-1  mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map((option, index) => (
              <button
                key={index}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  index === 0 || index === 5 || index === 9
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job, index) => {
                const matchScore = getMatchScore(job)
                const matchLabel = getMatchLabel(matchScore)
                
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect rounded-xl p-6 hover:bg-dark-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {job.company?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                            <p className="text-gray-400">{job.company}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.job_type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salary_range}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          {job.tags && job.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-dark-700 text-gray-300 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                       </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-right">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-1">
                            <span className="text-white font-bold text-lg">{matchScore}%</span>
                          </div>
                          <p className="text-xs text-green-400 font-medium">{matchLabel}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Star className="w-5 h-5" />
                          </button>
                          <button className="btn-primary px-4 py-2 text-sm">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No jobs found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
