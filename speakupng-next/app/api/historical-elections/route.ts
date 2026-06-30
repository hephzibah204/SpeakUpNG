import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const type = searchParams.get('type') || 'presidential';

    let sql = 'SELECT * FROM historical_elections WHERE election_type = ?';
    const params: unknown[] = [type];

    if (year) {
      sql += ' AND election_year = ?';
      params.push(parseInt(year));
    }

    sql += ' ORDER BY election_year DESC, votes DESC';

    const results = await queryAll(sql, params);

    const years = Array.from(new Set(results.map((r: any) => r.election_year))).sort((a: any, b: any) => b - a);
    const byYear: Record<number, any[]> = {};
    for (const r of results as any[]) {
      byYear[r.election_year] = byYear[r.election_year] || [];
      byYear[r.election_year].push(r);
    }

    return NextResponse.json({ years, elections: byYear });
  } catch (error: any) {
    console.error('historical-elections error:', error);
    return NextResponse.json({ years: [], elections: {} });
  }
}
