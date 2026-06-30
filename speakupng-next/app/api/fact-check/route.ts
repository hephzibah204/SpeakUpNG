import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  try {
    const factChecks = await queryAll(
      `SELECT * FROM fact_checks ORDER BY created_at DESC`
    );
    return NextResponse.json({ factChecks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { claim, evidence_url, official_id } = body;

    if (!claim) {
      return NextResponse.json({ error: 'Claim text is required' }, { status: 400 });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO fact_checks (id, claim, evidence_url, official_id, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [id, claim, evidence_url || null, official_id || null]
    );

    return NextResponse.json({ success: true, factCheckId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
