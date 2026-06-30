import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  try {
    const verifications = await queryAll(
      `SELECT * FROM project_verifications WHERE project_id = ? ORDER BY created_at DESC`,
      [projectId]
    );

    // Calculate status aggregates
    const stats = await queryAll(
      `SELECT status, COUNT(*) as count 
       FROM project_verifications 
       WHERE project_id = ? 
       GROUP BY status`,
      [projectId]
    );

    return NextResponse.json({ verifications, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_id, status, photo_url, comment, device_hash } = body;

    if (!project_id || !status || !device_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent double verification from the same device
    const existing = await queryAll(
      `SELECT id FROM project_verifications WHERE project_id = ? AND device_hash = ?`,
      [project_id, device_hash]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already verified this project.' }, { status: 400 });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO project_verifications (id, project_id, status, photo_url, comment, device_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, project_id, status, photo_url || null, comment || null, device_hash]
    );

    return NextResponse.json({ success: true, verificationId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
