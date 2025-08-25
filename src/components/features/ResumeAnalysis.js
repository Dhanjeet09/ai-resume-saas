'use client'
import { useState } from 'react'
import { BarChart3, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion } from "motion/react"

export function ResumeAnalysis({ resumeText }) {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      })

      const result = await response.json()
      if (result.success) {
        setAnalysis(result.analysis)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        AI Resume Analysis
      </h2>
      
      {!analysis ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6 text-lg">
            Get AI-powered insights about your resume instantly.
          </p>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !resumeText}
            className="px-6 py-3 text-lg rounded-xl shadow-md hover:shadow-lg transition"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Score */}
          <div className="flex items-center gap-6 p-6 bg-blue-100/70 rounded-xl shadow-inner">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md"
            >
              <span className="text-2xl font-bold text-blue-700">
                {analysis.score}%
              </span>
            </motion.div>
            <div>
              <p className="font-semibold text-lg text-gray-800">
                Overall Resume Score
              </p>
              <p className="text-gray-600 text-sm">
                {analysis.score >= 80 ? '🌟 Excellent' : 
                 analysis.score >= 60 ? '👍 Good' : '⚡ Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-700 text-lg">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {analysis.strengths?.map((strength, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-gray-700 bg-green-50 rounded-lg px-4 py-2 shadow-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-700 text-lg">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {analysis.improvementTips?.map((tip, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-gray-700 bg-amber-50 rounded-lg px-4 py-2 shadow-sm"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Skills */}
          {analysis.missingSkills?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 text-red-700 text-lg">
                Suggested Skills to Add
              </h3>
              <div className="flex flex-wrap gap-3">
                {analysis.missingSkills.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-1.5 bg-red-100 text-red-700 
                               rounded-full text-sm font-medium 
                               shadow-sm hover:bg-red-200 transition"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
