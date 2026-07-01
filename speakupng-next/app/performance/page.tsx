'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  id: string;
  official_name: string;
  role: string;
  state?: string;
  photo_url?: string;
  tier: string;
  rating_count: number;
  overall_score: number | null;
  categories: {
    accountability: number | null;
    service: number | null;
    transparency: number | null;
    responsiveness: number | null;
    power: number | null;
    security: number | null;
    economic_stability: number | null;
    education: number | null;
    healthcare: number | null;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  accountability: 'Accountability',
  service: 'Service Delivery',
  transparency: 'Transparency',
  responsiveness: 'Responsiveness',
  power: 'Power & Influence',
  security: 'Security',
  economic_stability: 'Economic Stability',
  education: 'Education',
  healthcare: 'Healthcare',
};

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  const availableTiers = Array.from(new Set(data.map(d => d.tier))).sort();

  useEffect(() => {
    fetch('/api/performance')
      .then((res) => res.json())
      .then((data) => {
        setData(data.performance || []);
        if (data.performance && data.performance.length > 0) {
          setSelectedId(data.performance[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredData = data.filter(
    (item) => activeTab === 'all' || item.tier === activeTab
  );

  const selectedItem = data.find((item) => item.id === selectedId);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-zinc-500 border-zinc-700 bg-zinc-800/30';
    if (score >= 70) return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
    if (score >= 50) return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
    return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Performance Tracking</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Government Performance</h1>
          <p className="text-lg text-[#6b7163]">
            Sector-by-sector performance, computed entirely from real citizen ratings submitted on this platform.
          </p>
        </div>

        <div className="mb-10 p-4 bg-[#4f8ef7]/10 border border-[#4f8ef7]/30 rounded-lg">
          <p className="text-[#4f8ef7] text-sm font-bold mb-1">ℹ️ Citizen ratings only — not an official audit</p>
          <p className="text-[#6b7163] text-xs leading-relaxed">
            Every score below is a direct average of citizen reviews submitted for that official on this platform — nothing is
            estimated or sourced from a third-party index. Only officials with at least one citizen rating appear here, and a
            "—" means that category has no ratings yet.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 justify-center sm:justify-start">
          {['all', ...availableTiers].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                activeTab === tab
                  ? 'bg-[#008751]/15 border-[#00b368] text-white'
                  : 'bg-[#1d211b] border-[#2c312a] hover:border-zinc-700 text-zinc-400'
              }`}
            >
              {tab === 'all' ? 'All Tiers' : tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-500">No rated officials in this tier yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Officials Scorecard</h3>
              <div className="space-y-2">
                {filteredData.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      selectedId === item.id
                        ? 'bg-[#008751]/10 border-[#00b368] text-white'
                        : 'bg-[#141714] border-[#2c312a] hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.official_name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.role} · {item.rating_count} reviews</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border flex-shrink-0 ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score ?? '—'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedItem && (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#2c312a] pb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#2c312a] bg-zinc-900 flex-shrink-0">
                      <img
                        src={selectedItem.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.official_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={selectedItem.official_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <h2 className="text-2xl font-black text-white font-display">{selectedItem.official_name}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{selectedItem.role} {selectedItem.state ? `· ${selectedItem.state}` : ''}</p>
                      <p className="text-[10px] text-[#6b7163] mt-1">Based on {selectedItem.rating_count} citizen review{selectedItem.rating_count === 1 ? '' : 's'}</p>
                    </div>
                    <div className={`px-4 py-3 rounded-xl border text-center font-display ${getScoreColor(selectedItem.overall_score)}`}>
                      <div className="text-3xl font-black">{selectedItem.overall_score ?? '—'}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Overall</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(selectedItem.categories).map(([key, score]) => (
                      <div key={key} className="bg-[#141714] border border-[#2c312a] p-4 rounded-xl space-y-2 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">{CATEGORY_LABELS[key] || key}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">{score ?? '—'}</span>
                          {score !== null && <span className="text-[10px] text-zinc-500">/100</span>}
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${score === null ? '' : score >= 70 ? 'bg-[#00b368]' : score >= 50 ? 'bg-[#e8a020]' : 'bg-[#e57368]'}`} style={{ width: `${score ?? 0}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
