import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const politicianId = searchParams.get('politician_id') || '';
  const officialId = searchParams.get('official_id') || '';
  const status = searchParams.get('status') || '';

  if (!politicianId && !officialId) {
    return NextResponse.json({ promises: [], stats: null });
  }

  try {
    let query = 'SELECT * FROM official_promises WHERE';
    const params: unknown[] = [];

    if (politicianId) {
      query += ' politician_id = ?';
      params.push(politicianId);
    } else {
      query += ' official_id = ?';
      params.push(officialId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY last_updated DESC';

    const results = await queryAll(query, params);

    const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'broken' THEN 1 ELSE 0 END) as broken,
        SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed,
        CASE
          WHEN COUNT(*) > 0 THEN
            ROUND((SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) + SUM(CASE WHEN status = 'in_progress' THEN 0.4 ELSE 0 END))::numeric / CAST(COUNT(*) AS REAL) * 100, 1)
          ELSE 0
        END as mandate_score
      FROM official_promises
      WHERE ${politicianId ? 'politician_id = ?' : 'official_id = ?'}
    `;

    const statsResult = await queryFirst<{
      total: number;
      fulfilled: number;
      in_progress: number;
      broken: number;
      disputed: number;
      mandate_score: number;
    }>(statsQuery, [politicianId || officialId]);

    return NextResponse.json({
      promises: results,
      stats: statsResult || { total: 0, fulfilled: 0, in_progress: 0, broken: 0, disputed: 0, mandate_score: 0 },
    });
  } catch (error) {
    console.error('Error fetching promises:', error);
    return NextResponse.json({ promises: [], stats: null });
  }
}