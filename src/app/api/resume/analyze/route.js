import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { perplexityClient } from '@/lib/perplexity';

// Optional rate limiter (simple in-memory)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export async function POST(req) {
  // --- Auth check ---
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user?.email || session.user?.id;
  const now = Date.now();

  // --- Simple Rate Limiter ---
  const requests = rateLimit.get(userId) || [];
  const recent = requests.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= MAX_REQUESTS) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }
  recent.push(now);
  rateLimit.set(userId, recent);

  // --- Parse request body ---
  const { resumeText } = await req.json();
  if (!resumeText || resumeText.length < 50) {
    return NextResponse.json({ error: 'Resume text too short or invalid' }, { status: 400 });
  }

  // --- Advanced Prompt ---
  const analysisPrompt = `
  You are an expert HR recruiter and technical interviewer.

  TASK: Analyze the following resume and return ONLY valid JSON (no extra text).
  
  Schema:
  {
    "score": number (0-100),
    "missingSkills": string[],
    "strengths": string[],
    "improvementTips": string[],
    "summary": string
  }

  Resume: """${resumeText}"""
  `;

  try {
    // Step 1: Analyze Resume
    const resp = await perplexityClient.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: 'You are a strict JSON generator. Always reply ONLY with valid JSON, no explanation.' },
        { role: 'user', content: analysisPrompt },
      ],
      temperature: 0.2,
    });

    let analysis;
    try {
      analysis = JSON.parse(resp.choices[0].message.content);
    } catch (err) {
      console.error('Invalid JSON received:', resp.choices[0].message.content);
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Step 2: Suggest resources for missing skills
    if (analysis.missingSkills && Array.isArray(analysis.missingSkills)) {
      analysis.resourceLinks = [];

      for (const skill of analysis.missingSkills) {
        const resourcePrompt = `
        Suggest ONE highly-rated free or affordable online course/resource for learning "${skill}".
        Reply in this JSON format:
        { "title": "string", "url": "string" }
        `;

        const res = await perplexityClient.chat.completions.create({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'Always return valid JSON only.' },
            { role: 'user', content: resourcePrompt },
          ],
          temperature: 0.4,
        });

        try {
          const resource = JSON.parse(res.choices[0].message.content);
          analysis.resourceLinks.push({ skill, ...resource });
        } catch (err) {
          console.error('Invalid resource JSON for skill:', skill, res.choices[0].message.content);
          analysis.resourceLinks.push({ skill, title: 'N/A', url: 'N/A' });
        }
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error('API error in resume analysis:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
