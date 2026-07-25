import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const author_id = searchParams.get('author_id');

  try {
    let query = `
      SELECT p.*, a.display_name as author_name, a.role as author_role 
      FROM blog_posts p
      LEFT JOIN blog_authors a ON p.author_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }
    if (author_id) {
      params.push(author_id);
      query += ` AND p.author_id = $${params.length}`;
    }

    query += ` ORDER BY p.updated_at DESC`;

    const res = await sql.query(query, params);
    return NextResponse.json({ posts: res.rows });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, author_id, status, focus_keyword, meta_title, meta_description, seo_score, readability_score } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and Slug are required fields' }, { status: 400 });
    }

    const id = `post-${Math.random().toString(36).substring(2, 11)}`;
    const finalContent = content || JSON.stringify([
      { id: 'b1', type: 'paragraph', content: 'Start writing your story here...' }
    ]);

    const res = await sql.query(
      `INSERT INTO blog_posts (
        id, title, slug, content, author_id, status, 
        focus_keyword, meta_title, meta_description, seo_score, readability_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id,
        title,
        slug,
        typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent),
        author_id || 'author-default-id',
        status || 'draft',
        focus_keyword || '',
        meta_title || title,
        meta_description || '',
        seo_score || 0,
        readability_score || 0
      ]
    );

    return NextResponse.json({ message: 'Post created successfully', post: res.rows[0] });
  } catch (err: any) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
