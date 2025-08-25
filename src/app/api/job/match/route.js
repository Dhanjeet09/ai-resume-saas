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

    const { resumeText, jobDescription } = await request.json()

    const prompt = `
    Compare this resume with the job description and provide a JSON response with:
    1. Match percentage (0-100)
    2. Matched skills array
    3. Missing skills array
    4. Recommendations array
    
    Resume: ${resumeText}
    Job Description: ${jobDescription}
    
    Respond only in valid JSON format like:
    {
      "matchPercentage": 78,
      "matchedSkills": ["JavaScript", "React"],
      "missingSkills": ["Python", "Docker"],
      "recommendations": ["Learn Python basics", "Get Docker certification"]
    }
    `

    const resp = await perplexityClient.chat.completions.create({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = resp.choices[0]?.message?.content || '{}'
    const matchResult = JSON.parse(content)

    return NextResponse.json({ success: true, matchResult })

  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Match analysis failed' }, { status: 500 })
  }
}
