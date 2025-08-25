import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { perplexityClient } from '@/lib/perplexity';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeText } = await req.json();
  const prompt = `
    Analyze this resume and return valid JSON with:
      "score", "missingSkills", "improvementTips", "strengths"
    
    Resume: ${resumeText}
  `;

  try {
    const resp = await perplexityClient.chat.completions.create({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const analysis = JSON.parse(resp.choices[0].message.content);
    return NextResponse.json({ success: true, analysis });
  } catch (err) {
    console.error('Perplexity API error', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
