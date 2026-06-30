import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { official_id, politician_id, anon_id, description, evidence_url, is_anonymous, categories } = body;

    if (!official_id && !politician_id) {
      return NextResponse.json({ error: 'Either official_id or politician_id is required' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const id = randomUUID();
    const catsStr = Array.isArray(categories) ? categories.join(',') : (categories || '');

    await queryRun(`
      INSERT INTO misconduct_reports (id, official_id, politician_id, anon_id, description, evidence_url, is_anonymous, categories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      official_id || null,
      politician_id || null,
      anon_id || null,
      description,
      evidence_url || null,
      is_anonymous ? 1 : 0,
      catsStr
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Reports API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
