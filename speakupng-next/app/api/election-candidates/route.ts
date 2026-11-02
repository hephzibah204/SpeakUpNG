import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2027';
    const type = searchParams.get('type') || 'presidential';
    const state = searchParams.get('state') || '';

    // Join with politicians and officials to dynamically retrieve any uploaded photo_url
    let sql = `
      SELECT ec.*,
             COALESCE(p.photo_url, o.photo_url) as photo_url
      FROM election_candidates ec
      LEFT JOIN politicians p ON ec.politician_id = p.id OR LOWER(ec.candidate_name) = LOWER(p.full_name) OR LOWER(ec.candidate_name) = LOWER(p.common_name)
      LEFT JOIN officials o ON ec.official_id = o.id OR LOWER(ec.candidate_name) = LOWER(o.full_name)
      WHERE ec.election_year = ? AND ec.election_type = ?
    `;
    const params: unknown[] = [parseInt(year), type];
    if (state) { sql += ' AND ec.state = ?'; params.push(state); }
    sql += ' ORDER BY ec.state ASC, ec.candidate_name ASC';

    try {
      const candidates = await queryAll(sql, params);
      return NextResponse.json({ candidates });
    } catch {
      // Fallback in case table structure or joins fail
      let fallbackSql = 'SELECT * FROM election_candidates WHERE election_year = ? AND election_type = ?';
      const fallbackParams: unknown[] = [parseInt(year), type];
      if (state) { fallbackSql += ' AND state = ?'; fallbackParams.push(state); }
      fallbackSql += ' ORDER BY state ASC, candidate_name ASC';
      const fallbackCandidates = await queryAll(fallbackSql, fallbackParams);
      return NextResponse.json({ candidates: fallbackCandidates });
    }
  } catch (error: any) {
    console.error('election-candidates error:', error);
    return NextResponse.json({ candidates: [] });
  }
}
