import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Briefcase, MapPin, DollarSign, Link as LinkIcon, FileText, Flag } from 'lucide-react'

const AddApplicationModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        applicationUrl: '',
        status: 'wishlist',
        priority: 'Medium',
        notes: ''
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.title.trim()) newErrors.title = 'Job title is required'
        if (!formData.company.trim()) newErrors.company = 'Company name is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const newJob = {
            ...formData,
            id: Date.now(),
            dateApplied: 'Just now'
        }

        onAdd(newJob)
        handleClose()
    }

    const handleClose = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            salary: '',
            applicationUrl: '',
            status: 'wishlist',
            priority: 'Medium',
            notes: ''
        })
        setErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-effect rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto border border-white/10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-6 h-6 text-primary-400" />
                                    Add Job Application
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Job Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Job Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Senior Frontend Engineer"
                                        className={`w-full px-4 py-3 bg-dark-800 border ${errors.title ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors`}
                                    />
                                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Company <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="e.g., Google"
                                        className={`w-full px-4 py-3 bg-dark-800 border ${errors.company ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors`}
                                    />
                                    {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
                                </div>

                                {/* Location & Salary - Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g., Remote / San Francisco, CA"
                                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1" />
                                            Salary Range
                                        </label>
                                        <input
                                            type="text"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            placeholder="e.g., $120k - $180k"
                                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Application URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <LinkIcon className="w-4 h-4 inline mr-1" />
                                        Application URL
                                    </label>
                                    <input
                                        type="url"
                                        name="applicationUrl"
                                        value={formData.applicationUrl}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                                    />
                                </div>

                                {/* Status & Priority - Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                                        >
                                            <option value="wishlist">Wishlist</option>
                                            <option value="applied">Applied</option>
                                            <option value="interviewing">Interviewing</option>
                                            <option value="offer">Offer</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <Flag className="w-4 h-4 inline mr-1" />
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                                        >
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <FileText className="w-4 h-4 inline mr-1" />
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Any additional notes about this application..."
                                        className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-6 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary px-6 py-3 font-medium"
                                    >
                                        Add Application
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddApplicationModal
