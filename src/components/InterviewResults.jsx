import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Lightbulb, ArrowLeft, Download } from 'lucide-react'

const InterviewResults = ({ analysis, onExit }) => {
    return (
        <div className="min-h-screen bg-dark-900 text-white p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-bold mb-2">Interview Analysis</h1>
                    <p className="text-gray-400">Here's how you performed in your mock interview.</p>
                </motion.div>

                {/* Overall Score */}
                <div className="flex justify-center mb-12">
                    <div className="relative">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-dark-700"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={440}
                                strokeDashoffset={440 - (440 * (analysis.overallScore || 0)) / 10}
                                className={`text-primary-500 transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-4xl font-bold">{analysis.overallScore || 0}</span>
                            <span className="text-sm text-gray-400 block">/10</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Strengths */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-dark-800/50 p-6 rounded-2xl border border-white/10"
                    >
                        <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Strengths
                        </h3>
                        <ul className="space-y-3">
                            {analysis.strengths?.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Areas for Improvement */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-dark-800/50 p-6 rounded-2xl border border-white/10"
                    >
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {analysis.areasForImprovement?.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-primary-500/10 p-8 rounded-2xl border border-primary-500/20 mb-12"
                >
                    <h3 className="text-xl font-semibold text-primary-400 mb-6 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Key Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analysis.recommendations?.map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 text-primary-400 font-bold text-sm">
                                    {i + 1}
                                </div>
                                <p className="text-gray-300">{item}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onExit}
                        className="px-6 py-3 rounded-lg bg-dark-800 text-white hover:bg-dark-700 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <button className="px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InterviewResults
