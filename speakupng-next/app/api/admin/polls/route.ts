import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const polls = await queryAll('SELECT * FROM polls ORDER BY created_at DESC');
    return NextResponse.json({ polls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { question, options, closes_at } = body;

  if (!question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'question and at least 2 options are required' }, { status: 400 });
  }

  try {
    const id = randomUUID();
    await queryRun(
      `INSERT INTO polls (id, question, options, total_votes, status, closes_at, created_at, updated_at)
       VALUES (?, ?, ?::jsonb, 0, 'active', ?, NOW(), NOW())`,
      [id, question, JSON.stringify(options), closes_at || null]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
