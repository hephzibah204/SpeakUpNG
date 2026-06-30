import { NextResponse } from 'next/server';
import { queryFirst, queryAll } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  if (!id) {
    return NextResponse.json({ error: 'Missing promise ID' }, { status: 400 });
  }

  try {
    // 1. Fetch official promise
    const promise = await queryFirst<any>(
      `SELECT * FROM official_promises WHERE id = ?`,
      [id]
    );

    if (!promise) {
      return NextResponse.json({ error: 'Promise not found' }, { status: 404 });
    }

    // 2. Fetch associated official or politician
    let official = null;
    let politician = null;

    if (promise.official_id) {
      official = await queryFirst(
        `SELECT id, full_name, role, photo_url FROM officials WHERE id = ?`,
        [promise.official_id]
      );
    } else if (promise.politician_id) {
      politician = await queryFirst(
        `SELECT id, full_name, common_name, party, aspiration_title, photo_url FROM politicians WHERE id = ?`,
        [promise.politician_id]
      );
    }

    // 3. Fetch completion stats from view
    const completion = await queryFirst(
      `SELECT * FROM promise_public_completion WHERE promise_id = ?`,
      [id]
    );

    // 4. Fetch assessments (notes with comments)
    const assessments = await queryAll(
      `SELECT fulfilled, completion_percent, comment, created_at 
       FROM promise_assessments 
       WHERE promise_id = ? AND comment IS NOT NULL AND comment != ''
       ORDER BY created_at DESC LIMIT 20`,
      [id]
    );

    // 5. Fetch AI advisory verifications
    const aiVerifications = await queryAll(
      `SELECT model, verdict, confidence, evidence_canonical_url, explanation, created_at 
       FROM promise_ai_verifications 
       WHERE promise_id = ?
       ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    // 6. Fetch audit trail events
    const auditTrail = await queryAll(
      `SELECT event_type, record_table, actor_user_id, created_at, payload 
       FROM mandate_audit_events 
       WHERE promise_id = ?
       ORDER BY created_at DESC LIMIT 25`,
      [id]
    );

    // Parse payload JSON from strings if sqlite driver or postgres returning string
    const parsedAuditTrail = auditTrail.map((ev: any) => ({
      ...ev,
      payload: typeof ev.payload === 'string' ? JSON.parse(ev.payload) : (ev.payload || {}),
    }));

    return NextResponse.json({
      promise,
      official,
      politician,
      completion: completion || { total_votes: 0, yes_votes: 0, no_votes: 0, completion_score: null },
      assessments,
      aiVerifications,
      auditTrail: parsedAuditTrail,
    });
  } catch (error) {
    console.error('Error fetching promise details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
