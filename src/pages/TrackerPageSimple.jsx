import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, User, FileText, Settings, Layout, Plus, Menu, X, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import Logo from '../components/Logo'

const TrackerPageSimple = () => {
    const { user, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-dark-800/80 backdrop-blur-lg border-b border-white/10 z-10"
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
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 bg-dark-900 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-4">Application Tracker</h1>
                    <p className="text-gray-400 mb-8">Manage your job search pipeline</p>

                    <div className="glass-effect rounded-xl p-8 text-center">
                        <TrendingUp className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-white mb-2">Tracker Page Loaded Successfully!</h2>
                        <p className="text-gray-400">The Kanban board will be here.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrackerPageSimple
