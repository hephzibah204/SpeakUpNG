import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2027';
    const type = searchParams.get('type') || 'presidential';
    const state = searchParams.get('state') || '';

    let sql = 'SELECT * FROM election_candidates WHERE election_year = ? AND election_type = ?';
    const params: unknown[] = [parseInt(year), type];
    if (state) { sql += ' AND state = ?'; params.push(state); }
    sql += ' ORDER BY state ASC, candidate_name ASC';

    const candidates = await queryAll(sql, params);

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('election-candidates error:', error);
    return NextResponse.json({ candidates: [] });
  }
}
