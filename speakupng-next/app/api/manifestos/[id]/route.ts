import { NextResponse } from 'next/server';
import { queryFirst, execute } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  try {
    const manifesto = await queryFirst(
      `SELECT m.*,
              COALESCE(p.full_name, o.full_name) as politician_name,
              p.party as party
       FROM official_manifestos m
       LEFT JOIN politicians p ON m.politician_id = p.id
       LEFT JOIN officials o ON m.official_id = o.id
       WHERE m.id = ?`,
      [params.id]
    );
    if (!manifesto) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ manifesto });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  try {
    await execute('DELETE FROM official_manifestos WHERE id = ?', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
