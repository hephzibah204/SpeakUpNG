'use client';

import { useState, useEffect, useMemo } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  created_at: string;
  summary?: string;
  topic?: string;
  category?: string;
  image_url?: string;
  site_name?: string;
  author?: string;
  read_time?: number;
}

const CATEGORIES = ['All', 'Election', 'Economy', 'Security', 'Governance', 'Social'];

const CATEGORY_COLORS: Record<string, string> = {
  Election: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Economy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Security: 'bg-red-500/20 text-red-400 border-red-500/30',
  Governance: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Social: 'bg-[#00b368]/20 text-[#00b368] border-[#00b368]/30',
};

function formatDate(dateString: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function NewsHubPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('limit', '50');
        const res = await fetch(`/api/news?${params}`);
        if (!res.ok) throw new Error('API unavailable');
        const data = await res.json();
        const items: NewsArticle[] = (data.news || []).map((item: NewsArticle) => ({
          ...item,
          category: item.category || item.topic || 'Governance',
          read_time: item.read_time || Math.ceil(((item.summary || '').length / 200) + 2),
        }));
        setArticles(items);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchNews, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = activeCategory === 'All' || a.category === activeCategory;
      return matchCat;
    });
  }, [articles, activeCategory]);

  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-20">
      {/* Hero Header */}
      <div className="border-b border-[#2c312a] bg-[#1a1e19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              Live Updates
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Political News Hub
          </h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Breaking Nigerian political news, governance updates, security reports and economic analysis — curated for informed citizens.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search political news..."
              className="w-full pl-10 pr-4 py-3 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#f8f7f2] placeholder-zinc-500 text-sm focus:outline-none focus:border-[#00b368] transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#00b368] text-black border-[#00b368]'
                    : 'bg-[#1d211b] text-[#6b7163] border-[#2c312a] hover:text-[#f8f7f2] hover:border-zinc-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
            <p className="mt-4 text-[#6b7163] text-sm">Loading latest news...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-[#1d211b] border border-[#2c312a] rounded-2xl">
            <p className="text-[#6b7163] text-lg font-medium">No articles found for this filter.</p>
          </div>
        ) : (
          <>
            {/* Featured Breaking News (top 2) */}
            {featured.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">⚡ Breaking / Featured</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured.map((article, idx) => (
                    <FeaturedCard key={article.id} article={article} large={idx === 0} />
                  ))}
                </div>
              </section>
            )}

            {/* Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#6b7163]">
                Showing <span className="text-[#f8f7f2] font-semibold">{filtered.length}</span> articles
                {activeCategory !== 'All' && (
                  <> in <span className="text-[#00b368] font-semibold">{activeCategory}</span></>
                )}
              </p>
            </div>

            {/* Grid of remaining articles */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ article, large }: { article: NewsArticle; large: boolean }) {
  const catClass = CATEGORY_COLORS[article.category || ''] || 'bg-zinc-700/20 text-zinc-400 border-zinc-700/30';
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden hover:border-[#00b368]/50 hover:shadow-[0_0_30px_rgba(0,179,104,0.08)] transition-all duration-300 ${large ? 'md:row-span-1' : ''}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${catClass}`}>
            {article.category}
          </span>
          <span className="text-xs text-[#6b7163] whitespace-nowrap">{formatDate(article.published_at || article.created_at)}</span>
        </div>

        <h2 className={`font-bold text-white group-hover:text-[#00b368] transition-colors leading-snug mb-3 ${large ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
          {article.title}
        </h2>

        {article.summary && (
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3 mb-4">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[#2c312a]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6b7163] font-medium">{article.site_name || 'News Outlet'}</span>
            <span className="text-[#2c312a]">·</span>
            <span className="text-xs text-[#6b7163]">{article.read_time || 3} min read</span>
          </div>
          <span className="text-xs font-bold text-[#00b368] group-hover:underline">Read →</span>
        </div>
      </div>
    </a>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const catClass = CATEGORY_COLORS[article.category || ''] || 'bg-zinc-700/20 text-zinc-400 border-zinc-700/30';
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden hover:border-[#00b368]/50 hover:shadow-[0_0_30px_rgba(0,179,104,0.08)] transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${catClass}`}>
            {article.category}
          </span>
          <span className="text-xs text-[#6b7163] whitespace-nowrap shrink-0">{formatDate(article.published_at || article.created_at)}</span>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-[#00b368] transition-colors leading-snug mb-3 line-clamp-3">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-4">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#2c312a]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7163] font-medium truncate max-w-[120px]">{article.site_name || 'News'}</span>
            <span className="text-[#2c312a]">·</span>
            <span className="text-xs text-[#6b7163]">{article.read_time || 3} min</span>
          </div>
          <span className="text-xs font-bold text-[#00b368] group-hover:underline shrink-0">Read →</span>
        </div>
      </div>
    </a>
  );
}
