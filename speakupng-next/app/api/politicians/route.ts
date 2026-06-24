import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    const { queryAll, queryFirst } = await import('@/lib/db');

    let where = 'WHERE is_active = ?';
    const params: any[] = [true];

    if (search) {
      where += ' AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    const results = queryAll(`SELECT * FROM politicians ${where} ORDER BY priority DESC, created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const countResult = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM politicians ${where}`, params);

    return NextResponse.json({
      politicians: results,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ politicians: [], total: 0, page, limit });
  }
}
