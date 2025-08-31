'use client'
import { useState, useEffect } from 'react'
import { Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from "motion/react"

export function ResumeUpload({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/resume/upload')
        const data = await res.json()
        if (data.success) setResumes(data.resumes)
      } catch (err) {
        console.error('Failed to fetch resumes:', err)
      }
    })()
  }, [])

  const handleFileUpload = async (file) => {
    if (!file) return
    const extOk = /\.(pdf|docx|txt)$/i.test(file.name)
    if (!extOk) {
      alert('Please upload a PDF, DOCX, or TXT file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        const newItem = {
          _id: result.resumeId,
          originalName: file.name,
          url: result.fileUrl,
          createdAt: new Date().toISOString(),
          extractedText: result.extractedText || "",
        }
        setResumes(prev => [newItem, ...prev])
        // pass extracted text and url to parent for reuse
        onUploadSuccess?.(result.extractedText, result.fileUrl)
      } else {
        alert('Upload failed: ' + (result.error || 'Unknown'))
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleSelectResume = (resume) => {
  onUploadSuccess?.(resume.extractedText || "", resume.url, resume._id, "analyze");
};


  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Resume</h2>

      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`w-14 h-14 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-gray-600 mb-4 text-lg">
          Drag & drop your <span className="font-semibold">PDF, DOCX, TXT</span> resume here  
          <br /> or click to browse
        </p>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
          id="resume-upload"
          disabled={isUploading}
        />
        <Button
          onClick={() => document.getElementById('resume-upload').click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </Button>

        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-xl"
            >
              <motion.div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded list */}
      {resumes.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">📂 Your Uploaded Resumes</h3>
            <ul className="space-y-3">
              {resumes.map((r) => (
                <li key={r._id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <div>
                      <div className="text-gray-800 font-medium">{r.originalName}</div>
                      <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                   <button 
                     onClick={() => handleSelectResume(r)} 
                     className="text-sm text-indigo-600 hover:underline">
                     Reuse
                   </button>
                 </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
