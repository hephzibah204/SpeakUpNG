import { NextResponse } from 'next/server';
import { queryAll, queryFirst, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';
import { awardPoints } from '@/lib/gamification';

function calculateOverall(categories: Record<string, unknown>): number {
  const values: number[] = [];
  for (const key of ['accountability', 'service', 'transparency', 'responsiveness', 'power', 'security', 'economic_stability', 'education', 'healthcare']) {
    const val = Number(categories[key]);
    if (val >= 1 && val <= 5) values.push(val);
  }
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officialId = searchParams.get('official_id') || '';
  const politicianId = searchParams.get('politician_id') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query: string;
    const params: unknown[] = [];

    if (officialId) {
      query = 'SELECT * FROM public_ratings WHERE official_id = ?';
      params.push(officialId);
    } else if (politicianId) {
      query = 'SELECT * FROM politician_ratings WHERE politician_id = ?';
      params.push(politicianId);
    } else {
      query = 'SELECT * FROM public_ratings';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await queryAll(query, params);

    return NextResponse.json({
      ratings: results,
      total: results.length,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ ratings: [], total: 0, page, limit });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { official_id, politician_id, device_hash, review_text, reviewer_state, reviewer_name, ...categories } = body;

    if (!device_hash) {
      return NextResponse.json({ error: 'Device hash is required' }, { status: 400 });
    }

    if (!official_id && !politician_id) {
      return NextResponse.json({ error: 'Either official_id or politician_id is required' }, { status: 400 });
    }

    const overall = calculateOverall(categories) || Number(body.overall) || 0;
    const id = randomUUID();
    const finalName = String(reviewer_name || '').trim() || 'Anonymous';

    if (official_id) {
      await queryRun(`
        INSERT INTO public_ratings (id, official_id, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, reviewer_state, review_text, device_hash, reviewer_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, official_id, overall,
        categories.accountability || null,
        categories.service || null,
        categories.transparency || null,
        categories.responsiveness || null,
        categories.power || null,
        categories.security || null,
        categories.economic_stability || null,
        categories.education || null,
        categories.healthcare || null,
        reviewer_state || null,
        review_text || null,
        device_hash,
        finalName]);
    } else {
      await queryRun(`
        INSERT INTO politician_ratings (id, politician_id, device_hash, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, review_text, reviewer_state, reviewer_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, politician_id, device_hash, overall,
        categories.accountability || null,
        categories.service || null,
        categories.transparency || null,
        categories.responsiveness || null,
        categories.power || null,
        categories.security || null,
        categories.economic_stability || null,
        categories.education || null,
        categories.healthcare || null,
        review_text || null,
        reviewer_state || null,
        finalName]);
    }

    await awardPoints(device_hash, 'rating_submitted', { official_id, politician_id });

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error in POST /api/ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}