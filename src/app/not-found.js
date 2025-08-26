'use client'

import { motion } from "motion/react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4"
    >
      <div className="p-8 bg-white shadow-lg rounded-xl text-center max-w-md w-full">
        <div className="flex justify-center mb-5">
          <AlertTriangle className="w-14 h-14 text-blue-600" />
        </div>
        <h1 className="text-5xl font-bold mb-3 text-blue-700">404</h1>
        <p className="text-base text-gray-600 mb-6">
          Sorry, the page you’re looking for isn’t available.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </motion.div>
  )
}
