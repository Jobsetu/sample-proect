import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, User, FileText, Settings, TrendingUp, Zap, Download, BookOpen, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import Logo from '../components/Logo'
import CommonQuestionsManager from '../components/CommonQuestionsManager'
import ModelSelector from '../components/ModelSelector'
import useAutoFillStore from '../stores/useAutoFillStore'

const AutoFillPage = () => {
    const { user, signOut } = useAuth()
    const [activeTab, setActiveTab] = useState('questions')
    const { settings, updateSettings, getAllData } = useAutoFillStore()

    const tabs = [
        { id: 'questions', label: 'Questions & Answers', icon: FileText },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'bookmarklet', label: 'Bookmarklet', icon: Zap }
    ]

    const handleExportData = () => {
        const data = getAllData()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'jobsetu-autofill-data.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
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
                            <nav className="hidden md:flex space-x-6">
                                <Link to="/jobs" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <Briefcase className="w-5 h-5" />
                                    <span>Jobs</span>
                                </Link>
                                <Link to="/tracker" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                    <span>Tracker</span>
                                </Link>
                                <Link to="/auto-fill" className="flex items-center space-x-2 text-primary-400 font-medium">
                                    <Zap className="w-5 h-5" />
                                    <span>Auto-Fill</span>
                                </Link>
                                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <User className="w-5 h-5" />
                                    <span>Profile</span>
                                </Link>
                                <Link to="/resume" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                    <span>Resume</span>
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
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

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-900/20 to-accent-900/20 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Zap className="w-12 h-12 text-primary-400" />
                            <h1 className="text-4xl font-bold text-white">Auto-Fill Assistant</h1>
                        </div>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Save time on job applications! Set up your profile once and auto-fill applications across any job board with one click.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={handleExportData}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export Data
                            </button>
                            <a
                                href="#bookmarklet"
                                onClick={() => setActiveTab('bookmarklet')}
                                className="btn-primary flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Get Bookmarklet
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Settings Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-effect rounded-xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-primary-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-white">Auto-Fill Enabled</h3>
                                <p className="text-sm text-gray-400">Auto-fill forms when available</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enabled}
                                onChange={(e) => updateSettings({ enabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.fillOptionalFields}
                                onChange={(e) => updateSettings({ fillOptionalFields: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-300 text-sm">Fill optional fields</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.trackApplications}
                                onChange={(e) => updateSettings({ trackApplications: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-300 text-sm">Auto-track applications</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.showPreview}
                                onChange={(e) => updateSettings({ showPreview: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-300 text-sm">Show preview before submit</span>
                        </label>
                    </div>
                    <ModelSelector />
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex space-x-2 border-b border-white/10">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                        ? 'text-primary-400'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'questions' && <CommonQuestionsManager />}
                    {activeTab === 'preferences' && <PreferencesForm />}
                    {activeTab === 'bookmarklet' && (
                        <div className="glass-effect rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Bookmarklet Instructions</h3>
                            <div className="space-y-6">
                                <div className="bg-dark-800/50 rounded-lg p-6 border border-white/5">
                                    <h4 className="text-lg font-semibold text-white mb-3">📚 What is a Bookmarklet?</h4>
                                    <p className="text-gray-300 mb-4">
                                        A bookmarklet is a small JavaScript program stored as a bookmark in your browser. Click it on any job application page to auto-fill your information instantly!
                                    </p>
                                </div>

                                <div className="bg-dark-800/50 rounded-lg p-6 border border-white/5">
                                    <h4 className="text-lg font-semibold text-white mb-3">⚡ How to Use</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                        <li>Drag the button below to your bookmarks bar</li>
                                        <li>Go to any job application page (LinkedIn, Indeed, etc.)</li>
                                        <li>Click the "JobSetu Auto-Fill" bookmark</li>
                                        <li>Watch your information fill in automatically!</li>
                                    </ol>
                                </div>

                                <div className="bg-gradient-to-br from-primary-900/20 to-accent-900/20 rounded-lg p-6 border border-primary-500/20 text-center">
                                    <p className="text-gray-300 mb-4">Drag this to your bookmarks bar:</p>
                                    <a
                                        href={`javascript:(function(){const script=document.createElement('script');script.src='${window.location.origin}/bookmarklet.js';document.body.appendChild(script);})();`}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold text-lg hover:from-primary-500 hover:to-accent-500 transition-all shadow-lg cursor-move"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <Zap className="w-6 h-6" />
                                        JobSetu Auto-Fill
                                    </a>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Drag this button to your bookmarks toolbar
                                    </p>
                                </div>

                                <div className="bg-dark-800/50 rounded-lg p-6 border border-white/5">
                                    <h4 className="text-lg font-semibold text-white mb-3">🔒 Privacy & Security</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        <li>All data is stored locally in your browser</li>
                                        <li>No data is sent to external servers (except JobSetu)</li>
                                        <li>You control what information is shared</li>
                                        <li>Works entirely on your computer</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default AutoFillPage
