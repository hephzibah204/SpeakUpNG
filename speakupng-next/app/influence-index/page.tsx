'use client';

import { useState, useEffect } from 'react';

interface Official {
  id: string;
  full_name: string;
  role: string;
  tier: string;
  state?: string;
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
}

export default function InfluenceIndexPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'governors' | 'senators' | 'representatives'>('governors');

  useEffect(() => {
    fetch('/api/officials?limit=100')
      .then((res) => res.json())
      .then((data) => {
        setOfficials(data.officials || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter and sort officials by rating_avg (descending)
  const getFilteredRankings = () => {
    let filtered = [...officials];
    if (activeTab === 'governors') {
      filtered = filtered.filter((o) => o.role.toLowerCase().includes('governor'));
    } else if (activeTab === 'senators') {
      filtered = filtered.filter((o) => o.role.toLowerCase().includes('senator'));
    } else if (activeTab === 'representatives') {
      filtered = filtered.filter((o) => o.role.toLowerCase().includes('rep') || o.role.toLowerCase().includes('representative'));
    }
    return filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0)).slice(0, 10);
  };

  const rankings = getFilteredRankings();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]';
      case 2:
        return 'bg-gradient-to-r from-zinc-300 to-zinc-400 text-black border border-zinc-200 shadow-[0_0_12px_rgba(212,212,216,0.3)]';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white border border-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.3)]';
      default:
        return 'bg-[#141714] border border-[#2c312a] text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Weekly Rankings</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Political Influence Index</h1>
          <p className="text-lg text-[#6b7163]">
            Track public trust, performance reviews, and citizens\' consensus scoreboards for governors, senators, and representatives.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-8 gap-6 text-sm font-bold justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('governors')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'governors' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Top Governors
          </button>
          <button
            onClick={() => setActiveTab('senators')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'senators' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Top Senators
          </button>
          <button
            onClick={() => setActiveTab('representatives')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'representatives' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Top Reps
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-500">No rankings data available for this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((o, index) => {
              const rank = index + 1;
              return (
                <div
                  key={o.id}
                  className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-colors shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${getRankBadge(rank)}`}>
                      #{rank}
                    </div>

                    {/* Official Avatar & Info */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#2c312a] bg-zinc-900 flex-shrink-0">
                      <img
                        src={o.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.full_name)}&size=128&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={o.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="text-center sm:text-left min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-white truncate">{o.full_name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{o.role} {o.state ? `• ${o.state}` : ''}</p>
                    </div>
                  </div>

                  {/* Rating / Trend */}
                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto border-t sm:border-t-0 border-[#2c312a] pt-3 sm:pt-0">
                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                        <span className="text-[#e8a020] text-xs">★</span>
                        <span className="text-sm font-black text-white">{o.rating_avg ? Number(o.rating_avg).toFixed(1) : '—'}</span>
                      </div>
                      <span className="text-[9px] text-zinc-550 block mt-0.5 font-bold uppercase tracking-wider">{o.rating_count} reviews</span>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center gap-1 text-[10px] text-[#00b368] font-bold bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                      <span>▲</span>
                      <span>Steady</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
