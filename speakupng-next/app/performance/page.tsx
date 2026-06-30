'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  id: string;
  official_id: string;
  official_name: string;
  role: string;
  state?: string;
  photo_url?: string;
  education_score: number;
  healthcare_score: number;
  roads_score: number;
  agriculture_score: number;
  jobs_score: number;
  security_score: number;
  infrastructure_score: number;
  digital_economy_score: number;
  overall_score: number;
  tier: 'federal' | 'state' | 'local';
  year: number;
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'federal' | 'state'>('all');

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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
    if (score >= 50) return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
    return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-[#008751]/30 text-[#00b368]';
    if (score >= 50) return 'bg-[#e8a020]/30 text-[#e8a020]';
    return 'bg-[#c0392b]/30 text-[#e57368]';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Performance Tracking</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Government Performance</h1>
          <p className="text-lg text-[#6b7163]">
            Track sector-by-sector performance rankings across Education, Health, Security, and Public Infrastructure.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center sm:justify-start">
          {['all', 'federal', 'state'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                activeTab === tab
                  ? 'bg-[#008751]/15 border-[#00b368] text-white'
                  : 'bg-[#1d211b] border-[#2c312a] hover:border-zinc-700 text-zinc-400'
              }`}
            >
              {tab === 'all' ? 'All Tiers' : `${tab} tier`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-500">No performance data available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List Sidebar */}
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
                    <div>
                      <h4 className="font-bold text-sm truncate">{item.official_name}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 truncate">{item.role}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${getScoreColor(item.overall_score)}`}>
                      {item.overall_score}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scorecard Detailed Grid */}
            {selectedItem && (
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#2c312a] pb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#2c312a] bg-zinc-905 flex-shrink-0">
                      <img
                        src={selectedItem.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.official_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={selectedItem.official_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left min-w-0 flex-1">
                      <h2 className="text-2xl font-black text-white font-display">{selectedItem.official_name}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{selectedItem.role}</p>
                    </div>
                    <div className={`px-4 py-3 rounded-xl border text-center font-display ${getScoreColor(selectedItem.overall_score)}`}>
                      <div className="text-3xl font-black">{selectedItem.overall_score}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Overall</div>
                    </div>
                  </div>

                  {/* Sectors Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { name: 'Education', score: selectedItem.education_score },
                      { name: 'Healthcare', score: selectedItem.healthcare_score },
                      { name: 'Roads & Transport', score: selectedItem.roads_score },
                      { name: 'Agriculture', score: selectedItem.agriculture_score },
                      { name: 'Job Creation', score: selectedItem.jobs_score },
                      { name: 'Security', score: selectedItem.security_score },
                      { name: 'Infrastructure', score: selectedItem.infrastructure_score },
                      { name: 'Digital Economy', score: selectedItem.digital_economy_score }
                    ].map((sec, idx) => (
                      <div key={idx} className="bg-[#141714] border border-[#2c312a] p-4 rounded-xl space-y-2 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">{sec.name}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">{sec.score}</span>
                          <span className="text-[10px] text-zinc-500">/100</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${sec.score >= 70 ? 'bg-[#00b368]' : sec.score >= 50 ? 'bg-[#e8a020]' : 'bg-[#e57368]'}`} style={{ width: `${sec.score}%` }}></div>
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
