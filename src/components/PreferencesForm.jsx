import React from 'react'
import { Globe, Briefcase, DollarSign, Calendar, MapPin } from 'lucide-react'
import useAutoFillStore from '../stores/useAutoFillStore'

const PreferencesForm = () => {
    const { workAuthorization, preferences, setWorkAuthorization, setPreferences } = useAutoFillStore()

    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia', 'India', 'Singapore', 'UAE']
    const currencies = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'INR', 'SGD', 'AED']

    const toggleCountry = (country) => {
        const current = workAuthorization.canWorkIn || []
        const updated = current.includes(country)
            ? current.filter(c => c !== country)
            : [...current, country]
        setWorkAuthorization({ canWorkIn: updated })
    }

    return (
        <div className="space-y-6">
            {/* Work Authorization */}
            <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">Work Authorization</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Countries you're authorized to work in
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {countries.map((country) => (
                                <button
                                    key={country}
                                    onClick={() => toggleCountry(country)}
                                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${workAuthorization.canWorkIn?.includes(country)
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                                        }`}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={workAuthorization.requiresSponsorship || false}
                                onChange={(e) => setWorkAuthorization({ requiresSponsorship: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-300">Requires sponsorship</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={workAuthorization.hasWorkPermit || false}
                                onChange={(e) => setWorkAuthorization({ hasWorkPermit: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-gray-300">Have work permit</span>
                        </label>
                    </div>

                    {workAuthorization.hasWorkPermit && (
                        <textarea
                            value={workAuthorization.workPermitDetails || ''}
                            onChange={(e) => setWorkAuthorization({ workPermitDetails: e.target.value })}
                            placeholder="Work permit details (type, expiry, restrictions...)"
                            rows="2"
                            className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                        />
                    )}
                </div>
            </div>

            {/* Job Preferences */}
            <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-primary-400" />
                    <h3 className="text-lg font-semibold text-white">Job Preferences</h3>
                </div>

                <div className="space-y-4">
                    {/* Salary Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Desired Salary Range
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                value={preferences.desiredSalary?.min || ''}
                                onChange={(e) => setPreferences({
                                    desiredSalary: { ...preferences.desiredSalary, min: e.target.value }
                                })}
                                placeholder="Min"
                                className="px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                            />
                            <input
                                type="number"
                                value={preferences.desiredSalary?.max || ''}
                                onChange={(e) => setPreferences({
                                    desiredSalary: { ...preferences.desiredSalary, max: e.target.value }
                                })}
                                placeholder="Max"
                                className="px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-400 transition-colors"
                            />
                            <select
                                value={preferences.desiredSalary?.currency || 'USD'}
                                onChange={(e) => setPreferences({
                                    desiredSalary: { ...preferences.desiredSalary, currency: e.target.value }
                                })}
                                className="px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Available Start Date
                        </label>
                        <input
                            type="date"
                            value={preferences.availableStartDate || ''}
                            onChange={(e) => setPreferences({ availableStartDate: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                        />
                    </div>

                    {/* Notice Period */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notice Period
                        </label>
                        <select
                            value={preferences.noticePeriod || '2 weeks'}
                            onChange={(e) => setPreferences({ noticePeriod: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                        >
                            <option value="Immediate">Immediate</option>
                            <option value="1 week">1 week</option>
                            <option value="2 weeks">2 weeks</option>
                            <option value="1 month">1 month</option>
                            <option value="2 months">2 months</option>
                            <option value="3 months">3 months</option>
                        </select>
                    </div>

                    {/* Work Location Preferences */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Work Location Preferences
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.remoteOnly || false}
                                    onChange={(e) => setPreferences({ remoteOnly: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-300">Remote only</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.hybridOk !== false}
                                    onChange={(e) => setPreferences({ hybridOk: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-300">Hybrid OK</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.onsiteOk !== false}
                                    onChange={(e) => setPreferences({ onsiteOk: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-300">On-site OK</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.willingToRelocate || false}
                                    onChange={(e) => setPreferences({ willingToRelocate: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-300">Willing to relocate</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreferencesForm
