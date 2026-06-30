import { NextResponse } from 'next/server';
import { getLeaderboard, badgeForPoints } from '@/lib/gamification';

export async function GET() {
  try {
    const rows = await getLeaderboard(50);
    const leaderboard = rows.map((r, i) => {
      const points = Number(r.total_points);
      return {
        rank: i + 1,
        device_hash: r.device_hash.slice(0, 10) + '…',
        points,
        contributions: Number(r.contributions),
        badge: badgeForPoints(points),
      };
    });
    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('leaderboard error:', error);
    return NextResponse.json({ leaderboard: [] });
  }
}
