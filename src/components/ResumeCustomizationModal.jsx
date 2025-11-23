import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Edit3, 
  Palette, 
  CheckCircle, 
  AlertCircle,
  Star,
  Zap,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react'
import { GeminiService } from '../lib/geminiService'
import { ResumeExportService } from '../lib/resumeExportService'
import { SimpleResumeExport } from '../lib/simpleResumeExport'
import { useAuth } from '../contexts/AuthContext'

const ResumeCustomizationModal = ({ isOpen, onClose, jobData, userResume }) => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSections, setSelectedSections] = useState(['summary', 'skills', 'experience'])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [customResume, setCustomResume] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('report')
  const [resumeStyle, setResumeStyle] = useState({
    fontFamily: 'Times New Roman',
    fontSize: 11,
    lineSpacing: 1.2,
    sectionSpacing: 12,
    margin: 1
  })
  

  // Sample resume data for demonstration
  const sampleResume = {
    personalInfo: {
      name: user?.user_metadata?.full_name || 'Prasad Bylapudi',
      email: user?.email || 'prasadbylapudi123@gmail.com',
      phone: '+91 6281973339',
      linkedin: 'linkedin.com/in/prasadbylapudi',
      github: 'github.com/prasadbylapudi'
    },
    summary: "Experienced software engineer with 2+ years of experience in full-stack development, specializing in React, Node.js, and modern web technologies. Proven track record of delivering scalable applications and collaborating with cross-functional teams.",
    skills: {
      languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      frameworks: ['React', 'Node.js', 'Express', 'Django'],
      tools: ['Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL']
    },
    experience: [
      {
        company: 'Grow4Tech',
        position: 'Software Engineer - Full Stack',
        duration: 'Dec 2023 - Aug 2024',
        achievements: [
          'Developed and maintained web applications using React and Node.js',
          'Collaborated with cross-functional teams to deliver high-quality software',
          'Implemented responsive designs and optimized application performance'
        ]
      },
      {
        company: 'Samaaro',
        position: 'Frontend Developer',
        duration: 'Sep 2022 - Aug 2023',
        achievements: [
          'Built user interfaces using React and modern CSS frameworks',
          'Worked with REST APIs and integrated third-party services',
          'Participated in agile development processes'
        ]
      }
    ],
    education: {
      degree: 'B.Tech., Computer Science and Engineering',
      university: 'Rajiv Gandhi University of Knowledge Technologies, Srikakulam',
      year: 'Aug 2018 - Jun 2022',
      gpa: '8.5/10'
    },
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce application with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
      }
    ]
  }

  const availableSkills = [
    'JavaScript/TypeScript', 'React/Redux', 'Docker', 'GraphQL', 
    'SQL DB', 'No-SQL DB', 'Mentoring Engineers', 'Cross-functional collaboration',
    'AWS', 'Node.js', 'Python', 'Java', 'Git', 'Agile', 'REST APIs'
  ]

  const resumeSections = [
    { id: 'summary', name: 'Summary', description: 'Professional overview' },
    { id: 'skills', name: 'Skills', description: 'Technical and soft skills' },
    { id: 'experience', name: 'Work Experience', description: 'Professional history' },
    { id: 'education', name: 'Education', description: 'Academic background' },
    { id: 'projects', name: 'Projects', description: 'Notable projects' },
    { id: 'activities', name: 'Activities', description: 'Additional activities' }
  ]

  useEffect(() => {
    if (isOpen && currentStep === 1) {
      analyzeResume()
    }
  }, [isOpen, currentStep])

  const analyzeResume = async () => {
    setLoading(true)
    try {
      const analysis = await GeminiService.generateResumeAnalysis(
        jobData?.description || 'Software Engineer position',
        sampleResume
      )
      setResumeAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCustomResume = async () => {
    setLoading(true)
    try {
      const custom = await GeminiService.generateCustomResume(
        jobData?.description || 'Software Engineer position',
        sampleResume,
        selectedSections,
        selectedSkills
      )
      setCustomResume(custom)
      setCurrentStep(3)
    } catch (error) {
      console.error('Error generating custom resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSectionToggle = (sectionId) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const downloadPDF = async () => {
    try {
      const resumeData = customResume || sampleResume
      // Try advanced export first, fallback to simple export
      try {
        await ResumeExportService.downloadPDF(resumeData, 'custom-resume.pdf', resumeStyle)
      } catch (error) {
        console.warn('Advanced PDF export failed, using simple export:', error)
        await SimpleResumeExport.downloadPDF(resumeData, 'custom-resume.pdf')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading PDF. Please try again.')
    }
  }

  const downloadDOCX = async () => {
    try {
      const resumeData = customResume || sampleResume
      // Try advanced export first, fallback to simple export
      try {
        await ResumeExportService.downloadDOCX(resumeData, 'custom-resume.docx', resumeStyle)
      } catch (error) {
        console.warn('Advanced DOCX export failed, using simple export:', error)
        await SimpleResumeExport.downloadDOCX(resumeData, 'custom-resume.docx')
      }
    } catch (error) {
      console.error('Error downloading DOCX:', error)
      alert('Error downloading DOCX. Please try again.')
    }
  }

  

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-7xl h-full bg-white flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Resume Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Generate Your Custom Resume</h2>
                  <p className="text-gray-600">2 credits available today</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center space-x-4 mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    <span className={`ml-2 text-sm ${
                      currentStep >= step ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step === 1 && 'See Your Difference'}
                      {step === 2 && 'Align Your Resume'}
                      {step === 3 && 'Review Your New Resume'}
                    </span>
                    {step < 3 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-800">
                        Your Resume is a Low Match for This Job
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-bold">3.5</span>
                        </div>
                        <span className="text-red-600 text-sm">Poor</span>
                      </div>
                    </div>
                    <p className="text-red-700 text-sm">
                      Resumes under 6.0 are likely to be filtered out — we'll help you fix it fast.
                    </p>
                  </div>

                  {/* Resume Selection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your resume
                    </label>
                    <select className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>Prasad_Bylapudi - Full Stack Developer.pdf</option>
                    </select>
                  </div>

                  {/* Analysis Table */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium text-gray-900">LegalZoom Software Engineer II</div>
                        <div className="font-medium text-gray-900">Your resume</div>
                        <div className="font-medium text-gray-900">Match</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {[
                        { job: 'Software Engineer II', resume: 'Software Engineer - Full Stack', match: false },
                        { job: '2+ years exp', resume: '2+ years exp', match: true },
                        { job: "Bachelor's and/or Master's degree", resume: 'B.Tech., Computer Science', match: true },
                        { job: 'Industry Experience', resume: 'Partial match', match: 'partial' },
                        { job: 'Job Keywords (5/7)', resume: '5/7 matched', match: 'partial' },
                        { job: 'Summary', resume: 'Missing summary section', match: false }
                      ].map((row, index) => (
                        <div key={index} className="px-6 py-4 grid grid-cols-3 gap-4">
                          <div className="text-gray-700">{row.job}</div>
                          <div className="text-gray-700">{row.resume}</div>
                          <div className="flex items-center">
                            {row.match === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {row.match === false && <X className="w-5 h-5 text-red-500" />}
                            {row.match === 'partial' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <span>Improve My Resume for This Job</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Choose sections to enhance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Choose sections to enhance</h3>
                      {resumeSections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={section.id}
                            checked={selectedSections.includes(section.id)}
                            onChange={() => handleSectionToggle(section.id)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label htmlFor={section.id} className="flex-1">
                            <div className="font-medium text-gray-900">{section.name}</div>
                            <div className="text-sm text-gray-500">{section.description}</div>
                          </label>
                          {selectedSections.includes(section.id) && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Select relevant skills */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Select relevant skills to add</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableSkills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillToggle(skill)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              selectedSkills.includes(skill)
                                ? 'bg-green-100 border-green-300 text-green-700'
                                : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                      <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                        <Plus className="w-4 h-4" />
                        <span>Add Skills</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={generateCustomResume}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      <span>Generate My New Resume</span>
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Resume Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-8">
                    <div className="max-w-2xl mx-auto">
                      {/* Resume Header */}
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {customResume?.personalInfo?.name || sampleResume.personalInfo.name}
                        </h1>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{customResume?.personalInfo?.phone || sampleResume.personalInfo.phone}</p>
                          <p>{customResume?.personalInfo?.email || sampleResume.personalInfo.email}</p>
                          <p>{customResume?.personalInfo?.linkedin || sampleResume.personalInfo.linkedin}</p>
                          <p>{customResume?.personalInfo?.github || sampleResume.personalInfo.github}</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {customResume?.summary || sampleResume.summary}
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Languages & Databases: </span>
                            <span className="text-gray-600">
                              {(customResume?.skills?.languages || sampleResume.skills.languages).join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Frameworks and Libraries: </span>
                            <span className="text-gray-600">
                              {(customResume?.skills?.frameworks || sampleResume.skills.frameworks).join(', ')}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Developer Tools: </span>
                            <span className="text-gray-600">
                              {(customResume?.skills?.tools || sampleResume.skills.tools).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Experience</h2>
                        {(customResume?.experience || sampleResume.experience).map((exp, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                              <span className="text-sm text-gray-600">{exp.duration}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{exp.company}</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Education */}
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Education</h2>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {customResume?.education?.degree || sampleResume.education.degree}
                          </h3>
                          <p className="text-sm text-gray-700">
                            {customResume?.education?.university || sampleResume.education.university}
                          </p>
                          <p className="text-sm text-gray-600">
                            {customResume?.education?.year || sampleResume.education.year} • 
                            GPA: {customResume?.education?.gpa || sampleResume.education.gpa}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={downloadPDF}
                        className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={downloadDOCX}
                        className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        Download DOCX
                      </button>
                      <button className="btn-primary flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>APPLY NOW</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Editor Panel */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-white rounded-lg p-1">
                {[
                  { id: 'report', name: 'Report', icon: FileText },
                  { id: 'editor', name: 'Editor', icon: Edit3 },
                  { id: 'style', name: 'Style', icon: Palette }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'report' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Great! Your score jumped from 3.5 to 6</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Closer to landing that interview!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">See What's Changed</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">1</div>
                        <span className="text-sm text-gray-700">Summary Enhanced</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">2</div>
                        <span className="text-sm text-gray-700">Recent Work Experience Enhanced</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">More Adjustments You Can Make</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Align your job title</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">How do you like this resume?</h4>
                    <div className="flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <Star className="w-4 h-4" />
                        <span>Looks Great!</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                        <span>Not What I Expected</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      Note: Changes made here apply only to this resume. For major updates, like adjusting sections or editing experiences, update your Base Resume to affect future resumes.
                    </p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit Base Resume
                    </button>
                  </div>

                  <div className="space-y-2">
                    {[
                      'Personal Info', 'Summary', 'Skills', 'Professional Experience', 
                      'Education', 'Project', 'Activities'
                    ].map((section, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">{section}</span>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full flex items-center justify-center space-x-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Font</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Font Family</label>
                        <select 
                          value={resumeStyle.fontFamily}
                          onChange={(e) => setResumeStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option>Times New Roman</option>
                          <option>Arial</option>
                          <option>Calibri</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Name</label>
                        <div className="flex space-x-2">
                          <input 
                            type="number" 
                            value={resumeStyle.fontSize}
                            onChange={(e) => setResumeStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                            className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <select className="w-16 p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option>pt</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Spacing & Margin</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Section Spacing', value: resumeStyle.sectionSpacing },
                        { label: 'Entry Spacing', value: resumeStyle.itemSpacingPt ?? 2 },
                        { label: 'Line Spacing', value: resumeStyle.lineSpacing },
                        { label: 'Top & Bottom Margin', value: resumeStyle.margin },
                        { label: 'List Top Spacing', value: resumeStyle.listTopSepPt ?? 2 }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm text-gray-700 mb-1">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.5"
                            value={item.value}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              if (index === 0) setResumeStyle(prev => ({ ...prev, sectionSpacing: v }))
                              if (index === 1) setResumeStyle(prev => ({ ...prev, itemSpacingPt: v }))
                              if (index === 2) setResumeStyle(prev => ({ ...prev, lineSpacing: v }))
                              if (index === 3) setResumeStyle(prev => ({ ...prev, margin: v }))
                              if (index === 4) setResumeStyle(prev => ({ ...prev, listTopSepPt: v }))
                            }}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">List Options</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Bullet style</label>
                        <select
                          value={resumeStyle.bulletStyle || 'bullet'}
                          onChange={(e) => setResumeStyle(prev => ({ ...prev, bulletStyle: e.target.value }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="bullet">• Bullet</option>
                          <option value="dash">– Dash</option>
                          <option value="arrow">→ Arrow</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">List left margin</label>
                        <input
                          type="text"
                          value={resumeStyle.listLeftMargin || '*'}
                          onChange={(e) => setResumeStyle(prev => ({ ...prev, listLeftMargin: e.target.value }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="* or 12pt"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Text Alignment</h4>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Align Text Left & Right</span>
                    </div>
                  </div>

                  <button className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Reset formatting
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      
    </AnimatePresence>
  )
}

export default ResumeCustomizationModal
