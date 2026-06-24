'use client';

import { useState, useEffect } from 'react';

export default function AgenciesPage() {
  const [search, setSearch] = useState('');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/officials?tier=federal_agency&limit=100&sort=rating_count`)
      .then(r => r.json())
      .then(data => setAgencies(data.officials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = agencies.filter(a =>
    !search || a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Government Agencies</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Rate and review federal and state government agencies in Nigeria.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((agency) => (
              <a
                key={agency.id}
                href={`/official/${agency.slug || agency.id}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                    <img
                      src={agency.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                      alt={agency.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{agency.full_name}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{agency.role}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-bold text-green-600">
                      {agency.rating_avg ? Number(agency.rating_avg).toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {agency.rating_count || 0} ratings
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No agencies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
