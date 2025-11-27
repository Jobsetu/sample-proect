import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, BarChart2, CheckCircle, AlertCircle, Loader, Trash2, Lightbulb, TrendingUp, Star, Eye, EyeOff, PenTool, Briefcase, User, Settings } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { ResumeService } from '../lib/resumeService'
import { GeminiService } from '../lib/geminiService'
import { useAuth } from '../contexts/AuthContext'
import { useResumeStore } from '../stores/useResumeStore'
import Avatar from '../components/Avatar'
import EditorPanel from '../components/EditorPanel'
import PDFPreview from '../components/PDFPreview'
import TemplateSwitcher from '../components/TemplateSwitcher'
import ExportButtons from '../components/ExportButtons'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Resume Builder Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-red-500/10 rounded-xl border border-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-gray-300 mb-4">The resume builder encountered an error.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
          <pre className="mt-4 p-4 bg-black/50 rounded text-left text-xs text-red-300 overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

const ResumePage = () => {
  const { user: authUser, loading, signOut } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('analytics')
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [atsFeedback, setAtsFeedback] = useState([])
  const [resumeInsights, setResumeInsights] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [showRawText, setShowRawText] = useState(false)

  // Builder Store
  const setResume = useResumeStore(state => state.setResume)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'builder') {
      setActiveTab('builder')
    }
  }, [searchParams])

  useEffect(() => {
    if (authUser) {
      loadUserResume()
    }
  }, [authUser])

  const loadUserResume = async () => {
    try {
      const response = await ResumeService.getUserResume(authUser.id)
      if (response && response.data) {
        const data = response.data
        setResumeData(data)
        if (data.parsedText) {
          analyzeResume(data.parsedText, data)
        }
        // Also populate builder store
        populateBuilder(data)
      }
    } catch (error) {
      console.error("Error loading resume:", error)
    }
  }

  const populateBuilder = (data) => {
    // Map parsed data to builder store structure
    const builderData = {
      personalInfo: data.personalInfo || {},
      sections: [
        {
          id: 'summary',
          title: 'Summary',
          content: data.summary || ''
        },
        {
          id: 'experience',
          title: 'Professional Experience',
          items: data.experience || []
        },
        {
          id: 'education',
          title: 'Education',
          items: data.education || []
        },
        {
          id: 'skills',
          title: 'Skills',
          items: data.skills || []
        },
        {
          id: 'projects',
          title: 'Projects',
          items: data.projects || []
        }
      ],
      skills: data.skills || [], // Keep for backward compatibility if needed
      template: 'classic' // default
    }
    setResume(builderData)
  }

  const analyzeResume = async (text, parsedData) => {
    // Analyze using Gemini for ATS score, feedback, and key insights
    try {
      // Try to use stored job description
      let jobDescription = "General Software Engineering"

      try {
        const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
        const { hasJobDescription, getFormattedJobDescription } = useJobDescriptionStore.getState()

        if (hasJobDescription()) {
          jobDescription = getFormattedJobDescription()
          console.log('Using stored job description for resume analysis')
        } else {
          console.log('No job description stored, using generic analysis')
        }
      } catch (error) {
        console.error('Failed to load job description store:', error)
      }

      const analysis = await GeminiService.generateResumeAnalysis(jobDescription, parsedData)
      if (analysis) {
        setAtsScore(analysis.atsScore || 5) // Default if not returned
        setAtsFeedback(analysis.atsFeedback || [])

        // Store comprehensive insights including new fields
        setResumeInsights({
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          suggestions: analysis.suggestions || [],
          keywordsToAdd: analysis.keywordsToAdd || [],
          missingSkills: analysis.missingSkills || [],
          matchScore: analysis.matchScore || 0,
          estimatedExperience: analysis.estimatedExperience || null,
          // New enhanced analysis fields
          missingKeywords: analysis.missingKeywords || [],
          recommendedChanges: analysis.recommendedChanges || [],
          projectSuggestions: analysis.projectSuggestions || [],
          atsImprovements: analysis.atsImprovements || []
        })
      }
    } catch (err) {
      console.error("Analysis failed", err)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      setProcessing(true)

      // Upload and Parse (local mode now handles parsing)
      const uploadResult = await ResumeService.uploadResume(file, authUser.id)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      setResumeData(uploadResult)

      // Trigger analysis
      if (uploadResult.parsedText) {
        await analyzeResume(uploadResult.parsedText, uploadResult)
      }

      // Populate builder
      if (uploadResult.personalInfo || uploadResult.skills) {
        populateBuilder(uploadResult)
      }

      alert('Resume uploaded and analyzed successfully!')

    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Error uploading resume: ' + error.message)
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  // ... drag and drop handlers ...
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDeleteResume = async () => {
    if (!resumeData || !window.confirm('Are you sure you want to delete your resume?')) {
      return
    }
    setResumeData(null)
    setAtsScore(null)
    setAtsFeedback([])
    setResumeInsights(null)
    alert('Resume deleted from view (local mode).')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-dark-800/80 backdrop-blur-lg border-b border-white/10 z-10 flex-none"
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
                <Link to="/tracker" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                  <span>Tracker</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link to="/resume?tab=builder" className="flex items-center space-x-2 text-primary-400 font-medium">
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

      {/* Tabs Navigation */}
      <div className="bg-dark-800 border-b border-white/10 flex-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'analytics'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
            >
              <BarChart2 className="w-4 h-4" />
              Resume Analytics
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'builder'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
            >
              <PenTool className="w-4 h-4" />
              Resume Builder (LaTeX)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex-1 to fill remaining height */}
      <div className="flex-1 bg-dark-900 relative overflow-hidden flex flex-col">
        <ErrorBoundary>
          {activeTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-effect rounded-2xl p-8 lg:col-span-1 h-fit"
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Upload Resume</h2>

                    {!resumeData ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                          ? 'border-primary-400 bg-primary-400/10'
                          : 'border-gray-600 hover:border-gray-500'
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">
                          {uploading ? 'Uploading...' : 'Drag & Drop Resume'}
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileInput}
                          className="hidden"
                          id="resume-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="resume-upload"
                          className="btn-primary cursor-pointer inline-block w-full"
                        >
                          Browse Files
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-green-400 font-medium">Ready</p>
                            <p className="text-gray-300 text-sm truncate">{resumeData.fileName || 'Uploaded File'}</p>
                          </div>
                        </div>

                        <button
                          onClick={handleDeleteResume}
                          className="btn-danger w-full flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Reset</span>
                        </button>
                      </div>
                    )}

                    {processing && (
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Loader className="animate-spin w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-sm">Analyzing content...</span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Resume Analysis */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-effect rounded-2xl p-8 lg:col-span-2"
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Analysis Report</h2>

                    {resumeData ? (
                      <div className="space-y-8">
                        {/* Score Cards */}
                        {atsScore !== null && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-dark-800/50 p-5 rounded-xl border border-white/10 flex items-center gap-4">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${atsScore >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {atsScore}
                              </div>
                              <div>
                                <h3 className="text-white font-medium">ATS Score</h3>
                                <p className="text-gray-400 text-sm">Out of 10</p>
                              </div>
                            </div>
                            {resumeInsights?.matchScore && (
                              <div className="bg-dark-800/50 p-5 rounded-xl border border-white/10 flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${resumeInsights.matchScore >= 7 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                  {resumeInsights.matchScore}
                                </div>
                                <div>
                                  <h3 className="text-white font-medium">Match Score</h3>
                                  <p className="text-gray-400 text-sm">Job Relevance</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Experience Estimation */}
                        {resumeInsights?.estimatedExperience && (
                          <div className="bg-dark-800/50 p-5 rounded-xl border border-white/10 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-bold text-purple-400">
                              {resumeInsights.estimatedExperience.years}+
                            </div>
                            <div>
                              <h3 className="text-white font-medium flex items-center gap-2">
                                {resumeInsights.estimatedExperience.level}
                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                                  {resumeInsights.estimatedExperience.years} Years
                                </span>
                              </h3>
                              <p className="text-gray-400 text-sm">{resumeInsights.estimatedExperience.reasoning}</p>
                            </div>
                          </div>
                        )}

                        {/* Key Insights Section */}
                        {resumeInsights && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              Key Insights
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Strengths */}
                              {resumeInsights.strengths && resumeInsights.strengths.length > 0 && (
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                                  <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Strengths
                                  </h4>
                                  <ul className="space-y-2">
                                    {resumeInsights.strengths.map((strength, i) => (
                                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Areas for Improvement */}
                              {resumeInsights.weaknesses && resumeInsights.weaknesses.length > 0 && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                                  <h4 className="text-yellow-400 font-semibold mb-3">Areas for Improvement</h4>
                                  <ul className="space-y-2">
                                    {resumeInsights.weaknesses.map((weakness, i) => (
                                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-yellow-400">•</span>
                                        <span>{weakness}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Suggestions */}
                            {resumeInsights.suggestions && resumeInsights.suggestions.length > 0 && (
                              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Recommendations
                                </h4>
                                <ul className="space-y-2">
                                  {resumeInsights.suggestions.map((suggestion, i) => (
                                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                      <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Keywords to Add */}
                            {resumeInsights.keywordsToAdd && resumeInsights.keywordsToAdd.length > 0 && (
                              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                                <h4 className="text-purple-400 font-semibold mb-3">Keywords to Add</h4>
                                <div className="flex flex-wrap gap-2">
                                  {resumeInsights.keywordsToAdd.map((keyword, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Skills */}
                            {resumeInsights.missingSkills && resumeInsights.missingSkills.length > 0 && (
                              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                                <h4 className="text-red-400 font-semibold mb-3">Missing Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                  {resumeInsights.missingSkills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ENHANCED: Missing Keywords with Priority */}
                            {resumeInsights.missingKeywords && resumeInsights.missingKeywords.length > 0 && (
                              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
                                <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Missing Keywords from Job Description
                                </h4>
                                <div className="space-y-3">
                                  {['High', 'Medium', 'Low'].map(priority => {
                                    const keywords = resumeInsights.missingKeywords.filter(k => k.priority === priority)
                                    if (keywords.length === 0) return null

                                    return (
                                      <div key={priority}>
                                        <p className="text-xs text-gray-400 mb-2">{priority} Priority</p>
                                        <div className="flex flex-wrap gap-2">
                                          {keywords.map((kw, i) => (
                                            <span
                                              key={i}
                                              className={`px-3 py-1 rounded-full text-xs ${priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                priority === 'Medium' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                                  'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                                }`}
                                              title={`${kw.category} - Add to: ${kw.whereToAdd}`}
                                            >
                                              {kw.keyword}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ENHANCED: Recommended Changes */}
                            {resumeInsights.recommendedChanges && resumeInsights.recommendedChanges.length > 0 && (
                              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Recommended Changes
                                </h4>
                                <div className="space-y-3">
                                  {resumeInsights.recommendedChanges.map((change, i) => (
                                    <div key={i} className="bg-dark-800/30 p-3 rounded border border-blue-500/10">
                                      <div className="flex items-start justify-between mb-1">
                                        <p className="text-sm font-medium text-blue-300">{change.section}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded ${change.impact === 'High' ? 'bg-green-500/20 text-green-300' :
                                          change.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-gray-500/20 text-gray-300'
                                          }`}>
                                          {change.impact} Impact
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300">{change.change}</p>
                                      {change.example && (
                                        <p className="text-xs text-gray-500 mt-1 italic">Example: {change.example}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ENHANCED: Project Suggestions */}
                            {resumeInsights.projectSuggestions && resumeInsights.projectSuggestions.length > 0 && (
                              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                                <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Suggested Projects to Add
                                </h4>
                                <div className="space-y-3">
                                  {resumeInsights.projectSuggestions.map((project, i) => (
                                    <div key={i} className="bg-dark-800/30 p-3 rounded border border-purple-500/10">
                                      <div className="flex items-start justify-between mb-2">
                                        <h5 className="text-sm font-medium text-purple-300">{project.title}</h5>
                                        <span className={`text-xs px-2 py-0.5 rounded ${project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                                          project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-red-500/20 text-red-300'
                                          }`}>
                                          {project.difficulty}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 mb-2">{project.description}</p>
                                      <div className="flex flex-wrap gap-1">
                                        {project.targetSkills && project.targetSkills.map((skill, j) => (
                                          <span key={j} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ENHANCED: ATS Improvement Steps */}
                            {resumeInsights.atsImprovements && resumeInsights.atsImprovements.length > 0 && (
                              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                                <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  ATS Improvement Steps
                                </h4>
                                <div className="space-y-2">
                                  {resumeInsights.atsImprovements
                                    .sort((a, b) => a.priority - b.priority)
                                    .map((improvement, i) => (
                                      <div key={i} className="flex items-start gap-3 bg-dark-800/30 p-2 rounded">
                                        <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 text-green-300 rounded-full flex items-center justify-center text-xs font-bold">
                                          {improvement.priority}
                                        </span>
                                        <div className="flex-1">
                                          <p className="text-sm text-gray-300">{improvement.step}</p>
                                          <p className="text-xs text-gray-500 mt-1">Expected: {improvement.expectedImpact}</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* ATS Feedback */}
                            {atsFeedback && atsFeedback.length > 0 && (
                              <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  ATS Feedback
                                </h4>
                                <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                                  {atsFeedback.map((fb, i) => (
                                    <li key={i}>{fb}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Complete Breakdown Section */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-400" />
                            Complete Resume Breakdown
                          </h3>

                          {/* Section-by-Section Analysis */}
                          {resumeData.sections && resumeData.sections.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-md font-semibold text-gray-300">Section Analysis</h4>

                              {/* Summary Section */}
                              {resumeData.sections.find(s => s.id === 'summary') && (
                                <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-white font-medium">Summary</h5>
                                    <span className="text-xs text-gray-400">
                                      {resumeData.sections.find(s => s.id === 'summary')?.content?.length || 0} characters
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">
                                    {resumeData.sections.find(s => s.id === 'summary')?.content || 'No summary found'}
                                  </p>
                                  <div className="mt-2 text-xs text-gray-400">
                                    {resumeData.sections.find(s => s.id === 'summary')?.content?.length > 150
                                      ? '✓ Good length'
                                      : '⚠ Consider expanding to 150+ characters'}
                                  </div>
                                </div>
                              )}

                              {/* Experience Breakdown */}
                              {resumeData.sections.find(s => s.id === 'experience')?.items && (
                                <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium">Professional Experience</h5>
                                    <span className="text-xs text-gray-400">
                                      {resumeData.sections.find(s => s.id === 'experience')?.items?.length || 0} positions
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    {resumeData.sections.find(s => s.id === 'experience')?.items?.map((exp, idx) => (
                                      <div key={idx} className="bg-dark-900/50 p-3 rounded border border-white/5">
                                        <div className="flex items-start justify-between mb-2">
                                          <div>
                                            <p className="text-white font-medium text-sm">{exp.role || 'Position'}</p>
                                            <p className="text-gray-400 text-xs">{exp.company || 'Company'}</p>
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            {exp.startDate || 'Start'} - {exp.endDate || 'Present'}
                                          </span>
                                        </div>
                                        {exp.bullets && exp.bullets.length > 0 && (
                                          <ul className="text-xs text-gray-300 space-y-1 mt-2">
                                            {exp.bullets.slice(0, 3).map((bullet, i) => (
                                              <li key={i} className="flex items-start gap-2">
                                                <span className="text-primary-400 mt-1">•</span>
                                                <span>{bullet}</span>
                                              </li>
                                            ))}
                                            {exp.bullets.length > 3 && (
                                              <li className="text-gray-500">+ {exp.bullets.length - 3} more bullet points</li>
                                            )}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Education Breakdown */}
                              {resumeData.sections.find(s => s.id === 'education')?.items && (
                                <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium">Education</h5>
                                    <span className="text-xs text-gray-400">
                                      {resumeData.sections.find(s => s.id === 'education')?.items?.length || 0} entries
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {resumeData.sections.find(s => s.id === 'education')?.items?.map((edu, idx) => (
                                      <div key={idx} className="bg-dark-900/50 p-3 rounded border border-white/5">
                                        <p className="text-white font-medium text-sm">{edu.degree || 'Degree'}</p>
                                        <p className="text-gray-400 text-xs">{edu.school || 'Institution'}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                          {edu.year && <span>{edu.year}</span>}
                                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                          {edu.location && <span>{edu.location}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Skills Breakdown */}
                              {resumeData.sections.find(s => s.id === 'skills')?.items && (
                                <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium">Skills</h5>
                                    <span className="text-xs text-gray-400">
                                      {resumeData.sections.find(s => s.id === 'skills')?.items?.length || 0} skills listed
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {resumeData.sections.find(s => s.id === 'skills')?.items?.map((skill, idx) => (
                                      <span key={idx} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Projects Breakdown */}
                              {resumeData.sections.find(s => s.id === 'projects')?.items && (
                                <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium">Projects</h5>
                                    <span className="text-xs text-gray-400">
                                      {resumeData.sections.find(s => s.id === 'projects')?.items?.length || 0} projects
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    {resumeData.sections.find(s => s.id === 'projects')?.items?.map((proj, idx) => (
                                      <div key={idx} className="bg-dark-900/50 p-3 rounded border border-white/5">
                                        <p className="text-white font-medium text-sm">{proj.title || 'Project Title'}</p>
                                        {proj.subtitle && <p className="text-gray-400 text-xs mt-1">{proj.subtitle}</p>}
                                        {proj.description && (
                                          <p className="text-gray-300 text-xs mt-2">{proj.description}</p>
                                        )}
                                        {proj.technologies && proj.technologies.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {proj.technologies.map((tech, i) => (
                                              <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                {tech}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Detailed Metrics */}
                          <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                            <h4 className="text-md font-semibold text-gray-300 mb-4">Resume Metrics</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary-400">
                                  {resumeData.sections?.find(s => s.id === 'experience')?.items?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Work Experiences</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary-400">
                                  {resumeData.sections?.find(s => s.id === 'skills')?.items?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Skills Listed</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary-400">
                                  {resumeData.sections?.find(s => s.id === 'projects')?.items?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Projects</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary-400">
                                  {resumeData.sections?.find(s => s.id === 'education')?.items?.length || 0}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Education Entries</p>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-dark-800 p-4 rounded-lg border border-white/10">
                              <h3 className="text-gray-400 text-sm uppercase font-semibold mb-3">Contact Information</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-sm w-20">Name:</span>
                                  <span className="text-white text-sm">{resumeData.personalInfo?.name || 'Not Found'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-sm w-20">Email:</span>
                                  <span className="text-gray-300 text-sm">{resumeData.personalInfo?.email || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 text-sm w-20">Phone:</span>
                                  <span className="text-gray-300 text-sm">{resumeData.personalInfo?.phone || 'Not provided'}</span>
                                </div>
                                {resumeData.personalInfo?.location && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm w-20">Location:</span>
                                    <span className="text-gray-300 text-sm">{resumeData.personalInfo.location}</span>
                                  </div>
                                )}
                                {resumeData.personalInfo?.linkedin && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm w-20">LinkedIn:</span>
                                    <span className="text-primary-400 text-sm">{resumeData.personalInfo.linkedin}</span>
                                  </div>
                                )}
                                {resumeData.personalInfo?.github && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm w-20">GitHub:</span>
                                    <span className="text-primary-400 text-sm">{resumeData.personalInfo.github}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="bg-dark-800 p-4 rounded-lg border border-white/10">
                              <h3 className="text-gray-400 text-sm uppercase font-semibold mb-3">Skills Overview</h3>
                              <div className="flex flex-wrap gap-2">
                                {resumeData.sections?.find(s => s.id === 'skills')?.items?.map((skill, i) => (
                                  <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                                    {skill}
                                  </span>
                                )) || resumeData.skills?.slice(0, 20).map((skill, i) => (
                                  <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Raw Text Toggle */}
                        <div className="pt-4 border-t border-white/10">
                          <button
                            onClick={() => setShowRawText(!showRawText)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showRawText ? 'Hide Raw Text' : 'View Raw Extracted Text'}
                          </button>

                          {showRawText && resumeData.rawText && (
                            <div className="mt-4 p-4 bg-dark-800 rounded-lg border border-white/5">
                              <pre className="text-gray-400 text-xs whitespace-pre-wrap max-h-60 overflow-y-auto font-mono">
                                {resumeData.rawText}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Upload a resume to view detailed analysis and ATS scoring.</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="flex-1 w-full bg-white text-slate-900 flex flex-col h-full overflow-hidden">
              {/* Toolbar */}
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white flex-none z-10">
                <div className="flex items-center gap-4">
                  <TemplateSwitcher />
                </div>
                <ExportButtons />
              </div>

              {/* Two Panel Layout - Using Standard Flexbox instead of Resizable Panels for reliability */}
              <div className="flex-1 relative overflow-hidden h-full flex flex-row">
                <div className="w-1/2 h-full overflow-y-auto p-5 pb-20 bg-slate-50 border-r border-slate-200">
                  <EditorPanel />
                </div>
                <div className="w-1/2 h-full p-6 overflow-hidden flex flex-col bg-slate-100">
                  <PDFPreview />
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default ResumePage
