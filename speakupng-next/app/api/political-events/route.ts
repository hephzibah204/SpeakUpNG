import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event_type') || '';

    let sql = `
      SELECT pe.*, o.full_name AS official_name, p.full_name AS politician_name
      FROM political_events pe
      LEFT JOIN officials o ON pe.official_id = o.id
      LEFT JOIN politicians p ON pe.politician_id = p.id
    `;
    const params: unknown[] = [];
    if (eventType) {
      sql += ' WHERE pe.event_type = ?';
      params.push(eventType);
    }
    sql += ' ORDER BY pe.event_date DESC NULLS LAST, pe.created_at DESC LIMIT 200';

    const events = await queryAll(sql, params);
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('political-events GET error:', error);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { official_id, politician_id, event_type, from_party, to_party, description, source_url, event_date } = await request.json();

    if (!event_type || !['defection', 'coalition', 'endorsement', 'running_mate', 'alliance'].includes(event_type)) {
      return NextResponse.json({ error: 'Valid event_type is required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(
      `INSERT INTO political_events (id, official_id, politician_id, event_type, from_party, to_party, description, source_url, event_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, official_id || null, politician_id || null, event_type, from_party || null, to_party || null, description || null, source_url || null, event_date || null]
    );

    return NextResponse.json({ ok: true, id });
  } catch (error: any) {
    console.error('political-events POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
