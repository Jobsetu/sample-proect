import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Download,
  Eye,
  Code,
  FileText
} from 'lucide-react'

const OverleafModal = ({ isOpen, onClose, latexContent, template }) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  useEffect(() => {
    if (isOpen) {
      setCopied(false)
      setActiveTab('preview')
    }
  }, [isOpen])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latexContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Error copying to clipboard. Please try again.')
    }
  }

  const openOverleaf = () => {
    window.open('https://www.overleaf.com/project', '_blank', 'noopener,noreferrer')
  }

  const downloadLaTeX = () => {
    const blob = new Blob([latexContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${template?.name || 'template'}.tex`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">LaTeX Resume Ready</h2>
              <p className="text-gray-600">Your resume is ready for Overleaf compilation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'preview', name: 'Instructions', icon: Eye },
              { id: 'code', name: 'LaTeX Code', icon: Code },
              { id: 'template', name: 'Template Info', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🚀 Ready to Compile!</h3>
                  <p className="text-blue-800 text-sm">
                    Your LaTeX resume is ready. Follow these steps to create a professional PDF:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Open Overleaf</p>
                      <p className="text-gray-600 text-sm">Go to overleaf.com and sign in to your account</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Create New Project</p>
                      <p className="text-gray-600 text-sm">Click "New Project" → "Blank Project"</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Paste LaTeX Code</p>
                      <p className="text-gray-600 text-sm">Copy the LaTeX code and paste it into main.tex</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Compile & Download</p>
                      <p className="text-gray-600 text-sm">Click "Compile" and download your professional PDF</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={openOverleaf}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Overleaf</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy LaTeX'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">LaTeX Source Code</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={downloadLaTeX}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {latexContent}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'template' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Template Information</h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Template Name</p>
                      <p className="font-medium text-gray-900">{template?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Template Class</p>
                      <p className="font-medium text-gray-900">{template?.class || 'Unknown'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">{template?.description || 'Professional resume template'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Template Features</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Professional typography and layout</li>
                    <li>• Single-column design for easy reading</li>
                    <li>• Optimized for ATS systems</li>
                    <li>• Print-ready PDF output</li>
                    <li>• Easy to customize and modify</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Need help? Check out the <a href="https://www.overleaf.com/learn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Overleaf documentation</a>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={openOverleaf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open in Overleaf
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OverleafModal
