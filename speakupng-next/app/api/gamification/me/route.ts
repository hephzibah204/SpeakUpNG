import { NextResponse } from 'next/server';
import { getTotalPoints, badgeForPoints, nextBadge } from '@/lib/gamification';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceHash = searchParams.get('device_hash') || '';

  if (!deviceHash) {
    return NextResponse.json({ error: 'device_hash is required' }, { status: 400 });
  }

  try {
    const points = await getTotalPoints(deviceHash);
    const badge = badgeForPoints(points);
    const next = nextBadge(points);

    return NextResponse.json({
      points,
      badge,
      next_badge: next,
      points_to_next: next ? next.minPoints - points : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
