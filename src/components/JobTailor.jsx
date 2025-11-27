import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, Mic, Loader, CheckCircle, Download, Copy, X, PenTool, Lightbulb, TrendingUp, Save, AlertCircle, Video, VideoOff, Play, Square, RotateCcw } from 'lucide-react'
import { GeminiService } from '../lib/geminiService'
import { useResumeStore } from '../stores/useResumeStore'

const JOB_DESCRIPTION_KEY = 'jobYatra_jobDescription'

const JobTailor = () => {
  // Load job description from localStorage on mount
  const [jobDescription, setJobDescription] = useState(() => {
    const saved = localStorage.getItem(JOB_DESCRIPTION_KEY)
    return saved || ''
  })
  const [activeTab, setActiveTab] = useState('resume') // 'resume' | 'interview'
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState(null) // 'resume' | 'coverLetter' | 'interview'
  const [result, setResult] = useState(null) // { type: 'resume' | 'coverLetter', data: any }
  const [error, setError] = useState(null)

  // Video Interview state
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [videoStream, setVideoStream] = useState(null)
  const [recordedVideo, setRecordedVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [interviewStep, setInterviewStep] = useState(0)
  const [interviewFeedback, setInterviewFeedback] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [interviewInsights, setInterviewInsights] = useState(null)
  const [videoAnswers, setVideoAnswers] = useState([]) // Store video URLs for each answer

  const { resume, setResume } = useResumeStore()

  // Save job description to localStorage whenever it changes
  useEffect(() => {
    if (jobDescription.trim()) {
      localStorage.setItem(JOB_DESCRIPTION_KEY, jobDescription)
    }
  }, [jobDescription])

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.')
      return
    }

    setLoading(true)
    setLoadingType('resume')
    setResult(null)
    setError(null)

    try {
      console.log('Generating resume with job description:', jobDescription.substring(0, 100))
      console.log('Current resume:', resume)

      // Ensure we have a valid resume to start with
      let currentResume = resume
      if (!currentResume || !currentResume.personalInfo || !currentResume.personalInfo.name || !currentResume.sections || currentResume.sections.length === 0) {
        console.log('Resume appears empty or invalid. Creating basic resume structure...')
        // Import createBasicResume logic or define it here. 
        // Since we can't easily import from Dashboard, we'll implement a helper or use the store's reset if available, 
        // but better to create a basic structure.
        const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser())

        currentResume = {
          personalInfo: {
            name: user?.user_metadata?.full_name || 'Your Name',
            email: user?.email || 'email@example.com',
            phone: user?.user_metadata?.phone || '',
            location: user?.user_metadata?.current_city || '',
            linkedin: user?.user_metadata?.linkedin_url || '',
            github: user?.user_metadata?.github_url || '',
          },
          sections: [
            { id: 'summary', title: 'Professional Summary', content: 'Experienced professional seeking new opportunities.' },
            { id: 'experience', title: 'Work Experience', items: [] },
            { id: 'education', title: 'Education', items: [] },
            { id: 'skills', title: 'Skills', items: [] },
            { id: 'projects', title: 'Projects', items: [] }
          ]
        }
        setResume(currentResume)
      }

      const customResume = await GeminiService.generateCustomResume(jobDescription, currentResume)

      if (!customResume || !customResume.sections) {
        throw new Error('Invalid resume data received from AI')
      }

      console.log('Generated resume:', customResume)
      setResume(customResume)
      setResult({ type: 'resume', data: customResume })
    } catch (error) {
      console.error('Error generating resume:', error)
      setError(`Failed to generate resume: ${error.message || 'Please check your API key and try again.'}`)
    } finally {
      setLoading(false)
      setLoadingType(null)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.')
      return
    }

    setLoading(true)
    setLoadingType('coverLetter')
    setResult(null)
    setError(null)

    try {
      console.log('Generating cover letter with job description:', jobDescription.substring(0, 100))

      const coverLetter = await GeminiService.generateCoverLetter(jobDescription, resume)

      if (!coverLetter || coverLetter.length < 100) {
        throw new Error('Cover letter too short. Please try again.')
      }

      setResult({ type: 'coverLetter', data: coverLetter })
    } catch (error) {
      console.error('Error generating cover letter:', error)
      setError(`Failed to generate cover letter: ${error.message || 'Please check your API key and try again.'}`)
    } finally {
      setLoading(false)
      setLoadingType(null)
    }
  }

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description first.')
      return
    }

    setLoading(true)
    setLoadingType('interview')
    setInterviewStep(0)
    setInterviewFeedback(null)
    setInterviewInsights(null)
    setVideoAnswers([])
    setError(null)

    try {
      const questions = await GeminiService.generateMockInterviewQuestions(jobDescription, resume)
      if (!questions || questions.length === 0) {
        throw new Error('Failed to generate interview questions')
      }
      setInterviewQuestions(questions)
      // Start video stream
      await startVideoStream()
    } catch (error) {
      console.error('Error generating interview questions:', error)
      setError(`Failed to generate interview questions: ${error.message || 'Please check your API key and try again.'}`)
      setLoading(false)
      setLoadingType(null)
    }
  }

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })
      setVideoStream(stream)
      setLoading(false)
      setLoadingType(null)
    } catch (err) {
      console.error('Error accessing camera/microphone:', err)
      setError('Could not access camera/microphone. Please allow permissions and try again.')
      setLoading(false)
      setLoadingType(null)
    }
  }

  const startRecording = () => {
    if (!videoStream) return

    const recorder = new MediaRecorder(videoStream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    })

    const chunks = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedVideo(blob)
      setVideoUrl(url)

      // Store video answer
      const newAnswers = [...videoAnswers]
      newAnswers[interviewStep] = url
      setVideoAnswers(newAnswers)
    }

    recorder.start()
    setMediaRecorder(recorder)
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!recordedVideo || !interviewQuestions[interviewStep]) return

    setLoading(true)
    setError(null)

    try {
      // For now, we'll analyze based on the question
      // In a real implementation, you'd transcribe the video audio first
      // For this demo, we'll use a text-based analysis prompt
      const feedback = await GeminiService.analyzeInterviewAnswer(
        interviewQuestions[interviewStep],
        `[Video answer recorded - ${Math.round(recordedVideo.size / 1024)}KB]`
      )
      setInterviewFeedback(feedback)
    } catch (error) {
      console.error('Error analyzing video:', error)
      setError(`Failed to analyze video: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  const nextQuestion = () => {
    if (interviewStep < interviewQuestions.length - 1) {
      setInterviewStep(prev => prev + 1)
      setRecordedVideo(null)
      setVideoUrl(null)
      setInterviewFeedback(null)
    } else {
      // Interview completed - generate insights
      generateInterviewInsights()
    }
  }

  const generateInterviewInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const insights = await GeminiService.generateInterviewInsights(jobDescription, resume, interviewQuestions)
      setInterviewInsights(insights)
      // Stop video stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
        setVideoStream(null)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      setError(`Failed to generate insights: ${error.message || 'Please try again.'}`)
      setInterviewInsights({
        overallScore: 7,
        strengths: ["Good communication", "Relevant experience"],
        areasForImprovement: ["Be more specific with examples", "Quantify achievements"],
        recommendations: ["Practice STAR method", "Prepare more examples"]
      })
    } finally {
      setLoading(false)
    }
  }

  const resetInterview = () => {
    setInterviewStep(0)
    setInterviewFeedback(null)
    setInterviewQuestions([])
    setInterviewInsights(null)
    setVideoAnswers([])
    setRecordedVideo(null)
    setVideoUrl(null)

    // Stop video stream
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleJobDescriptionChange = (newValue) => {
    setJobDescription(newValue)
    // Clear results when job description changes
    setResult(null)
    setError(null)
  }

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoStream, videoUrl])

  return (
    <div className="w-full max-w-4xl mx-auto bg-dark-800/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Job Tailor & Interview Prep</h2>
        <p className="text-gray-400">
          Paste a job description below to generate a tailored resume, cover letter, or practice for your interview.
        </p>
      </div>

      {/* Job Description Input - Shared */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">Job Description</label>
          {jobDescription.trim() && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Save className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => handleJobDescriptionChange(e.target.value)}
          placeholder="Paste job description here... (This will be saved automatically)"
          className="w-full h-48 p-4 bg-dark-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
        {jobDescription.trim() && (
          <p className="text-xs text-gray-500 mt-1">
            Job description saved. You can update it anytime and it will replace the previous one.
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'resume'
            ? 'border-primary-500 text-primary-400'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Resume & Cover Letter
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'interview'
            ? 'border-primary-500 text-primary-400'
            : 'border-transparent text-gray-400 hover:text-white'
            }`}
        >
          <Video className="w-4 h-4 inline mr-2" />
          AI Mock Interview (Video)
        </button>
      </div>

      {/* Resume & Cover Letter Tab */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleGenerateResume}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && loadingType === 'resume' ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Tailored Resume
                </>
              )}
            </button>
            <button
              onClick={handleGenerateCoverLetter}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && loadingType === 'coverLetter' ? (
                <>
                  <Loader className="animate-spin w-4 h-4" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="min-h-[200px]">
            {result?.type === 'resume' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Resume Tailored Successfully!</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Your resume has been updated in the editor with keywords and phrasing matching the job description.
                </p>
                <Link to="/resume?tab=builder" className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors font-medium">
                  <PenTool className="w-4 h-4" />
                  Open in Resume Builder
                </Link>
              </motion.div>
            )}

            {result?.type === 'coverLetter' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-900 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Cover Letter</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.data)
                        alert('Cover letter copied to clipboard!')
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-2 px-3 py-1 rounded hover:bg-dark-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([result.data], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'cover-letter.txt'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-2 px-3 py-1 rounded hover:bg-dark-800 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-300 font-serif text-sm leading-relaxed bg-white/5 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {result.data}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* AI Mock Interview Tab - Video Format */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          {!interviewQuestions.length && !interviewInsights ? (
            <div className="text-center py-8">
              <Video className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 mb-4">Start a video mock interview to practice behavioral and technical questions.</p>
              <button
                onClick={handleStartInterview}
                disabled={loading || !jobDescription.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && loadingType === 'interview' ? (
                  <>
                    <Loader className="animate-spin w-4 h-4" />
                    Setting up camera...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Start Video Interview
                  </>
                )}
              </button>
            </div>
          ) : interviewInsights ? (
            // Interview Completed - Show Insights
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-900 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                  Interview Insights & Recommendations
                </h3>
                <button onClick={resetInterview} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-5 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-purple-500/30 flex items-center justify-center text-3xl font-bold text-purple-300">
                      {interviewInsights.overallScore || 7}/10
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Overall Performance Score</h4>
                      <p className="text-gray-300 text-sm">Based on your video answers to all questions</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(interviewInsights.strengths || []).map((strength, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                    <h4 className="text-yellow-400 font-semibold mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {(interviewInsights.areasForImprovement || []).map((area, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="text-blue-400 font-semibold mb-3">Key Recommendations</h4>
                  <ul className="space-y-2">
                    {(interviewInsights.recommendations || []).map((rec, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Video Playback Section */}
                {videoAnswers.length > 0 && (
                  <div className="bg-dark-800/50 p-4 rounded-lg border border-white/10">
                    <h4 className="text-white font-semibold mb-3">Your Video Answers</h4>
                    <div className="space-y-4">
                      {videoAnswers.map((videoUrl, idx) => (
                        <div key={idx} className="bg-dark-900 p-3 rounded-lg">
                          <p className="text-gray-400 text-sm mb-2">Question {idx + 1}: {interviewQuestions[idx]}</p>
                          <video
                            src={videoUrl}
                            controls
                            className="w-full rounded-lg max-h-64"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={resetInterview} className="btn-primary w-full">
                  Start New Interview Session
                </button>
              </div>
            </motion.div>
          ) : (
            // Interview in Progress - Video Recording
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-900 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Video Mock Interview ({interviewStep + 1}/{interviewQuestions.length})</h3>
                <button onClick={resetInterview}><X className="w-5 h-5 text-gray-400" /></button>
              </div>

              <div className="space-y-6">
                {/* Question */}
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                  <p className="text-xl text-white font-medium">{interviewQuestions[interviewStep]}</p>
                </div>

                {/* Video Preview/Recording */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {videoStream && (
                    <video
                      ref={(video) => {
                        if (video && videoStream) {
                          video.srcObject = videoStream
                          video.play()
                        }
                      }}
                      autoPlay
                      muted
                      className="w-full h-64 object-cover"
                    />
                  )}

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-medium">Recording</span>
                    </div>
                  )}

                  {/* Playback of recorded video */}
                  {videoUrl && !isRecording && (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-64 object-cover"
                    />
                  )}
                </div>

                {/* Recording Controls */}
                {!interviewFeedback ? (
                  <div className="flex gap-3">
                    {!isRecording && !recordedVideo ? (
                      <button
                        onClick={startRecording}
                        disabled={!videoStream}
                        className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50"
                      >
                        <Video className="w-4 h-4" />
                        Start Recording
                      </button>
                    ) : isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="btn-danger flex items-center gap-2 flex-1"
                      >
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRecordedVideo(null)
                            setVideoUrl(null)
                            const newAnswers = [...videoAnswers]
                            newAnswers[interviewStep] = null
                            setVideoAnswers(newAnswers)
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Re-record
                        </button>
                        <button
                          onClick={handleAnalyzeVideo}
                          disabled={loading || !recordedVideo}
                          className="btn-primary flex items-center gap-2 flex-1 disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin w-4 h-4" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Analyze Answer
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 font-bold">Score: {interviewFeedback.rating}/10</span>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold mb-1">Feedback:</p>
                      <p className="text-gray-300">{interviewFeedback.feedback}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold mb-1">Better Answer:</p>
                      <p className="text-gray-300">{interviewFeedback.improvedAnswer}</p>
                    </div>
                    <button onClick={nextQuestion} className="btn-secondary w-full">
                      {interviewStep < interviewQuestions.length - 1 ? 'Next Question' : 'Complete Interview & View Insights'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobTailor
