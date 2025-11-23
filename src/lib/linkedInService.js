// Mock LinkedIn Service
// In a real application, this would interact with a backend that handles OAuth and LinkedIn API calls

export const LinkedInService = {
    // Mock authentication
    connect: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    profile: {
                        id: 'li_123456',
                        firstName: 'Manas',
                        lastName: 'Mourya',
                        headline: 'Software Engineer | React | Node.js',
                        bio: 'Passionate software engineer with 5 years of experience in building scalable web applications.',
                        experience: [
                            {
                                id: 1,
                                title: 'Senior Frontend Developer',
                                company: 'Tech Corp',
                                startDate: '2021-01',
                                endDate: 'Present',
                                description: 'Leading the frontend team and migrating legacy app to React.'
                            },
                            {
                                id: 2,
                                title: 'Software Engineer',
                                company: 'Startup Inc',
                                startDate: '2018-06',
                                endDate: '2020-12',
                                description: 'Full stack development using MERN stack.'
                            }
                        ]
                    }
                })
            }, 1500)
        })
    },

    // Mock profile update
    updateProfile: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Updating LinkedIn profile with:', data)
                resolve({
                    success: true,
                    message: 'Profile updated successfully on LinkedIn'
                })
            }, 2000)
        })
    },

    // Mock disconnect
    disconnect: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true })
            }, 500)
        })
    }
}
