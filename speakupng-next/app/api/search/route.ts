import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchTerm = `%${q.toLowerCase()}%`;

    const [officials, politicians, news] = await Promise.all([
      queryAll(
        "SELECT id, full_name AS name, common_name, role, tier, 'official' AS type FROM officials WHERE status = ? AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ? OR LOWER(role) LIKE ?) LIMIT 10",
        ['active', searchTerm, searchTerm, searchTerm]
      ),
      queryAll(
        "SELECT id, full_name AS name, common_name, aspiration_title AS role, party, 'politician' AS type FROM politicians WHERE is_active = ? AND (LOWER(full_name) LIKE ? OR LOWER(common_name) LIKE ?) LIMIT 10",
        [true, searchTerm, searchTerm]
      ),
      queryAll(
        "SELECT id, title AS name, summary AS role, published_at AS created_at, 'news' AS type FROM news_items WHERE moderation_status = ? AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?) LIMIT 10",
        ['approved', searchTerm, searchTerm]
      ),
    ]);

    const results = [...officials, ...politicians, ...news];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}