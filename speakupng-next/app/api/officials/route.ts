import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const tier = searchParams.get('tier') || '';
  const sort = searchParams.get('sort') || 'rating_count';
  const fullNameIn = searchParams.get('full_name') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE o.status = ?';
    const params: unknown[] = ['active'];

    if (fullNameIn) {
      const names = fullNameIn.split(',').map((n) => n.trim()).filter(Boolean);
      if (names.length > 0) {
        const placeholders = names.map(() => '?').join(',');
        where += ` AND o.full_name IN (${placeholders})`;
        params.push(...names);
      }
    }

    if (search) {
      where += ' AND (LOWER(o.full_name) LIKE ? OR LOWER(o.common_name) LIKE ? OR LOWER(o.role) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (state) {
      where += ' AND o.state = ?';
      params.push(state);
    }

    if (tier) {
      where += ' AND o.tier = ?';
      params.push(tier);
    }

    const orderBy = sort === 'rating_avg_desc' ? 'o.rating_avg DESC'
      : sort === 'rating_avg_asc' ? 'o.rating_avg ASC'
      : sort === 'name' ? 'o.full_name ASC'
      : 'o.rating_count DESC';

    const results = await queryAll(
      `SELECT o.*
       FROM officials o
       ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const countResult = await queryFirst<{ count: number }>(`SELECT COUNT(*) as count FROM officials o ${where}`, params);

    return NextResponse.json({
      officials: results,
      total: countResult?.count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error in GET /api/officials:', error);
    return NextResponse.json({ officials: [], total: 0, page, limit });
  }
}
