'use client';

import { useState, useEffect } from 'react';

interface Politician {
  id: string;
  full_name: string;
  common_name: string;
  party: string;
  aspiration_title: string;
  photo_url: string;
  bio: string;
  aliases: string;
  priority: number;
  rating_avg: number;
  rating_count: number;
}

export default function PoliticiansPage() {
  const [search, setSearch] = useState('');
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('limit', '100');
        const res = await fetch(`/api/politicians?${params}`);
        const data = await res.json();
        setPoliticians(data.politicians || []);
      } catch (err) {
        console.error('Failed to fetch politicians:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticians();
  }, [search]);

  const filtered = politicians;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">All Politicians</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Aspirants and candidates for various political offices in Nigeria.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search politicians..."
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading politicians...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((politician) => (
              <div key={politician.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 mb-4">
                    <img
                      src={politician.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                      alt={politician.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                      }}
                    />
                  </div>

                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {politician.full_name}
                  </h2>

                  <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                    {politician.aspiration_title}
                  </p>

                  <div className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {politician.party}
                  </div>

                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3">
                    {politician.bio}
                  </p>

                  {politician.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">&#9733;</span>
                      <span className="font-bold text-green-600">{politician.rating_avg?.toFixed(1)}</span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">({politician.rating_count})</span>
                    </div>
                  )}

                  <div className="flex gap-2 w-full">
                    <a
                      href={`/politician/${politician.full_name.toLowerCase().replace(/\s+/g, '-')}-${politician.id}`}
                      className="flex-1 px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No politicians found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
