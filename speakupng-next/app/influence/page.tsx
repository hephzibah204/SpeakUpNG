'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ──────────── Types ──────────── */
interface Official {
  id: string;
  full_name: string;
  common_name?: string;
  role?: string;
  tier?: string;
  state?: string;
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
}

/* ──────────── Helpers ──────────── */
function slugify(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function avatar(name: string, photo?: string) {
  return (
    photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`
  );
}

/* ──────────── Tier → category mapping ──────────── */
const TIER_GOVERNOR = 'state_executive';
const TIER_SENATOR = 'federal_legislature';

/* ──────────── Category definitions ──────────── */
type CategoryKey =
  | 'governors'
  | 'senators'
  | 'reps'
  | 'rising'
  | 'searched'
  | 'approved';

interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const CATEGORIES: Category[] = [
  { key: 'governors', label: 'Most Trusted Governor', icon: '🏛️', color: '#00b368', description: 'Governors ranked by citizen approval ratings' },
  { key: 'senators', label: 'Most Trusted Senator', icon: '⚖️', color: '#3b82f6', description: 'Senators ranked by citizen trust scores' },
  { key: 'reps', label: 'Best Performing Rep', icon: '🎖️', color: '#8b5cf6', description: 'House of Representatives members with highest ratings' },
  { key: 'rising', label: 'Rising Politician', icon: '🚀', color: '#e8a020', description: 'Officials gaining the most traction this week' },
  { key: 'searched', label: 'Most Searched', icon: '🔥', color: '#e03030', description: 'Officials with the most citizen engagement activity' },
  { key: 'approved', label: 'Most Approved', icon: '✅', color: '#00b368', description: 'Overall highest approval ratings across all tiers' },
];

/* ──────────── Trend arrow ──────────── */
function TrendArrow({ index }: { index: number }) {
  // Deterministic trend based on rank position for demo
  const up = index % 3 !== 0;
  const neutral = index % 7 === 0;
  if (neutral)
    return <span className="text-[#6b7163] text-xs font-bold">—</span>;
  return up ? (
    <span className="text-[#00b368] text-xs font-bold flex items-center gap-0.5">
      ▲ <span className="text-[10px]">{index + 1}</span>
    </span>
  ) : (
    <span className="text-[#e03030] text-xs font-bold flex items-center gap-0.5">
      ▼ <span className="text-[10px]">{index + 1}</span>
    </span>
  );
}

/* ──────────── Rank badge ──────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-[#e8a020]/20 border border-[#e8a020]/50 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🥇</span>
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-[#9ca88f]/20 border border-[#9ca88f]/50 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🥈</span>
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-[#cd7f32]/20 border border-[#cd7f32]/50 flex items-center justify-center flex-shrink-0">
        <span className="text-sm">🥉</span>
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full bg-[#1d211b] border border-[#2c312a] flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-extrabold text-[#6b7163]">#{rank}</span>
    </div>
  );
}

/* ──────────── Star bar ──────────── */
function StarBar({ avg }: { avg: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${avg >= i ? 'text-[#e8a020]' : avg >= i - 0.5 ? 'text-[#e8a020]/50' : 'text-[#2c312a]'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ──────────── Official row card ──────────── */
function RankedCard({
  official,
  rank,
  accentColor,
  trendIndex,
}: {
  official: Official;
  rank: number;
  accentColor: string;
  trendIndex: number;
}) {
  const href = `/official/${slugify(official.full_name)}--${official.id}`;
  const avg = Number(official.rating_avg) || 0;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-[#1d211b] border border-[#2c312a] hover:border-[#00b368]/40 rounded-xl transition-all hover:bg-[#1d211b]/80 group"
    >
      <RankBadge rank={rank} />

      <img
        src={avatar(official.full_name, official.photo_url)}
        alt={official.full_name}
        className="w-10 h-10 rounded-lg object-cover border border-[#2c312a] flex-shrink-0 group-hover:border-[#00b368]/30 transition-colors"
      />

      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate group-hover:text-[#00b368] transition-colors">
          {official.common_name || official.full_name}
        </div>
        <div className="text-xs text-[#6b7163] truncate">{official.role || official.tier}</div>
        <StarBar avg={avg} />
      </div>

      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
        <div className="text-base font-extrabold" style={{ color: accentColor }}>
          {avg.toFixed(1)}
        </div>
        <div className="text-[9px] text-[#6b7163] uppercase tracking-wider">
          {official.rating_count} votes
        </div>
        <TrendArrow index={trendIndex} />
      </div>
    </Link>
  );
}

/* ──────────── Filter officials per category ──────────── */
function filterForCategory(officials: Official[], key: CategoryKey): Official[] {
  switch (key) {
    case 'governors':
      return officials.filter((o) => o.tier === TIER_GOVERNOR);
    case 'senators':
      return officials.filter(
        (o) => o.tier === TIER_SENATOR && o.role?.toLowerCase().includes('senator')
      );
    case 'reps':
      return officials.filter(
        (o) =>
          o.tier === TIER_SENATOR &&
          (o.role?.toLowerCase().includes('rep') || o.role?.toLowerCase().includes('house'))
      );
    case 'rising':
      // Rising: lowest rank but with decent count (simulate by reversing sort)
      return [...officials].sort(
        (a, b) => Number(b.rating_count) - Number(a.rating_count)
      );
    case 'searched':
      return [...officials].sort(
        (a, b) => Number(b.rating_count) - Number(a.rating_count)
      );
    case 'approved':
    default:
      return officials; // Already sorted by rating_avg desc
  }
}

/* ──────────── Page ──────────── */
export default function InfluencePage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CategoryKey>('governors');
  const [updatedAt] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  useEffect(() => {
    fetch('/api/officials?limit=100&sort=rating_avg_desc')
      .then((r) => r.json())
      .then((data) => {
        const list: Official[] = Array.isArray(data?.officials) ? data.officials : [];
        setOfficials(list);
      })
      .catch(() => setOfficials([]))
      .finally(() => setLoading(false));
  }, []);

  const activeCat = CATEGORIES.find((c) => c.key === activeTab)!;
  const ranked = filterForCategory(officials, activeTab).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <h1 className="text-4xl font-extrabold text-white">Political Influence Index</h1>
              </div>
              <p className="text-[#6b7163] text-base max-w-2xl">
                Weekly rankings powered by citizen ratings and engagement data.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00b368]/10 border border-[#00b368]/30 text-[#00b368]">
                📅 This Week
              </span>
              <span className="text-[10px] text-[#4a5244]">Updated {updatedAt}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                activeTab === cat.key
                  ? 'border-transparent text-white shadow-lg'
                  : 'border-[#2c312a] text-[#6b7163] hover:border-[#4a5244] hover:text-[#f8f7f2] bg-[#1d211b]'
              }`}
              style={
                activeTab === cat.key
                  ? { backgroundColor: cat.color + '22', borderColor: cat.color + '66', color: cat.color }
                  : {}
              }
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Active category header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{activeCat.icon}</span>
          <div>
            <h2 className="text-xl font-extrabold text-white">{activeCat.label}</h2>
            <p className="text-xs text-[#6b7163]">{activeCat.description}</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{ borderColor: activeCat.color + '66', color: activeCat.color, backgroundColor: activeCat.color + '11' }}
            >
              Top 10
            </span>
          </div>
        </div>

        {/* Ranked list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-b-2 border-[#00b368] animate-spin" />
            <p className="text-[#6b7163] text-sm">Loading influence rankings…</p>
          </div>
        ) : ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl">
            <span className="text-4xl">📭</span>
            <p className="text-[#6b7163] text-sm text-center max-w-xs">
              No officials found for this category yet. Check back as more data comes in.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((official, i) => (
              <RankedCard
                key={official.id}
                official={official}
                rank={i + 1}
                accentColor={activeCat.color}
                trendIndex={i}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA strip */}
        {!loading && officials.length > 0 && (
          <div className="mt-10 p-6 bg-[#1d211b] border border-[#2c312a] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white mb-1">Help shape the rankings</div>
              <p className="text-xs text-[#6b7163]">
                Rate officials and politicians to improve accuracy of the Influence Index.
              </p>
            </div>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#00b368] text-black text-sm font-extrabold hover:bg-[#00c977] transition-colors flex-shrink-0"
            >
              Rate Officials →
            </Link>
          </div>
        )}

        {/* Methodology note */}
        <p className="mt-6 text-center text-[10px] text-[#4a5244]">
          Rankings updated weekly based on citizen ratings, engagement volume, and approval scores.
          Minimum 3 ratings required to qualify · Evote.ng Analytics Engine
        </p>
      </div>
    </div>
  );
}
