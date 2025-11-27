import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultState = {
  personalInfo: {
    name: 'Your Name',
    title: 'Software Engineer',
    email: 'email@example.com',
    phone: '(123) 456-7890',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/username',
    github: 'github.com/username',
    website: 'yourwebsite.com'
  },
  font: 'Inter',
  color: '#1E293B',
  spacing: 1.2,
  margin: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
  template: 'stitch',
  sections: [
    { id: 'summary', title: 'Summary', content: 'Experienced software engineer with a passion for building scalable web applications.' },
    {
      id: 'experience',
      title: 'Professional Experience',
      items: [
        {
          id: 'exp-1',
          role: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2022',
          endDate: 'Present',
          bullets: [
            'Lead developer for the main product dashboard',
            'Mentored junior developers and conducted code reviews',
            'Reduced page load time by 40% through optimization'
          ]
        }
      ]
    },
    {
      id: 'education',
      title: 'Education',
      items: [
        {
          id: 'edu-1',
          degree: 'B.S. Computer Science',
          school: 'University of Technology',
          location: 'City, State',
          year: '2018',
          gpa: '3.8/4.0'
        }
      ]
    },
    {
      id: 'skills',
      title: 'Skills',
      items: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Git']
    },
    {
      id: 'projects',
      title: 'Projects',
      items: [
        {
          id: 'proj-1',
          title: 'E-commerce Platform',
          subtitle: 'Full Stack Application',
          description: 'Built a scalable e-commerce platform using MERN stack with Redux for state management.',
          technologies: ['React', 'Node.js', 'MongoDB']
        }
      ]
    },
    {
      id: 'certifications',
      title: 'Certifications',
      items: []
    }
  ]
}

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resume: defaultState,
      setField: (path, value) => {
        set(state => {
          const draft = structuredClone(state.resume)
          const keys = path.split('.')
          let cursor = draft
          for (let i = 0; i < keys.length - 1; i++) {
            if (!cursor[keys[i]]) cursor[keys[i]] = {}
            cursor = cursor[keys[i]]
          }
          cursor[keys[keys.length - 1]] = value
          return { resume: draft }
        })
      },
      setResume: (data) => set({ resume: data }),
      resetResume: () => set({ resume: defaultState }),
      addSection: (section) => set(state => ({ resume: { ...state.resume, sections: [...state.resume.sections, section] } })),
      removeSection: (sectionId) => set(state => ({ resume: { ...state.resume, sections: state.resume.sections.filter(s => s.id !== sectionId) } })),
      reorderSections: (fromIndex, toIndex) => set(state => {
        const sections = [...state.resume.sections]
        const [moved] = sections.splice(fromIndex, 1)
        sections.splice(toIndex, 0, moved)
        return { resume: { ...state.resume, sections } }
      }),
      updateSection: (sectionId, updater) => set(state => {
        const sections = state.resume.sections.map(s => s.id === sectionId ? { ...s, ...updater(s) } : s)
        return { resume: { ...state.resume, sections } }
      }),
    }),
    {
      name: 'resume-storage', // unique name
      version: 1,
    }
  )
)
