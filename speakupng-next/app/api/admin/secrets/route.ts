import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'save_service_key') {
      const serviceKey = body.service_role_key;
      if (serviceKey) {
        await queryRun(
          'INSERT INTO admin_secrets (id, key, value, updated_at) VALUES (?, ?, ?, NOW()) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()',
          [randomUUID(), 'SUPABASE_SERVICE_ROLE_KEY', serviceKey]
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}