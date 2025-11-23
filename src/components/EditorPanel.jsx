import { useMemo, useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useResumeStore } from '../stores/useResumeStore'
import { Sparkles, Loader, Check, FileText } from 'lucide-react'
import { GeminiService } from '../lib/geminiService'

const SectionCard = ({ section, index, register, remove, move, control }) => {
  if (section.id === 'summary') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800">{section.title}</h4>
        </div>
        <textarea {...register(`sections.${index}.content`)} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" rows={4} />
      </div>
    )
  }

  if (section.id === 'skills') {
    const { fields, append, remove: removeSkill } = useFieldArray({ control, name: `sections.${index}.items` })
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800">{section.title}</h4>
          <button type="button" className="text-blue-600 text-sm" onClick={() => append('')}>Add Skill</button>
        </div>
        <div className="grid gap-2">
          {fields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input {...register(`sections.${index}.items.${i}`)} className="flex-1 border border-slate-200 rounded-md p-2 text-slate-800" />
              <button type="button" className="text-red-600 text-sm" onClick={() => removeSkill(i)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section.id === 'experience') {
    const { fields, append, remove: removeItem } = useFieldArray({ control, name: `sections.${index}.items` })
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-800">{section.title}</h4>
          <button type="button" className="text-blue-600 text-sm" onClick={() => append({ role: '', company: '', location: '', startDate: '', endDate: '', bullets: [] })}>Add Role</button>
        </div>
        <div className="grid gap-4">
          {fields.map((f, i) => {
            const bullets = useFieldArray({ control, name: `sections.${index}.items.${i}.bullets` })
            return (
              <div key={f.id} className="border border-slate-200 rounded-md p-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input placeholder="Role" {...register(`sections.${index}.items.${i}.role`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
                  <input placeholder="Company" {...register(`sections.${index}.items.${i}.company`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
                  <input placeholder="Location" {...register(`sections.${index}.items.${i}.location`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
                  <div className="flex gap-2">
                    <input placeholder="Start" {...register(`sections.${index}.items.${i}.startDate`)} className="border border-slate-200 rounded-md p-2 text-slate-800 w-full" />
                    <input placeholder="End" {...register(`sections.${index}.items.${i}.endDate`)} className="border border-slate-200 rounded-md p-2 text-slate-800 w-full" />
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <h5 className="font-medium text-slate-700">Bullets</h5>
                  <button type="button" className="text-blue-600 text-sm" onClick={() => bullets.append('')}>Add Bullet</button>
                </div>
                <div className="grid gap-2">
                  {bullets.fields.map((bf, bi) => (
                    <div key={bf.id} className="flex gap-2">
                      <input {...register(`sections.${index}.items.${i}.bullets.${bi}`)} className="flex-1 border border-slate-200 rounded-md p-2 text-slate-800" />
                      <button type="button" className="text-red-600 text-sm" onClick={() => bullets.remove(bi)}>Remove</button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <button type="button" className="text-red-600 text-sm" onClick={() => removeItem(i)}>Delete Role</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Generic list section (education, projects, certifications)
  const { fields, append, remove: removeGeneric } = useFieldArray({ control, name: `sections.${index}.items` })
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-slate-800">{section.title}</h4>
        <button type="button" className="text-blue-600 text-sm" onClick={() => append({ title: '', subtitle: '', description: '' })}>Add Item</button>
      </div>
      <div className="grid gap-3">
        {fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 border border-slate-200 rounded-md p-3">
            <input placeholder="Title / Degree" {...register(`sections.${index}.items.${i}.title`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
            <input placeholder="Subtitle / School" {...register(`sections.${index}.items.${i}.subtitle`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
            <div className="flex gap-2">
              <input placeholder="Year / Duration" {...register(`sections.${index}.items.${i}.year`)} className="border border-slate-200 rounded-md p-2 text-slate-800 w-1/2" />
              <input placeholder="Location" {...register(`sections.${index}.items.${i}.location`)} className="border border-slate-200 rounded-md p-2 text-slate-800 w-1/2" />
            </div>
            <input placeholder="GPA (if applicable)" {...register(`sections.${index}.items.${i}.gpa`)} className="border border-slate-200 rounded-md p-2 text-slate-800" />
            <textarea placeholder="Description" {...register(`sections.${index}.items.${i}.description`)} className="border border-slate-200 rounded-md p-2 text-slate-800" rows={3} />
            <div className="text-right">
              <button type="button" className="text-red-600 text-sm" onClick={() => removeGeneric(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
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

  const methods = useForm({
    defaultValues: resume || {
      personalInfo: {},
      sections: [],
      font: 'Inter',
      color: '#000000',
      spacing: 1.2
    },
    mode: 'onBlur'
  })
  const { control, handleSubmit, register, watch, reset } = methods

  const values = watch()

  useMemo(() => {
    if (JSON.stringify(values) !== JSON.stringify(resume)) {
      setResume(values)
    }
  }, [values, setResume, resume])

  // Force reset when store changes externally (e.g. AI Write)
  useEffect(() => {
    reset(resume)
  }, [resume, reset])

  const handleAiWrite = async () => {
    // Try to use stored job description first
    let description = aiJobDescription.trim()

    if (!description) {
      // Check if there's a stored job description
      try {
        const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
        const { hasJobDescription, getFormattedJobDescription } = useJobDescriptionStore.getState()

        if (hasJobDescription()) {
          description = getFormattedJobDescription()
          console.log('Using stored job description for AI Write')
        } else {
          alert('Please enter a job description first')
          return
        }
      } catch (error) {
        alert('Please enter a job description first')
        return
      }
    } else {
      // Save the entered job description for future use
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
      // 1. Generate tailored resume data
      const tailoredData = await GeminiService.generateCustomResume(description, resume)

      // 2. Update store with new data
      setResume(tailoredData)

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
    setGeneratingCoverLetter(true)
    try {
      // Try to use stored job description first
      const { useJobDescriptionStore } = await import('../stores/useJobDescriptionStore')
      const { jobDescription, hasJobDescription, getFormattedJobDescription } = useJobDescriptionStore.getState()

      let description = ''

      if (hasJobDescription()) {
        // Use stored job description
        description = getFormattedJobDescription()
        console.log('Using stored job description for cover letter')
      } else {
        // Prompt user to enter job description and store it
        description = prompt("Please enter the job description for the cover letter:\n\n(This will be saved for future use)")
        if (!description) {
          setGeneratingCoverLetter(false)
          return
        }

        // Extract job title and company if possible (basic heuristic)
        const firstLine = description.split('\n')[0]
        const jobTitle = firstLine.substring(0, 100) // Use first line as job title
        const companyMatch = description.match(/(?:at|@|for)\s+([A-Z][A-Za-z\s&]+?)(?:\s|,|\.)/i)
        const company = companyMatch ? companyMatch[1].trim() : ''

        // Store for future use
        useJobDescriptionStore.getState().setJobDescription(description, jobTitle, company)
        alert('Job description saved! Next time you generate a cover letter or resume, it will be used automatically.')
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

  return (
    <div className="grid gap-4 relative">
      {/* AI Actions Toolbar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI Assistant
          </h3>
          <p className="text-xs text-blue-700 mt-1">Auto-tailor your resume or write a cover letter.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-2 bg-white border border-blue-200 text-blue-700 text-sm rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-3 h-3" />
            Write with AI
          </button>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={generatingCoverLetter}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            {generatingCoverLetter ? <Loader className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            Generate Cover Letter
          </button>
        </div>
      </div>

      {/* AI Write Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Tailor Resume with AI
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Paste the job description below. AI will rewrite your resume content to match the keywords and requirements.
              </p>

              <textarea
                value={aiJobDescription}
                onChange={(e) => setAiJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full h-40 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-slate-800 mb-4"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiWrite}
                  disabled={isWriting || !aiJobDescription.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isWriting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Writing...
                    </>
                  ) : aiSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Updated!
                    </>
                  ) : (
                    'Generate & Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Result Modal */}
      {coverLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Generated Cover Letter</h3>
              <button onClick={() => setCoverLetter(null)} className="text-slate-500 hover:text-slate-800">Close</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="whitespace-pre-wrap text-slate-700 text-sm font-serif leading-relaxed">
                {coverLetter}
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coverLetter)
                  alert("Copied to clipboard!")
                }}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 text-slate-700"
              >
                Copy Text
              </button>
              <button
                onClick={() => setCoverLetter(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setIsCodeView(false)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${!isCodeView ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Form Editor
          </button>
          <button
            onClick={() => setIsCodeView(true)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${isCodeView ? 'bg-white text-blue-600 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
          >
            LaTeX Code
          </button>
        </div>
      </div>

      {isCodeView ? (
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
        <form onSubmit={handleSubmit(() => { })} className="grid gap-4">

          {/* Personal Info Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm text-slate-600">Full Name</label>
                <input {...register('personalInfo.name')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Job Title</label>
                <input {...register('personalInfo.title')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input {...register('personalInfo.email')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Phone</label>
                <input {...register('personalInfo.phone')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div>
                <label className="text-sm text-slate-600">Location</label>
                <input {...register('personalInfo.location')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-600">LinkedIn (optional)</label>
                <input {...register('personalInfo.linkedin')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-600">GitHub (optional)</label>
                <input {...register('personalInfo.github')} className="w-full border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Global Styles</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <label className="text-sm text-slate-600">Font</label>
                <select {...register('font')} className="border border-slate-200 rounded-md p-2 text-slate-800">
                  <option value="Inter">Inter</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-slate-600">Color</label>
                <input type="color" {...register('color')} className="h-10 w-full border border-slate-200 rounded-md" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-slate-600">Line Spacing</label>
                <input type="number" step="0.1" min="1" max="2" {...register('spacing')} className="border border-slate-200 rounded-md p-2 text-slate-800" />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {values.sections && values.sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                register={register}
                control={control}
              />
            ))}
          </div>
        </form>
      )}
    </div>
  )
}

export default EditorPanel
