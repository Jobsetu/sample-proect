import { PDFViewer } from '@react-pdf/renderer'
import { useResumeStore } from '../stores/useResumeStore'
import ResumeDocument from './ResumeDocument'

const PDFPreview = () => {
  const resume = useResumeStore(s => s.resume)

  if (!resume) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading preview...</div>
  }

  const template = resume.template || 'classic'

  return (
    <div className="w-full h-full border border-slate-200 rounded-lg overflow-hidden bg-slate-500/10">
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={true}>
        <ResumeDocument resume={resume} template={template} />
      </PDFViewer>
    </div>
  )
}

export default PDFPreview
