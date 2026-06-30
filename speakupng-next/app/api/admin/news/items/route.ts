import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const search = searchParams.get('search') || '';

  try {
    let where = 'WHERE ni.moderation_status = ?';
    const params: unknown[] = [status];

    if (search) {
      where += ' AND LOWER(ni.title) LIKE ?';
      params.push(`%${search.toLowerCase()}%`);
    }

    const items = await queryAll(
      `SELECT ni.*, ns.name as source_name
       FROM news_items ni
       LEFT JOIN news_sources ns ON ni.source_id = ns.id
       ${where}
       ORDER BY ni.published_at DESC NULLS LAST
       LIMIT 100`,
      params
    );
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
