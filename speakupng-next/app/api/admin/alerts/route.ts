import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    await queryRun(`
      CREATE TABLE IF NOT EXISTS news_alerts (
        id VARCHAR PRIMARY KEY,
        profile_type VARCHAR NOT NULL CHECK(profile_type IN ('official', 'politician')),
        profile_id VARCHAR NOT NULL,
        trigger_keyword VARCHAR NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_triggered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    const alerts = await queryAll(`
      SELECT a.*,
        COALESCE(o.full_name, p.full_name) as profile_name
      FROM news_alerts a
      LEFT JOIN officials o ON a.profile_type = 'official' AND a.profile_id = o.id
      LEFT JOIN politicians p ON a.profile_type = 'politician' AND a.profile_id = p.id
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { profile_type, profile_id, trigger_keyword } = body;

  if (!profile_type || !profile_id || !trigger_keyword) {
    return NextResponse.json({ error: 'profile_type, profile_id and trigger_keyword are required' }, { status: 400 });
  }

  try {
    const id = randomUUID();
    await queryRun(
      'INSERT INTO news_alerts (id, profile_type, profile_id, trigger_keyword, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
      [id, profile_type, profile_id, trigger_keyword]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
