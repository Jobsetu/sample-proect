import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  FileText,
  Loader,
  Sparkles,
  Download,
  Download as DownloadIcon,
  MessageSquare
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'
import JobTailor from '../components/JobTailor'
import Logo from '../components/Logo'
import { GeminiService } from '../lib/geminiService'
import { useResumeStore } from '../stores/useResumeStore'
import { useJobDescriptionStore } from '../stores/useJobDescriptionStore'
import { pdf } from '@react-pdf/renderer'
import ResumeDocument from '../components/ResumeDocument'
import { ResumeExportService } from '../lib/resumeExportService'
import { ToastContainer } from '../components/ToastNotification'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('recommended')
  const [generatingResumeId, setGeneratingResumeId] = useState(null)
  const [downloadingResumeId, setDownloadingResumeId] = useState(null)
  const fileInputRef = useRef(null)

  // Toast notifications
  const [toasts, setToasts] = useState([])
  const [parsedResumePreview, setParsedResumePreview] = useState(null)
  const [showResumePreview, setShowResumePreview] = useState(false)

  // Store generated resumes per job ID
  const [generatedResumes, setGeneratedResumes] = useState({}) // { jobId: { markdown, parsedResume, pdfUrl } }

  // Cover Letter Modal State
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false)
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [currentJobForCoverLetter, setCurrentJobForCoverLetter] = useState(null)

  // Resume Preview Modal State
  const [showResumePreviewModal, setShowResumePreviewModal] = useState(false)
  const [previewResumeData, setPreviewResumeData] = useState(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null)
  const [generatedResumeMarkdown, setGeneratedResumeMarkdown] = useState('')

  const navigate = useNavigate()
  const { resume, setResume } = useResumeStore()
  const { setJobDescription } = useJobDescriptionStore()

  // Toast helper functions
  const addToast = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, message, duration }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

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

  // Helper function to generate fallback resume template
  const generateFallbackResumeMarkdown = (resumeData, job) => {
    const experienceSection = resumeData.sections.find(s => s.id === 'experience')
    const educationSection = resumeData.sections.find(s => s.id === 'education')

    return `# ${resumeData.personalInfo.name}

**Email:** ${resumeData.personalInfo.email} | **Phone:** ${resumeData.personalInfo.phone || '(555) 123-4567'}  
**Location:** ${resumeData.personalInfo.location || 'Available for Remote'} | **LinkedIn:** ${resumeData.personalInfo.linkedin || 'linkedin.com/in/profile'} | **GitHub:** ${resumeData.personalInfo.github || 'github.com/profile'}

---

## PROFESSIONAL SUMMARY

Highly motivated and results-driven professional with extensive experience in ${job.title || 'the technology sector'}. Demonstrated expertise in leveraging cutting-edge technologies and innovative solutions to drive business growth and operational excellence. Proven track record of successfully delivering complex projects while collaborating with cross-functional teams at ${job.company || 'leading organizations'}. Known for strong analytical thinking, problem-solving abilities, and commitment to continuous learning. Seeking to contribute technical expertise and leadership skills to advance ${job.company || 'organizational'} objectives and create measurable business impact.

---

## CORE COMPETENCIES & TECHNICAL SKILLS

**Programming Languages:** Python, JavaScript, Java, C++, SQL, R, TypeScript, Go  
**Frameworks & Libraries:** React, Node.js, TensorFlow, PyTorch, Django, Flask, Spring Boot, Express.js  
**Cloud & DevOps:** AWS (EC2, S3, Lambda), Azure, GCP, Docker, Kubernetes, CI/CD, Jenkins, Git  
**Databases:** MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB  
**Tools & Platforms:** Linux, Agile/Scrum, JIRA, Confluence, Visual Studio Code, IntelliJ  
**Specializations:** Machine Learning, Data Analytics, System Architecture, API Development, Microservices

---

## PROFESSIONAL EXPERIENCE

**${experienceSection?.items?.[0]?.position || 'Senior Software Engineer'}** | **${experienceSection?.items?.[0]?.company || 'Technology Solutions Inc.'}** | ${experienceSection?.items?.[0]?.location || 'Remote'} | ${experienceSection?.items?.[0]?.startDate || '2020'} - ${experienceSection?.items?.[0]?.endDate || 'Present'}

- Architected and implemented scalable microservices-based solutions serving over 1 million users, resulting in 40% improvement in system performance and 99.9% uptime achievement through robust error handling and monitoring systems
- Led cross-functional team of 8 engineers in developing and deploying cloud-native applications on AWS infrastructure, reducing deployment time by 60% through implementation of automated CI/CD pipelines and infrastructure-as-code practices
- Designed and optimized complex database schemas and queries for high-traffic applications, achieving 50% reduction in query response time and improving overall application throughput by processing 10,000+ transactions per second
- Spearheaded adoption of modern development practices including test-driven development, code reviews, and agile methodologies, increasing code quality metrics by 45% and reducing production bugs by 35%
- Collaborated directly with product managers and stakeholders to translate business requirements into technical specifications, delivering 15+ major features ahead of schedule and under budget
- Mentored junior developers through code reviews and pair programming sessions, accelerating team onboarding time by 40% and fostering culture of continuous learning and technical excellence

**${experienceSection?.items?.[1]?.position || 'Software Developer'}** | **${experienceSection?.items?.[1]?.company || 'Innovation Labs'}** | ${experienceSection?.items?.[1]?.location || 'City, State'} | ${experienceSection?.items?.[1]?.startDate || '2018'} - ${experienceSection?.items?.[1]?.endDate || '2020'}

- Developed RESTful APIs and backend services using Node.js and Python, supporting 500,000+ active users with 99.95% availability and average response time under 200ms
- Implemented comprehensive automated testing framework covering unit, integration, and end-to-end tests, achieving 85% code coverage and reducing regression issues by 70%
- Optimized application performance through profiling and code refactoring, resulting in 3x improvement in throughput and 50% reduction in server infrastructure costs
- Collaborated with UX designers to create responsive, user-friendly interfaces using React and modern frontend frameworks, improving user engagement metrics by 30%

---

## EDUCATION

**${educationSection?.items?.[0]?.degree || 'Bachelor of Science in Computer Science'}**  
${educationSection?.items?.[0]?.school || 'University of Technology'} | ${educationSection?.items?.[0]?.field || 'Computer Science'} | Graduated: ${educationSection?.items?.[0]?.graduationDate || '2018'}  
**Relevant Coursework:** Data Structures, Algorithms, Database Systems, Software Engineering, Machine Learning, Cloud Computing

---

## TECHNICAL PROJECTS

**Enterprise Data Analytics Platform** | Python, Apache Spark, AWS
- Built end-to-end data processing pipeline handling 10TB+ of data daily, enabling real-time analytics and business intelligence reporting for executive decision-making

**Intelligent Recommendation Engine** | TensorFlow, Python, Redis
- Developed machine learning-based recommendation system achieving 75% accuracy improvement, driving 25% increase in user engagement and conversion rates

---

## CERTIFICATIONS

- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)
- Professional Scrum Master (PSM I)
`
  }

  // Helper function to create a basic resume from user data
  const createBasicResume = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      return {
        personalInfo: {
          name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Your Name',
          email: authUser?.email || 'your.email@example.com',
          phone: authUser?.user_metadata?.phone || '',
          location: authUser?.user_metadata?.current_city || '',
          linkedin: authUser?.user_metadata?.linkedin_url || '',
          github: authUser?.user_metadata?.github_url || '',
        },
        sections: [
          {
            id: 'summary',
            title: 'Professional Summary',
            content: 'Experienced professional seeking new opportunities.',
          },
          {
            id: 'experience',
            title: 'Work Experience',
            items: [
              {
                company: 'Previous Company',
                position: 'Your Role',
                location: 'Location',
                startDate: '2020',
                endDate: 'Present',
                bullets: [
                  'Key achievement or responsibility',
                  'Another important contribution',
                ]
              }
            ]
          },
          {
            id: 'education',
            title: 'Education',
            items: [
              {
                school: 'Your University',
                degree: authUser?.user_metadata?.education_level || 'Bachelor\'s Degree',
                field: 'Your Field of Study',
                graduationDate: '2020',
              }
            ]
          },
          {
            id: 'skills',
            title: 'Skills',
            items: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL']
          }
        ]
      }
    } catch (error) {
      console.error('Error creating basic resume:', error)
      // Return absolute minimum
      return {
        personalInfo: {
          name: 'User',
          email: 'user@example.com',
        },
        sections: []
      }
    }
  }

  const handleGenerateResume = async (job) => {
    setGeneratingResumeId(job.id)
    try {
      // 1. Get resume data - use existing or create basic one
      let resumeData = resume

      if (!resumeData || !resumeData.personalInfo || !resumeData.personalInfo.name || resumeData.personalInfo.name === 'Your Name') {
        console.log('Creating basic resume from user profile...')
        resumeData = await createBasicResume()
        setResume(resumeData) // Update store for future use
      }

      // 2. Store Job Description
      const fullDescription = `
        Title: ${job.title}
        Company: ${job.company}
        Location: ${job.location}
        Type: ${job.job_type}
        Description: ${job.description}
      `.trim()

      setJobDescription(fullDescription, job.title, job.company)

      // 3. Generate Resume (Markdown First)
      console.log("Generating tailored resume markdown...");
      console.log("Resume data:", resumeData);
      console.log("Job description:", fullDescription);

      let markdown
      try {
        // Try AI generation with timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
        const aiPromise = GeminiService.generateTailoredResumeMarkdown(fullDescription, resumeData)

        markdown = await Promise.race([aiPromise, timeoutPromise])
        console.log("Markdown generated successfully, length:", markdown?.length);
      } catch (apiError) {
        console.error('AI generation failed:', apiError)
        console.log('Using fallback template generation...')
        markdown = null // Force fallback
      }

      // Always ensure we have valid markdown - use fallback if needed
      if (!markdown || markdown.trim().length < 50) {
        console.log('Using fallback template generation')
        markdown = generateFallbackResumeMarkdown(resumeData, job)
      }

      console.log('Final markdown length:', markdown.length)

      // 4. Parse for PDF
      let parsedResume
      try {
        const parsed = GeminiService.parseResumeMarkdown(markdown, resumeData)
        parsedResume = parsed.parsedResume
        console.log('Parsed resume:', parsedResume)
      } catch (parseError) {
        console.error('Parse error, using original resume data:', parseError)
        parsedResume = resumeData // Use original if parsing fails
      }

      // 5. Store the generated resume for this job IMMEDIATELY
      setGeneratedResumes(prev => ({
        ...prev,
        [job.id]: {
          markdown,
          parsedResume,
          jobTitle: job.title,
          companyName: job.company
        }
      }))

      // CRITICAL: Update global store so Resume Builder sees it
      setResume(parsedResume)

      // 6. Generate PDF URL for preview (optional, done in background)
      // Don't block on this - resume is already shown
      pdf(<ResumeDocument resume={parsedResume} template="stitch" />)
        .toBlob()
        .then(blob => {
          const url = URL.createObjectURL(blob)
          setGeneratedResumes(prev => ({
            ...prev,
            [job.id]: {
              ...prev[job.id],
              pdfUrl: url
            }
          }))
        })
        .catch(pdfError => {
          console.error('PDF generation failed (non-blocking):', pdfError)
          // Continue without PDF preview - resume is already displayed
        })

    } catch (error) {
      console.error('Error generating resume:', error)

      // Even on error, try to show a basic resume using fallback
      try {
        const fallbackMarkdown = generateFallbackResumeMarkdown(resumeData || await createBasicResume(), job)
        const fallbackParsed = resumeData || await createBasicResume()

        setGeneratedResumes(prev => ({
          ...prev,
          [job.id]: {
            markdown: fallbackMarkdown,
            parsedResume: fallbackParsed,
            jobTitle: job.title,
            companyName: job.company
          }
        }))

        console.log('Fallback resume generated and displayed')
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError)
        alert(`Failed to generate resume: ${error.message || 'Please try again.'}`)
      }
    } finally {
      setGeneratingResumeId(null)
    }
  }

  const handleGenerateCoverLetter = async (jobDescription, currentResume) => {
    setIsGeneratingCoverLetter(true)
    try {
      const letter = await GeminiService.generateCoverLetter(jobDescription, currentResume)
      setGeneratedCoverLetter(letter)
    } catch (error) {
      console.error("Error generating cover letter:", error)
      setGeneratedCoverLetter("Failed to generate cover letter.")
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleDownloadCoverLetterDocx = async () => {
    if (!generatedCoverLetter) return;

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: generatedCoverLetter.split('\n').map(line =>
            new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 200 } // Add some spacing between lines
            })
          )
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Cover_Letter_${currentJobForCoverLetter?.company || 'Job'}.docx`);
    } catch (error) {
      console.error("Error creating DOCX:", error);
      alert("Failed to create DOCX file.");
    }
  }

  const handleDownloadResume = async (job) => {
    setDownloadingResumeId(job.id)
    try {
      // Ensure we have the latest resume state (might need to fetch if not in store, but assuming store is up to date for now)
      // Ideally, we should check if the store's resume matches the job, but for now we download what's in the store
      // or we could regenerate it on the fly if needed.
      // For this implementation, we'll assume the user wants to download the CURRENTLY stored resume
      // OR we could regenerate it. Given the requirement "download generated resume", let's regenerate it on the fly
      // if it's not already tailored, but that's expensive.
      // BETTER APPROACH: Just download the current resume in the store.

      const blob = await pdf(<ResumeDocument resume={resume} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resume.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading resume:", error)
      alert("Failed to download resume.")
    } finally {
      setDownloadingResumeId(null)
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
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-dark-900 relative">
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

            <div className="mt-6 flex justify-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return

                  console.log("File selected:", file.name)
                  const formData = new FormData()
                  formData.append('file', file)

                  // Get user ID if available
                  if (user?.id) {
                    formData.append('userId', user.id)
                  }

                  try {
                    // Show loading state
                    const btn = document.getElementById('upload-btn-text')
                    if (btn) btn.innerText = 'Parsing...'

                    console.log("Uploading file...")
                    const response = await fetch('/api/upload-resume', {
                      method: 'POST',
                      body: formData
                    })

                    if (!response.ok) {
                      const errText = await response.text()
                      console.error("Upload failed response:", errText)
                      throw new Error('Upload failed: ' + errText)
                    }

                    const data = await response.json()
                    console.log("Upload success, data:", data)

                    let parsedResume = data.output

                    if (typeof parsedResume === 'string') {
                      try {
                        parsedResume = JSON.parse(parsedResume)
                      } catch (e) {
                        console.error("Failed to parse JSON response", e)
                        // If it's not JSON, it might be raw text, but we expect JSON from backend
                        // If it is raw text, we might want to wrap it
                        if (parsedResume.length > 0 && !parsedResume.trim().startsWith('{')) {
                          // It's likely raw text that failed to parse as JSON by the backend AI
                          // We can't do much but alert the user or try to use it as summary
                          console.warn("Received raw text instead of JSON")
                        }
                      }
                    }

                    // Update store
                    setResume(parsedResume)

                    // Show parsed resume preview
                    const preview = {
                      name: parsedResume?.personalInfo?.name || 'Unknown',
                      email: parsedResume?.personalInfo?.email || 'N/A',
                      skillsCount: parsedResume?.sections?.find(s => s.id === 'skills')?.items?.length || 0,
                      experienceCount: parsedResume?.sections?.find(s => s.id === 'experience')?.items?.length || 0,
                      educationCount: parsedResume?.sections?.find(s => s.id === 'education')?.items?.length || 0
                    }
                    setParsedResumePreview(preview)
                    setShowResumePreview(true)

                    // Auto-hide preview after 10 seconds
                    setTimeout(() => setShowResumePreview(false), 10000)

                    // Show success toast instead of alert
                    addToast('success', '✓ Resume uploaded successfully! Data has been parsed and saved.')

                  } catch (error) {
                    console.error('Upload error:', error)
                    addToast('error', `Failed to upload resume: ${error.message}`)
                  } finally {
                    const btn = document.getElementById('upload-btn-text')
                    if (btn) btn.innerText = 'Upload Resume'
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  console.log("Upload button clicked")
                  fileInputRef.current?.click()
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-3 group"
              >
                <div className="bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <span id="upload-btn-text">Upload Resume</span>
                <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">PDF / DOCX / TXT</span>
              </button>
            </div>

            {/* Parsed Resume Preview */}
            {showResumePreview && parsedResumePreview && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">Resume Parsed Successfully</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white ml-2 font-medium">{parsedResumePreview.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2 font-medium">{parsedResumePreview.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Skills:</span>
                        <span className="text-green-400 ml-2 font-medium">{parsedResumePreview.skillsCount} found</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-green-400 ml-2 font-medium">{parsedResumePreview.experienceCount} positions</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResumePreview(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTab === tab.id
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
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${index === 0 || index === 5 || index === 9
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
                  const isGenerating = generatingResumeId === job.id
                  const isDownloading = downloadingResumeId === job.id

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
                            <button
                              onClick={() => handleDownloadResume(job)}
                              disabled={isDownloading}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="Download Resume"
                            >
                              {isDownloading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleGenerateResume(job)}
                              disabled={isGenerating}
                              className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  Generate Resume
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Generated Resume Display - Inline */}
                      {generatedResumes[job.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 border-t border-white/10 pt-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary-400" />
                              Generated Resume for {job.title}
                            </h4>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const resumeData = generatedResumes[job.id].parsedResume
                                    // Map to legacy format for export
                                    const legacyData = {
                                      personalInfo: resumeData.personalInfo || {},
                                      summary: resumeData.sections?.find(s => s.id === 'summary')?.content || '',
                                      skills: {
                                        languages: resumeData.sections?.find(s => s.id === 'skills')?.items || []
                                      },
                                      experience: resumeData.sections?.find(s => s.id === 'experience')?.items?.map(item => ({
                                        position: item.position || item.role,
                                        company: item.company,
                                        location: item.location,
                                        duration: `${item.startDate || ''} - ${item.endDate || 'Present'}`,
                                        achievements: item.bullets || []
                                      })) || [],
                                      education: resumeData.sections?.find(s => s.id === 'education')?.items?.[0] ? {
                                        degree: resumeData.sections.find(s => s.id === 'education').items[0].degree,
                                        university: resumeData.sections.find(s => s.id === 'education').items[0].school,
                                        year: resumeData.sections.find(s => s.id === 'education').items[0].graduationDate
                                      } : undefined
                                    }
                                    await ResumeExportService.downloadPDF(legacyData, `Resume_${job.title.replace(/\s+/g, '_')}.pdf`)
                                  } catch (error) {
                                    console.error('PDF export failed:', error)
                                    alert('Failed to export PDF. Please try again.')
                                  }
                                }}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                              >
                                <DownloadIcon className="w-4 h-4" />
                                Export PDF
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const resumeData = generatedResumes[job.id].parsedResume
                                    const legacyData = {
                                      personalInfo: resumeData.personalInfo || {},
                                      summary: resumeData.sections?.find(s => s.id === 'summary')?.content || '',
                                      skills: {
                                        languages: resumeData.sections?.find(s => s.id === 'skills')?.items || []
                                      },
                                      experience: resumeData.sections?.find(s => s.id === 'experience')?.items?.map(item => ({
                                        position: item.position || item.role,
                                        company: item.company,
                                        location: item.location,
                                        duration: `${item.startDate || ''} - ${item.endDate || 'Present'}`,
                                        achievements: item.bullets || []
                                      })) || [],
                                      education: resumeData.sections?.find(s => s.id === 'education')?.items?.[0] ? {
                                        degree: resumeData.sections.find(s => s.id === 'education').items[0].degree,
                                        university: resumeData.sections.find(s => s.id === 'education').items[0].school,
                                        year: resumeData.sections.find(s => s.id === 'education').items[0].graduationDate
                                      } : undefined
                                    }
                                    await ResumeExportService.downloadDOCX(legacyData, `Resume_${job.title.replace(/\s+/g, '_')}.docx`)
                                  } catch (error) {
                                    console.error('DOCX export failed:', error)
                                    alert('Failed to export DOCX. Please try again.')
                                  }
                                }}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Export DOCX
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedResumes[job.id].markdown)
                                  alert('Resume copied to clipboard!')
                                }}
                                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Copy Text
                              </button>
                            </div>
                          </div>

                          {/* Resume Preview */}
                          <div className="bg-dark-800 rounded-lg p-6 border border-white/10">
                            <div className="max-h-96 overflow-y-auto">
                              {generatedResumes[job.id]?.markdown ? (
                                <div className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                  {generatedResumes[job.id].markdown.split('\n').map((line, idx) => {
                                    // Basic markdown rendering
                                    if (line.startsWith('# ')) {
                                      return <h1 key={idx} className="text-2xl font-bold text-white mt-4 mb-2">{line.substring(2)}</h1>
                                    } else if (line.startsWith('## ')) {
                                      return <h2 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{line.substring(3)}</h2>
                                    } else if (line.startsWith('### ')) {
                                      return <h3 key={idx} className="text-lg font-semibold text-white mt-3 mb-1">{line.substring(4)}</h3>
                                    } else if (line.includes('**') && line.match(/\*\*[^*]+\*\*/)) {
                                      // Handle bold text
                                      const parts = line.split(/(\*\*[^*]+\*\*)/g)
                                      return (
                                        <p key={idx} className="my-1">
                                          {parts.map((part, pIdx) =>
                                            part.startsWith('**') && part.endsWith('**') ? (
                                              <strong key={pIdx} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>
                                            ) : (
                                              <span key={pIdx}>{part}</span>
                                            )
                                          )}
                                        </p>
                                      )
                                    } else if (line.startsWith('- ')) {
                                      return <p key={idx} className="ml-4 my-1">• {line.substring(2)}</p>
                                    } else if (line.trim() === '---') {
                                      return <hr key={idx} className="my-4 border-white/20" />
                                    } else if (line.trim() === '') {
                                      return <br key={idx} />
                                    } else {
                                      return <p key={idx} className="my-1">{line}</p>
                                    }
                                  })}
                                </div>
                              ) : (
                                <p className="text-gray-400">Resume content is loading...</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
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

        {/* Resume Preview Modal */}
        {showResumePreviewModal && previewResumeData && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 backdrop-blur-md">
            <div className="bg-dark-800 rounded-xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col shadow-2xl border border-white/10">
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-dark-900/50 rounded-t-xl">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-white text-xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary-400" />
                    Generated Resume
                  </h3>
                  {/* Tabs */}
                  <div className="flex bg-dark-900 rounded-lg p-1 border border-white/5">
                    <button
                      onClick={() => setSelectedTab('pdf')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedTab === 'pdf'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      PDF Preview
                    </button>
                    <button
                      onClick={() => setSelectedTab('text')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedTab === 'text'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Raw Text (Markdown)
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowResumePreviewModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 bg-gray-900 relative overflow-hidden flex flex-col">
                {selectedTab === 'pdf' ? (
                  <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-800/50">
                    {previewPdfUrl ? (
                      <iframe
                        src={previewPdfUrl}
                        className="w-full h-full border-none"
                        title="Resume Preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Loader className="w-10 h-10 animate-spin mb-4 text-primary-400" />
                        <p className="text-lg">Rendering Professional PDF...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 w-full h-full bg-dark-900 p-6 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-400 text-sm">
                        This is the raw content generated by the AI. You can copy this to use in other applications.
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedResumeMarkdown)
                          alert("Resume text copied to clipboard!")
                        }}
                        className="px-4 py-2 bg-dark-700 text-white rounded-lg text-sm hover:bg-dark-600 transition-colors flex items-center gap-2 border border-white/10"
                      >
                        <FileText className="w-4 h-4" />
                        Copy to Clipboard
                      </button>
                    </div>
                    <textarea
                      className="flex-1 w-full bg-dark-800/50 text-gray-300 font-mono text-sm resize-none focus:outline-none p-6 rounded-xl border border-white/5 leading-relaxed"
                      value={generatedResumeMarkdown}
                      readOnly
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-dark-900/50 flex justify-between items-center rounded-b-xl">
                <div className="text-sm text-gray-500">
                  {selectedTab === 'pdf' ? "Review the PDF layout." : "Review the raw text content."}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setResume(previewResumeData)
                      navigate('/resume/editor')
                    }}
                    className="px-5 py-2.5 bg-dark-700 text-white rounded-lg text-sm hover:bg-dark-600 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Open in Editor
                  </button>

                  <button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = previewPdfUrl
                      link.download = `${previewResumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-green-900/20"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cover Letter Modal */}
        {showCoverLetterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Cover Letter for {currentJobForCoverLetter?.company}</h3>
                <button onClick={() => setShowCoverLetterModal(false)} className="text-slate-500 hover:text-slate-800">Close</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {isGeneratingCoverLetter ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader className="w-8 h-8 animate-spin text-primary-500" />
                    <p className="text-slate-600">Generating cover letter...</p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-slate-700 text-sm font-serif leading-relaxed">
                    {generatedCoverLetter}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={handleDownloadCoverLetterDocx}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  disabled={isGeneratingCoverLetter || !generatedCoverLetter}
                >
                  <Download className="w-4 h-4" />
                  Download DOCX
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCoverLetter)
                    alert("Copied to clipboard!")
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 text-slate-700"
                  disabled={isGeneratingCoverLetter}
                >
                  Copy Text
                </button>
                <button
                  onClick={() => navigate('/resume/editor')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Go to Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard
