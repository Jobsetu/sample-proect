// LaTeX Resume Generation Service
export class LaTeXService {
  static templates = {
    classic: {
        name: 'Classic',
        description: 'Traditional, linear resume template',
        file: 'classic-resume.tex',
        class: 'article'
    },
    modern: {
      name: 'Modern CV',
      description: 'Clean, professional template with classic styling',
      file: 'modern-resume.tex',
      class: 'moderncv'
    },
    altacv: {
      name: 'AltaCV',
      description: 'Modern template with color accents and sidebars',
      file: 'altacv-resume.tex',
      class: 'altacv'
    },
    clean: {
      name: 'Clean Resume',
      description: 'Minimalist design with custom formatting',
      file: 'clean-resume.tex',
      class: 'article'
    },
    professional: {
        name: 'Professional',
        description: 'Compact, dense layout for experienced professionals',
        file: 'professional-resume.tex',
        class: 'article'
    }
  }

  static async generateLaTeX(resumeData, templateName = 'modern', style = {}) {
    try {
      const template = this.templates[templateName] || this.templates.classic
      if (!template) {
        throw new Error(`Template ${templateName} not found`)
      }

      // Load template
      const templateContent = await this.loadTemplate(template.file)
      
      // Replace placeholders with user data
      const processedContent = this.processTemplate(templateContent, resumeData, style, templateName)
      
      return {
        content: processedContent,
        template: template,
        filename: `resume-${templateName}.tex`
      }
    } catch (error) {
      console.error('Error generating LaTeX:', error)
      throw error
    }
  }

  static async loadTemplate(templateFile) {
    try {
      // In a real implementation, you would load from the file system
      // For now, we'll return the template content directly
      const templates = {
        'classic-resume.tex': `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

% dynamic style overrides
<<STYLE_BLOCK>>

\\pagestyle{empty}

\\begin{document}

\\begin{center}
    {\\Huge \\textbf{<<NAME>>}} \\\\[0.5em]
    <<TITLE>> \\\\[0.5em]
    <<EMAIL>> | <<PHONE>> | <<LOCATION>> \\\\
    \\href{https://<<LINKEDIN>>}{LinkedIn} | \\href{https://<<GITHUB>>}{GitHub}
\\end{center}

\\section*{Summary}
<<SUMMARY>>

\\section*{Skills}
\\textbf{Languages:} <<LANGUAGES>> \\\\
\\textbf{Frameworks:} <<FRAMEWORKS>> \\\\
\\textbf{Tools:} <<TOOLS>>

\\section*{Experience}
<<EXPERIENCE>>

\\section*{Education}
<<EDUCATION>>

\\section*{Projects}
<<PROJECTS>>

\\end{document}`,
        'modern-resume.tex': `\\documentclass[11pt,a4paper,sans]{moderncv}

% modern themes
\\moderncvstyle{classic}
\\moderncvcolor{blue}

% character encoding
\\usepackage[utf8]{inputenc}

% adjust the page margins
\\usepackage[scale=0.85]{geometry}

% dynamic style overrides
<<STYLE_BLOCK>>

% personal data
\\name{<<NAME>>}
\\title{<<TITLE>>}
\\address{<<ADDRESS>>}
\\phone[mobile]{<<PHONE>>}
\\email{<<EMAIL>>}
\\social[linkedin]{<<LINKEDIN>>}
\\social[github]{<<GITHUB>>}

\\begin{document}

% make the title
\\makecvtitle

% objective/summary
\\section{Summary}
\\cvitem{}{<<SUMMARY>>}

% skills
\\section{Technical Skills}
\\cvitem{Languages}{<<LANGUAGES>>}
\\cvitem{Frameworks \\& Libraries}{<<FRAMEWORKS>>}
\\cvitem{Tools \\& Technologies}{<<TOOLS>>}

% experience
\\section{Professional Experience}
<<EXPERIENCE>>

% education
\\section{Education}
<<EDUCATION>>

% projects
\\section{Projects}
<<PROJECTS>>

\\end{document}`,
        'altacv-resume.tex': `\\documentclass[10pt,a4paper,ragged2e,withhyper]{altacv}

% Change the page layout if you need to
\\geometry{left=1.25cm,right=1.25cm,top=1.5cm,bottom=1.5cm,columnsep=1.2cm}

% The paracol package lets you typeset columns of text in parallel or side-by-side
\\usepackage{paracol}

% dynamic style overrides
<<STYLE_BLOCK>>

% Change the font if you want to
\\renewcommand{\\familydefault}{\\sfdefault}

% Change the colours if you want to
\\definecolor{SlateGrey}{HTML}{2E2E2E}
\\definecolor{LightGrey}{HTML}{666666}
\\definecolor{DarkPastelRed}{HTML}{450808}
\\definecolor{PastelRed}{HTML}{8F0000}
\\definecolor{Goldenrod}{HTML}{DAA520}
\\definecolor{DarkGoldenrod}{HTML}{B8860B}
\\colorlet{name}{black}
\\colorlet{tagline}{PastelRed}
\\colorlet{heading}{DarkPastelRed}
\\colorlet{headingrule}{Goldenrod}
\\colorlet{personalinfo}{SlateGrey}
\\colorlet{secondaryheading}{SlateGrey}
\\colorlet{accent}{PastelRed}
\\colorlet{emphasis}{SlateGrey}
\\colorlet{body}{LightGrey}

% Change some fonts, if necessary
\\renewcommand{\\namefont}{\\Huge\\rmfamily\\bfseries}
\\renewcommand{\\personalinfofont}{\\footnotesize}
\\renewcommand{\\cvsectionfont}{\\LARGE\\rmfamily\\slshape}
\\renewcommand{\\cvsubsectionfont}{\\large\\bfseries}

% Change the bullets for itemize and rating marker
\\renewcommand{\\itemmarker}{{\\small\\textbullet}}
\\renewcommand{\\ratingmarker}{\\faCircle}

\\begin{document}

\\name{<<NAME>>}
\\tagline{<<TITLE>>}

\\personalinfo{%
  \\email{<<EMAIL>>}
  \\phone{<<PHONE>>}
  \\location{<<LOCATION>>}
  \\linkedin{<<LINKEDIN>>}
  \\github{<<GITHUB>>}
}

\\makecvheader

\\cvsection{Summary}
<<SUMMARY>>

\\cvsection{Technical Skills}
\\cvskill{Languages}{<<LANGUAGES>>}
\\cvskill{Frameworks \\& Libraries}{<<FRAMEWORKS>>}
\\cvskill{Tools \\& Technologies}{<<TOOLS>>}

\\cvsection{Professional Experience}
<<EXPERIENCE>>

\\cvsection{Education}
<<EDUCATION>>

\\cvsection{Projects}
<<PROJECTS>>

\\end{document}`,
        'clean-resume.tex': `\\documentclass[11pt,a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{fontawesome}

% dynamic style overrides
<<STYLE_BLOCK>>

% Custom colors
\\definecolor{primary}{RGB}{0,102,204}
\\definecolor{secondary}{RGB}{102,102,102}

% Remove page numbers
\\pagestyle{empty}

% Custom section formatting
\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0em}{}
\\titleformat{\\subsubsection}{\\small\\bfseries\\color{secondary}}{}{0em}{}

% Custom spacing
\\titlespacing*{\\section}{0pt}{12pt}{6pt}
\\titlespacing*{\\subsection}{0pt}{8pt}{4pt}
\\titlespacing*{\\subsubsection}{0pt}{6pt}{3pt}

% Custom list formatting
\\setlist[itemize]{leftmargin=*,topsep=0pt,itemsep=0pt,parsep=0pt}

\\begin{document}

% Header
\\begin{center}
    {\\Huge\\bfseries\\color{primary}<<NAME>>}\\\\[0.5em]
    {\\large\\color{secondary}<<TITLE>>}\\\\[0.5em]
    \\faPhone\\ <<PHONE>> \\quad
    \\faEnvelope\\ \\href{mailto:<<EMAIL>>}{<<EMAIL>>} \\quad
    \\faLinkedin\\ \\href{https://linkedin.com/in/<<LINKEDIN>>}{<<LINKEDIN>>} \\quad
    \\faGithub\\ \\href{https://github.com/<<GITHUB>>}{<<GITHUB>>}
\\end{center}

\\vspace{0.5em}

% Summary
\\section{Summary}
<<SUMMARY>>

% Skills
\\section{Technical Skills}
\\textbf{Languages:} <<LANGUAGES>>\\\\[0.3em]
\\textbf{Frameworks \\& Libraries:} <<FRAMEWORKS>>\\\\[0.3em]
\\textbf{Tools \\& Technologies:} <<TOOLS>>

% Experience
\\section{Professional Experience}
<<EXPERIENCE>>

% Education
\\section{Education}
<<EDUCATION>>

% Projects
\\section{Projects}
<<PROJECTS>>

\\end{document}`,
        'professional-resume.tex': `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

% dynamic style overrides
<<STYLE_BLOCK>>

\\pagestyle{empty}

\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{5pt}

\\begin{document}

\\begin{center}
    {\\LARGE \\textbf{<<NAME>>}} \\\\
    <<TITLE>> \\\\
    <<EMAIL>> | <<PHONE>> | <<LOCATION>> \\\\
    LinkedIn: <<LINKEDIN>> | GitHub: <<GITHUB>>
\\end{center}

\\section{Summary}
<<SUMMARY>>

\\section{Technical Skills}
\\begin{itemize}[leftmargin=*]
    \\item \\textbf{Languages:} <<LANGUAGES>>
    \\item \\textbf{Frameworks:} <<FRAMEWORKS>>
    \\item \\textbf{Tools:} <<TOOLS>>
\\end{itemize}

\\section{Experience}
<<EXPERIENCE>>

\\section{Education}
<<EDUCATION>>

\\section{Projects}
<<PROJECTS>>

\\end{document}`
      }

      return templates[templateFile] || templates['classic-resume.tex']
    } catch (error) {
      console.error('Error loading template:', error)
      throw error
    }
  }

  static processTemplate(template, resumeData, style = {}, templateName = 'modern') {
    let processed = template

    // Inject dynamic style block
    const styleBlock = this.buildStyleBlock(style, templateName)
    processed = processed.replace('<<STYLE_BLOCK>>', styleBlock)

    // Extract skills from store structure
    const skillsSection = resumeData.sections?.find(s => s.id === 'skills')
    const skillsList = Array.isArray(skillsSection?.items) ? skillsSection.items : []
    
    // Basic categorization logic (fallback since store is flat list)
    const languages = skillsList.slice(0, Math.ceil(skillsList.length / 3)).join(', ')
    const frameworks = skillsList.slice(Math.ceil(skillsList.length / 3), Math.ceil(2 * skillsList.length / 3)).join(', ')
    const tools = skillsList.slice(Math.ceil(2 * skillsList.length / 3)).join(', ')

    // Replace basic placeholders
    const replacements = {
      '<<NAME>>': resumeData.personalInfo?.name || 'Your Name',
      '<<TITLE>>': resumeData.personalInfo?.title || 'Software Engineer',
      '<<ADDRESS>>': resumeData.personalInfo?.location || 'Your City, State',
      '<<PHONE>>': resumeData.personalInfo?.phone || 'Your Phone',
      '<<EMAIL>>': resumeData.personalInfo?.email || 'your.email@example.com',
      '<<LINKEDIN>>': resumeData.personalInfo?.linkedin || '',
      '<<GITHUB>>': resumeData.personalInfo?.github || '',
      '<<LOCATION>>': resumeData.personalInfo?.location || 'Your City, State',
      '<<SUMMARY>>': resumeData.sections?.find(s => s.id === 'summary')?.content || 'Professional summary goes here.',
      '<<LANGUAGES>>': languages || 'JavaScript, Python, Java',
      '<<FRAMEWORKS>>': frameworks || 'React, Node.js, Express',
      '<<TOOLS>>': tools || 'Git, Docker, AWS'
    }

    // Apply basic replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processed = processed.replace(new RegExp(placeholder, 'g'), value)
    })

    // Process experience section
    const experienceSection = resumeData.sections?.find(s => s.id === 'experience')
    processed = this.processExperience(processed, experienceSection?.items || [], style, templateName)
    
    // Process education section
    const educationSection = resumeData.sections?.find(s => s.id === 'education')
    processed = this.processEducation(processed, educationSection?.items || [], templateName)
    
    // Process projects section
    const projectsSection = resumeData.sections?.find(s => s.id === 'projects')
    processed = this.processProjects(processed, projectsSection?.items || [], templateName)

    return processed
  }

  static processExperience(template, experience, style = {}, templateName) {
    if (!experience || experience.length === 0) {
      return template.replace('<<EXPERIENCE>>', '')
    }

    let experienceSection = ''
    
    experience.forEach(exp => {
      if (templateName === 'modern' || templateName === 'altacv') {
          experienceSection += `\\cventry{${exp.startDate || ''} -- ${exp.endDate || 'Present'}}{${exp.role || 'Position'}}{${exp.company || 'Company'}}{${exp.location || 'Location'}}{}{`
      } else {
          // Classic/Professional/Clean Article styles
          experienceSection += `\\textbf{${exp.role || 'Position'}} \\hfill ${exp.startDate || ''} -- ${exp.endDate || 'Present'} \\\\
          \\textit{${exp.company || 'Company'}, ${exp.location || 'Location'}} \\\\
          `
      }
      
      const achievements = Array.isArray(exp.bullets) ? exp.bullets : []
      if (achievements.length > 0) {
        const itemSep = Number.isFinite(style.itemSpacingPt) ? style.itemSpacingPt : 2
        const topSep = Number.isFinite(style.listTopSepPt) ? style.listTopSepPt : 2
        const leftMargin = style.listLeftMargin || '*'
        experienceSection += `\\begin{itemize}[leftmargin=${leftMargin}, itemsep=${itemSep}pt, topsep=${topSep}pt, parsep=0pt]\n`
        achievements.forEach(achievement => {
          experienceSection += `\\item ${achievement}\n`
        })
        experienceSection += `\\end{itemize}\n`
      }
      
      if (templateName === 'modern' || templateName === 'altacv') {
          experienceSection += '}\n\n'
      } else {
          experienceSection += '\n\\vspace{5pt}\n'
      }
    })

    return template.replace('<<EXPERIENCE>>', experienceSection)
  }

  static processEducation(template, education, templateName) {
    if (!education || education.length === 0) {
      return template.replace('<<EDUCATION>>', '')
    }

    let educationSection = ''
    
    education.forEach(edu => {
        if (templateName === 'modern' || templateName === 'altacv') {
            educationSection += `\\cventry{${edu.year || 'Year'}}{${edu.degree || 'Degree'}}{${edu.school || 'University'}}{${edu.location || 'Location'}}{${edu.gpa ? `GPA: ${edu.gpa}` : ''}}{}\n`
        } else {
            educationSection += `\\textbf{${edu.school || 'University'}} \\hfill ${edu.location || 'Location'} \\\\
            ${edu.degree || 'Degree'} \\hfill ${edu.year || 'Year'} \\\\
            ${edu.gpa ? `GPA: ${edu.gpa}` : ''}\n`
        }
    })

    return template.replace('<<EDUCATION>>', educationSection)
  }

  static processProjects(template, projects, templateName) {
    if (!projects || projects.length === 0) {
      return template.replace('<<PROJECTS>>', '')
    }

    let projectsSection = ''
    
    projects.forEach(project => {
        if (templateName === 'modern' || templateName === 'altacv') {
            projectsSection += `\\cventry{${project.year || ''}}{${project.title || 'Project Name'}}{${project.subtitle || ''}}{}{}{${project.description || 'Project description.'}}\n\n`
        } else {
            projectsSection += `\\textbf{${project.title || 'Project Name'}} \\hfill ${project.year || ''} \\\\
            \\textit{${project.subtitle || ''}} \\\\
            ${project.description || 'Project description.'}\n\\vspace{5pt}\n`
        }
    })

    return template.replace('<<PROJECTS>>', projectsSection)
  }

  static async downloadLaTeX(resumeData, templateName = 'modern', filename = 'resume.tex') {
    try {
      const { content } = await this.generateLaTeX(resumeData, templateName)
      
      // Create and download .tex file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Error downloading LaTeX:', error)
      throw error
    }
  }

  static async compileToPDF(resumeData, templateName = 'modern') {
    try {
      // In a real implementation, you would send the LaTeX content to a compilation service
      // For now, we'll return the LaTeX content and instructions
      const { content, template } = await this.generateLaTeX(resumeData, templateName)
      
      return {
        latexContent: content,
        template: template,
        instructions: `
To compile this LaTeX resume to PDF:

1. Copy the LaTeX content below
2. Go to Overleaf.com and create a new project
3. Paste the content into the main .tex file
4. Make sure to include the required class files (${template.class})
5. Click "Compile" to generate the PDF
6. Download the PDF from Overleaf

Alternatively, if you have LaTeX installed locally:
1. Save the content as a .tex file
2. Run: pdflatex filename.tex
3. The PDF will be generated automatically
        `
      }
    } catch (error) {
      console.error('Error compiling LaTeX:', error)
      throw error
    }
  }

  static getAvailableTemplates() {
    return Object.entries(this.templates).map(([key, template]) => ({
      id: key,
      ...template
    }))
  }

  static buildStyleBlock(style = {}, templateName = 'modern') {
    const marginInches = typeof style.marginInches === 'number' ? style.marginInches : undefined
    const lineSpacing = typeof style.lineSpacing === 'number' ? style.lineSpacing : 1.2
    const sectionSpacingPt = typeof style.sectionSpacingPt === 'number' ? style.sectionSpacingPt : 12
    const itemSepPt = typeof style.itemSpacingPt === 'number' ? style.itemSpacingPt : 2
    const topSepPt = typeof style.listTopSepPt === 'number' ? style.listTopSepPt : 2
    const leftMargin = style.listLeftMargin || '*'
    const bulletStyle = style.bulletStyle || 'bullet'
    const bulletMap = {
      bullet: '\\textbullet',
      dash: '–',
      arrow: '→'
    }
    const bulletCmd = bulletMap[bulletStyle] || '\\textbullet'

    const lines = []
    lines.push('% === dynamic style block (injected) ===')
    lines.push('\\usepackage{enumitem}')
    if (marginInches) {
      // prefer geometry margin override where applicable
      lines.push(`\\usepackage[margin=${marginInches}in]{geometry}`)
    }
    lines.push(`\\linespread{${lineSpacing}}`)
    lines.push(`\\setlist[itemize]{leftmargin=${leftMargin}, itemsep=${itemSepPt}pt, topsep=${topSepPt}pt, parsep=0pt, partopsep=0pt}`)
    lines.push(`\\renewcommand\\labelitemi{${bulletCmd}}`)
    // gentle section additional spacing (may be ignored by some classes)
    lines.push('\\makeatletter')
    lines.push(`\\g@addto@macro\\section{\\vspace{${sectionSpacingPt}pt}}`)
    lines.push('\\makeatother')
    lines.push('% === end dynamic style block ===')

    return lines.join('\n')
  }
}
