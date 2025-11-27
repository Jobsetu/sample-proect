import React, { useState } from 'react'
import { Download, FileText, File } from 'lucide-react'
import { useResumeStore } from '../stores/useResumeStore'
import { pdf } from '@react-pdf/renderer'
import ResumeDocument from './ResumeDocument'
import { saveAs } from 'file-saver'

const DownloadToolbar = () => {
    const resume = useResumeStore(s => s.resume)
    const [downloadingPdf, setDownloadingPdf] = useState(false)
    const [downloadingDocx, setDownloadingDocx] = useState(false)

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true)
        try {
            console.log('Generating Resume PDF...')
            const blob = await pdf(<ResumeDocument resume={resume} template={resume.template} />).toBlob()
            console.log('PDF Blob size:', blob.size)
            if (blob.size < 100) console.warn('PDF Blob is suspiciously small')
            saveAs(blob, `${resume.personalInfo?.name || 'resume'}.pdf`)
        } catch (error) {
            console.error('PDF Download failed', error)
            alert('Failed to download PDF')
        } finally {
            setDownloadingPdf(false)
        }
    }

    const handleDownloadDocx = async () => {
        setDownloadingDocx(true)
        try {
            console.log('Requesting Resume DOCX...')
            const response = await fetch('/api/download-docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume })
            })

            console.log('DOCX Response status:', response.status)
            const contentType = response.headers.get('content-type')

            if (!response.ok) {
                const text = await response.text()
                console.error('DOCX Error response:', text)
                throw new Error('Failed to generate DOCX')
            }

            if (contentType && contentType.includes('text/html')) {
                console.error('Received HTML instead of DOCX. Backend might be down.')
                alert('Server error: Received HTML instead of file. Please check backend.')
                return
            }

            const blob = await response.blob()
            console.log('DOCX Blob size:', blob.size)

            const docxBlob = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
            saveAs(docxBlob, `${resume.personalInfo?.name || 'resume'}.docx`)
        } catch (error) {
            console.error('DOCX Download failed', error)
            alert('Failed to download DOCX')
        } finally {
            setDownloadingDocx(false)
        }
    }

    return (
        <div className="bg-white border-b border-slate-200 p-2 flex justify-end gap-2">
            <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
            >
                <FileText className="w-4 h-4" />
                {downloadingPdf ? 'Generating...' : 'Download PDF'}
            </button>
            <button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
                <File className="w-4 h-4" />
                {downloadingDocx ? 'Generating...' : 'Download DOCX'}
            </button>
        </div>
    )
}

export default DownloadToolbar
