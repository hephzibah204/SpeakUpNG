import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q) return NextResponse.json({ results: [] });

  try {
    const { queryAll } = await import('@/lib/db');
    const term = `%${q.toLowerCase()}%`;

    const officials = queryAll(
      `SELECT id, full_name, common_name, role, tier, 'official' as type FROM officials WHERE status = ? AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ? OR LOWER(role) LIKE ?) LIMIT 10`,
      ['active', term, term, term]
    );

    const politicians = queryAll(
      `SELECT id, full_name, common_name, aspiration_title as role, party, 'politician' as type FROM politicians WHERE is_active = ? AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ?) LIMIT 10`,
      [true, term, term]
    );

    const news = queryAll(
      `SELECT id, title, summary, published_at, 'news' as type FROM news_items WHERE moderation_status = ? AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?) LIMIT 10`,
      ['approved', term, term]
    );

    return NextResponse.json({ results: [...officials, ...politicians, ...news] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
