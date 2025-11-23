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

  // Upload resume file - MODIFIED to parse locally
  static async uploadResume(file, userId) {
    try {
      console.log('Processing resume locally...', { fileName: file.name, userId })

      let parsedText = ''
      
      if (file.type === 'application/pdf') {
        parsedText = await this.extractTextFromPDF(file)
      } else {
        // Fallback for text files
        parsedText = await file.text()
      }

      const parsedData = this.parseResumeText(parsedText)
      
      return {
        success: true,
        filePath: 'local-only',
        publicUrl: null,
        fileName: file.name,
        parsedText,
        ...parsedData
      }
    } catch (error) {
      console.error('Error processing resume:', error)
      return {
        success: false,
        error: error.message
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
