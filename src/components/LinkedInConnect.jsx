import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Linkedin, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { LinkedInService } from '../lib/linkedInService'

const LinkedInConnect = ({ onConnect }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleConnect = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await LinkedInService.connect()
            if (result.success) {
                onConnect(result.profile)
            } else {
                setError('Failed to connect to LinkedIn')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-[#0077b5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Linkedin className="w-8 h-8 text-[#0077b5]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connect LinkedIn</h3>
            <p className="text-gray-400 text-sm mb-6">
                Sync your profile, manage your bio, and keep your experience up to date directly from JobSetu.
            </p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-red-400 text-sm text-left">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-3 rounded-lg bg-[#0077b5] hover:bg-[#006097] text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <Linkedin className="w-5 h-5" />
                        Connect with LinkedIn
                    </>
                )}
            </button>
        </div>
    )
}

export default LinkedInConnect
