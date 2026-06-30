import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const performance = await queryAll(
      `SELECT gp.*, o.full_name as official_name, o.role, o.state, o.photo_url 
       FROM government_performance gp
       JOIN officials o ON gp.official_id = o.id
       ORDER BY gp.overall_score DESC`
    );
    return NextResponse.json({ performance });
  } catch (error: any) {
    console.error('Performance API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
