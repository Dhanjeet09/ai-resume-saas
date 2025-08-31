// src/app/api/ai/interview/route.js
import { NextResponse } from 'next/server'
import { perplexityClient } from '@/lib/perplexity';

export async function POST(request) {
  const { jobTitle, resumeText, numQuestions = 5 } = await request.json()
  const prompt = `
  - Generate ${numQuestions} job interview questions for the role: "${jobTitle}".
  - Consider this resume: "${resumeText}".
  - For each question, also generate a sample strong answer.
  - Format: [{ "question": "...", "answer": "..." }, ...]
  `
  const completion = await perplexityClient.chat.completions.create({
    model: 'sonar-pro',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  })
  const questions = JSON.parse(completion.choices[0].message.content)
  return NextResponse.json({ success: true, questions })
}