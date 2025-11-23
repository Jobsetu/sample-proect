import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Save, X, MessageSquare, Sparkles } from 'lucide-react'
import useAutoFillStore from '../stores/useAutoFillStore'
import { GeminiService } from '../lib/geminiService'


const CommonQuestionsManager = () => {
    const { commonAnswers, customQA, setCommonAnswer, addCustomQA, updateCustomQA, deleteCustomQA } = useAutoFillStore()
    const [editingCustom, setEditingCustom] = useState(null)
    const [newQuestion, setNewQuestion] = useState('')
    const [newAnswer, setNewAnswer] = useState('')
    const [generatingFor, setGeneratingFor] = useState(null)

    const commonQuestions = [
        'Why do you want to work here?',
        'What are your salary expectations?',
        'When can you start?',
        'Why should we hire you?',
        'What are your strengths?',
        'What are your weaknesses?',
        'Where do you see yourself in 5 years?',
        'Tell me about yourself',
        'Why are you leaving your current job?'
    ]

    const handleGenerateAnswer = async (question) => {
        setGeneratingFor(question)
        try {
            // Use Gemini to generate a professional answer
            const prompt = `Generate a professional, concise answer (2-3 sentences) for this common job application question: "${question}". Make it generic enough to apply to most jobs but specific enough to be helpful.`

            const response = await GeminiService.generateContent(prompt)
            setCommonAnswer(question, response)
        } catch (error) {
            console.error('Error generating answer:', error)
        } finally {
            setGeneratingFor(null)
        }
    }

    const handleAddCustom = () => {
        if (newQuestion.trim() && newAnswer.trim()) {
            addCustomQA(newQuestion, newAnswer)
            setNewQuestion('')
            setNewAnswer('')
        }
    }

    const handleUpdateCustom = (id, question, answer) => {
        updateCustomQA(id, question, answer)
        setEditingCustom(null)
    }

    return (
        <div className="space-y-6">
            {/* Common Questions */}
            <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">Common Questions</h3>
                    <span className="text-xs text-gray-400">(Pre-fill your standard answers)</span>
                </div>

                <div className="space-y-4">
                    {commonQuestions.map((question) => (
                        <div key={question} className="bg-dark-800/50 rounded-lg p-4 border border-white/5">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {question}
                            </label>
                            <div className="flex gap-2">
                                <textarea
                                    value={commonAnswers[question] || ''}
                                    onChange={(e) => setCommonAnswer(question, e.target.value)}
                                    placeholder="Your answer..."
                                    rows="3"
                                    className="flex-1 px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                                />
                                <button
                                    onClick={() => handleGenerateAnswer(question)}
                                    disabled={generatingFor === question}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2 h-fit"
                                    title="Generate AI answer"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {generatingFor === question ? '...' : 'AI'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Q&A */}
            <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Questions & Answers</h3>

                {/* Add New */}
                <div className="bg-dark-800/50 rounded-lg p-4 border border-white/5 mb-4">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Question..."
                        className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors mb-3"
                    />
                    <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Your answer..."
                        rows="2"
                        className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none mb-3"
                    />
                    <button
                        onClick={handleAddCustom}
                        disabled={!newQuestion.trim() || !newAnswer.trim()}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Custom Q&A
                    </button>
                </div>

                {/* Custom QA List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {customQA.map((qa) => (
                            <motion.div
                                key={qa.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="bg-dark-800/50 rounded-lg p-4 border border-white/5"
                            >
                                {editingCustom === qa.id ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            defaultValue={qa.question}
                                            id={`edit-q-${qa.id}`}
                                            className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
                                        />
                                        <textarea
                                            defaultValue={qa.answer}
                                            id={`edit-a-${qa.id}`}
                                            rows="2"
                                            className="w-full px-4 py-2 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const question = document.getElementById(`edit-q-${qa.id}`).value
                                                    const answer = document.getElementById(`edit-a-${qa.id}`).value
                                                    handleUpdateCustom(qa.id, question, answer)
                                                }}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm flex items-center gap-1"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingCustom(null)}
                                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center gap-1"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-medium text-white flex-1">{qa.question}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingCustom(qa.id)}
                                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCustomQA(qa.id)}
                                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{qa.answer}</p>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {customQA.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No custom Q&A pairs yet. Add one above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommonQuestionsManager
