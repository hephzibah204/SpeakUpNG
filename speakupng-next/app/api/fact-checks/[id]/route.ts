import { NextResponse } from 'next/server';
import { queryFirst, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';
import { awardPoints } from '@/lib/gamification';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  try {
    const claim = await queryFirst(
      `SELECT fc.*, o.full_name AS official_name, p.full_name AS politician_name
       FROM fact_checks fc
       LEFT JOIN officials o ON fc.official_id = o.id
       LEFT JOIN politicians p ON fc.politician_id = p.id
       WHERE fc.id = ?`,
      [params.id]
    );
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ claim });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin/expert review: set status + label + note
export async function PUT(request: Request, context: any) {
  const params = await context.params;
  try {
    const { status, label, expert_note, reviewed_by } = await request.json();
    await queryRun(
      `UPDATE fact_checks SET status = ?, label = ?, expert_notes = ?, reviewed_by = ?, updated_at = NOW() WHERE id = ?`,
      [status || 'resolved', label || null, expert_note || null, reviewed_by || null, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  await queryRun('DELETE FROM fact_checks WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}

// Community vote on credibility (one per device)
export async function POST(request: Request, context: any) {
  const params = await context.params;
  try {
    const { device_hash, stance } = await request.json();
    if (!device_hash || !['credible', 'not_credible'].includes(stance)) {
      return NextResponse.json({ error: 'device_hash and valid stance required' }, { status: 400 });
    }
    await queryRun(
      `INSERT INTO fact_check_votes (id, fact_check_id, device_hash, stance) VALUES (?, ?, ?, ?)
       ON CONFLICT (fact_check_id, device_hash) DO UPDATE SET stance = EXCLUDED.stance`,
      [randomUUID(), params.id, device_hash, stance]
    );
    // Enough community votes -> move to expert_review automatically
    await queryRun(
      `UPDATE fact_checks SET status = 'community_review'
       WHERE id = ? AND status = 'pending'
       AND (SELECT COUNT(*) FROM fact_check_votes WHERE fact_check_id = ?) >= 5`,
      [params.id, params.id]
    );
    await awardPoints(device_hash, 'fact_check_vote', { fact_check_id: params.id });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
