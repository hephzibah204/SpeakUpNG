'use client';

import { useState, useEffect, useMemo } from 'react';

interface Official {
  id: string;
  full_name: string;
  common_name?: string;
  role: string;
  tier: string;
  state: string;
  rating_avg: number;
  rating_count: number;
  photo_url?: string;
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all rated officials sorted by average rating
    fetch('/api/officials?limit=250&sort=rating_avg_desc')
      .then(res => res.json())
      .then(data => {
        // Filter: only show officials with at least 1 rating on the leaderboard
        const ratedOnly = (data.officials || []).filter((o: Official) => o.rating_count > 0);
        setOfficials(ratedOnly);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return officials.filter(official => {
      if (search) {
        const term = search.toLowerCase();
        if (!official.full_name.toLowerCase().includes(term) &&
            official.common_name?.toLowerCase().includes(term) === false &&
            official.role.toLowerCase().includes(term) === false) {
          return false;
        }
      }
      if (selectedTier && official.tier !== selectedTier) return false;
      return true;
    });
  }, [officials, search, selectedTier]);

  const tiers = [
    { value: '', label: 'All Tiers' },
    { value: 'federal_executive', label: 'Federal Executive' },
    { value: 'state_executive', label: 'State Executive' },
    { value: 'federal_legislature', label: 'National Assembly' },
    { value: 'federal_agency', label: 'Federal Agency' },
    { value: 'state_agency', label: 'State Agency' },
  ];

  const slugify = (name: string) => {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Citizens Leaderboard</h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Live rankings based on aggregate anonymous citizen reviews and ratings.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-[#1d211b] border border-[#2c312a] p-5 rounded-xl justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search leader rankings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-500 focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            />
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors"
            >
              {tiers.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-[#2c312a] bg-[#1d211b]/80 font-display font-bold text-xs uppercase tracking-wider text-[#6b7163]">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-5">Official</div>
            <div className="col-span-3 sm:col-span-2 text-center">Score</div>
            <div className="col-span-2 text-center hidden sm:block">Reviews</div>
            <div className="col-span-2 text-right">Location</div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
              <p className="mt-4 text-[#6b7163] text-sm">Calculating leaderboard...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7163] text-lg font-medium">No ranked leaders match your filters.</p>
            </div>
          ) : (
            filtered.map((official, index) => (
              <div
                key={official.id}
                className="grid grid-cols-12 gap-4 p-5 border-b border-[#2c312a] last:border-b-0 hover:bg-[#232820] transition-colors items-center"
              >
                {/* Rank Badge */}
                <div className="col-span-1 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                    ${index === 0 ? 'bg-[#e8a020]/20 text-[#e8a020] border border-[#e8a020]/40' :
                      index === 1 ? 'bg-zinc-300/20 text-zinc-300' :
                      index === 2 ? 'bg-amber-600/20 text-amber-600' :
                      'bg-zinc-800/50 text-zinc-400'}`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Profile Link */}
                <div className="col-span-6 sm:col-span-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2c312a] flex-shrink-0">
                      <img
                        src={official.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(official.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={official.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(official.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white hover:text-[#00b368] transition-colors truncate text-sm sm:text-base">
                        <a href={`/official/${slugify(official.full_name)}`}>{official.full_name}</a>
                      </h3>
                      <p className="text-xs text-[#6b7163] truncate mt-0.5">{official.role}</p>
                    </div>
                  </div>
                </div>

                {/* Rating score */}
                <div className="col-span-3 sm:col-span-2 text-center">
                  <div className="inline-flex items-center gap-1.5 justify-center bg-zinc-800/80 px-2.5 py-1 rounded-md border border-[#2c312a]">
                    <span className="text-[#e8a020] text-xs">★</span>
                    <span className="font-extrabold text-sm text-[#e8a020]">
                      {Number(official.rating_avg).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Review Count */}
                <div className="col-span-2 text-center hidden sm:block">
                  <span className="text-xs text-[#f8f7f2] font-semibold">
                    {official.rating_count.toLocaleString()} reviews
                  </span>
                </div>

                {/* State Tag */}
                <div className="col-span-2 text-right">
                  <span className="inline-block px-2 py-0.5 bg-zinc-800 text-xs rounded text-zinc-400 font-semibold">
                    {official.state || 'N/A'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
