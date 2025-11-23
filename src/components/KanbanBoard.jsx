import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical } from 'lucide-react'
import JobCard from './JobCard'

const initialData = [
    { id: 1, title: 'Frontend Engineer', company: 'Google', location: 'Mountain View, CA', salary: '$180k - $250k', dateApplied: '2 days ago', status: 'wishlist', priority: 'High' },
    { id: 2, title: 'Product Designer', company: 'Airbnb', location: 'San Francisco, CA', salary: '$160k - $220k', dateApplied: '1 week ago', status: 'applied', priority: 'Medium' },
    { id: 3, title: 'Full Stack Dev', company: 'Netflix', location: 'Remote', salary: '$200k+', dateApplied: '3 days ago', status: 'interviewing', priority: 'High' },
    { id: 4, title: 'React Developer', company: 'Meta', location: 'Menlo Park, CA', salary: '$190k - $240k', dateApplied: '2 weeks ago', status: 'rejected', priority: 'Low' },
]

const columns = [
    { id: 'wishlist', title: 'Wishlist', color: 'bg-purple-500' },
    { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-500' },
    { id: 'offer', title: 'Offer', color: 'bg-green-500' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500' }
]

const STORAGE_KEY = 'jobyatra_applications'

const KanbanBoard = ({ onAddJob }) => {
    const [jobs, setJobs] = useState([])
    const [draggedJobId, setDraggedJobId] = useState(null)

    // Load jobs from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setJobs(JSON.parse(stored))
            } else {
                // Use initial data if nothing in storage
                setJobs(initialData)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
            }
        } catch (error) {
            console.error('Error loading jobs:', error)
            setJobs(initialData)
        }
    }, [])

    // Save jobs to localStorage whenever they change
    useEffect(() => {
        if (jobs.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
            } catch (error) {
                console.error('Error saving jobs:', error)
            }
        }
    }, [jobs])

    const addJob = useCallback((newJob) => {
        setJobs(prev => [...prev, newJob])
    }, [])

    // Expose addJob to parent
    useEffect(() => {
        if (onAddJob) {
            onAddJob(addJob)
        }
    }, [onAddJob, addJob])

    const onDragStart = (e, id) => {
        setDraggedJobId(id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const onDragOver = (e) => {
        e.preventDefault()
    }

    const onDrop = (e, status) => {
        e.preventDefault()
        if (!draggedJobId) return

        setJobs(prevJobs =>
            prevJobs.map(job =>
                job.id === draggedJobId ? { ...job, status } : job
            )
        )
        setDraggedJobId(null)
    }

    const deleteJob = (jobId) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            setJobs(prev => prev.filter(job => job.id !== jobId))
        }
    }

    return (
        <div className="h-full overflow-x-auto pb-4">
            {/* Mobile: Vertical Stack, Desktop: Horizontal Scroll */}
            <div className="flex flex-col md:flex-row gap-6 md:min-w-[1200px] h-full px-4">
                {columns.map(column => (
                    <div
                        key={column.id}
                        className="w-full md:w-80 flex-shrink-0 flex flex-col md:h-full"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 p-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                <h3 className="font-semibold text-gray-200">{column.title}</h3>
                                <span className="text-xs text-gray-500 bg-dark-800 px-2 py-0.5 rounded-full border border-white/5">
                                    {jobs.filter(j => j.status === column.id).length}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Drop Zone */}
                        <div className="flex-1 bg-dark-800/30 rounded-xl border border-white/5 p-3 overflow-y-auto custom-scrollbar transition-colors hover:bg-dark-800/50 min-h-[200px] md:min-h-0">
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {jobs
                                        .filter(job => job.status === column.id)
                                        .map(job => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onDragStart={onDragStart}
                                                onDelete={deleteJob}
                                            />
                                        ))}
                                </AnimatePresence>

                                {jobs.filter(j => j.status === column.id).length === 0 && (
                                    <div className="h-32 md:h-full flex flex-col items-center justify-center text-gray-600 text-sm italic border-2 border-dashed border-white/5 rounded-lg p-4">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default KanbanBoard
