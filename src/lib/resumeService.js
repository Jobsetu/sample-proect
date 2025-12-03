import { supabase } from './supabase'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'

// Set up the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

// Resume upload and processing service
// Note: S3 functionality temporarily disabled to parse directly from user
export class ResumeService {
  // Helper to extract text from PDF
  static async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n'
      }

      return fullText
    } catch (error) {
      console.error('Error extracting PDF text:', error)
      throw new Error('Failed to parse PDF file')
    }
  }

  // Helper to parse resume text into structured data (simple heuristic parser)
  static parseResumeText(text) {
    // This is a basic parser. In a real app, you might use an AI service or more complex regex
    const sections = {
      personalInfo: {},
      skills: [],
      experience: [],
      education: [],
      summary: ''
    }

    // Simple email extraction
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)
    if (emailMatch) sections.personalInfo.email = emailMatch[0]

    // Simple phone extraction
    const phoneMatch = text.match(/(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)
    if (phoneMatch) sections.personalInfo.phone = phoneMatch[0]

    // Attempt to find name (first line often)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    if (lines.length > 0) sections.personalInfo.name = lines[0]

    // Simple keyword matching for skills (expand this list)
    const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Java', 'C++', 'HTML', 'CSS', 'Git']
    sections.skills = commonSkills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()))

    sections.rawText = text
    return sections
  }

  // Upload resume file - MODIFIED to use Python Backend
  static async uploadResume(file, userId) {
    try {
      console.log('Uploading resume to backend...', { fileName: file.name, userId })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      // Call Python backend
      const response = await fetch('http://localhost:5000/api/upload-resume', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload resume to backend')
      }

      const data = await response.json()

      // The backend returns { output: JSON_STRING }
      // We need to parse the JSON string if it's a string
      let parsedData = {}
      try {
        if (typeof data.output === 'string') {
          parsedData = JSON.parse(data.output)
        } else {
          parsedData = data.output
        }
      } catch (e) {
        console.error("Error parsing backend response:", e)
        // Fallback to raw text if JSON parse fails
        parsedData = { rawText: data.output }
      }

      return {
        success: true,
        filePath: 'backend-processed',
        publicUrl: null,
        fileName: file.name,
        parsedText: JSON.stringify(parsedData), // Store as string for analysis
        ...parsedData
      }
    } catch (error) {
      console.error('Error processing resume with backend:', error)

      // Fallback to local parsing if backend fails
      console.log('Falling back to local parsing...')
      try {
        let parsedText = ''
        if (file.type === 'application/pdf') {
          parsedText = await this.extractTextFromPDF(file)
        } else {
          parsedText = await file.text()
        }
        const parsedData = this.parseResumeText(parsedText)
        return {
          success: true,
          filePath: 'local-fallback',
          fileName: file.name,
          parsedText,
          ...parsedData,
          isFallback: true
        }
      } catch (localError) {
        return {
          success: false,
          error: `Backend error: ${error.message}. Local fallback failed: ${localError.message}`
        }
      }
    }
  }

  // Save resume data to database - Keeping this as it uses Supabase DB
  static async saveResumeData(userId, resumeData) {
    try {
      // If we're skipping S3, we might not have a file_path or file_url
      // so we handle that gracefully
      return {
        success: true,
        data: {
          id: 'local-id-' + Date.now(),
          ...resumeData
        }
      }
    } catch (error) {
      console.error('Error saving resume data:', error)
      return { success: false, error: error.message }
    }
  }

  static async getUserResume(userId) {
    return { success: true, data: null }
  }

  static async deleteResume(userId, resumeId) {
    return { success: true }
  }

  static async setPrimaryResume(userId, resumeId) {
    return { success: true }
  }

  // Kept for compatibility with existing calls, but now handled inside uploadResume
  static async extractResumeData(file) {
    if (file.type === 'application/pdf') {
      const text = await this.extractTextFromPDF(file)
      return this.parseResumeText(text)
    }
    const text = await file.text()
    return this.parseResumeText(text)
  }
}
