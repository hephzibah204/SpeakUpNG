import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const events = await queryAll(
      `SELECT * FROM political_coalitions ORDER BY event_date DESC NULLS LAST, created_at DESC`
    );
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('coalitions GET error:', error);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { event_type, politician_name, from_party, to_party, description, source_url, event_date } = await request.json();

    if (!event_type || !['defection', 'coalition', 'endorsement', 'running_mate'].includes(event_type)) {
      return NextResponse.json({ error: 'Valid event_type is required' }, { status: 400 });
    }
    if (!politician_name?.trim()) {
      return NextResponse.json({ error: 'politician_name is required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(
      `INSERT INTO political_coalitions (id, event_type, politician_name, from_party, to_party, description, source_url, event_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, event_type, politician_name.trim(), from_party || null, to_party || null, description || null, source_url || null, event_date || null]
    );

    return NextResponse.json({ ok: true, id });
  } catch (error: any) {
    console.error('coalitions POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
