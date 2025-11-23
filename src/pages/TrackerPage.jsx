import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, User, FileText, Settings, Layout, Plus, Menu, X, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import Logo from '../components/Logo'
import KanbanBoard from '../components/KanbanBoard'
import AddApplicationModal from '../components/AddApplicationModal'

const TrackerPage = () => {
    const { user, signOut } = useAuth()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const addJobRef = useRef(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleAddJob = (jobData) => {
        if (addJobRef.current) {
            addJobRef.current(jobData)
        }
    }

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col overflow-hidden">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-dark-800/80 backdrop-blur-lg border-b border-white/10 z-10 flex-none"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <Link to="/dashboard">
                                <Logo size="md" />
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex space-x-6">
                                <Link to="/jobs" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <Briefcase className="w-5 h-5" />
                                    <span>Jobs</span>
                                </Link>
                                <Link to="/tracker" className="flex items-center space-x-2 text-primary-400 font-medium">
                                    <Layout className="w-5 h-5" />
                                    <span>Tracker</span>
                                </Link>
                                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </Link>
                                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                    <span>Resume</span>
                                </Link>
                                <Link to="/settings" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <Settings className="w-5 h-5" />
                                    <span>Settings</span>
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-300 hover:text-white"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            {/* Desktop User Info */}
                            <div className="hidden md:flex items-center space-x-2">
                                <Avatar
                                    name={user?.user_metadata?.full_name || user?.email}
                                    email={user?.email}
                                    size={32}
                                    style="avataaars"
                                />
                                <span className="text-gray-300 text-sm">
                                    {user?.user_metadata?.full_name || user?.email || 'User'}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="ml-2 px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (
                        <motion.nav
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4"
                        >
                            <div className="flex flex-col space-y-3">
                                <Link to="/jobs" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2">
                                    <Briefcase className="w-5 h-5" />
                                    <span>Jobs</span>
                                </Link>
                                <Link to="/tracker" className="flex items-center space-x-2 text-primary-400 font-medium py-2">
                                    <Layout className="w-5 h-5" />
                                    <span>Tracker</span>
                                </Link>
                                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2">
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </Link>
                                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Resume</span>
                                </Link>
                                <Link to="/settings" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors py-2">
                                    <Settings className="w-5 h-5" />
                                    <span>Settings</span>
                                </Link>
                                <div className="flex items-center space-x-2 py-2 border-t border-white/10 pt-3">
                                    <Avatar
                                        name={user?.user_metadata?.full_name || user?.email}
                                        email={user?.email}
                                        size={32}
                                        style="avataaars"
                                    />
                                    <span className="text-gray-300 text-sm flex-1">
                                        {user?.user_metadata?.full_name || user?.email || 'User'}
                                    </span>
                                    <button
                                        onClick={signOut}
                                        className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </motion.nav>
                    )}
                </div>
            </motion.header>

            {/* Sub-header / Toolbar */}
            <div className="bg-dark-800 border-b border-white/10 flex-none px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Application Tracker</h1>
                        <p className="text-gray-400 text-sm">Manage your job search pipeline</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Add Application
                    </button>
                </div>
            </div>

            {/* Main Content - Kanban Board */}
            <div className="flex-1 overflow-hidden bg-dark-900 p-4 md:p-8">
                <KanbanBoard onAddJob={(fn) => { addJobRef.current = fn }} />
            </div>

            {/* Add Application Modal */}
            <AddApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddJob}
            />
        </div>
    )
}

export default TrackerPage
