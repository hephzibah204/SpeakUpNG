import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'save_service_key' && body.service_role_key) {
      const { queryRun } = await import('@/lib/db');
      queryRun(
        `INSERT INTO admin_secrets (id, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?`,
        [crypto.randomUUID(), 'SUPABASE_SERVICE_ROLE_KEY', body.service_role_key, new Date().toISOString(), body.service_role_key, new Date().toISOString()]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving secrets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
