import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { generateContent } from '@/lib/ai';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const manifestos = await queryAll(
      `SELECT m.*, 
              COALESCE(p.full_name, o.full_name) as politician_name, 
              p.party as party
       FROM official_manifestos m
       LEFT JOIN politicians p ON m.politician_id = p.id
       LEFT JOIN officials o ON m.official_id = o.id
       ORDER BY m.created_at DESC`
    );
    return NextResponse.json({ manifestos });
  } catch (error: any) {
    console.error('Manifestos API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await execute('DELETE FROM official_manifestos WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { politician_id, title, text } = body;

    if (!politician_id || !title || !text) {
      return NextResponse.json({ error: 'Missing required parameters: politician_id, title, text' }, { status: 400 });
    }

    console.log(`Generating AI manifesto analysis for title: "${title}"...`);

    const systemInstruction = `You are a professional political policy analyst and data extraction expert. 
Analyze the provided manifesto text and extract a structured analysis strictly as JSON matching the following schema. Do not output markdown code blocks (like \`\`\`json), just raw text.

{
  "summary": "2-sentence concise summary of the key promises.",
  "cost_feasibility": {
    "rating": "Low / Moderate / High",
    "score": 85, 
    "notes": "A brief explanation of why the rating and score were assigned, highlighting economic feasibility."
  },
  "sdg_alignment": [
    {
      "goal": 1,
      "title": "No Poverty",
      "details": "Details on how the candidate plans to achieve this goal."
    }
  ],
  "milestones": [
    {
      "title": "First milestone or key promise",
      "timeline": "e.g., 100 Days / Year 1 / Year 4",
      "status": "pending"
    }
  ]
}`;

    const prompt = `Manifesto Title: ${title}\nManifesto Text Content:\n${text}`;
    const aiResponseText = await generateContent({
      prompt,
      systemInstruction,
      temperature: 0.2,
      maxTokens: 3000
    });

    let cleanJsonText = aiResponseText.trim();
    if (cleanJsonText.startsWith('```')) {
      // Strip markdown code fences if present
      cleanJsonText = cleanJsonText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }

    const analysis = JSON.parse(cleanJsonText);
    const id = randomUUID();

    await execute(
      `INSERT INTO official_manifestos (id, politician_id, title, summary, cost_feasibility, sdg_alignment, milestones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        politician_id,
        title,
        analysis.summary,
        JSON.stringify(analysis.cost_feasibility),
        JSON.stringify(analysis.sdg_alignment),
        JSON.stringify(analysis.milestones)
      ]
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Create Manifesto Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
