import { NextResponse } from 'next/server';
import { queryAll, queryFirst, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';
import { generateContent } from '@/lib/ai';
import { awardPoints } from '@/lib/gamification';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const label = searchParams.get('label') || '';

    let sql = `
      SELECT fc.*, o.full_name AS official_name, p.full_name AS politician_name,
        (SELECT COUNT(*) FROM fact_check_votes v WHERE v.fact_check_id = fc.id AND v.stance = 'credible') AS credible_votes,
        (SELECT COUNT(*) FROM fact_check_votes v WHERE v.fact_check_id = fc.id AND v.stance = 'not_credible') AS not_credible_votes
      FROM fact_checks fc
      LEFT JOIN officials o ON fc.official_id = o.id
      LEFT JOIN politicians p ON fc.politician_id = p.id
    `;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) { conditions.push('fc.status = ?'); params.push(status); }
    if (label) { conditions.push('fc.label = ?'); params.push(label); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY fc.created_at DESC LIMIT 100';

    const claims = await queryAll(sql, params);
    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error('fact-checks GET error:', error);
    return NextResponse.json({ claims: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { claim, context, official_id, politician_id, evidence_url, submitted_by, device_hash } = await request.json();

    if (!claim?.trim()) {
      return NextResponse.json({ error: 'claim is required' }, { status: 400 });
    }

    const id = randomUUID();

    // Kick off a first-pass AI assessment (advisory only — does not set the final label)
    let aiAssessment = '';
    try {
      let subjectName = '';
      if (official_id) {
        const o = await queryFirst<any>('SELECT full_name FROM officials WHERE id = ?', [official_id]);
        subjectName = o?.full_name || '';
      } else if (politician_id) {
        const p = await queryFirst<any>('SELECT full_name FROM politicians WHERE id = ?', [politician_id]);
        subjectName = p?.full_name || '';
      }

      aiAssessment = await generateContent({
        prompt: `Claim to fact-check${subjectName ? ` (about ${subjectName})` : ''}: "${claim.trim()}"
${context ? `Additional context: ${context}` : ''}
${evidence_url ? `Submitted evidence link: ${evidence_url}` : ''}

Give a brief (3-4 sentence) preliminary assessment of how verifiable this claim is and what evidence would confirm or refute it. Do not state a final true/false verdict — this is advisory input for human reviewers, not the final fact-check label.`,
        systemInstruction: 'You are a careful Nigerian fact-checking assistant. Be precise about uncertainty. Never assert a definitive verdict — only describe verifiability and what evidence is needed.',
        temperature: 0.3,
        maxTokens: 250,
      });
    } catch {
      aiAssessment = '';
    }

    await queryRun(
      `INSERT INTO fact_checks (id, claim, context, official_id, politician_id, submitted_by, evidence_url, status, ai_assessment)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, claim.trim(), context || null, official_id || null, politician_id || null, submitted_by || null, evidence_url || null, aiAssessment || null]
    );

    await awardPoints(device_hash, 'fact_check_submitted', { fact_check_id: id });

    return NextResponse.json({ ok: true, id, ai_assessment: aiAssessment });
  } catch (error: any) {
    console.error('fact-checks POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
