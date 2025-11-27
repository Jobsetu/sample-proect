import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, X, Volume2, VolumeX, Loader } from 'lucide-react'
import { GeminiService } from '../lib/geminiService'
import InterviewResults from './InterviewResults'

const InterviewSession = ({ mode, role, onExit }) => {
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [interviewEnded, setInterviewEnded] = useState(false)
    const [questionCount, setQuestionCount] = useState(0)
    const [finalAnalysis, setFinalAnalysis] = useState(null)

    const messagesEndRef = useRef(null)
    const recognitionRef = useRef(null)
    const synthRef = useRef(window.speechSynthesis)

    const MAX_QUESTIONS = 5

    useEffect(() => {
        // Initialize interview
        startInterview()

        // Setup Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setInputText(prev => prev + ' ' + transcript)
                setIsListening(false)
            }

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error)
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const startInterview = async () => {
        setIsLoading(true)
        const introMessage = mode === 'role'
            ? `Hello! I'm your AI interviewer. I see you're applying for a ${role} position. Let's start with a simple question: Tell me about yourself and why you're interested in this role?`
            : "Hello! I'm your AI interviewer. Let's start with a classic opener: Tell me a little about yourself."

        addMessage('ai', introMessage)
        speak(introMessage)
        setIsLoading(false)
    }

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, { sender, text, timestamp: new Date() }])
    }

    const handleSend = async () => {
        if (!inputText.trim()) return

        const userResponse = inputText
        setInputText('')
        addMessage('user', userResponse)

        if (synthRef.current) synthRef.current.cancel()

        setIsLoading(true)

        try {
            // Analyze answer and get next question
            // Note: In a real app, we would maintain context more robustly
            // Here we simulate the flow

            setQuestionCount(prev => prev + 1)

            if (questionCount >= MAX_QUESTIONS - 1) {
                await endInterview()
            } else {
                // Generate next question based on previous answer
                // For now, we'll use a simplified prompt to Gemini
                const prompt = `
          I am conducting a mock interview for a ${role || 'general'} role.
          The user just answered: "${userResponse}"
          
          Please provide a short, constructive feedback on their answer (1 sentence) and then ask the next follow-up question.
          Make it natural and conversational.
        `

                // We can reuse GeminiService or call it directly if we expose a generic method
                // For this demo, let's assume we can use a generic chat method or similar
                // Since we don't have a generic chat method in GeminiService, we'll use a new instance here or add a method
                // Let's use a direct call pattern similar to existing service methods

                const geminiResponse = await GeminiService.analyzeInterviewAnswer("Previous Question", userResponse)

                // Construct the AI response
                const feedbackPart = geminiResponse.feedback ? `${geminiResponse.feedback}` : "Good answer."
                const tipPart = geminiResponse.improvedAnswer ? ` Here's a tip: ${geminiResponse.improvedAnswer}` : ""

                // Get next question from AI
                const nextQuestion = await GeminiService.generateNextInterviewQuestion(role || 'General', "Previous Question", userResponse)

                const fullResponse = `${feedbackPart}${tipPart} Now, next question: ${nextQuestion}`

                addMessage('ai', fullResponse)
                speak(fullResponse)
            }

        } catch (error) {
            console.error(error)
            addMessage('ai', "I'm having trouble connecting. Let's try that again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Removed local generateNextTurn as we use GeminiService now

    const endInterview = async () => {
        setInterviewEnded(true)
        const closing = "Thank you for your time. I've gathered enough information to provide you with some feedback. Let's review your performance."
        addMessage('ai', closing)
        speak(closing)

        // Generate final report
        const report = await GeminiService.generateInterviewInsights(
            role || "General Role",
            {}, // No resume context in this isolated mode for now
            messages.map(m => m.text)
        )
        setFinalAnalysis(report)
    }

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            recognitionRef.current?.start()
            setIsListening(true)
        }
    }

    const speak = (text) => {
        if (!synthRef.current) return

        setIsSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setIsSpeaking(false)
        synthRef.current.speak(utterance)
    }

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel()
            setIsSpeaking(false)
        }
    }

    if (interviewEnded && finalAnalysis) {
        return <InterviewResults analysis={finalAnalysis} onExit={onExit} />
    }

    return (
        <div className="flex flex-col h-screen bg-dark-900">
            {/* Header */}
            <div className="bg-dark-800 border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold">AI Interviewer</h2>
                        <p className="text-xs text-gray-400">{mode === 'role' ? role : 'General Interview'}</p>
                    </div>
                </div>
                <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-dark-800 text-gray-200 rounded-tl-none border border-white/10'
                            }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-dark-800 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-800 border-t border-white/10">
                <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                    <button
                        onClick={toggleListening}
                        className={`p-4 rounded-full transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
                            }`}
                    >
                        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your answer..."
                            className="w-full bg-dark-900 border border-white/10 rounded-xl px-6 py-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className="p-4 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    {isSpeaking && (
                        <button onClick={stopSpeaking} className="text-xs text-primary-400 flex items-center justify-center gap-1 hover:underline">
                            <Volume2 className="w-3 h-3" /> Mute AI
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InterviewSession
