import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officialId = searchParams.get('official_id') || '';
  const politicianId = searchParams.get('politician_id') || '';
  const politicianSlug = searchParams.get('politician_slug') || '';

  try {
    const { queryAll } = await import('@/lib/db');

    if (politicianId || politicianSlug) {
      const sql = politicianId
        ? 'SELECT * FROM politician_ratings WHERE politician_id = ? ORDER BY created_at DESC LIMIT 100'
        : `SELECT pr.* FROM politician_ratings pr
           JOIN politicians p ON p.id = pr.politician_id
           WHERE LOWER(p.full_name) LIKE ? OR LOWER(p.common_name) LIKE ?
           ORDER BY pr.created_at DESC LIMIT 100`;
      const params = politicianId ? [politicianId] : [`%${politicianSlug.replace(/-/g, ' ')}%`, `%${politicianSlug.replace(/-/g, ' ')}%`];
      const results = queryAll(sql, params);
      return NextResponse.json({ results });
    }

    if (officialId) {
      const results = queryAll('SELECT * FROM public_ratings WHERE official_id = ? ORDER BY created_at DESC LIMIT 100', [officialId]);
      return NextResponse.json({ results });
    }

    const results = queryAll('SELECT * FROM public_ratings ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { queryRun } = await import('@/lib/db');
    const { randomUUID } = await import('crypto');

    const id = randomUUID();
    const now = new Date().toISOString();

    if (body.target_type === 'politician') {
      queryRun(
        `INSERT INTO politician_ratings (id, politician_id, device_hash, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, review_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, body.target_id, body.device_hash || '', body.overall || 0, body.accountability || null, body.service || null, body.transparency || null, body.responsiveness || null, body.power || null, body.security || null, body.economic_stability || null, body.education || null, body.healthcare || null, body.review_text || '', now]
      );
    } else {
      queryRun(
        `INSERT INTO public_ratings (id, official_id, device_hash, overall, accountability, service, transparency, responsiveness, power, security, economic_stability, education, healthcare, reviewer_state, review_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, body.target_id, body.device_hash || '', body.overall || 0, body.accountability || null, body.service || null, body.transparency || null, body.responsiveness || null, body.power || null, body.security || null, body.economic_stability || null, body.education || null, body.healthcare || null, body.reviewer_state || '', body.review_text || '', now]
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
