import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, Save, Loader, Check, RefreshCw } from 'lucide-react'
import { LinkedInService } from '../lib/linkedInService'

const LinkedInProfileEditor = ({ profile, onDisconnect }) => {
    const [formData, setFormData] = useState({
        headline: profile.headline || '',
        bio: profile.bio || '',
        experience: profile.experience || []
    })
    const [saving, setSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleExperienceChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        setSuccessMsg('')
        try {
            await LinkedInService.updateProfile(formData)
            setSuccessMsg('Profile synced successfully!')
            setTimeout(() => setSuccessMsg(''), 3000)
        } catch (error) {
            console.error('Failed to save', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0077b5] rounded-full flex items-center justify-center">
                            <Linkedin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">LinkedIn Profile</h3>
                            <p className="text-sm text-gray-400">Connected as {profile.firstName} {profile.lastName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onDisconnect}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Headline</label>
                        <input
                            type="text"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#0077b5] focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">About / Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#0077b5] focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Experience</h3>
                <div className="space-y-6">
                    {formData.experience.map((exp) => (
                        <div key={exp.id} className="bg-dark-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                                        className="w-full bg-dark-800 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-[#0077b5] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                        className="w-full bg-dark-800 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-[#0077b5] outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full bg-dark-800 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-[#0077b5] outline-none resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-green-400 text-sm"
                    >
                        <Check className="w-4 h-4" />
                        {successMsg}
                    </motion.div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 rounded-lg bg-[#0077b5] hover:bg-[#006097] text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Sync to LinkedIn
                </button>
            </div>
        </div>
    )
}

export default LinkedInProfileEditor
