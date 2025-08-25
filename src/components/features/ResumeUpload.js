'use client'
import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from "motion/react"

export function ResumeUpload({ onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([]) 

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
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
        setUploadedFiles((prev) => [...prev, { name: file.name, url: result.fileUrl }]) // 👈 save file info
        onUploadSuccess(result.extractedText, result.fileUrl) // pass back file URL too
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Resume</h2>
      
      {/* Upload Area */}
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
          Drag & drop your <span className="font-semibold">PDF resume</span> here  
          <br /> or click to browse
        </p>

        <input
          type="file"
          accept=".pdf"
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

        {/* Uploading Overlay */}
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

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">📂 Uploaded Resumes</h3>
          <ul className="space-y-3">
            {uploadedFiles.map((file, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span className="text-gray-800 font-medium">{file.name}</span>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm font-semibold hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
