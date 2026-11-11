'use client';

import { useState, useEffect } from 'react';

interface Official {
  id: string;
  full_name: string;
  role: string;
  state?: string;
  rating_avg?: number;
  rating_count: number;
  photo_url?: string;
}

export default function InfluenceIndexPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'governors' | 'senators' | 'representatives'>('governors');

  useEffect(() => {
    fetch('/api/officials?limit=50&sort=rating_avg_desc')
      .then((res) => res.json())
      .then((data) => {
        setOfficials(data.officials || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
        return 'bg-paper-3 text-gold border border-gold/40';
      case 2:
        return 'bg-paper-3 text-ink border border-rule';
      case 3:
        return 'bg-paper-3 text-ink-2 border border-rule';
      default:
        return 'bg-paper text-muted border border-rule';
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-rule pb-6">
          <span className="text-xs font-semibold text-accent-light">Consensus scorecards</span>
          <h1 className="text-4xl font-extrabold font-display text-ink mb-3 mt-1">Political Influence Index</h1>
          <p className="text-lg text-muted">
            Aggregated public ratings, constituent confidence reviews, and verified scorecard rankings.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-rule pb-3 mb-8 gap-6 text-sm font-semibold justify-center sm:justify-start">
          {(['governors', 'senators', 'representatives'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 ${
                activeTab === tab ? 'border-accent-light text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab === 'governors' ? 'Governors' : tab === 'senators' ? 'Senators' : 'House of Representatives'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted">
            <div className="inline-block motion-safe:animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 bg-paper-2 border border-rule rounded-xl">
            <p className="text-muted text-sm">No rankings data available for this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((o, index) => {
              const rank = index + 1;
              return (
                <div
                  key={o.id}
                  className="bg-paper-2 border border-rule rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-rule shadow-card transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm font-display tabular-nums ${getRankBadge(rank)}`}>
                      {rank}
                    </div>

                    {/* Official Avatar & Info */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-rule bg-paper-3 flex-shrink-0">
                      <img
                        src={o.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.full_name)}&size=128&background=1d211b&color=00b368&rounded=true&bold=true`}
                        alt={o.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="text-center sm:text-left min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-ink truncate font-display">{o.full_name}</h3>
                      <p className="text-xs text-muted mt-0.5">{o.role}{o.state ? ` · ${o.state}` : ''}</p>
                    </div>
                  </div>

                  {/* Rating & Count */}
                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto border-t sm:border-t-0 border-rule pt-3 sm:pt-0">
                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-end">
                        <svg aria-hidden="true" className="w-3.5 h-3.5 text-gold fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold text-ink tabular-nums">{o.rating_avg ? Number(o.rating_avg).toFixed(1) : '—'}</span>
                      </div>
                      <span className="text-xs text-muted block mt-0.5 tabular-nums">{o.rating_count} reviews</span>
                    </div>

                    <div className="text-xs text-accent-light font-semibold bg-paper-3 border border-rule px-2.5 py-1 rounded-md tabular-nums">
                      Active
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
