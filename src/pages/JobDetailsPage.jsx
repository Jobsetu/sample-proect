import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ResumeCustomizationModal from '../components/ResumeCustomizationModal'
import {
  ArrowLeft,
  Share2,
  Flag,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Target,
  CheckCircle,
  Star,
  Building2,
  Calendar,
  Award,
  Heart,
  MessageCircle,
  Download,
  Settings,
  HelpCircle,
  X,
  Search,
  Send
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useResumeStore } from '../stores/useResumeStore'

const JobDetailsPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSkills, setSelectedSkills] = useState(new Set())
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)

  // Sample job data - in real app, this would come from API
  const sampleJob = {
    id: jobId,
    title: "Software Engineer II",
    company: "LegalZoom",
    companyLogo: "LZ",
    location: "Los Angeles, CA",
    workType: "Remote",
    salary: "$93K/yr - $139K/yr",
    employmentType: "Full-time",
    seniority: "Entry, Mid Level",
    experience: "2+ years exp",
    postedTime: "6 hours ago",
    applicants: "200+ applicants",
    matchScore: 91,
    expLevel: 90,
    skillMatch: 98,
    industryExp: 44,
    description: "LegalZoom is on a mission to help people navigate the legal system with confidence and clarity. They are seeking a Software Engineer II to build user interfaces, features, applications, and tools for customers while collaborating with cross-functional teams and improving engineering standards.",
    responsibilities: [
      "Build software solutions which meet and exceed operating targets of reliability, scalability, security, maintainability and performance",
      "Develop and define the architecture and tech stack for Product Experiences",
      "Work cross-functionally with many teams: Engineering, Product, Technical Operations, Data Science, etc...",
      "Debug production issues across services and multiple levels of the stack",
      "Improve engineering standards, tooling, and processes"
    ],
    qualifications: {
      skills: [
        { name: "Javascript/Typescript", hasSkill: true },
        { name: "React/Redux", hasSkill: true },
        { name: "Docker", hasSkill: true },
        { name: "GraphQL", hasSkill: true },
        { name: "SQL DB", hasSkill: true },
        { name: "No-SQL DB", hasSkill: true },
        { name: "Mentoring engineers", hasSkill: false },
        { name: "Cross-functional collaboration", hasSkill: true }
      ],
      requirements: [
        "2+ years of experience in a hands-on software engineering role",
        "Bachelor's and/or Master's degree, preferably in CS, or equivalent experience",
        "Passion for building high-impact, well-performing user experiences across different form-factors/devices",
        "Strong coding skills in Javascript/Typescript",
        "Work experience preferred in one or more of the following technologies: React/Redux, Docker, Github Actions, GraphQL, SQL DB, No-SQL DB",
        "Experience or desire to work collaboratively in cross-functional teams with design, product and data science partners",
        "Experience mentoring engineers"
      ]
    },
    benefits: [
      "Medical, Dental, Vision Insurance",
      "401k, With Matching Contributions",
      "Paid Time Off",
      "Health Savings Account (HSA)",
      "Flexible Spending Account (FSA)",
      "Short-Term/Long-Term Disability Insurance",
      "Fertility",
      "Mental Health",
      "One Medical",
      "Fringe lifestyle benefits up to $250"
    ],
    keywords: ["Consulting", "Legal", "Legal Tech", "Professional Services"],
    h1bSponsor: true
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJob(sampleJob)
      setLoading(false)
    }, 1000)
  }, [jobId])

  const handleSkillToggle = (skillName) => {
    const newSelectedSkills = new Set(selectedSkills)
    if (newSelectedSkills.has(skillName)) {
      newSelectedSkills.delete(skillName)
    } else {
      newSelectedSkills.add(skillName)
    }
    setSelectedSkills(newSelectedSkills)
  }

  const handleBackClick = () => {
    navigate('/jobs')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Job Not Found</h2>
          <Link to="/jobs" className="btn-primary">Back to Jobs</Link>
        </div>
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
              <Link to="/" className="text-2xl font-bold text-white">JobSetu</Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/jobs" className="flex items-center space-x-2 text-primary-400 font-medium">
                  <Briefcase className="w-5 h-5" />
                  <span>Jobs</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <Award className="w-5 h-5" />
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
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-8 mb-6"
            >
              {/* Back Button and Job Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleBackClick}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-300" />
                  </button>
                  <span className="text-gray-400">{job.applicants}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <Flag className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ExternalLink className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="btn-primary">
                    APPLY NOW
                  </button>
                </div>
              </div>

              {/* Company Logo and Job Title */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{job.companyLogo}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-1">
                    <span>{job.company}</span>
                    <span>·</span>
                    <span>{job.postedTime}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                </div>
              </div>

              {/* Job Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.workType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.salary}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.employmentType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.seniority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{job.experience}</span>
                </div>
              </div>

              {/* Match Score */}
              <div className="flex items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-xl">{job.matchScore}%</span>
                  </div>
                  <p className="text-green-400 font-semibold">STRONG MATCH</p>
                </div>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                      <span className="text-green-400 font-semibold text-sm">{job.expLevel}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">Exp. Level</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                      <span className="text-green-400 font-semibold text-sm">{job.skillMatch}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">Skill</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                      <span className="text-green-400 font-semibold text-sm">{job.industryExp}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">Industry Exp</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-6">
                <button className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Maximize your interview chances</span>
                </button>
                <button
                  onClick={() => setIsResumeModalOpen(true)}
                  className="flex items-center space-x-2 bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg hover:bg-primary-500/30 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>Generate Custom Resume</span>
                </button>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-2 mb-6">
                {job.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
                {job.h1bSponsor && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>H1B Sponsor Likely</span>
                  </span>
                )}
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex space-x-8 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'overview'
                  ? 'border-primary-400 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'company'
                  ? 'border-primary-400 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                Company
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Company Description */}
                <div className="glass-effect rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">About {job.company}</h3>
                  <p className="text-gray-300 leading-relaxed">{job.description}</p>
                </div>

                {/* Responsibilities */}
                <div className="glass-effect rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Responsibilities</h3>
                  </div>
                  <ul className="space-y-3">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Qualifications */}
                <div className="glass-effect rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Qualifications</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      Find out how your skills align with this job's requirements. If anything seems off, you can easily click on the tags to select or unselect skills to reflect your actual expertise.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {job.qualifications.skills.map((skill, index) => (
                        <button
                          key={index}
                          onClick={() => handleSkillToggle(skill.name)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${skill.hasSkill || selectedSkills.has(skill.name)
                            ? 'border-green-500 bg-green-500/20 text-green-300'
                            : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{skill.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-3 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Represents the skills you have</span>
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Required</h4>
                    <ul className="space-y-2">
                      {job.qualifications.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-300">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Benefits */}
                <div className="glass-effect rounded-2xl p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Benefits</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'company' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">About {job.company}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {job.company} is a leading company in the legal technology space, dedicated to making legal services accessible to everyone.
                  They provide innovative solutions that help individuals and businesses navigate complex legal processes with confidence and clarity.
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar - AI Copilot */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-2xl p-6 sticky top-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Orion</h3>
                  <p className="text-gray-400 text-sm">Your AI Copilot</p>
                </div>
                <button className="ml-auto text-primary-400 hover:text-primary-300 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <button className="w-full text-left p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-300">Give me some resume tips if I want to apply</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-300">Generate custom resume tailored to this job</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-300">Show me Connections for potential referral</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg hover:bg-primary-500/20 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-primary-400" />
                    <span className="text-primary-300">Write a cover letter for this job</span>
                  </div>
                </button>
              </div>

              {/* Find Email Section */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3">Find Any Email</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Paste any LinkedIn profile URL..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                    <Search className="w-4 h-4" />
                    <span>Find Email</span>
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    I'm working on getting the email contact information for Won Y. at {job.company}...
                  </p>
                </div>

                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">W</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Won Y.</p>
                      <p className="text-gray-400 text-sm">Beyond Your Network</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">Frontend Software Engineer @{job.company}</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    Connect On LinkedIn
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <div className="mt-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Customization Modal */}
      <ResumeCustomizationModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        jobData={job}
        userResume={useResumeStore.getState().resume}
      />
    </div>
  )
}

export default JobDetailsPage
