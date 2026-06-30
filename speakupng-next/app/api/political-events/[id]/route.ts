import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  try {
    const { official_id, politician_id, event_type, from_party, to_party, description, source_url, event_date } = await request.json();
    await queryRun(
      `UPDATE political_events SET official_id = ?, politician_id = ?, event_type = ?, from_party = ?, to_party = ?, description = ?, source_url = ?, event_date = ? WHERE id = ?`,
      [official_id || null, politician_id || null, event_type, from_party || null, to_party || null, description || null, source_url || null, event_date || null, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  await queryRun('DELETE FROM political_events WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
