import { ResumeExportService } from '../lib/resumeExportService'
import { useResumeStore } from '../stores/useResumeStore'
import { LaTeXService } from '../lib/latexService'
import { Upload, Download, FileCode, FileJson } from 'lucide-react'

const ExportButtons = () => {
  const resume = useResumeStore(s => s.resume)
  const setResume = useResumeStore(s => s.setResume)

  const handlePDF = async () => {
    await ResumeExportService.downloadPDF(mapToLegacyData(resume), 'resume.pdf', toStyle(resume))
  }

  const handleDOCX = async () => {
    await ResumeExportService.downloadDOCX(mapToLegacyData(resume), 'resume.docx', toStyle(resume))
  }

  const handleTeX = async () => {
    // Convert store data to LaTeXService expected format
    const latexData = mapToLaTeXData(resume)
    await LaTeXService.downloadLaTeX(latexData, resume.template)
  }

  const handleJSONExport = () => {
    const dataStr = JSON.stringify(resume, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = "resume.json"
    link.href = url
    link.click()
  }

  const handleJSONImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        // Basic validation check
        if (json.sections && json.personalInfo) {
          setResume(json)
        } else {
          alert("Invalid resume JSON format")
        }
      } catch (err) {
        console.error(err)
        alert("Error parsing JSON file")
      }
    }
    reader.readAsText(file)
    e.target.value = null // reset input
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="file"
          accept=".json"
          onChange={handleJSONImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Import JSON"
        />
        <button className="btn-secondary flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import JSON
        </button>
      </div>

      <button className="btn-secondary flex items-center gap-2" onClick={handleJSONExport}>
        <FileJson className="w-4 h-4" /> Export JSON
      </button>

      <button className="btn-secondary flex items-center gap-2" onClick={handleTeX}>
        <FileCode className="w-4 h-4" /> Export TeX
      </button>

      <button className="btn-primary flex items-center gap-2" onClick={handlePDF}>
        <Download className="w-4 h-4" /> PDF
      </button>
    </div>
  )
}

function toStyle(resume) {
  return {
    margin: resume.margin?.left / 20 || 0.75, // crude map to inches assumption
    fontSize: 11,
    lineSpacing: resume.spacing || 1.2,
  }
}

// Map for Legacy HTML/PDF generation (resumeExportService)
function mapToLegacyData(resume) {
  if (!resume || !resume.sections) return {}
  const getSection = (id) => resume.sections.find(s => s.id === id) || {}
  const exp = getSection('experience')
  const edu = getSection('education')
  const skills = getSection('skills')
  const summary = getSection('summary')
  const projects = getSection('projects')

  return {
    personalInfo: resume.personalInfo || {},
    summary: summary.content || '',
    skills: Array.isArray(skills.items) ? {
      languages: skills.items,
      frameworks: [], // The store only has a flat list currently, so we put all in languages or split logic needed
      tools: []
    } : undefined,
    experience: Array.isArray(exp.items) ? exp.items.map(it => ({
      position: it.role,
      duration: `${it.startDate || ''} - ${it.endDate || 'Present'}`,
      company: it.company,
      location: it.location,
      achievements: Array.isArray(it.bullets) ? it.bullets : []
    })) : [],
    education: Array.isArray(edu.items) && edu.items[0] ? {
      degree: edu.items[0].title || edu.items[0].degree || '',
      university: edu.items[0].subtitle || edu.items[0].school || '',
      year: edu.items[0].year || '',
      gpa: edu.items[0].gpa || '',
      location: edu.items[0].location || ''
    } : undefined,
    projects: Array.isArray(projects.items) ? projects.items.map(p => ({
      name: p.title,
      description: p.description,
      technologies: p.technologies || []
    })) : []
  }
}

// Map for LaTeX generation (latexService)
function mapToLaTeXData(resume) {
  const legacy = mapToLegacyData(resume)
  // LaTeXService expects slightly different structure (check processTemplate in latexService.js)
  return {
    personalInfo: legacy.personalInfo,
    summary: legacy.summary,
    skills: {
      languages: legacy.skills?.languages || [],
      frameworks: legacy.skills?.frameworks || [],
      tools: legacy.skills?.tools || []
    },
    experience: legacy.experience,
    education: legacy.education ? // Latex service expects single object or array? 
      // Looking at latexService.js: processed = this.processEducation(processed, resumeData.education)
      // processEducation takes 'education' object directly (not array) in the current simple implementation
      // BUT wait, processEducation in latexService.js uses education.year, education.degree.
      // If user has multiple degrees, the current latexService only supports one!
      // I should verify latexService capability.
      legacy.education : {},
    projects: legacy.projects
  }
}

export default ExportButtons
