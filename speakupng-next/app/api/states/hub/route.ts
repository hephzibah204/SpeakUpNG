import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stateName = searchParams.get('state_name');

  if (!stateName) {
    return NextResponse.json({ error: 'state_name parameter is required' }, { status: 400 });
  }

  try {
    // 1. Fetch officials representing this state (Governor, Senators)
    const officials = await queryAll(
      `SELECT id, full_name, role, photo_url, rating_avg 
       FROM officials 
       WHERE state = ? OR (LOWER(role) = 'governor' AND state = ?)`,
      [stateName, stateName]
    );

    // 2. Fetch promises for these officials
    const promises = await queryAll(
      `SELECT p.*, o.full_name as official_name 
       FROM official_promises p
       JOIN officials o ON p.official_id = o.id
       WHERE o.state = ?`,
      [stateName]
    );

    // 3. Fetch projects for these officials
    const projects = await queryAll(
      `SELECT pr.*, o.full_name as official_name 
       FROM official_projects pr
       JOIN officials o ON pr.official_id = o.id
       WHERE o.state = ?`,
      [stateName]
    );

    // 4. Fetch recent incidents reported in this state
    const incidents = await queryAll(
      `SELECT * FROM misconduct_reports 
       WHERE state = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [stateName]
    );

    return NextResponse.json({
      officials,
      promises,
      projects,
      incidents
    });
  } catch (error: any) {
    console.error('State Hub API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
