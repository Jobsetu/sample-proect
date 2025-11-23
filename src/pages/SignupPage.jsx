import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Sparkles, Upload, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ResumeService } from '../lib/resumeService'

const SignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Using direct Supabase auth instead of context for now

  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    currentCity: '',
    
    // Step 2: Education & Experience
    educationLevel: '',
    experienceLevel: '',
    
    // Step 3: Skills
    skills: [],
    newSkill: '',
    
    // Step 4: Resume Upload
    resumeFile: null,
    resumeData: null,
    
    // Step 5: Job Preferences
    jobFunction: '',
    jobType: 'Full-time',
    location: 'India',
    openToRemote: true,
    
    // Step 5: Password
    password: '',
    confirmPassword: ''
  })

  const steps = [
    { number: 1, title: 'Personal', icon: User },
    { number: 2, title: 'Education', icon: GraduationCap },
    { number: 3, title: 'Skills', icon: Briefcase },
    { number: 4, title: 'Resume', icon: FileText },
    { number: 5, title: 'Preferences', icon: MapPin },
    { number: 6, title: 'Security', icon: Check }
  ]

  const educationLevels = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Other'
  ]

  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)',
    'Senior Level (6-10 years)',
    'Executive Level (10+ years)'
  ]

  const jobFunctions = [
    'Software Engineer',
    'Full Stack Developer',
    'Backend Engineer',
    'Frontend Developer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Mobile Developer',
    'Other'
  ]

  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'SQL', 'MongoDB',
    'Express', 'Next.js', 'Vue.js', 'Angular', 'PHP', 'C++'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
        newSkill: ''
      }))
    }
  }

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      
      // Create user in Supabase Auth directly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            current_city: formData.currentCity
          }
        }
      })

      if (authError) {
        if (authError.message.includes('429')) {
          setError('Too many signup attempts. Please wait a few minutes and try again.')
        } else if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(authError.message || 'Failed to create account. Please try again.')
        }
        setLoading(false)
        return
      }

      // Wait a moment for the auth to be fully processed
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create user profile in database (only if auth was successful)
      if (authData?.user?.id) {
        try {
          // 1. Create user profile
          const { error: userError } = await supabase
            .from('Users')
            .insert({
              id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              current_city: formData.currentCity,
              education_level: formData.educationLevel,
              experience_level: formData.experienceLevel
            })

          if (userError) {
            console.error('User profile creation error:', userError)
            throw userError
          }

          // 2. Insert user skills if any
          if (formData.skills && formData.skills.length > 0) {
            const skillsData = formData.skills.map(skill => ({
              user_id: authData.user.id,
              skill_name: skill,
              skill_level: 'intermediate' // Default level, can be updated later
            }))

            const { error: skillsError } = await supabase
              .from('user_skills')
              .insert(skillsData)

            if (skillsError) {
              console.error('Skills insertion error:', skillsError)
              // Don't fail the signup for skills error
            }
          }

          // 3. Insert user preferences
          const { error: preferencesError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: authData.user.id,
              job_function: formData.jobFunction,
              job_type: formData.jobType,
              location_preference: formData.location,
              open_to_remote: formData.openToRemote,
              job_search_status: 'active'
            })

          if (preferencesError) {
            console.error('Preferences insertion error:', preferencesError)
            // Don't fail the signup for preferences error
          }

          console.log('User profile created successfully with all data')

        } catch (error) {
          console.error('Database error:', error)
          // Don't fail the signup if database insert fails - user is still created in auth
          console.warn('User created in auth but failed to create profile in database')
        }
      }

      // Show success message and redirect
      setError('')
      alert('Account created successfully! Please check your email to verify your account.')
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Let's get to know you</h2>
              <p className="text-gray-300">Tell us about yourself to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current City
                </label>
                <input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your current city"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Background</h2>
              <p className="text-gray-300">Help us understand your experience level</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Education Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {educationLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('educationLevel', level)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.educationLevel === level
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-white/20 bg-white/10 text-white hover:border-white/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Experience Level *
                </label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('experienceLevel', level)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        formData.experienceLevel === level
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-white/20 bg-white/10 text-white hover:border-white/40'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Skills</h2>
              <p className="text-gray-300">Add your technical skills to improve job matching</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Add Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.newSkill}
                    onChange={(e) => handleInputChange('newSkill', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill(formData.newSkill)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Type a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(formData.newSkill)}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Common Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {formData.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Your Skills ({formData.skills.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary-500/20 border border-primary-500 rounded-full text-primary-400"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-primary-400 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Job Preferences</h2>
              <p className="text-gray-300">Tell us what kind of job you're looking for</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Job Function *
                </label>
                <select
                  value={formData.jobFunction}
                  onChange={(e) => handleInputChange('jobFunction', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your preferred job function</option>
                  {jobFunctions.map((func) => (
                    <option key={func} value={func} className="bg-dark-800">
                      {func}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Job Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('jobType', type)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.jobType === type
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-white/20 bg-white/10 text-white hover:border-white/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Preference
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Bangalore, Mumbai, Remote"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="openToRemote"
                  checked={formData.openToRemote}
                  onChange={(e) => handleInputChange('openToRemote', e.target.checked)}
                  className="w-4 h-4 text-primary-500 bg-white/10 border-white/20 rounded focus:ring-primary-500"
                />
                <label htmlFor="openToRemote" className="text-gray-300">
                  Open to Remote work
                </label>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Password</h2>
              <p className="text-gray-300">Secure your account with a strong password</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.number
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-white/30 text-white/50'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-primary-500' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-effect rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                currentStep === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
