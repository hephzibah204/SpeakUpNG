import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const { id } = await context.params;
  const body = await request.json();
  const { title, slug, summary, content, category, author, published } = body;

  try {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (title !== undefined) { sets.push('title = ?'); params.push(title); }
    if (slug !== undefined) { sets.push('slug = ?'); params.push(slug); }
    if (summary !== undefined) { sets.push('summary = ?'); params.push(summary); }
    if (content !== undefined) { sets.push('content = ?'); params.push(content); }
    if (category !== undefined) { sets.push('category = ?'); params.push(category); }
    if (author !== undefined) { sets.push('author = ?'); params.push(author); }
    if (published !== undefined) {
      sets.push('published = ?');
      params.push(published);
      sets.push('published_at = ?');
      params.push(published ? new Date().toISOString() : null);
    }
    sets.push('updated_at = NOW()');
    params.push(id);

    await queryRun(`UPDATE blog_posts SET ${sets.join(', ')} WHERE id = ?`, params);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  try {
    await queryRun('DELETE FROM blog_posts WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
