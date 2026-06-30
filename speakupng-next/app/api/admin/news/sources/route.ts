import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const sources = await queryAll(
      'SELECT * FROM news_sources ORDER BY name ASC'
    );
    return NextResponse.json({ sources });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, home_url, feed_url, credibility_tier = 'tier2' } = body;

  if (!name || !home_url || !feed_url) {
    return NextResponse.json({ error: 'name, home_url and feed_url are required' }, { status: 400 });
  }

  try {
    const id = randomUUID();
    await queryRun(
      `INSERT INTO news_sources (id, name, home_url, feed_url, credibility_tier, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [id, name, home_url, feed_url, credibility_tier]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
