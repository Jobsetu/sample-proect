import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Edit3,
  Save,
  X,
  Linkedin,
  Github,
  Calendar,
  Award,
  CheckCircle,
  Settings,
  Bell,
  Search,
  FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { UserService } from '../lib/userService'
import Avatar from '../components/Avatar'
// import LinkedInConnect from '../components/LinkedInConnect'
// import LinkedInProfileEditor from '../components/LinkedInProfileEditor'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  // const [linkedInProfile, setLinkedInProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_city: '',
    education_level: '',
    experience_level: '',
    linkedin_url: '',
    github_url: ''
  })
  const { user: authUser, signOut } = useAuth()

  useEffect(() => {
    getCurrentUser()
    fetchProfile()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error getting user:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const profileData = await UserService.getUserProfile(user.id)
        setProfile(profileData)
        setFormData({
          full_name: profileData.user?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: profileData.user?.phone || '',
          current_city: profileData.user?.current_city || '',
          education_level: profileData.user?.education_level || '',
          experience_level: profileData.user?.experience_level || '',
          linkedin_url: profileData.user?.linkedin_url || '',
          github_url: profileData.user?.github_url || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!user) return

      await UserService.updateUserProfile(user.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        current_city: formData.current_city,
        education_level: formData.education_level,
        experience_level: formData.experience_level,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url
      })

      setEditing(false)
      await fetchProfile()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(`Error saving profile: ${error.message || 'Unknown error'}`)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'employment', label: 'Equal Employment', icon: CheckCircle },
    // { id: 'integrations', label: 'Integrations', icon: Linkedin }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

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
                <Link to="/jobs" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                  <span>Jobs</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-primary-400 font-medium">
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
                  name={authUser?.user_metadata?.full_name || authUser?.email}
                  email={authUser?.email}
                  size={32}
                  style="avataaars"
                />
                <span className="text-gray-300 text-sm">
                  {authUser?.user_metadata?.full_name || authUser?.email || 'User'}
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

      {/* Profile Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <div className="flex items-center space-x-4">
            {editing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center space-x-6">
            <Avatar
              name={formData.full_name || user?.user_metadata?.full_name || user?.email}
              email={user?.email}
              size={96}
              style="avataaars"
              className="ring-4 ring-primary-500/20"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                {formData.full_name || user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-gray-400 text-lg mb-4">
                {formData.current_city && `${formData.current_city} • `}
                {formData.experience_level && `${formData.experience_level} • `}
                {formData.education_level}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Profile Complete</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="glass-effect rounded-xl p-6 mb-6">
              <div className="flex space-x-1 mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-700'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <p className="text-white text-lg">{formData.full_name || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <p className="text-white text-lg">{formData.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <p className="text-white text-lg">{formData.phone || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current City
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.current_city}
                            onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <p className="text-white text-lg">{formData.current_city || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Education Level
                      </label>
                      {editing ? (
                        <select
                          value={formData.education_level}
                          onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                          className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select education level</option>
                          <option value="High School">High School</option>
                          <option value="Associate">Associate Degree</option>
                          <option value="Bachelor">Bachelor's Degree</option>
                          <option value="Master">Master's Degree</option>
                          <option value="PhD">PhD</option>
                        </select>
                      ) : (
                        <p className="text-white text-lg">{formData.education_level || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Experience Level
                      </label>
                      {editing ? (
                        <select
                          value={formData.experience_level}
                          onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                          className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select experience level</option>
                          <option value="Entry Level">Entry Level (0-2 years)</option>
                          <option value="Mid Level">Mid Level (2-5 years)</option>
                          <option value="Senior Level">Senior Level (5-10 years)</option>
                          <option value="Lead Level">Lead Level (10+ years)</option>
                        </select>
                      ) : (
                        <p className="text-white text-lg">{formData.experience_level || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <p className="text-gray-400">Skills will be displayed here once you add them.</p>
                  </div>
                )}

                {activeTab === 'employment' && (
                  <div className="space-y-4">
                    <p className="text-gray-400">Equal employment information will be displayed here.</p>
                  </div>
                )}

                {/* {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    {!linkedInProfile ? (
                      <LinkedInConnect onConnect={setLinkedInProfile} />
                    ) : (
                      <LinkedInProfileEditor
                        profile={linkedInProfile}
                        onDisconnect={() => setLinkedInProfile(null)}
                      />
                    )}
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Complete Profile Card */}
            <div className="glass-effect rounded-xl p-6 bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">!</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Complete your profile to boost job matching accuracy and enable better recommendations.
                  </p>
                  <button className="btn-primary text-sm">
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/resume'}
                  className="w-full flex items-center space-x-3 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-primary-400" />
                  <span className="text-white">Manage Resume</span>
                </button>
                <button
                  onClick={() => {
                    const url = prompt("Enter your LinkedIn Profile URL:", formData.linkedin_url);
                    if (url !== null) {
                      setFormData(prev => ({ ...prev, linkedin_url: url }));
                      UserService.updateUserProfile(user.id, { ...formData, linkedin_url: url })
                        .then(() => {
                          alert("LinkedIn URL updated!");
                          fetchProfile();
                        })
                        .catch(err => alert("Failed to update LinkedIn URL"));
                    }
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Update LinkedIn</span>
                </button>
                <button
                  onClick={() => {
                    const url = prompt("Enter your GitHub Profile URL:", formData.github_url);
                    if (url !== null) {
                      setFormData(prev => ({ ...prev, github_url: url }));
                      UserService.updateUserProfile(user.id, { ...formData, github_url: url })
                        .then(() => {
                          alert("GitHub URL updated!");
                          fetchProfile();
                        })
                        .catch(err => alert("Failed to update GitHub URL"));
                    }
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-400" />
                  <span className="text-white">Connect GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
