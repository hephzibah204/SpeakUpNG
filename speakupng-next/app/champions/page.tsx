'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  device_hash: string;
  points: number;
  contributions: number;
  badge: { key: string; label: string; icon: string };
}

interface MeData {
  points: number;
  badge: { key: string; label: string; icon: string };
  next_badge: { label: string; icon: string; minPoints: number } | null;
  points_to_next: number;
}

export default function ChampionsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deviceHash = localStorage.getItem('nr_anon_id');

    Promise.all([
      fetch('/api/gamification/leaderboard').then(r => r.json()),
      deviceHash ? fetch(`/api/gamification/me?device_hash=${encodeURIComponent(deviceHash)}`).then(r => r.json()) : Promise.resolve(null),
    ])
      .then(([lb, meData]) => {
        setLeaderboard(lb.leaderboard || []);
        if (meData && !meData.error) setMe(meData);
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold font-display text-white mb-3">Civic Champions</h1>
        <p className="text-[#6b7163] text-lg mb-8 max-w-2xl">
          Earn points by rating officials, fact-checking claims, voting on credibility, and reporting election incidents.
        </p>

        {me && (
          <div className="bg-[#1d211b] border border-[#008751]/30 rounded-2xl p-6 mb-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{me.badge.icon}</div>
              <div>
                <div className="text-xs text-[#6b7163] font-bold uppercase">Your Badge</div>
                <div className="text-xl font-bold text-white">{me.badge.label}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold font-display text-[#00b368]">{me.points} pts</div>
              {me.next_badge && (
                <div className="text-xs text-[#6b7163]">{me.points_to_next} pts to {me.next_badge.icon} {me.next_badge.label}</div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#6b7163]">
            No contributions yet. Be the first civic champion — rate an official or submit a fact-check.
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map(entry => (
              <div key={entry.device_hash} className="flex items-center gap-4 p-4 bg-[#1d211b] border border-[#2c312a] rounded-xl">
                <div className="text-lg font-extrabold font-display text-[#6b7163] w-8 text-center">{entry.rank}</div>
                <div className="text-2xl">{entry.badge.icon}</div>
                <div className="flex-1">
                  <div className="font-mono text-xs text-zinc-400">{entry.device_hash}</div>
                  <div className="text-[10px] text-[#6b7163] uppercase font-bold">{entry.badge.label}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#00b368]">{entry.points} pts</div>
                  <div className="text-[10px] text-[#6b7163]">{entry.contributions} contributions</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
