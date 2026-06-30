import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM politicians WHERE is_active = ?';
    const params: unknown[] = [1];

    if (search) {
      query += ' AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY priority DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await queryAll(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM politicians WHERE is_active = ?';
    const countParams: unknown[] = [1];

    if (search) {
      countQuery += ' AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ?)';
      const searchTerm = `%${search.toLowerCase()}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const countResult = await queryFirst<{ count: number }>(countQuery, countParams);

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