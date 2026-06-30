import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { generateContent } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { official_id, official_name } = await request.json();

    if (!official_id) {
      return NextResponse.json({ error: 'official_id is required' }, { status: 400 });
    }

    // Fetch citizen ratings with review text
    const reviews = await queryAll<any>(
      `SELECT review_text, overall
       FROM ratings
       WHERE official_id = ?
         AND review_text IS NOT NULL
         AND review_text <> ''
       ORDER BY created_at DESC
       LIMIT 20`,
      [official_id]
    );

    if (reviews.length === 0) {
      return NextResponse.json({
        ok: true,
        sentiment: 'neutral',
        summary: 'Not enough written reviews to analyze yet.',
      });
    }

    const reviewText = reviews
      .map(r => `[Score: ${r.overall}/5] ${r.review_text}`)
      .join('\n---\n');

    const prompt = `You are a political sentiment analyst. Analyze these citizen reviews for '${official_name ?? 'this official'}':

${reviewText}

Return a JSON object with:
- sentiment_score: number 0–100 (100 = extremely positive)
- primary_concerns: array of top 3 things people are complaining about
- key_strengths: array of top 2 things people like
- executive_summary: 2 sentences summarizing the public mood

Return ONLY the JSON object, no markdown fences.`;

    const raw = await generateContent({
      prompt,
      systemInstruction: 'Return only strict JSON. No markdown. No extra text.',
      temperature: 0.3,
      maxTokens: 400,
    });

    let parsed: any = null;
    try {
      const cleaned = (raw ?? '').replace(/^```json\s*|```\s*$/gi, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw }, { status: 500 });
    }

    return NextResponse.json({ ok: true, analysis: parsed });
  } catch (error: any) {
    console.error('official-sentiment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
