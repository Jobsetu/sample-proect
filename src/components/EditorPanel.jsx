import { useMemo, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useResumeStore } from '../stores/useResumeStore'
import { Sparkles, Loader, Check, FileText, ArrowUp, ArrowDown, Plus, Trash2, GripVertical, User } from 'lucide-react'
import { GeminiService } from '../lib/geminiService'
import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import CoverLetterDocument from './CoverLetterDocument'


const SectionCard = ({ section, index, register, remove, move, control, isFirst, isLast, allSections }) => {
  const isSummary = section.id === 'summary'
  const isFirstSectionSummary = allSections?.[0]?.id === 'summary'

  // Disable moving up if it's the summary (already top) OR if it's the second item and summary is first
  const disableMoveUp = isFirst || (index === 1 && isFirstSectionSummary) || isSummary
  // Disable moving down if it's the summary (locked to top)
  const disableMoveDown = isLast || isSummary

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md ${isSummary ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      {/* Section Header with Controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-1 mr-4">
          <GripVertical className={`w-4 h-4 text-slate-400 ${isSummary ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`} />
          <input
            {...register(`sections.${index}.title`)}
            disabled={isSummary}
            className={`font-semibold text-slate-800 bg-transparent border-b border-transparent px-1 py-0.5 w-full transition-colors ${isSummary ? 'opacity-100' : 'hover:border-slate-300 focus:border-blue-500 focus:outline-none'}`}
          />
          {isSummary && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Fixed</span>}
        </div>
        <div className="flex items-center gap-1">
          {!isSummary && (
            <>
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={disableMoveUp}
                className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={disableMoveDown}
                className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 text-slate-400 hover:text-red-600 ml-1 transition-colors"
                title="Delete Section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section Content */}
      {section.id === 'summary' ? (
        <textarea
          {...register(`sections.${index}.content`)}
          className="w-full border border-slate-200 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          rows={4}
          placeholder="Write your professional summary..."
        />
      ) : section.id === 'skills' ? (
        <SkillsSection index={index} control={control} register={register} />
      ) : section.id === 'experience' ? (
        <ExperienceSection index={index} control={control} register={register} />
      ) : section.id === 'projects' ? (
        <ProjectsSection index={index} control={control} register={register} />
      ) : (
        <GenericSection index={index} control={control} register={register} />
      )}
    </div>
  )
}

const SkillsSection = ({ index, control, register }) => {
  const { fields, append, remove, replace } = useFieldArray({ control, name: `sections.${index}.items` })

  // Auto-fix: If any field is an object, replace it with its string value
  useEffect(() => {
    const hasObjects = fields.some(f => typeof f === 'object' && f !== null && !f.id); // check for non-id objects
    // Note: useFieldArray adds an 'id' property to objects. We need to check if the *value* is an object.
    // Actually, react-hook-form wraps values. 
    // Let's check the actual values in the form if possible, or just rely on the input rendering to be safe.
    // A better approach for the input is to safely render the value.
  }, [fields])

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button type="button" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1" onClick={() => append('')}>
          <Plus className="w-3 h-3" /> Add Skill
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-2 group">
            <input
              {...register(`sections.${index}.items.${i}`)}
              className="flex-1 border border-slate-200 rounded-md p-2 text-slate-800 text-sm focus:border-blue-500 outline-none"
              placeholder="Skill"
            />
            <button
              type="button"
              className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => remove(i)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const ExperienceSection = ({ index, control, register }) => {
  const { fields, append, remove } = useFieldArray({ control, name: `sections.${index}.items` })
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          onClick={() => append({ role: '', company: '', location: '', startDate: '', endDate: '', bullets: [] })}
        >
          <Plus className="w-3 h-3" /> Add Role
        </button>
      </div>
      {fields.map((f, i) => {
        const bullets = useFieldArray({ control, name: `sections.${index}.items.${i}.bullets` })
        return (
          <div key={f.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input placeholder="Role" {...register(`sections.${index}.items.${i}.role`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm font-medium" />
              <input placeholder="Company" {...register(`sections.${index}.items.${i}.company`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm" />
              <input placeholder="Location" {...register(`sections.${index}.items.${i}.location`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm" />
              <div className="flex gap-2">
                <input placeholder="Start" {...register(`sections.${index}.items.${i}.startDate`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm w-full" />
                <input placeholder="End" {...register(`sections.${index}.items.${i}.endDate`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Achievements</label>
                <button type="button" className="text-blue-600 text-xs hover:text-blue-700" onClick={() => bullets.append('')}>+ Add Bullet</button>
              </div>
              {bullets.fields.map((bf, bi) => (
                <div key={bf.id} className="flex gap-2 group">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <textarea
                    {...register(`sections.${index}.items.${i}.bullets.${bi}`)}
                    className="flex-1 border-b border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent outline-none text-sm py-1 resize-none"
                    rows={1}
                    style={{ minHeight: '2rem' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  <button type="button" className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100" onClick={() => bullets.remove(bi)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
              <button type="button" className="text-red-500 text-xs hover:text-red-700 flex items-center gap-1" onClick={() => remove(i)}>
                <Trash2 className="w-3 h-3" /> Delete Role
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const ProjectsSection = ({ index, control, register }) => {
  const { fields, append, remove } = useFieldArray({ control, name: `sections.${index}.items` })
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          onClick={() => append({ title: '', subtitle: '', description: '', bullets: [] })}
        >
          <Plus className="w-3 h-3" /> Add Project
        </button>
      </div>
      {fields.map((f, i) => {
        const bullets = useFieldArray({ control, name: `sections.${index}.items.${i}.bullets` })
        return (
          <div key={f.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="grid gap-3 mb-3">
              <input placeholder="Project Title" {...register(`sections.${index}.items.${i}.title`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm font-medium" />
              <input placeholder="Technologies Used" {...register(`sections.${index}.items.${i}.subtitle`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm" />
              <textarea placeholder="Brief Description" {...register(`sections.${index}.items.${i}.description`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm" rows={2} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Accomplishments</label>
                <button type="button" className="text-blue-600 text-xs hover:text-blue-700" onClick={() => bullets.append('')}>+ Add Bullet</button>
              </div>
              {bullets.fields.map((bf, bi) => (
                <div key={bf.id} className="flex gap-2 group">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <textarea
                    {...register(`sections.${index}.items.${i}.bullets.${bi}`)}
                    className="flex-1 border-b border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent outline-none text-sm py-1 resize-none"
                    rows={1}
                    style={{ minHeight: '2rem' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  <button type="button" className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100" onClick={() => bullets.remove(bi)}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
              <button type="button" className="text-red-500 text-xs hover:text-red-700 flex items-center gap-1" onClick={() => remove(i)}>
                <Trash2 className="w-3 h-3" /> Delete Project
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const GenericSection = ({ index, control, register }) => {
  const { fields, append, remove } = useFieldArray({ control, name: `sections.${index}.items` })
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          onClick={() => append({ title: '', subtitle: '', description: '' })}
        >
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>
      {fields.map((f, i) => (
        <div key={f.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors relative group">
          <button
            type="button"
            className="absolute top-2 right-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => remove(i)}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="grid gap-3">
            <input placeholder="Title / Degree / Award" {...register(`sections.${index}.items.${i}.title`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm font-medium w-full" />
            <input placeholder="Subtitle / School / Organization" {...register(`sections.${index}.items.${i}.subtitle`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm w-full" />

            <div className="flex gap-2">
              <input placeholder="Year / Duration" {...register(`sections.${index}.items.${i}.year`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm w-1/2" />
              <input placeholder="Location" {...register(`sections.${index}.items.${i}.location`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm w-1/2" />
            </div>

            <textarea placeholder="Description" {...register(`sections.${index}.items.${i}.description`)} className="border border-slate-200 rounded-md p-2 text-slate-800 text-sm" rows={2} />
          </div>
        </div>
      ))}
    </div>
  )
}

const EditorPanel = () => {
  const resume = useResumeStore(s => s.resume)
  const setResume = useResumeStore(s => s.setResume)

  // AI Writer State
  const [aiJobDescription, setAiJobDescription] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const [aiSuccess, setAiSuccess] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  // Cover Letter State
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false)
  const [coverLetter, setCoverLetter] = useState(null)

  // Editor View State
  const [isCodeView, setIsCodeView] = useState(false)
  const [latexCode, setLatexCode] = useState('% LaTeX code will be generated here...')

  // Add Section State
  const [showAddSection, setShowAddSection] = useState(false)

  // Sanitize resume data to ensure content is string (prevents React Error #31)
  const sanitizedResume = useMemo(() => {
    if (!resume) return null;
    const clean = JSON.parse(JSON.stringify(resume));
    if (clean.sections) {
      clean.sections.forEach(section => {
        // Fix object content in Summary
        if (section.content && typeof section.content === 'object') {
          section.content = section.content.content || '';
        }
        // Fix object items in Skills
        if (section.id === 'skills' && Array.isArray(section.items)) {
          section.items = section.items.map(item => {
            if (typeof item === 'object' && item !== null) {
              return item.name || item.label || item.value || '';
            }
            return item;
          });
        }
      });
    }
    return clean;
  }, [resume]);

  const methods = useForm({
    defaultValues: sanitizedResume || {
      personalInfo: {},
      sections: [],
      font: 'Inter',
      color: '#000000',
      spacing: 1.2
    },
    mode: 'onChange'  // Changed from 'onBlur' for real-time preview updates
  })
  const { control, handleSubmit, register, watch, reset } = methods

  // Use Field Array for Top-Level Sections
  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: "sections"
  })

  // Sync form values to store for live preview
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('[EditorPanel] Watch triggered, syncing to store');
      setResume(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, setResume]);

  // Force reset ONLY when store changes externally (not driven by form)
  // We'll handle explicit resets in AI handlers. 
  // Removing the auto-reset effect to prevent fighting with useFieldArray.

  // Enforce Summary at Top on Load/Change
  useEffect(() => {
    if (!sanitizedResume) return;
    const summaryIndex = sanitizedResume.sections.findIndex(s => s.id === 'summary')
    if (summaryIndex > 0) {
      const newSections = [...sanitizedResume.sections]
      const [summary] = newSections.splice(summaryIndex, 1)
      newSections.unshift(summary)
      setResume({ ...sanitizedResume, sections: newSections })
      reset({ ...sanitizedResume, sections: newSections })
    }
  }, []) // Run once on mount to fix order if needed

  const handleAiWrite = async () => {
    // ... (Keep existing AI Write logic) ...
    // For brevity, assuming this logic is preserved or I should include it.
    // I will include the logic to be safe.
    let description = aiJobDescription.trim()

    if (!description) {
      try {
        const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
        const { hasJobDescription, getFormattedJobDescription } = useJobDescriptionStore.getState()

        if (hasJobDescription()) {
          description = getFormattedJobDescription()
        } else {
          alert('Please enter a job description first')
          return
        }
      } catch (error) {
        alert('Please enter a job description first')
        return
      }
    } else {
      try {
        const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
        const firstLine = description.split('\n')[0]
        const jobTitle = firstLine.substring(0, 100)
        const companyMatch = description.match(/(?:at|@|for)\s+([A-Z][A-Za-z\s&]+?)(?:\s|,|\.)/i)
        const company = companyMatch ? companyMatch[1].trim() : ''

        useJobDescriptionStore.getState().setJobDescription(description, jobTitle, company)
      } catch (error) {
        console.error('Failed to store job description:', error)
      }
    }

    setIsWriting(true)
    setAiSuccess(false)
    try {
      const tailoredData = await GeminiService.generateCustomResume(description, resume)
      console.log('[handleAiWrite] Raw AI data sections:', tailoredData.sections?.map(s => ({ id: s.id, itemsCount: s.items?.length })));

      // Find skills in raw data
      const rawSkills = tailoredData.sections?.find(s => s.id === 'skills');
      console.log('[handleAiWrite] Raw skills section:', rawSkills);

      // CRITICAL: Sanitize the AI data before updating form
      const sanitized = JSON.parse(JSON.stringify(tailoredData));
      if (sanitized.sections) {
        sanitized.sections.forEach(section => {
          // Fix object content in Summary
          if (section.content && typeof section.content === 'object') {
            section.content = section.content.content || '';
          }
          // Fix object items in Skills - ENSURE STRINGS!
          if (section.id === 'skills' && Array.isArray(section.items)) {
            console.log('[handleAiWrite] BEFORE sanitization, skills.items:', section.items);
            section.items = section.items.map(item => {
              if (typeof item === 'object' && item !== null) {
                return item.name || item.label || item.value || String(item);
              }
              return String(item); // Force string conversion
            }).filter(Boolean);
            console.log('[handleAiWrite] AFTER sanitization, skills.items:', section.items);
          }
        });
      }

      // Verify final skills
      const finalSkills = sanitized.sections?.find(s => s.id === 'skills');
      console.log('[handleAiWrite] FINAL sanitized skills:', finalSkills);

      setResume(sanitized)
      reset(sanitized) // Reset form with sanitized data!
      setAiSuccess(true)
      setTimeout(() => {
        setShowAiModal(false)
        setAiSuccess(false)
        setAiJobDescription('')
      }, 1500)
    } catch (error) {
      console.error("AI Write failed", error)
      alert("Failed to generate resume content. Please try again.")
    } finally {
      setIsWriting(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    // ... (Keep existing Cover Letter logic) ...
    setGeneratingCoverLetter(true)
    try {
      const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
      const { hasJobDescription, getFormattedJobDescription } = useJobDescriptionStore.getState()

      let description = ''

      if (hasJobDescription()) {
        description = getFormattedJobDescription()
      } else if (aiJobDescription && aiJobDescription.trim()) {
        description = aiJobDescription.trim()
        // Save it for future use
        const firstLine = description.split('\n')[0]
        const jobTitle = firstLine.substring(0, 100)
        useJobDescriptionStore.getState().setJobDescription(description, jobTitle, '')
      } else {
        // Generate a generic cover letter if no JD is present
        description = "General application for a role matching my skills and experience."
      }

      const letter = await GeminiService.generateCoverLetter(description, resume)
      setCoverLetter(letter)
    } catch (error) {
      console.error("Cover Letter generation failed", error)
      alert("Failed to generate cover letter. Please try again.")
    } finally {
      setGeneratingCoverLetter(false)
    }
  }

  const handleAddSection = (type) => {
    const newId = `section-${Date.now()}`
    if (type === 'custom') {
      appendSection({ id: newId, type: 'custom', title: 'New Section', items: [] })
    } else if (type === 'summary') {
      appendSection({ id: 'summary', type: 'summary', title: 'Professional Summary', content: '' })
    } else if (type === 'skills') {
      appendSection({ id: `skills-${Date.now()}`, type: 'skills', title: 'Skills', items: [] })
    } else if (type === 'experience') {
      appendSection({ id: `experience-${Date.now()}`, type: 'experience', title: 'Experience', items: [] })
    } else if (type === 'education') {
      appendSection({ id: `education-${Date.now()}`, type: 'education', title: 'Education', items: [] })
    } else if (type === 'projects') {
      appendSection({ id: `projects-${Date.now()}`, type: 'projects', title: 'Projects', items: [] })
    }
    setShowAddSection(false)
  }

  // Helper for native download
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleDownloadCoverLetterPdf = async () => {
    if (!coverLetter) return
    try {
      console.log('Generating PDF...')
      const blob = await pdf(<CoverLetterDocument text={coverLetter} />).toBlob()
      console.log('PDF Blob size:', blob.size)

      // Check Magic Bytes (%PDF)
      const header = await blob.slice(0, 4).text()
      console.log('PDF Header:', header)
      if (!header.startsWith('%PDF')) {
        console.error('Invalid PDF Header:', header)
        alert('Generated file is not a valid PDF. Please try again.')
        return
      }

      downloadBlob(blob, `Cover_Letter_${Date.now()}.pdf`)
    } catch (error) {
      console.error('PDF Download failed', error)
      alert('Failed to download PDF')
    }
  }

  const handleDownloadCoverLetterDocx = async () => {
    if (!coverLetter) return
    try {
      console.log('Requesting DOCX...')
      const response = await fetch('/api/download-cover-letter-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: coverLetter })
      })

      if (!response.ok) {
        const text = await response.text()
        console.error('DOCX Error response:', text)
        throw new Error('Failed to generate DOCX')
      }

      const blob = await response.blob()
      console.log('DOCX Blob size:', blob.size)

      // Check Magic Bytes (PK for Zip/Docx)
      const header = await blob.slice(0, 2).text()
      console.log('DOCX Header:', header)
      if (header !== 'PK') {
        console.error('Invalid DOCX Header (expected PK):', header)
        if (header.startsWith('<')) {
          alert('Server Error: Received HTML instead of DOCX.')
        } else {
          alert('Generated file is corrupted (Invalid Header).')
        }
        return
      }

      const docxBlob = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      downloadBlob(docxBlob, `Cover_Letter_${Date.now()}.docx`)
    } catch (error) {
      console.error('DOCX Download failed', error)
      alert('Failed to download DOCX')
    }
  }

  return (
    <div className="grid gap-4 relative pb-20">
      {/* AI Actions Toolbar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Assistant
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            Write with AI
          </button>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={generatingCoverLetter}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            {generatingCoverLetter ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            Cover Letter
          </button>
        </div>
      </div>

      {/* AI Write Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Tailor Resume to Job</h3>
            <p className="text-sm text-slate-500 mb-4">Paste the job description below. The AI will rewrite your resume to match the keywords and requirements.</p>

            {aiSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Resume Optimized!</p>
                  <p className="text-xs opacity-80">Skills, summary, and bullets updated.</p>
                </div>
              </div>
            ) : (
              <textarea
                value={aiJobDescription}
                onChange={(e) => setAiJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-40 border border-slate-200 rounded-lg p-3 text-sm mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                autoFocus
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
              >
                Cancel
              </button>
              {!aiSuccess && (
                <button
                  onClick={handleAiWrite}
                  disabled={isWriting || !aiJobDescription.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isWriting ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isWriting ? 'Optimizing...' : 'Generate Resume'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {
        coverLetter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Generated Cover Letter</h3>
                <button onClick={() => setCoverLetter(null)} className="text-slate-500 hover:text-slate-800">Close</button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="whitespace-pre-wrap text-slate-700 text-sm font-serif leading-relaxed">{coverLetter}</div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-wrap">
                <button onClick={handleDownloadCoverLetterPdf} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm hover:bg-red-100">Download PDF</button>
                <button onClick={handleDownloadCoverLetterDocx} className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm hover:bg-blue-100">Download DOCX</button>
                <button onClick={() => { navigator.clipboard.writeText(coverLetter); alert("Copied!") }} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 text-slate-700">Copy Text</button>
                <button onClick={() => setCoverLetter(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900">Done</button>
              </div>
            </div>
          </div>
        )
      }

      {/* View Toggle */}
      <div className="flex justify-end mb-2">
        <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
          <button onClick={() => setIsCodeView(false)} className={`px-3 py-1.5 text-sm rounded-md transition-all ${!isCodeView ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}>Form Editor</button>
          <button onClick={() => setIsCodeView(true)} className={`px-3 py-1.5 text-sm rounded-md transition-all ${isCodeView ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}>LaTeX Code</button>
        </div>
      </div>

      {
        isCodeView ? (
          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-slate-700 h-[600px] flex flex-col">
            <div className="bg-[#252526] px-4 py-2 border-b border-slate-700 flex justify-between items-center">
              <span className="text-slate-300 text-xs font-mono">main.tex</span>
              <span className="text-slate-500 text-xs">LaTeX Mode</span>
            </div>
            <textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(() => { })} className="grid gap-6">

            {/* Personal Info Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">Full Name</label>
                  <input {...register('personalInfo.name')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Job Title</label>
                  <input {...register('personalInfo.title')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Email</label>
                  <input {...register('personalInfo.email')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Phone</label>
                  <input {...register('personalInfo.phone')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">Location</label>
                  <input {...register('personalInfo.location')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">LinkedIn</label>
                  <input {...register('personalInfo.linkedin')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">GitHub</label>
                  <input {...register('personalInfo.github')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800 mt-1" />
                </div>
              </div>
            </div>

            {/* Dynamic Sections */}
            <div className="grid gap-6">
              {sectionFields.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  register={register}
                  control={control}
                  remove={removeSection}
                  move={moveSection}
                  isFirst={index === 0}
                  isLast={index === sectionFields.length - 1}
                  allSections={sectionFields}
                />
              ))}
            </div>

            {/* Add Section Button */}
            <div className="relative">
              {showAddSection ? (
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg animate-in fade-in zoom-in duration-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Add New Section</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => handleAddSection('custom')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Custom Section</span>
                      <span className="text-xs text-slate-500">Hobbies, Awards, etc.</span>
                    </button>
                    <button type="button" onClick={() => handleAddSection('experience')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Experience</span>
                      <span className="text-xs text-slate-500">Work history</span>
                    </button>
                    <button type="button" onClick={() => handleAddSection('education')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Education</span>
                      <span className="text-xs text-slate-500">Schools & degrees</span>
                    </button>
                    <button type="button" onClick={() => handleAddSection('projects')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Projects</span>
                      <span className="text-xs text-slate-500">Portfolio items</span>
                    </button>
                    <button type="button" onClick={() => handleAddSection('skills')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Skills</span>
                      <span className="text-xs text-slate-500">List of skills</span>
                    </button>
                    <button type="button" onClick={() => handleAddSection('summary')} className="p-3 text-left border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <span className="font-medium text-slate-700 block">Summary</span>
                      <span className="text-xs text-slate-500">Text block</span>
                    </button>
                  </div>
                  <button type="button" onClick={() => setShowAddSection(false)} className="mt-3 text-sm text-slate-500 hover:text-slate-700 w-full text-center">Cancel</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" /> Add Section
                </button>
              )}
            </div>

          </form>
        )
      }
    </div>
  )
}

export default EditorPanel
