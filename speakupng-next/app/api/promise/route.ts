import { NextResponse } from 'next/server';
import { queryRun, queryFirst } from '@/lib/db';
import { randomUUID } from 'crypto';
import { awardPoints } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { promise_id, user_id, device_hash, anon_id, fulfilled, completion_percent, comment } = body;

    if (!promise_id) {
      return NextResponse.json({ error: 'Promise ID is required' }, { status: 400 });
    }

    if (!device_hash) {
      return NextResponse.json({ error: 'Device hash is required' }, { status: 400 });
    }

    // Check if device has already rated this promise
    const existing = await queryFirst(
      `SELECT id FROM promise_assessments WHERE promise_id = ? AND device_hash = ?`,
      [promise_id, device_hash]
    );

    if (existing) {
      return NextResponse.json({ error: 'Already rated from this device.' }, { status: 409 });
    }

    const id = randomUUID();
    const fulfilledBool = !!fulfilled;
    const pct = fulfilledBool ? (completion_percent !== undefined ? parseInt(completion_percent) : 100) : null;

    await queryRun(
      `INSERT INTO promise_assessments (id, promise_id, user_id, device_hash, anon_id, fulfilled, completion_percent, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        promise_id,
        user_id || null,
        device_hash,
        anon_id || null,
        fulfilledBool,
        pct,
        comment || null
      ]
    );

    // Also trigger insertion into audit trail event manually if Postgres trigger did not copy perfectly
    // or if SQLite/Postgres triggers are not fully supported by Neon/Vercel Postgres client
    // Let's log it in mandate_audit_events table
    const auditId = randomUUID();
    const hasComment = comment && comment.trim().length > 0;
    const payload = JSON.stringify({
      fulfilled: fulfilledBool,
      completion_percent: pct,
      has_comment: hasComment
    });

    await queryRun(
      `INSERT INTO mandate_audit_events (id, event_type, promise_id, record_table, record_id, actor_user_id, actor_device_hash, anon_id, payload)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auditId,
        'promise_assessment_insert',
        promise_id,
        'promise_assessments',
        id,
        user_id || null,
        device_hash,
        anon_id || null,
        payload
      ]
    );

    await awardPoints(device_hash, 'promise_assessment_submitted', { promise_id });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Promise Assessment API Error:', error);
    const msg = error.message || '';
    if (msg.includes('UNIQUE') || msg.includes('duplicate') || msg.includes('constraint')) {
      return NextResponse.json({ error: 'Already submitted from this device.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
