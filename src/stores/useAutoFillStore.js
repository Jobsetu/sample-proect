import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAutoFillStore = create(
    persist(
        (set, get) => ({
            // Personal Information (from existing profile)
            personalInfo: {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: '',
                linkedin: '',
                github: '',
                portfolio: '',
                website: ''
            },

            // Work Authorization
            workAuthorization: {
                canWorkIn: [], // ['US', 'Canada', 'UK', etc.]
                requiresSponsorship: false,
                hasWorkPermit: false,
                workPermitDetails: '',
                authorized: true // Authorized to work without sponsorship
            },

            // Job Preferences
            preferences: {
                desiredSalary: {
                    min: '',
                    max: '',
                    currency: 'USD'
                },
                availableStartDate: '',
                willingToRelocate: false,
                remoteOnly: false,
                hybridOk: true,
                onsiteOk: true,
                noticePeriod: '2 weeks'
            },

            // Common Application Questions & Answers
            commonAnswers: {
                'Why do you want to work here?': '',
                'What are your salary expectations?': '',
                'When can you start?': '',
                'Why should we hire you?': '',
                'What are your strengths?': '',
                'What are your weaknesses?': '',
                'Where do you see yourself in 5 years?': '',
                'Tell me about yourself': '',
                'Why are you leaving your current job?': ''
            },

            // Custom Q&A pairs
            customQA: [],

            // References
            references: [],

            // Auto-fill Settings
            settings: {
                enabled: true,
                autoSubmit: false, // Never auto-submit without confirmation
                fillOptionalFields: true,
                trackApplications: true,
                showPreview: true
            },

            // Actions
            setPersonalInfo: (info) => set({ personalInfo: { ...get().personalInfo, ...info } }),

            setWorkAuthorization: (auth) => set({ workAuthorization: { ...get().workAuthorization, ...auth } }),

            setPreferences: (prefs) => set({ preferences: { ...get().preferences, ...prefs } }),

            setCommonAnswer: (question, answer) => set((state) => ({
                commonAnswers: { ...state.commonAnswers, [question]: answer }
            })),

            addCustomQA: (question, answer) => set((state) => ({
                customQA: [...state.customQA, { id: Date.now(), question, answer }]
            })),

            updateCustomQA: (id, question, answer) => set((state) => ({
                customQA: state.customQA.map(qa =>
                    qa.id === id ? { ...qa, question, answer } : qa
                )
            })),

            deleteCustomQA: (id) => set((state) => ({
                customQA: state.customQA.filter(qa => qa.id !== id)
            })),

            addReference: (reference) => set((state) => ({
                references: [...state.references, { id: Date.now(), ...reference }]
            })),

            updateReference: (id, reference) => set((state) => ({
                references: state.references.map(ref =>
                    ref.id === id ? { ...ref, ...reference } : ref
                )
            })),

            deleteReference: (id) => set((state) => ({
                references: state.references.filter(ref => ref.id !== id)
            })),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Get all data for auto-fill
            getAllData: () => {
                const state = get()
                return {
                    personalInfo: state.personalInfo,
                    workAuthorization: state.workAuthorization,
                    preferences: state.preferences,
                    commonAnswers: { ...state.commonAnswers },
                    customQA: state.customQA,
                    references: state.references
                }
            },

            // Import from existing profile
            importFromProfile: (profileData) => {
                if (profileData.personalInfo) {
                    set({ personalInfo: { ...get().personalInfo, ...profileData.personalInfo } })
                }
            },

            // Clear all data
            clearAllData: () => set({
                personalInfo: {},
                workAuthorization: {
                    canWorkIn: [],
                    requiresSponsorship: false,
                    hasWorkPermit: false,
                    workPermitDetails: '',
                    authorized: true
                },
                preferences: {
                    desiredSalary: { min: '', max: '', currency: 'USD' },
                    availableStartDate: '',
                    willingToRelocate: false,
                    remoteOnly: false,
                    hybridOk: true,
                    onsiteOk: true,
                    noticePeriod: '2 weeks'
                },
                commonAnswers: {},
                customQA: [],
                references: []
            })
        }),
        {
            name: 'jobsetu-autofill-storage',
            version: 1
        }
    )
)

export default useAutoFillStore
