'use client';

import { useState } from 'react';

export default function NewsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const news = [
    {
      id: '1',
      title: 'President Tinubu Launches New Economic Policy',
      url: 'https://example.com/news/tinubu-economic-policy',
      published_at: '2024-12-20T10:00:00Z',
      content_hash: 'abc123',
      summary: 'President Tinubu announced a comprehensive economic reform package aimed at boosting economic growth.',
      sentiment_score: 0.8,
      topic: 'policy',
      categories: ['economy', 'policy'],
      is_politics: true,
      matched_profiles: [
        {
          profile_type: 'official',
          profile_id: '1',
          confidence: 0.95,
          method: 'keyword',
          matched_terms: ['Tinubu'],
        },
      ],
      image_url: 'https://example.com/news/tinubu-policy.jpg',
      site_name: 'Government Gazette',
      author: 'John Doe',
      content_text: 'President Bola Ahmed Tinubu has launched a new economic policy aimed at boosting economic growth and reducing inflation. The policy includes measures to attract foreign investment and support local businesses.',
      content_html: '<p>President Bola Ahmed Tinubu has launched a new economic policy aimed at boosting economic growth and reducing inflation. The policy includes measures to attract foreign investment and support local businesses.</p>',
      content_extracted_at: '2024-12-20T10:05:00Z',
      moderation_status: 'approved',
    },
    {
      id: '2',
      title: 'Oyo State Governor Makinde Inaugurates New Hospital',
      url: 'https://example.com/news/makinde-hospital',
      published_at: '2024-12-19T15:30:00Z',
      content_hash: 'def456',
      summary: 'Seyi Makinde inaugurated a new state-of-the-art hospital in Ibadan.',
      sentiment_score: 0.9,
      topic: 'achievement',
      categories: ['health', 'infrastructure'],
      is_politics: true,
      matched_profiles: [
        {
          profile_type: 'official',
          profile_id: '2',
          confidence: 0.92,
          method: 'keyword',
          matched_terms: ['Makinde'],
        },
      ],
      image_url: 'https://example.com/news/makinde-hospital.jpg',
      site_name: 'Oyo State News',
      author: 'Jane Smith',
      content_text: 'Governor Seyi Makinde inaugurated a new state-of-the-art hospital in Ibadan, aimed at improving healthcare access for residents.',
      content_html: '<p>Governor Seyi Makinde inaugurated a new state-of-the-art hospital in Ibadan, aimed at improving healthcare access for residents.</p>',
      content_extracted_at: '2024-12-19T15:35:00Z',
      moderation_status: 'approved',
    },
    {
      id: '3',
      title: 'Senate Passes Bill on Local Government Autonomy',
      url: 'https://example.com/news/senate-bill-local-government',
      published_at: '2024-12-18T14:00:00Z',
      content_hash: 'ghi789',
      summary: 'The Senate has passed a bill seeking to grant local governments financial autonomy.',
      sentiment_score: 0.7,
      topic: 'policy',
      categories: ['governance', 'policy'],
      is_politics: true,
      matched_profiles: [],
      image_url: 'https://example.com/news/senate-bill.jpg',
      site_name: 'National Assembly Gazette',
      author: 'Robert Johnson',
      content_text: 'The Senate has passed a bill seeking to grant local governments financial autonomy, a move that could significantly impact grassroots development.',
      content_html: '<p>The Senate has passed a bill seeking to grant local governments financial autonomy, a move that could significantly impact grassroots development.</p>',
      content_extracted_at: '2024-12-18T14:05:00Z',
      moderation_status: 'approved',
    },
  ];

  const filtered = news.filter(item => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
        !item.summary.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (tab === 'politics' && !item.is_politics) return false;
    if (tab === 'editorial' && item.topic !== 'achievement') return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">News & Updates</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Daily Nigerian governance news and policy updates.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search news..."
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

          <div className="flex gap-2">
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTab('politics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'politics'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Politics
            </button>
            <button
              onClick={() => setTab('editorial')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'editorial'
                ? 'bg-green-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Editorial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((item) => (
            <article key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {formatDate(item.published_at)}
                  </span>
                  {item.is_politics && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                      Politics
                    </span>
                  )}
                  {item.topic && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                      {item.topic}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  <a href={item.url} className="hover:text-green-600 transition-colors">
                    {item.title}
                  </a>
                </h2>

                <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      {item.site_name}
                    </span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      by {item.author}
                    </span>
                  </div>

                  <a
                    href={item.url}
                    className="text-green-600 dark:text-green-400 font-medium hover:underline"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No news found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
