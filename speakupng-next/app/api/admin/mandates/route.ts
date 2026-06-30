import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';

    let sql = `
      SELECT p.*,
             o.full_name AS official_name,
             pol.full_name AS politician_name
      FROM official_promises p
      LEFT JOIN officials o ON p.official_id = o.id
      LEFT JOIN politicians pol ON p.politician_id = pol.id
    `;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (q) {
      conditions.push('(LOWER(p.promise_title) LIKE ? OR LOWER(p.promise_detail) LIKE ?)');
      params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`);
    }
    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY p.created_at DESC LIMIT 100';

    const promises = await queryAll(sql, params);
    return NextResponse.json({ promises });
  } catch (error: any) {
    console.error('Error fetching mandates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      official_id,
      politician_id,
      promise_title,
      promise_category,
      promise_detail,
      status,
      evidence_url,
      progress_percent,
    } = body;

    if (!promise_title || !promise_category) {
      return NextResponse.json({ error: 'Promise title and category are required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(`
      INSERT INTO official_promises (id, official_id, politician_id, promise_title, promise_category, promise_detail, status, evidence_url, progress_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      official_id || null,
      politician_id || null,
      promise_title,
      promise_category,
      promise_detail || null,
      status || 'pending',
      evidence_url || null,
      progress_percent !== undefined ? parseInt(progress_percent) : 0,
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating promise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
