"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { motion } from "motion/react";
import { Upload, BarChart3, Briefcase, FileText, User, MessageCircle } from "lucide-react";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { ResumeAnalysis } from "@/components/features/ResumeAnalysis";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeId, setResumeId] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(""); 
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [jdSummary, setJdSummary] = useState("");
  const [interviewQAs, setInterviewQAs] = useState([]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 max-w-md"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            🚀 AI Resume Platform
          </h1>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Upload your resume and let AI help you{" "}
            <span className="font-semibold text-indigo-600">
              analyze, match, and apply
            </span>{" "}
            with confidence.
          </p>
          <Button
            onClick={() => signIn("google")}
            className="w-full text-lg py-3"
          >
            Sign in with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleJobMatch = async () => {
    if (!resumeText || !jobDescription) return;
    try {
      const response = await fetch("/api/job/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const result = await response.json();
      if (result.success) setMatchResult(result.matchResult);
    } catch (error) {
      console.error("Job match failed:", error);
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeText || !jobDescription) return;
    try {
      const response = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          companyName: "Target Company",
        }),
      });
      const result = await response.json();
      if (result.success) setCoverLetter(result.coverLetter);
    } catch (error) {
      console.error("Cover letter generation failed:", error);
    }
  };

  const summarizeJD = async () => {
    if (!jobDescription) return;
    try {
      const response = await fetch("/api/ai/summarize-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const result = await response.json();
      if (result.success) setJdSummary(result.summary);
    } catch (error) {
      console.error("JD summarization failed:", error);
    }
  };

  const generateInterviewQAs = async () => {
    if (!resumeText || !jobDescription) return;
    try {
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: "Software Engineer", // you could let user input this
          resumeText,
          numQuestions: 5,
        }),
      });
      const result = await response.json();
      if (result.success) setInterviewQAs(result.questions);
    } catch (error) {
      console.error("Interview Q&A generation failed:", error);
    }
  };

  const tabs = [
    { id: "upload", label: "Upload Resume", icon: Upload },
    { id: "analyze", label: "AI Analysis", icon: BarChart3 },
    { id: "match", label: "Job Match", icon: Briefcase },
    { id: "tools", label: "AI Tools", icon: FileText },
    { id: "interview", label: "Interview Prep", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-indigo-700">
              AI Resume Platform
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-indigo-600" />
                {session.user.email}
              </div>
              <Button
                variant="secondary"
                onClick={() => signOut()}
                className="text-sm"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 py-4 px-2 text-sm font-medium transition-all ${
                  activeTab === id
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {activeTab === id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === "upload" && (
            <ResumeUpload
              onUploadSuccess={(text, url, id, nextTab) => {
                setResumeText(text);
                setResumeUrl(url);
                setResumeId(id);
                setActiveTab(nextTab || "analyze");  
              }}
            />
          )}

          {activeTab === "analyze" && (
            <ResumeAnalysis 
              resumeText={resumeText} 
              resumeId={resumeId}  
            />
          )}


          {activeTab === "match" && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-700">
                <Briefcase className="w-5 h-5" />
                Job Match Analysis
              </h2>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Job Description Input */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    placeholder="Paste the job description here..."
                    className="w-full p-3 border rounded-lg h-40 resize-y 
             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
             text-gray-800 bg-white shadow-sm leading-relaxed"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() => handleJobMatch()}
                      disabled={!resumeText || !jobDescription}
                    >
                      Analyze Match
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => summarizeJD()}
                      disabled={!jobDescription}
                    >
                      Summarize JD
                    </Button>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  {matchResult && (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-100 via-blue-50 to-indigo-50 rounded-xl shadow"
                      >
                        <div className="text-4xl font-bold text-green-600">
                          {matchResult.matchPercentage}%
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Match Score
                          </p>
                          <p className="text-sm text-gray-600">
                            {matchResult.matchPercentage >= 80
                              ? "🌟 Excellent Match"
                              : matchResult.matchPercentage >= 60
                              ? "👍 Good Match"
                              : "⚠️ Needs Improvement"}
                          </p>
                        </div>
                      </motion.div>

                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">
                            ✅ Matched Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.matchedSkills?.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-red-700 mb-2">
                            ❌ Missing Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.missingSkills?.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {jdSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm"
                    >
                      <h4 className="font-semibold mb-2 text-indigo-700">
                        📄 Job Description Summary
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {jdSummary}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">
                AI Cover Letter Generator
              </h2>
              <Button
                onClick={() => generateCoverLetter()}
                disabled={!resumeText || !jobDescription}
                className="mb-6"
              >
                Generate Cover Letter
              </Button>

              {coverLetter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200"
                >
                  <h4 className="font-semibold mb-3 text-gray-800">
                    Generated Cover Letter
                  </h4>
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm">
                    {coverLetter}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "interview" && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">
                Interview Prep
              </h2>
              <Button
                onClick={generateInterviewQAs}
                disabled={!resumeText || !jobDescription}
                className="mb-6"
              >
                Generate Interview Questions
              </Button>

              {interviewQAs.length > 0 && (
                <div className="space-y-6">
                  {interviewQAs.map((qa, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200"
                    >
                      <p className="font-semibold text-gray-800">
                        Q{idx + 1}: {qa.question}
                      </p>
                      <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                        💡 {qa.answer}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
