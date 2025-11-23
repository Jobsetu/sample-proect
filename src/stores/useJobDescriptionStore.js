import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useJobDescriptionStore = create(
    persist(
        (set, get) => ({
            jobDescription: '',
            jobTitle: '',
            company: '',
            lastUpdated: null,

            // Set job description
            setJobDescription: (description, title = '', company = '') => {
                set({
                    jobDescription: description,
                    jobTitle: title,
                    company: company,
                    lastUpdated: new Date().toISOString()
                })
            },

            // Clear job description
            clearJobDescription: () => {
                set({
                    jobDescription: '',
                    jobTitle: '',
                    company: '',
                    lastUpdated: null
                })
            },

            // Get formatted job description
            getFormattedJobDescription: () => {
                const state = get()
                if (!state.jobDescription) return ''

                let formatted = ''
                if (state.jobTitle && state.company) {
                    formatted += `Position: ${state.jobTitle} at ${state.company}\n\n`
                }
                formatted += state.jobDescription
                return formatted
            },

            // Check if job description exists
            hasJobDescription: () => {
                return !!get().jobDescription && get().jobDescription.trim().length > 0
            }
        }),
        {
            name: 'job-description-storage', // localStorage key
            version: 1
        }
    )
)
