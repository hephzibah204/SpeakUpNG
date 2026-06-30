import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    const body = await request.json();
    const {
      official_id,
      politician_id,
      promise_title,
      promise_category,
      promise_detail,
      status,
      evidence_url,
      progress_percent,
    } = body;

    if (!promise_title || !promise_category) {
      return NextResponse.json({ error: 'Promise title and category are required' }, { status: 400 });
    }

    await queryRun(`
      UPDATE official_promises
      SET official_id = ?, politician_id = ?, promise_title = ?, promise_category = ?, promise_detail = ?, status = ?, evidence_url = ?, progress_percent = ?
      WHERE id = ?
    `, [
      official_id || null,
      politician_id || null,
      promise_title,
      promise_category,
      promise_detail || null,
      status || 'pending',
      evidence_url || null,
      progress_percent !== undefined ? parseInt(progress_percent) : 0,
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating promise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    await queryRun('DELETE FROM official_promises WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting promise:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
