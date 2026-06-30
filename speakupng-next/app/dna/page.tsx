'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Official {
  id: string;
  full_name: string;
  common_name?: string;
  role?: string;
  state?: string;
  photo_url?: string;
  party?: string;
}

interface DnaScore {
  id: string;
  official_id: string;
  leadership: number;
  integrity: number;
  transparency: number;
  accountability: number;
  accessibility: number;
  youth_support: number;
  economic_performance: number;
  education_performance: number;
  healthcare_performance: number;
  innovation: number;
  national_acceptance: number;
  legislative_productivity: number;
  overall_score: number;
  updated_at: string;
  full_name: string;
  common_name?: string;
  role?: string;
  state?: string;
  photo_url?: string;
  party?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIMENSIONS = [
  { key: 'leadership',              label: 'Leadership',          icon: '👑' },
  { key: 'integrity',               label: 'Integrity',           icon: '⚖️' },
  { key: 'transparency',            label: 'Transparency',        icon: '🔍' },
  { key: 'accountability',          label: 'Accountability',      icon: '📋' },
  { key: 'accessibility',           label: 'Accessibility',       icon: '🤝' },
  { key: 'youth_support',           label: 'Youth Support',       icon: '🌱' },
  { key: 'economic_performance',    label: 'Economy',             icon: '📈' },
  { key: 'education_performance',   label: 'Education',           icon: '📚' },
  { key: 'healthcare_performance',  label: 'Healthcare',          icon: '🏥' },
  { key: 'innovation',              label: 'Innovation',          icon: '💡' },
  { key: 'national_acceptance',     label: 'Nat. Acceptance',     icon: '🇳🇬' },
  { key: 'legislative_productivity',label: 'Legislative',         icon: '🏛️' },
] as const;

type DimKey = (typeof DIMENSIONS)[number]['key'];

function scoreColor(score: number): string {
  if (score >= 71) return '#00b368';
  if (score >= 50) return '#e8a020';
  return '#e57368';
}

function scoreBand(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Weak';
  return 'Poor';
}

// ─── Pure-SVG Radar Chart ─────────────────────────────────────────────────────

function RadarChart({ dna, size = 340 }: { dna: DnaScore; size?: number }) {
  const center = size / 2;
  const radius = (size / 2) * 0.62;
  const n = DIMENSIONS.length;

  const getCoords = (index: number, ratio: number) => {
    const angle = (index * 2 * Math.PI) / n - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle) * ratio,
      y: center + radius * Math.sin(angle) * ratio,
      angle,
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const val = (dna[dim.key as DimKey] as number) ?? 0;
    return getCoords(i, val / 100);
  });

  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
      aria-label="Political DNA radar chart"
    >
      {/* Grid rings */}
      {gridLevels.map((level, li) => {
        const pts = DIMENSIONS.map((_, i) => {
          const c = getCoords(i, level);
          return `${c.x.toFixed(2)},${c.y.toFixed(2)}`;
        }).join(' ');
        return (
          <polygon
            key={li}
            points={pts}
            fill="none"
            stroke={li === 3 ? '#3a403a' : '#2c312a'}
            strokeWidth={li === 3 ? 1.5 : 1}
            strokeDasharray={li < 3 ? '4,4' : undefined}
          />
        );
      })}

      {/* Axis spokes */}
      {DIMENSIONS.map((_, i) => {
        const outer = getCoords(i, 1);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="#2c312a"
            strokeWidth={1}
          />
        );
      })}

      {/* Data filled polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(0,179,104,0.18)"
        stroke="#00b368"
        strokeWidth={2}
        style={{ transition: 'all 0.5s ease' }}
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#00b368"
          stroke="#141714"
          strokeWidth={2}
        />
      ))}

      {/* Labels */}
      {DIMENSIONS.map((dim, i) => {
        const labelOff = 22;
        const outerC = getCoords(i, 1);
        const lx = center + (radius + labelOff) * Math.cos(outerC.angle);
        const ly = center + (radius + labelOff) * Math.sin(outerC.angle);

        const cos = Math.cos(outerC.angle);
        const anchor: 'middle' | 'start' | 'end' =
          cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle';

        const val = (dna[dim.key as DimKey] as number) ?? 0;

        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="#a0a89a"
            fontSize={9.5}
            fontWeight="600"
            fontFamily="sans-serif"
            style={{ userSelect: 'none' }}
          >
            {dim.label} {val}
          </text>
        );
      })}

      {/* Center score */}
      <text
        x={center}
        y={center - 10}
        textAnchor="middle"
        fill={scoreColor(dna.overall_score)}
        fontSize={28}
        fontWeight="800"
        fontFamily="sans-serif"
      >
        {dna.overall_score}
      </text>
      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        fill="#6b7163"
        fontSize={10}
        fontFamily="sans-serif"
      >
        OVERALL DNA
      </text>
    </svg>
  );
}

// ─── Bar metric row ───────────────────────────────────────────────────────────

function MetricBar({ label, icon, value }: { label: string; icon: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-base w-6 flex-shrink-0">{icon}</span>
      <span className="text-xs text-[#a0a89a] w-32 flex-shrink-0 font-medium">{label}</span>
      <div className="flex-1 bg-[#1d211b] rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right flex-shrink-0" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DnaScorePage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dna, setDna] = useState<DnaScore | null>(null);
  const [loadingOfficials, setLoadingOfficials] = useState(true);
  const [loadingDna, setLoadingDna] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch officials list
  useEffect(() => {
    fetch('/api/officials?limit=50&sort=name')
      .then(r => r.json())
      .then(data => {
        setOfficials(data.officials ?? []);
        setLoadingOfficials(false);
      })
      .catch(() => setLoadingOfficials(false));
  }, []);

  // Fetch DNA score when official selected
  const fetchDna = useCallback((officialId: string) => {
    setLoadingDna(true);
    setDna(null);
    fetch(`/api/officials/dna?official_id=${officialId}`)
      .then(r => r.json())
      .then(data => {
        setDna(data.dna ?? null);
        setLoadingDna(false);
      })
      .catch(() => setLoadingDna(false));
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    fetchDna(id);
  };

  const filteredOfficials = officials.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.full_name?.toLowerCase().includes(q) ||
      o.common_name?.toLowerCase().includes(q) ||
      o.role?.toLowerCase().includes(q) ||
      o.state?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2]">
      {/* Header */}
      <div className="border-b border-[#2c312a] bg-[#0e110e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧬</span>
            <h1 className="text-3xl font-bold tracking-tight text-[#f8f7f2]">
              Political DNA Score
            </h1>
          </div>
          <p className="text-[#6b7163] text-sm max-w-2xl">
            A 12-dimension intelligence score assessing Nigeria&apos;s political leaders across
            leadership, integrity, transparency, economic performance, and more. Select an
            official to reveal their Political DNA.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 min-h-[600px]">

          {/* ── Left Sidebar: Officials list ── */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-20">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search officials…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1d211b] border border-[#2c312a] rounded-lg px-3 py-2 text-sm text-[#f8f7f2] placeholder-[#4a5244] focus:outline-none focus:border-[#00b368] transition-colors"
                />
              </div>

              <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
                {loadingOfficials ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-14 rounded-xl bg-[#1d211b]" />
                  ))
                ) : filteredOfficials.length === 0 ? (
                  <p className="text-[#4a5244] text-sm text-center py-8">No officials found</p>
                ) : (
                  filteredOfficials.map(o => {
                    const isActive = selectedId === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => handleSelect(o.id)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 ${
                          isActive
                            ? 'border-[#00b368]/50 bg-[#00b368]/10 text-[#f8f7f2]'
                            : 'border-transparent hover:border-[#2c312a] hover:bg-[#1d211b] text-[#a0a89a]'
                        }`}
                      >
                        {o.photo_url ? (
                          <img
                            src={o.photo_url}
                            alt={o.full_name}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-[#2c312a]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#2c312a] flex items-center justify-center flex-shrink-0 text-lg">
                            👤
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">
                            {o.common_name || o.full_name}
                          </p>
                          <p className="text-[10px] text-[#4a5244] truncate mt-0.5">
                            {o.role ? `${o.role}` : 'Official'}
                            {o.state ? ` · ${o.state}` : ''}
                          </p>
                        </div>
                        {isActive && (
                          <span className="ml-auto text-[#00b368] text-xs flex-shrink-0">●</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* ── Right Panel: DNA Score Display ── */}
          <main className="flex-1 min-w-0">
            {!selectedId ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-24">
                <div className="text-6xl opacity-30">🧬</div>
                <h2 className="text-xl font-semibold text-[#4a5244]">Select an Official</h2>
                <p className="text-sm text-[#3a403a] max-w-xs">
                  Choose a political leader from the sidebar to view their Political DNA Score
                  across 12 performance dimensions.
                </p>
              </div>
            ) : loadingDna ? (
              /* Loading skeleton */
              <div className="animate-pulse space-y-6">
                <div className="h-24 rounded-2xl bg-[#1d211b]" />
                <div className="h-80 rounded-2xl bg-[#1d211b]" />
                <div className="space-y-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-[#1d211b]" />
                  ))}
                </div>
              </div>
            ) : !dna ? (
              /* No DNA data found */
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-24">
                <div className="text-5xl opacity-30">📊</div>
                <h2 className="text-xl font-semibold text-[#4a5244]">No DNA Data Yet</h2>
                <p className="text-sm text-[#3a403a] max-w-xs">
                  DNA score data has not been recorded for this official yet.
                </p>
              </div>
            ) : (
              /* DNA Score Panel */
              <div className="space-y-6">
                {/* Official header card */}
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 flex items-center gap-5">
                  {dna.photo_url ? (
                    <img
                      src={dna.photo_url}
                      alt={dna.full_name}
                      className="w-16 h-16 rounded-xl object-cover bg-[#2c312a]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#2c312a] flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#f8f7f2] truncate">{dna.full_name}</h2>
                    <p className="text-sm text-[#6b7163] mt-0.5">
                      {dna.role}{dna.state ? ` · ${dna.state}` : ''}
                      {dna.party ? ` · ${dna.party}` : ''}
                    </p>
                  </div>

                  {/* Overall Score Badge */}
                  <div className="flex-shrink-0 text-center">
                    <div
                      className="text-5xl font-black tabular-nums leading-none"
                      style={{ color: scoreColor(dna.overall_score) }}
                    >
                      {dna.overall_score}
                    </div>
                    <div
                      className="text-xs font-semibold mt-1 uppercase tracking-wider"
                      style={{ color: scoreColor(dna.overall_score) }}
                    >
                      {scoreBand(dna.overall_score)}
                    </div>
                    <div className="text-[10px] text-[#4a5244] mt-0.5">out of 100</div>
                  </div>
                </div>

                {/* Score legend */}
                <div className="flex gap-4 flex-wrap text-xs">
                  {[
                    { label: 'Excellent (80–100)', color: '#00b368' },
                    { label: 'Good (70–79)', color: '#7bc96f' },
                    { label: 'Average (50–69)', color: '#e8a020' },
                    { label: 'Weak / Poor (<50)', color: '#e57368' },
                  ].map(b => (
                    <span key={b.label} className="flex items-center gap-1.5 text-[#6b7163]">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: b.color }}
                      />
                      {b.label}
                    </span>
                  ))}
                </div>

                {/* Grid: Radar + Bars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 flex flex-col items-center">
                    <h3 className="text-sm font-semibold text-[#6b7163] uppercase tracking-wider mb-4">
                      DNA Radar
                    </h3>
                    <RadarChart dna={dna} size={320} />
                  </div>

                  {/* Metric Bars */}
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[#6b7163] uppercase tracking-wider mb-4">
                      Dimension Breakdown
                    </h3>
                    <div className="space-y-0.5">
                      {DIMENSIONS.map(dim => (
                        <MetricBar
                          key={dim.key}
                          label={dim.label}
                          icon={dim.icon}
                          value={(dna[dim.key as DimKey] as number) ?? 0}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Updated at */}
                <p className="text-[10px] text-[#3a403a] text-right">
                  Last updated:{' '}
                  {dna.updated_at
                    ? new Date(dna.updated_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
