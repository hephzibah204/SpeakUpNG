import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = 'SELECT id, title, slug, summary, category, author, published_at, created_at FROM blog_posts WHERE published = true';
    const params: unknown[] = [];

    if (search) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT 100';

    const posts = await queryAll(sql, params);
    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ posts: [] });
  }
}
