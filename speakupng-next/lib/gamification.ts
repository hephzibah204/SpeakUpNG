import { queryAll, queryFirst, queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export const POINTS = {
  rating_submitted: 10,
  promise_assessment_submitted: 8,
  fact_check_submitted: 15,
  fact_check_vote: 3,
  incident_report_submitted: 20,
} as const;

export type GamificationAction = keyof typeof POINTS;

export async function awardPoints(deviceHash: string | null | undefined, action: GamificationAction, meta: Record<string, unknown> = {}) {
  if (!deviceHash) return;
  try {
    await queryRun(
      `INSERT INTO reward_points_ledger (id, anon_id, device_hash, action, points, meta) VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), deviceHash, deviceHash, action, POINTS[action], JSON.stringify(meta)]
    );
  } catch (err) {
    console.error('awardPoints failed:', err);
  }
}

export interface BadgeDef {
  key: string;
  label: string;
  icon: string;
  minPoints: number;
}

export const BADGES: BadgeDef[] = [
  { key: 'newcomer', label: 'Civic Newcomer', icon: '🌱', minPoints: 0 },
  { key: 'contributor', label: 'Civic Contributor', icon: '🗳️', minPoints: 50 },
  { key: 'verified_observer', label: 'Verified Observer', icon: '👁️', minPoints: 150 },
  { key: 'fact_checker', label: 'Fact Checker', icon: '🔍', minPoints: 300 },
  { key: 'civic_champion', label: 'Civic Champion', icon: '🏆', minPoints: 600 },
  { key: 'community_leader', label: 'Community Leader', icon: '👑', minPoints: 1200 },
];

export function badgeForPoints(points: number): BadgeDef {
  let current = BADGES[0];
  for (const b of BADGES) {
    if (points >= b.minPoints) current = b;
  }
  return current;
}

export function nextBadge(points: number): BadgeDef | null {
  return BADGES.find(b => b.minPoints > points) || null;
}

export async function getTotalPoints(deviceHash: string): Promise<number> {
  const row = await queryFirst<{ total: string }>(
    `SELECT COALESCE(SUM(points), 0) AS total FROM reward_points_ledger WHERE device_hash = ?`,
    [deviceHash]
  );
  return Number(row?.total || 0);
}

export async function getLeaderboard(limit = 20) {
  return queryAll<{ device_hash: string; total_points: string; contributions: string }>(
    `SELECT device_hash, SUM(points) AS total_points, COUNT(*) AS contributions
     FROM reward_points_ledger
     GROUP BY device_hash
     ORDER BY total_points DESC
     LIMIT ?`,
    [limit]
  );
}
