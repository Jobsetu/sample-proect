import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, MapPin, Calendar, DollarSign, Sparkles, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'

const JobCard = ({ job, onDragStart, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false)

    const priorityColors = {
        High: 'bg-red-500/20 text-red-300 border-red-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        Low: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }

    return (
        <motion.div
            layout
            draggable="true"
            onDragStart={(e) => onDragStart(e, job.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
            className="bg-dark-800/80 backdrop-blur-sm border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing group relative overflow-hidden"
        >
            {/* Glass gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h3 className="font-semibold text-white text-lg leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                        <Building2 className="w-3 h-3" />
                        <span>{job.company}</span>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-48 bg-dark-700 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
                            >
                                {job.applicationUrl && (
                                    <a
                                        href={job.applicationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open Link
                                    </a>
                                )}
                                <button
                                    onClick={() => {
                                        onDelete(job.id)
                                        setShowMenu(false)
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-2 mt-3 relative z-10">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{job.location || 'Remote'}</span>
                </div>

                {job.salary && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                        <DollarSign className="w-3 h-3" />
                        <span>{job.salary}</span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{job.dateApplied || 'Just now'}</span>
                    </div>

                    {job.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[job.priority] || priorityColors.Low}`}>
                            {job.priority} Priority
                        </span>
                    )}
                </div>
            </div>

            {/* AI Action Button - Appears on Hover */}
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-full shadow-lg shadow-primary-600/20 z-20"
                title="Get AI Advice"
            >
                <Sparkles className="w-4 h-4" />
            </motion.button>
        </motion.div>
    )
}

export default JobCard
