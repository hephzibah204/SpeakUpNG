import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const petitions = await queryAll(
      `SELECT gp.*, o.full_name as target_official_name, o.role as target_official_role 
       FROM governance_petitions gp 
       LEFT JOIN officials o ON gp.target_official_id = o.id 
       ORDER BY gp.created_at DESC`
    );
    return NextResponse.json({ petitions });
  } catch (error: any) {
    console.error('governance/petitions GET error:', error);
    return NextResponse.json({ petitions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, petitionId, title, summary, target_official_id } = body;

    if (action === 'sign' || petitionId) {
      const idToSign = petitionId || body.id;
      if (!idToSign) {
        return NextResponse.json({ error: 'petitionId is required to sign' }, { status: 400 });
      }
      
      const result = await queryRun(
        `UPDATE governance_petitions SET signatures_count = signatures_count + 1 WHERE id = ?`,
        [idToSign]
      );
      
      if (result.changes === 0) {
        return NextResponse.json({ error: 'Petition not found' }, { status: 404 });
      }

      return NextResponse.json({ ok: true });
    } else {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'title is required' }, { status: 400 });
      }
      if (!summary?.trim()) {
        return NextResponse.json({ error: 'summary is required' }, { status: 400 });
      }

      const id = randomUUID();
      await queryRun(
        `INSERT INTO governance_petitions (id, title, summary, target_official_id, signatures_count)
         VALUES (?, ?, ?, ?, 1)`,
        [id, title.trim(), summary.trim(), target_official_id || null]
      );

      return NextResponse.json({ ok: true, id });
    }
  } catch (error: any) {
    console.error('governance/petitions POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
