import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const officialId = searchParams.get('official_id');

  try {
    if (officialId) {
      const projects = await queryAll(
        `SELECT * FROM official_projects WHERE official_id = ? ORDER BY date_delivered DESC`,
        [officialId]
      );
      return NextResponse.json({ projects });
    }

    const projects = await queryAll(
      `SELECT p.*, o.full_name as official_name, o.role as official_role 
       FROM official_projects p
       LEFT JOIN officials o ON p.official_id = o.id
       ORDER BY p.created_at DESC`
    );
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { official_id, title, description, status, budget, date_delivered, evidence_url } = body;

    if (!official_id || !title) {
      return NextResponse.json({ error: 'Official ID and Title are required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(`
      INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered, evidence_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      official_id,
      title,
      description || null,
      status || 'completed',
      budget || null,
      date_delivered || null,
      evidence_url || null
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
