import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const tier = searchParams.get('tier') || '';
  const sort = searchParams.get('sort') || 'rating_count';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  try {
    const { queryAll, queryFirst } = await import('@/lib/db');

    let where = 'WHERE status = ?';
    const params: any[] = ['active'];

    if (search) {
      where += ' AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ? OR LOWER(role) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }
    if (state) { where += ' AND state = ?'; params.push(state); }
    if (tier) { where += ' AND tier = ?'; params.push(tier); }

    const orderBy = sort === 'rating_avg_desc' ? 'rating_avg DESC'
      : sort === 'rating_avg_asc' ? 'rating_avg ASC'
      : sort === 'name' ? 'full_name ASC'
      : 'rating_count DESC';

    const results = queryAll(`SELECT * FROM officials ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const countResult = queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM officials ${where}`, params);

    return NextResponse.json({
      officials: results,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch {
    return NextResponse.json({ officials: [], total: 0, page, limit });
  }
}
