// Simple resume export service that works without external dependencies
export class SimpleResumeExport {
  static async downloadPDF(resumeData, filename = 'resume.pdf') {
    try {
      // Create a simple HTML representation
      const htmlContent = this.generateHTML(resumeData)
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Resume - ${resumeData.personalInfo?.name || 'Resume'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .contact { font-size: 14px; color: #666; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .experience-item { margin-bottom: 15px; }
            .job-title { font-weight: bold; }
            .company { color: #666; }
            .duration { float: right; color: #666; }
            .achievements { margin-top: 5px; }
            .achievements li { margin-bottom: 3px; }
            .skills { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-category { margin-bottom: 10px; }
            .skill-category strong { display: block; margin-bottom: 5px; }
            .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
            .skill-tag { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print / Save as PDF
            </button>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      
      // Auto-trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  static async downloadDOCX(resumeData, filename = 'resume.docx') {
    try {
      // For now, we'll create a simple text version
      const textContent = this.generateText(resumeData)
      
      // Create and download text file
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace('.docx', '.txt')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert('Text version downloaded. For full DOCX support, please use the advanced export feature.')
      
    } catch (error) {
      console.error('Error generating DOCX:', error)
      alert('Error generating document. Please try again.')
    }
  }

  static generateHTML(resumeData) {
    const { personalInfo, summary, skills, experience, education, projects } = resumeData
    
    return `
      <div class="header">
        <div class="name">${personalInfo?.name || 'Your Name'}</div>
        <div class="contact">
          ${personalInfo?.phone || ''} | 
          ${personalInfo?.email || ''} | 
          ${personalInfo?.linkedin || ''} | 
          ${personalInfo?.github || ''}
        </div>
      </div>

      ${summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <p>${summary}</p>
        </div>
      ` : ''}

      ${skills ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${skills.languages ? `
              <div class="skill-category">
                <strong>Languages & Databases:</strong>
                <div class="skill-tags">
                  ${skills.languages.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${skills.frameworks ? `
              <div class="skill-category">
                <strong>Frameworks and Libraries:</strong>
                <div class="skill-tags">
                  ${skills.frameworks.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            ${skills.tools ? `
              <div class="skill-category">
                <strong>Developer Tools:</strong>
                <div class="skill-tags">
                  ${skills.tools.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      ${experience && experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${experience.map(exp => `
            <div class="experience-item">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company} <span class="duration">${exp.duration}</span></div>
              ${exp.achievements ? `
                <ul class="achievements">
                  ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${education ? `
        <div class="section">
          <div class="section-title">Education</div>
          <div class="experience-item">
            <div class="job-title">${education.degree}</div>
            <div class="company">${education.university}</div>
            <div class="company">${education.year} • GPA: ${education.gpa}</div>
          </div>
        </div>
      ` : ''}

      ${projects && projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${projects.map(project => `
            <div class="experience-item">
              <div class="job-title">${project.name}</div>
              <div class="company">${project.description}</div>
              ${project.technologies ? `
                <div class="company">Technologies: ${project.technologies.join(', ')}</div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `
  }

  static generateText(resumeData) {
    const { personalInfo, summary, skills, experience, education, projects } = resumeData
    
    let text = `${personalInfo?.name || 'Your Name'}\n`
    text += `${personalInfo?.phone || ''} | ${personalInfo?.email || ''} | ${personalInfo?.linkedin || ''} | ${personalInfo?.github || ''}\n\n`
    
    if (summary) {
      text += `SUMMARY\n${'='.repeat(50)}\n${summary}\n\n`
    }
    
    if (skills) {
      text += `SKILLS\n${'='.repeat(50)}\n`
      if (skills.languages) {
        text += `Languages & Databases: ${skills.languages.join(', ')}\n`
      }
      if (skills.frameworks) {
        text += `Frameworks and Libraries: ${skills.frameworks.join(', ')}\n`
      }
      if (skills.tools) {
        text += `Developer Tools: ${skills.tools.join(', ')}\n`
      }
      text += '\n'
    }
    
    if (experience && experience.length > 0) {
      text += `PROFESSIONAL EXPERIENCE\n${'='.repeat(50)}\n`
      experience.forEach(exp => {
        text += `${exp.position}\n`
        text += `${exp.company} - ${exp.duration}\n`
        if (exp.achievements) {
          exp.achievements.forEach(achievement => {
            text += `• ${achievement}\n`
          })
        }
        text += '\n'
      })
    }
    
    if (education) {
      text += `EDUCATION\n${'='.repeat(50)}\n`
      text += `${education.degree}\n`
      text += `${education.university}\n`
      text += `${education.year} • GPA: ${education.gpa}\n\n`
    }
    
    if (projects && projects.length > 0) {
      text += `PROJECTS\n${'='.repeat(50)}\n`
      projects.forEach(project => {
        text += `${project.name}\n`
        text += `${project.description}\n`
        if (project.technologies) {
          text += `Technologies: ${project.technologies.join(', ')}\n`
        }
        text += '\n'
      })
    }
    
    return text
  }
}
