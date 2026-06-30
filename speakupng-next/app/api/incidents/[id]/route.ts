import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  try {
    const { status, reviewer_note } = await request.json();
    await queryRun(
      'UPDATE election_incidents SET status = ?, reviewer_note = ? WHERE id = ?',
      [status, reviewer_note || null, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  await queryRun('DELETE FROM election_incidents WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
