'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({ ratings: 0, officials: 0 });
  const [featuredOfficials, setFeaturedOfficials] = useState([]);
  const [featuredAgencies, setFeaturedAgencies] = useState([]);
  const [featuredLeaders, setFeaturedLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const [statsRes, officialsRes, agenciesRes, leadersRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/officials?limit=5&sort=rating_count'),
          fetch('/api/officials?limit=5&tier=federal_agency'),
          fetch('/api/officials?full_name=in,Bola%20Ahmed%20Tinubu,Seyi%20Makinde,Babajide%20Sanwo-Olu,Nyesom%20Wike,Dapo%20Abiodun'),
        ]);

        const statsData = await statsRes.json();
        const officialsData = await officialsRes.json();
        const agenciesData = await agenciesRes.json();
        const leadersData = await leadersRes.json();

        setStats({
          ratings: statsData.ratings || 0,
          officials: statsData.officials || 0,
        });
        setFeaturedOfficials(officialsData.officials || []);
        setFeaturedAgencies(agenciesData.officials || []);
        setFeaturedLeaders(leadersData.officials || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🇳🇬 Civic Accountability Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Rate Every <em className="text-green-600">Government Official</em> in Nigeria
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            From your local councillor to the President. Anonymous, transparent, and powered by citizens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('officials-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Rating ↓
            </button>
            <a
              href="/leaderboard"
              className="px-8 py-4 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              View Rankings
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {loading ? '—' : stats.ratings.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {loading ? '—' : stats.officials.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Officials Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">36+</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Anonymous</div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Rated Officials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Best Rated Officials & Agencies</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Live rankings from citizen reviews submitted on evote.ng.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Best Rated Officials */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">🏛️ Best Rated Officials</h3>
            <div className="space-y-4" id="best-rated-officials">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
                </div>
              ) : (
                featuredOfficials.slice(0, 5).map((official) => (
                  <a
                    key={official.id}
                    href={`/official/${official.slug || official.id}`}
                    className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{official.full_name}</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{official.role}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {official.tier && (
                            <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs mr-2">
                              {official.tier.replace('_', ' ')}
                            </span>
                          )}
                          {official.states?.name && (
                            <span>{official.states.name}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {official.rating_avg ? official.rating_avg.toFixed(1) : '—'}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          ({official.rating_count || 0} ratings)
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Best Rated Agencies */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">🏢 Best Rated Agencies</h3>
            <div className="space-y-4" id="best-rated-agencies">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading...</p>
                </div>
              ) : (
                featuredAgencies.slice(0, 5).map((agency) => (
                  <a
                    key={agency.id}
                    href={`/official/${agency.slug || agency.id}`}
                    className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{agency.full_name}</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{agency.role}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {agency.tier && (
                            <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs mr-2">
                              {agency.tier.replace('_', ' ')}
                            </span>
                          )}
                          {agency.states?.name && (
                            <span>{agency.states.name}</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {agency.rating_avg ? agency.rating_avg.toFixed(1) : '—'}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          ({agency.rating_count || 0} ratings)
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Leaders */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Featured Leader Ratings</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Live leader spotlight powered by real user ratings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="featured-leaders">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading featured leaders...</p>
            </div>
          ) : (
            featuredLeaders.slice(0, 6).map((leader) => (
              <div key={leader.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 flex-shrink-0">
                    <img
                      src={leader.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.full_name || 'Official')}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                      alt={leader.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.full_name || 'Official')}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">{leader.full_name}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">{leader.role}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      {leader.tier && (
                        <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs mr-2">
                          {leader.tier.replace('_', ' ')}
                        </span>
                      )}
                      {leader.states?.name && (
                        <span>{leader.states.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-bold text-green-600">
                      {leader.rating_avg ? leader.rating_avg.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    ({leader.rating_count || 0} ratings)
                  </span>
                </div>

                <a
                  href={`/official/${leader.slug || leader.id}`}
                  className="block w-full text-center py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                >
                  View Full Profile →
                </a>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Politicians Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Prominent Politicians (Aspirants)</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Not currently in office. Prioritized by relevance and updated with verified news.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="politicians-preview">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading politicians...</p>
            </div>
          ) : (
            []
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/politicians"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            View all politicians
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Civic Insights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl mx-4 sm:mx-6 lg:mx-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Civic Insights and Updates</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Follow policy explainers and fresh political updates linked to the officials you rate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium mb-4">
              Blog
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Governance Explainers and Accountability Guides
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Read practical breakdowns on budgets, service delivery, elections, and how to evaluate office performance.
            </p>
            <a href="/blog" className="text-green-600 dark:text-green-400 font-medium hover:underline">
              Visit Blog →
            </a>
          </article>

          <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
              News
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Daily Nigerian Governance News Roundup
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Track recent policy moves, campaign events, and institutional changes shaping citizen priorities.
            </p>
            <a href="/news" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              View News Updates →
            </a>
          </article>

          <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium mb-4">
              Editorial
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Curated Updates and Context for Citizens
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Editorial updates with context — less noise, more signal about governance changes that affect you.
            </p>
            <a href="/news?tab=editorial" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
              Read Editorial →
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
