import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, User, Briefcase, ArrowRight, Mic } from 'lucide-react'
import InterviewSession from '../components/InterviewSession'

const InterviewPage = () => {
    const [started, setStarted] = useState(false)
    const [mode, setMode] = useState('general') // 'general' or 'resume'
    const [role, setRole] = useState('')

    const handleStart = () => {
        if (mode === 'role' && !role.trim()) {
            alert('Please enter a role')
            return
        }
        setStarted(true)
    }

    if (started) {
        return <InterviewSession mode={mode} role={role} onExit={() => setStarted(false)} />
    }

    return (
        <div className="min-h-screen bg-dark-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                        AI Mock Interview
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Practice your interview skills with our advanced AI interviewer. Get real-time feedback and improve your confidence.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* General Mode */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${mode === 'general'
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                            }`}
                        onClick={() => setMode('general')}
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                            <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">General Interview</h3>
                        <p className="text-gray-400 text-sm">
                            Standard behavioral and situational questions suitable for any role. Great for practicing soft skills.
                        </p>
                    </motion.div>

                    {/* Role Specific Mode */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${mode === 'role'
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 bg-dark-800/50 hover:border-white/20'
                            }`}
                        onClick={() => setMode('role')}
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                            <Briefcase className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Role Specific</h3>
                        <p className="text-gray-400 text-sm">
                            Technical and role-specific questions tailored to your target position.
                        </p>
                    </motion.div>
                </div>

                {mode === 'role' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-8"
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Target Role / Job Title
                        </label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Senior React Developer, Product Manager"
                            className="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </motion.div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={handleStart}
                        className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
                    >
                        <Mic className="w-5 h-5" />
                        Start Interview Session
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InterviewPage
