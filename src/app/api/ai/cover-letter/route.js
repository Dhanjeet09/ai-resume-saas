import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { perplexityClient } from '@/lib/perplexity'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText, jobDescription, companyName } = await request.json()

    const prompt = `
    Generate a professional cover letter based on:
    Resume: ${resumeText}
    Job Description: ${jobDescription}
    Company: ${companyName}
    
    Make it personalized, professional, and highlight relevant skills.
    Keep it concise (3-4 paragraphs).
    `

    const resp = await perplexityClient.chat.completions.create({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const coverLetter = resp.choices[0]?.message?.content || ''

    return NextResponse.json({ success: true, coverLetter })

  } catch (error) {
    console.error('Cover letter error:', error)
    return NextResponse.json({ error: 'Cover letter generation failed' }, { status: 500 })
  }
}
