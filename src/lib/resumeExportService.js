// Dynamic imports to handle missing packages gracefully
let jsPDF = null
let Document = null
let Packer = null
let Paragraph = null
let TextRun = null
let HeadingLevel = null
let AlignmentType = null
let saveAs = null

// Initialize packages
const initializePackages = async () => {
  try {
    if (!jsPDF) {
      const jsPDFModule = await import('jspdf')
      jsPDF = jsPDFModule.default
    }
    if (!Document) {
      const docxModule = await import('docx')
      Document = docxModule.Document
      Packer = docxModule.Packer
      Paragraph = docxModule.Paragraph
      TextRun = docxModule.TextRun
      HeadingLevel = docxModule.HeadingLevel
      AlignmentType = docxModule.AlignmentType
    }
    if (!saveAs) {
      const fileSaverModule = await import('file-saver')
      saveAs = fileSaverModule.saveAs
    }
  } catch (error) {
    console.warn('Export packages not available:', error)
  }
}

export class ResumeExportService {
  static async generatePDF(resumeData, style = {}) {
    try {
      await initializePackages()
      if (!jsPDF) {
        throw new Error('jsPDF not available')
      }
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = style.margin || 1
      const fontSize = style.fontSize || 11
      const lineHeight = style.lineSpacing || 1.2

      // Set font
      doc.setFont('helvetica')
      doc.setFontSize(fontSize)

      let yPosition = margin * 20 // Convert inches to points

      // Helper function to add text with word wrap
      const addText = (text, x, y, maxWidth, fontSize = fontSize, isBold = false) => {
        doc.setFontSize(fontSize)
        if (isBold) {
          doc.setFont('helvetica', 'bold')
        } else {
          doc.setFont('helvetica', 'normal')
        }

        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + (lines.length * fontSize * lineHeight)
      }

      // Header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(resumeData.personalInfo.name, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      // Contact Info
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const contactInfo = [
        resumeData.personalInfo.phone,
        resumeData.personalInfo.email,
        resumeData.personalInfo.linkedin,
        resumeData.personalInfo.github
      ].filter(Boolean).join(' • ')

      doc.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Summary
      if (resumeData.summary) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('SUMMARY', margin * 20, yPosition)
        yPosition += 8

        doc.setFontSize(fontSize)
        doc.setFont('helvetica', 'normal')
        yPosition = addText(
          resumeData.summary,
          margin * 20,
          yPosition,
          pageWidth - (margin * 40)
        ) + 5
      }

      // Skills
      if (resumeData.skills) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('SKILLS', margin * 20, yPosition)
        yPosition += 8

        doc.setFontSize(fontSize)
        doc.setFont('helvetica', 'normal')

        if (resumeData.skills.languages) {
          doc.setFont('helvetica', 'bold')
          doc.text('Languages & Databases: ', margin * 20, yPosition)
          doc.setFont('helvetica', 'normal')
          const skillStrings = resumeData.skills.languages.map(s => typeof s === 'string' ? s : (s.name || s.skill || ''))
          doc.text(skillStrings.join(', '), margin * 20 + 60, yPosition)
          yPosition += 6
        }

        if (resumeData.skills.frameworks) {
          doc.setFont('helvetica', 'bold')
          doc.text('Frameworks and Libraries: ', margin * 20, yPosition)
          doc.setFont('helvetica', 'normal')
          const skillStrings = resumeData.skills.frameworks.map(s => typeof s === 'string' ? s : (s.name || s.skill || ''))
          doc.text(skillStrings.join(', '), margin * 20 + 60, yPosition)
          yPosition += 6
        }

        if (resumeData.skills.tools) {
          doc.setFont('helvetica', 'bold')
          doc.text('Developer Tools: ', margin * 20, yPosition)
          doc.setFont('helvetica', 'normal')
          const skillStrings = resumeData.skills.tools.map(s => typeof s === 'string' ? s : (s.name || s.skill || ''))
          doc.text(skillStrings.join(', '), margin * 20 + 60, yPosition)
          yPosition += 6
        }
        yPosition += 5
      }

      // Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('PROFESSIONAL EXPERIENCE', margin * 20, yPosition)
        yPosition += 8

        resumeData.experience.forEach(exp => {
          doc.setFontSize(fontSize)
          doc.setFont('helvetica', 'bold')
          doc.text(exp.position, margin * 20, yPosition)
          doc.setFont('helvetica', 'normal')
          doc.text(exp.duration, pageWidth - margin * 20 - 50, yPosition, { align: 'right' })
          yPosition += 5

          doc.setFont('helvetica', 'normal')
          doc.text(exp.company, margin * 20, yPosition)
          yPosition += 8

          if (exp.achievements) {
            exp.achievements.forEach(achievement => {
              doc.text('• ' + achievement, margin * 20 + 10, yPosition)
              yPosition += 5
            })
          }
          yPosition += 5
        })
      }

      // Education
      if (resumeData.education) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('EDUCATION', margin * 20, yPosition)
        yPosition += 8

        doc.setFontSize(fontSize)
        doc.setFont('helvetica', 'bold')
        doc.text(resumeData.education.degree, margin * 20, yPosition)
        yPosition += 5

        doc.setFont('helvetica', 'normal')
        doc.text(resumeData.education.university, margin * 20, yPosition)
        yPosition += 5

        doc.text(`${resumeData.education.year} • GPA: ${resumeData.education.gpa}`, margin * 20, yPosition)
        yPosition += 10
      }

      // Projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('PROJECTS', margin * 20, yPosition)
        yPosition += 8

        resumeData.projects.forEach(project => {
          doc.setFontSize(fontSize)
          doc.setFont('helvetica', 'bold')
          doc.text(project.name, margin * 20, yPosition)
          yPosition += 5

          doc.setFont('helvetica', 'normal')
          doc.text(project.description, margin * 20, yPosition)
          yPosition += 5

          if (project.technologies) {
            doc.text(`Technologies: ${project.technologies.join(', ')}`, margin * 20, yPosition)
            yPosition += 8
          }
        })
      }

      return doc
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  static async downloadPDF(resumeData, filename = 'resume.pdf', style = {}) {
    try {
      const doc = await this.generatePDF(resumeData, style)
      doc.save(filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw error
    }
  }

  static async generateDOCX(resumeData, style = {}) {
    try {
      await initializePackages()
      if (!Document) {
        throw new Error('DOCX package not available')
      }
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.personalInfo.name,
                  bold: true,
                  size: 32
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            // Contact Info
            new Paragraph({
              children: [
                new TextRun({
                  text: [
                    resumeData.personalInfo.phone,
                    resumeData.personalInfo.email,
                    resumeData.personalInfo.linkedin,
                    resumeData.personalInfo.github
                  ].filter(Boolean).join(' • '),
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),

            // Summary
            ...(resumeData.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SUMMARY',
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 200, after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeData.summary,
                    size: 22
                  })
                ],
                spacing: { after: 200 }
              })
            ] : []),

            // Skills
            ...(resumeData.skills ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SKILLS',
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 200, after: 200 }
              }),
              ...(resumeData.skills.languages ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Languages & Databases: ',
                      bold: true,
                      size: 22
                    }),
                    new TextRun({
                      text: resumeData.skills.languages.map(s => typeof s === 'string' ? s : (s.name || s.skill || '')).join(', '),
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                })
              ] : []),
              ...(resumeData.skills.frameworks ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Frameworks and Libraries: ',
                      bold: true,
                      size: 22
                    }),
                    new TextRun({
                      text: resumeData.skills.frameworks.map(s => typeof s === 'string' ? s : (s.name || s.skill || '')).join(', '),
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                })
              ] : []),
              ...(resumeData.skills.tools ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Developer Tools: ',
                      bold: true,
                      size: 22
                    }),
                    new TextRun({
                      text: resumeData.skills.tools.map(s => typeof s === 'string' ? s : (s.name || s.skill || '')).join(', '),
                      size: 22
                    })
                  ],
                  spacing: { after: 200 }
                })
              ] : [])
            ] : []),

            // Experience
            ...(resumeData.experience && resumeData.experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PROFESSIONAL EXPERIENCE',
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 200, after: 200 }
              }),
              ...resumeData.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.position,
                      bold: true,
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.company,
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                }),
                ...(exp.achievements ? exp.achievements.map(achievement =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ' + achievement,
                        size: 22
                      })
                    ],
                    spacing: { after: 100 }
                  })
                ) : []),
                new Paragraph({
                  children: [new TextRun({ text: '' })],
                  spacing: { after: 200 }
                })
              ])
            ] : []),

            // Education
            ...(resumeData.education ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'EDUCATION',
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 200, after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeData.education.degree,
                    bold: true,
                    size: 22
                  })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeData.education.university,
                    size: 22
                  })
                ],
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${resumeData.education.year} • GPA: ${resumeData.education.gpa}`,
                    size: 22
                  })
                ],
                spacing: { after: 200 }
              })
            ] : []),

            // Projects
            ...(resumeData.projects && resumeData.projects.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'PROJECTS',
                    bold: true,
                    size: 24
                  })
                ],
                spacing: { before: 200, after: 200 }
              }),
              ...resumeData.projects.flatMap(project => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.name,
                      bold: true,
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.description,
                      size: 22
                    })
                  ],
                  spacing: { after: 100 }
                }),
                ...(project.technologies ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Technologies: ${project.technologies.join(', ')}`,
                        size: 22
                      })
                    ],
                    spacing: { after: 200 }
                  })
                ] : [])
              ])
            ] : [])
          ]
        }]
      })

      return doc
    } catch (error) {
      console.error('Error generating DOCX:', error)
      throw error
    }
  }

  static async downloadDOCX(resumeData, filename = 'resume.docx', style = {}) {
    try {
      await initializePackages()
      if (!Packer || !saveAs) {
        throw new Error('DOCX export packages not available')
      }
      const doc = await this.generateDOCX(resumeData, style)
      const buffer = await Packer.toBuffer(doc)
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error downloading DOCX:', error)
      throw error
    }
  }
}
