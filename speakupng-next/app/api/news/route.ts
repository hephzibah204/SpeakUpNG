import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    const { queryAll, queryFirst } = await import('@/lib/db');

    let where = 'WHERE moderation_status = ?';
    const params: any[] = ['approved'];

    if (search) {
      where += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    const results = queryAll(`SELECT * FROM news_items ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const countResult = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM news_items ${where}`, params);

    return NextResponse.json({
      news: results,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ news: [], total: 0, page, limit });
  }
}
