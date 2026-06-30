import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const { id } = await context.params;
  const body = await request.json();
  const { is_active, credibility_tier } = body;

  try {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (is_active !== undefined) { sets.push('is_active = ?'); params.push(is_active); }
    if (credibility_tier !== undefined) { sets.push('credibility_tier = ?'); params.push(credibility_tier); }
    sets.push('updated_at = NOW()');
    params.push(id);
    await queryRun(`UPDATE news_sources SET ${sets.join(', ')} WHERE id = ?`, params);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  try {
    await queryRun('DELETE FROM news_sources WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
