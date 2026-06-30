import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officialId = searchParams.get('official_id') || '';

  try {
    if (officialId) {
      // Return DNA score for a specific official
      const rows = await queryAll(
        `SELECT
           d.*,
           o.full_name, o.common_name, o.role, o.state, o.photo_url, o.party
         FROM official_dna_scores d
         JOIN officials o ON o.id = d.official_id
         WHERE d.official_id = ?
         LIMIT 1`,
        [officialId]
      );
      if (rows.length === 0) {
        return NextResponse.json({ dna: null }, { status: 404 });
      }
      return NextResponse.json({ dna: rows[0] });
    }

    // Return all DNA scores (leaderboard-style)
    const rows = await queryAll(
      `SELECT
         d.*,
         o.full_name, o.common_name, o.role, o.state, o.photo_url, o.party
       FROM official_dna_scores d
       JOIN officials o ON o.id = d.official_id
       ORDER BY d.overall_score DESC`
    );
    return NextResponse.json({ dna: rows });
  } catch (error) {
    console.error('Error in GET /api/officials/dna:', error);
    return NextResponse.json({ dna: null, error: 'Internal server error' }, { status: 500 });
  }
}
