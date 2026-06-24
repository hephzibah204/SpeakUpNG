'use client';

import { useState } from 'react';

export default function LeaderboardPage() {
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('');

  const officials = [
    {
      id: '1',
      full_name: 'Bola Ahmed Tinubu',
      common_name: 'Tinubu',
      role: 'President',
      tier: 'federal_executive',
      state: 'FCT',
      rating_avg: 4.2,
      rating_count: 1245,
      photo_url: 'https://example.com/tinubu.jpg',
    },
    {
      id: '2',
      full_name: 'Seyi Makinde',
      common_name: 'Makinde',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Oyo',
      rating_avg: 4.5,
      rating_count: 892,
      photo_url: 'https://example.com/makinde.jpg',
    },
    {
      id: '3',
      full_name: 'Babajide Sanwo-Olu',
      common_name: 'Sanwo-Olu',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Lagos',
      rating_avg: 4.1,
      rating_count: 2156,
      photo_url: 'https://example.com/sanwo-olu.jpg',
    },
    {
      id: '4',
      full_name: 'Peter Obi',
      common_name: 'Obi',
      role: 'Senator',
      tier: 'federal_legislature',
      state: 'Anambra',
      rating_avg: 4.8,
      rating_count: 567,
      photo_url: 'https://example.com/obi.jpg',
    },
    {
      id: '5',
      full_name: 'Atiku Abubakar',
      common_name: 'Abubakar',
      role: 'Former Vice President',
      tier: 'federal_executive',
      state: 'Adamawa',
      rating_avg: 3.9,
      rating_count: 892,
      photo_url: 'https://example.com/abubakar.jpg',
    },
  ];

  const filtered = officials.filter(official => {
    if (search && !official.full_name.toLowerCase().includes(search.toLowerCase()) &&
        !official.common_name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedTier && official.tier !== selectedTier) return false;
    return true;
  });

  const tiers = [
    { value: '', label: 'All Tiers' },
    { value: 'federal_executive', label: 'Federal Executive' },
    { value: 'state_executive', label: 'State Executive' },
    { value: 'federal_legislature', label: 'National Assembly' },
    { value: 'federal_agency', label: 'Federal Agency' },
    { value: 'state_agency', label: 'State Agency' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Rankings</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Live rankings from citizen reviews submitted on evote.ng.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search officials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {tiers.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="col-span-1 text-center">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rank</span>
            </div>
            <div className="col-span-5">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Official</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Rating</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Votes</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</span>
            </div>
          </div>

          {filtered.map((official, index) => (
            <div
              key={official.id}
              className={`grid grid-cols-12 gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index === filtered.length - 1 ? 'border-b-0' : ''}`}
            >
              <div className="col-span-1 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <div className="col-span-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
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
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-green-600 transition-colors">
                      <a href={`/official/${official.id}`}>{official.full_name}</a>
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{official.role}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-green-600">
                    {official.rating_avg ? official.rating_avg.toFixed(1) : '—'}
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-zinc-700 dark:text-zinc-300">
                  {official.rating_count?.toLocaleString() || 0}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {official.state}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No officials found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
