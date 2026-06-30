import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const { id } = await context.params;
  const body = await request.json();
  const { is_active, trigger_keyword } = body;

  try {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (is_active !== undefined) { sets.push('is_active = ?'); params.push(is_active); }
    if (trigger_keyword !== undefined) { sets.push('trigger_keyword = ?'); params.push(trigger_keyword); }
    params.push(id);
    if (sets.length === 0) return NextResponse.json({ success: true });
    await queryRun(`UPDATE news_alerts SET ${sets.join(', ')} WHERE id = ?`, params);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  try {
    await queryRun('DELETE FROM news_alerts WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
