import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Search,
  FileText
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'

const SettingsPage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('account')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      jobAlerts: true,
      profileViews: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC'
    }
  })
  const { user: authUser, signOut } = useAuth()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error getting user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // Delete user data from database
        if (user) {
          await supabase
            .from('Users')
            .delete()
            .eq('id', user.id)
        }
        
        // Sign out user
        await supabase.auth.signOut()
        window.location.href = '/'
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('Error deleting account. Please try again.')
      }
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Key }
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
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                  <span>Resume</span>
                </Link>
                <Link to="/settings" className="flex items-center space-x-2 text-primary-400 font-medium">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-xl p-8"
            >
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.user_metadata?.full_name || ''}
                        className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button className="btn-primary flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="btn-secondary"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Receive push notifications'}
                            {key === 'jobAlerts' && 'Get alerts for new job matches'}
                            {key === 'profileViews' && 'Notify when someone views your profile'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Profile Visibility</h3>
                      <p className="text-gray-400 text-sm mb-4">Control who can see your profile</p>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            profileVisibility: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="connections">Connections Only</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                          <div>
                            <h3 className="text-white font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {key === 'showEmail' && 'Show email address on profile'}
                              {key === 'showPhone' && 'Show phone number on profile'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setSettings({
                                ...settings,
                                privacy: {
                                  ...settings.privacy,
                                  [key]: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Theme</h3>
                      <p className="text-gray-400 text-sm mb-4">Choose your preferred theme</p>
                      <div className="grid grid-cols-3 gap-4">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSettings({
                              ...settings,
                              preferences: {
                                ...settings.preferences,
                                theme
                              }
                            })}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              settings.preferences.theme === theme
                                ? 'border-primary-500 bg-primary-500/20'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                              theme === 'light' ? 'bg-gray-200' : 
                              theme === 'dark' ? 'bg-gray-800' : 
                              'bg-gradient-to-r from-gray-200 to-gray-800'
                            }`}></div>
                            <p className="text-white text-sm capitalize">{theme}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Language</h3>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {
                            ...settings.preferences,
                            language: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-700 rounded-lg">
                      <h3 className="text-white font-medium mb-2">Change Password</h3>
                      <p className="text-gray-400 text-sm mb-4">Update your password to keep your account secure</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-dark-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button className="btn-primary">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                          <p className="text-gray-300 text-sm mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Account</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
