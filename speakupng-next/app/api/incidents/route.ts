import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';
import { awardPoints } from '@/lib/gamification';

const CATEGORIES = ['vote_buying', 'violence', 'ballot_snatching', 'missing_materials', 'delayed_officials', 'card_reader_failure', 'intimidation', 'fake_polling_unit', 'other'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const state = searchParams.get('state') || '';

    let sql = 'SELECT * FROM election_incidents';
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (state) { conditions.push('state = ?'); params.push(state); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT 200';

    const incidents = await queryAll(sql, params);
    return NextResponse.json({ incidents });
  } catch (error: any) {
    console.error('incidents GET error:', error);
    return NextResponse.json({ incidents: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, description, state, lga, polling_unit, lat, lng, photo_url, video_url, reporter_name, reporter_contact, device_hash } = body;

    if (!category || !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Valid category is required' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(
      `INSERT INTO election_incidents (id, category, description, state, lga, polling_unit, lat, lng, photo_url, video_url, reporter_name, reporter_contact, device_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, category, description.trim(), state || null, lga || null, polling_unit || null,
       lat ?? null, lng ?? null, photo_url || null, video_url || null,
       reporter_name || null, reporter_contact || null, device_hash || null]
    );

    await awardPoints(device_hash, 'incident_report_submitted', { incident_id: id, category });

    return NextResponse.json({ ok: true, id });
  } catch (error: any) {
    console.error('incidents POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
