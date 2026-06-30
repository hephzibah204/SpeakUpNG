import { NextResponse } from 'next/server';
import { queryAll, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    await queryRun(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        summary TEXT,
        content TEXT,
        category VARCHAR NOT NULL DEFAULT 'blog',
        author VARCHAR,
        published BOOLEAN NOT NULL DEFAULT FALSE,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    const posts = await queryAll('SELECT * FROM blog_posts ORDER BY created_at DESC');
    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, slug, summary, content, category = 'blog', author, published = false } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: 'title, slug and content are required' }, { status: 400 });
  }

  try {
    const id = randomUUID();
    await queryRun(
      `INSERT INTO blog_posts (id, title, slug, summary, content, category, author, published, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, title, slug, summary || null, content, category, author || null,
       published, published ? new Date().toISOString() : null]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
