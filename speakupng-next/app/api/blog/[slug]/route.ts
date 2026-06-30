import { NextResponse } from 'next/server';
import { queryFirst } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const slug = params.slug as string;

  try {
    const post = await queryFirst(
      'SELECT * FROM blog_posts WHERE slug = ? AND published = true',
      [slug]
    );
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
