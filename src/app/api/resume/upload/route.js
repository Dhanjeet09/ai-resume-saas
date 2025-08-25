import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/mongodb'
import { cloudinary } from '@/lib/cloudinary'
import pdf from 'pdf-parse'
import { Buffer } from 'buffer'

export const maxDuration = 60 // Vercel serverless timeout

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('resume')
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary (as raw file)
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `ai-resume-saas/${session.userId}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    // Extract text from PDF
    const pdfData = await pdf(buffer)
    const resumeText = pdfData.text

    // Save metadata to MongoDB
    const db = await connectToMongoDB()
    const result = await db.collection('resumes').insertOne({
      userId: session.userId,
      fileName: file.name,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      extractedText: resumeText,
      uploadedAt: new Date(),
      analyzed: false
    })

    return NextResponse.json({
      success: true,
      resumeId: result.insertedId,
      extractedText: resumeText,
      cloudinaryUrl: uploadResult.secure_url
    })
  } catch (error) {
    console.error('Cloudinary upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
