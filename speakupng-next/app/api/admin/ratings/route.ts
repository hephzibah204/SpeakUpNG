import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const ratings = await queryAll(`
      SELECT r.*, o.full_name as official_name, p.full_name as politician_name
      FROM (
        SELECT id, 'official' as type, official_id as target_id, overall, review_text, reviewer_state, device_hash, created_at FROM public_ratings
        UNION ALL
        SELECT id, 'politician' as type, politician_id as target_id, overall, review_text, null as reviewer_state, device_hash, created_at FROM politician_ratings
      ) r
      LEFT JOIN officials o ON r.type = 'official' AND r.target_id = o.id
      LEFT JOIN politicians p ON r.type = 'politician' AND r.target_id = p.id
      ORDER BY r.created_at DESC LIMIT 100
    `);
    return NextResponse.json({ ratings });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
