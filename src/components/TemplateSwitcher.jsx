import { useResumeStore } from '../stores/useResumeStore'

const TemplateSwitcher = () => {
  const template = useResumeStore(s => s.resume?.template || 'classic')
  const setResume = useResumeStore(s => s.setResume)
  const resume = useResumeStore(s => s.resume)

  const setTemplate = (t) => setResume({ ...resume, template: t })

  const templates = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'clean', label: 'Clean' },
    { id: 'professional', label: 'Professional' }
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center gap-1">
      {templates.map(t => (
        <button
          key={t.id}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${template === t.id ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          onClick={() => setTemplate(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export default TemplateSwitcher
