'use client'
import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle, AlertCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion } from "motion/react"

export function ResumeAnalysis({ resumeText, resumeId }) {
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Auto-analyze when resumeText or resumeId changes
  useEffect(() => {
    const analyzeResume = async () => {
      // Check if we have saved analysis first
      const saved = localStorage.getItem(`analysis-${resumeId || 'text'}`)
      if (saved) {
        setAnalysis(JSON.parse(saved))
        return
      }

      // If no saved analysis and we have resume data, start auto-analysis
      if (resumeText || resumeId) {
        setIsAnalyzing(true)
        try {
          const response = await fetch("/api/resume/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resumeText ? { resumeText } : { resumeId }),
          })
          const result = await response.json()
          if (result.success) {
            setAnalysis(result.analysis)
            localStorage.setItem(
              `analysis-${resumeId || 'text'}`,
              JSON.stringify(result.analysis)
            )
          }
        } catch (error) {
          console.error("Auto-analysis failed:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }
    }

    analyzeResume()
  }, [resumeText, resumeId,]) // Dependencies: run when resumeText or resumeId changes

  const handleReanalyze = async () => {
    setIsAnalyzing(true)
    setAnalysis(null) // Clear existing analysis
    
    try {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeText ? { resumeText } : { resumeId }),
      })
      const result = await response.json()
      if (result.success) {
        setAnalysis(result.analysis)
        localStorage.setItem(
          `analysis-${resumeId || 'text'}`,
          JSON.stringify(result.analysis)
        )
      }
    } catch (error) {
      console.error("Re-analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold flex items-center gap-3 text-gray-900">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          AI Resume Analysis
        </h2>
        
        {/* Re-analyze button - only show when analysis exists */}
        {analysis && !isAnalyzing && (
          <Button 
            onClick={handleReanalyze}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Re-analyze
          </Button>
        )}
      </div>
      
      {isAnalyzing ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">
            Analyzing your resume with AI...
          </p>
        </div>
      ) : !analysis ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6 text-lg">
            {resumeText || resumeId 
              ? "Analysis will start automatically..." 
              : "Upload a resume to get AI-powered insights."}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Score */}
          <div className="flex items-center gap-6 p-6 bg-blue-50 rounded-xl shadow-inner border border-blue-200">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg border border-blue-200"
            >
              <span className="text-3xl font-bold text-blue-700">
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
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-700 text-xl">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {analysis.strengths?.map((strength, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-gray-700 bg-green-50 rounded-lg px-4 py-3 shadow hover:shadow-md transition"
                >
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-2"></div>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-amber-700 text-xl">
              <AlertCircle className="w-5 h-5" />
              Areas for Improvement
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {analysis.improvementTips?.map((tip, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-gray-700 bg-amber-50 rounded-lg px-4 py-3 shadow hover:shadow-md transition"
                >
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Skills */}
          {analysis.missingSkills?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 text-red-700 text-xl">
                Suggested Skills to Add
              </h3>
              <div className="flex flex-wrap gap-3">
                {analysis.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-red-100 text-red-700 
                               rounded-full text-sm font-medium 
                               shadow hover:shadow-md border border-red-200
                               transition hover:scale-105"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {analysis.resourceLinks?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-700 text-xl">
                <BookOpen className="w-5 h-5" />
                Recommended Learning Resources
              </h3>
              <ul className="grid sm:grid-cols-2 gap-4">
                {analysis.resourceLinks.map((item, idx) => (
                  <li 
                    key={idx}
                    className="p-5 bg-blue-50 rounded-lg shadow hover:shadow-lg transition text-gray-700 border border-blue-200"
                  >
                    <span className="font-semibold text-gray-900">{item.skill}:</span>{" "}
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
