import { NextResponse } from 'next/server'
import { perplexityClient } from '@/lib/perplexity'

export async function POST(request) {
  try {
    const { jobDescription } = await request.json()

    const prompt = `
    Summarize this job description into key points:
    1. Role summary (1-2 sentences)
    2. Key responsibilities (3-5 bullet points)
    3. Required skills (list format)
    4. Experience level needed
    
    Job Description: ${jobDescription}
    
    Format as clear, organized sections.
    `

    const resp = await perplexityClient.chat.completions.create({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    })

    const summary = resp.choices[0]?.message?.content || ''

    return NextResponse.json({ success: true, summary })

  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Summarization failed' }, { status: 500 })
  }
}
