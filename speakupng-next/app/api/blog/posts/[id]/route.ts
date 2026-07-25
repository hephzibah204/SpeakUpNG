import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await sql.query(
      `SELECT p.*, a.display_name as author_name, a.role as author_role 
       FROM blog_posts p
       LEFT JOIN blog_authors a ON p.author_id = a.id
       WHERE p.id = $1`,
      [id]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post: res.rows[0] });
  } catch (err: any) {
    console.error('Error fetching post:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, slug, content, status, focus_keyword, meta_title, meta_description, seo_score, readability_score } = body;

    const res = await sql.query(
      `UPDATE blog_posts 
       SET title = $1, slug = $2, content = $3, status = $4, 
           focus_keyword = $5, meta_title = $6, meta_description = $7, 
           seo_score = $8, readability_score = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title,
        slug,
        typeof content === 'string' ? content : JSON.stringify(content),
        status,
        focus_keyword,
        meta_title,
        meta_description,
        seo_score,
        readability_score,
        id
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post updated successfully', post: res.rows[0] });
  } catch (err: any) {
    console.error('Error updating post:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Quick Edit fields support
    const fields = [];
    const values = [];
    let paramIdx = 1;

    for (const key of ['title', 'slug', 'status', 'published_at']) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${paramIdx}`);
        values.push(body[key]);
        paramIdx++;
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE blog_posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx} RETURNING *`;
    
    const res = await sql.query(query, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post quick-updated successfully', post: res.rows[0] });
  } catch (err: any) {
    console.error('Error quick-updating post:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await sql.query(`DELETE FROM blog_posts WHERE id = $1 RETURNING *`, [id]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted successfully', post: res.rows[0] });
  } catch (err: any) {
    console.error('Error deleting post:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
