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

const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'INEC Releases Final 2027 Election Timetable, Presidential Poll Set for February',
    url: 'https://www.premiumtimesng.com',
    published_at: '2026-06-28T09:00:00Z',
    created_at: '2026-06-28T09:00:00Z',
    summary: 'The Independent National Electoral Commission unveiled a comprehensive 2027 election timetable, setting the presidential poll for the third Saturday of February 2027. The commission also announced voter registration would resume in October 2026.',
    topic: 'elections',
    category: 'Election',
    site_name: 'Premium Times',
    read_time: 4,
  },
  {
    id: 'n2',
    title: 'Tinubu Signs ₦54.9 Trillion 2026 Supplementary Budget, Eyes Infrastructure Boost',
    url: 'https://www.punchng.com',
    published_at: '2026-06-27T10:30:00Z',
    created_at: '2026-06-27T10:30:00Z',
    summary: 'President Bola Tinubu signed the ₦54.9 trillion supplementary appropriation bill into law, with the bulk of new allocations directed at roads, rail infrastructure, and power sector reform. Critics warned the deficit financing risks worsening inflation.',
    topic: 'economy',
    category: 'Economy',
    site_name: 'Punch',
    read_time: 5,
  },
  {
    id: 'n3',
    title: 'APC Governors Back Tinubu for 2027 Re-election at Emergency Caucus Meeting',
    url: 'https://www.thecable.ng',
    published_at: '2026-06-26T08:00:00Z',
    created_at: '2026-06-26T08:00:00Z',
    summary: 'All nineteen APC governors passed a resolution endorsing President Tinubu for a second term at a closed-door meeting in Abuja. The governors dismissed reports of internal dissent as media fabrication.',
    topic: 'politics',
    category: 'Election',
    site_name: 'The Cable',
    read_time: 3,
  },
  {
    id: 'n4',
    title: 'Bandits Attack Three Communities in Zamfara, 40 Killed — Army Launches Airstrikes',
    url: 'https://www.channels.com.ng',
    published_at: '2026-06-25T07:15:00Z',
    created_at: '2026-06-25T07:15:00Z',
    summary: 'Armed bandits razed three farming villages in Zamfara State overnight, killing at least 40 people and displacing thousands. The Nigerian Army responded with airstrikes on suspected bandit camps across the Dansadau forest corridor.',
    topic: 'security',
    category: 'Security',
    site_name: 'Channels TV',
    read_time: 4,
  },
  {
    id: 'n5',
    title: 'Naira Gains 12% Against Dollar After CBN\'s New FX Intervention Window',
    url: 'https://www.businessday.ng',
    published_at: '2026-06-24T11:00:00Z',
    created_at: '2026-06-24T11:00:00Z',
    summary: 'The naira appreciated sharply to ₦1,390 per dollar after the Central Bank of Nigeria launched a targeted foreign exchange window for manufacturers and importers of essential commodities. Analysts cautioned the gains may be temporary.',
    topic: 'economy',
    category: 'Economy',
    site_name: 'BusinessDay',
    read_time: 4,
  },
  {
    id: 'n6',
    title: 'Peter Obi Meets with Labour Party Governors to Build 2027 Coalition Framework',
    url: 'https://www.guardian.ng',
    published_at: '2026-06-23T09:30:00Z',
    created_at: '2026-06-23T09:30:00Z',
    summary: 'Labour Party\'s 2023 presidential candidate Peter Obi convened a strategic meeting with LP lawmakers and emerging party leaders to chart a 2027 electoral roadmap. Sources say cross-party defections to LP are expected before year-end.',
    topic: 'politics',
    category: 'Election',
    site_name: 'The Guardian',
    read_time: 5,
  },
  {
    id: 'n7',
    title: 'Senate Passes Petroleum Industry Amendment Act to Boost Local Refining',
    url: 'https://www.vanguardngr.com',
    published_at: '2026-06-22T14:00:00Z',
    created_at: '2026-06-22T14:00:00Z',
    summary: 'The Nigerian Senate amended the Petroleum Industry Act to provide additional tax incentives for local refinery operators and mandate a domestic supply obligation on crude oil producers. The bill now heads to the House of Representatives.',
    topic: 'policy',
    category: 'Governance',
    site_name: 'Vanguard',
    read_time: 5,
  },
  {
    id: 'n8',
    title: 'ISWAP Kills 11 Soldiers in Borno Ambush — Military Confirms',
    url: 'https://www.thenationonlineng.net',
    published_at: '2026-06-21T06:00:00Z',
    created_at: '2026-06-21T06:00:00Z',
    summary: 'Islamic State West Africa Province militants ambushed a Nigerian Army patrol near Marte in Borno State, killing eleven soldiers and destroying two armoured vehicles. The military confirmed the attack and said reinforcements had been deployed.',
    topic: 'security',
    category: 'Security',
    site_name: 'The Nation',
    read_time: 3,
  },
  {
    id: 'n9',
    title: 'National Grid Collapses for the 9th Time This Year, Plunging Nigeria Into Darkness',
    url: 'https://www.punchng.com',
    published_at: '2026-06-20T17:45:00Z',
    created_at: '2026-06-20T17:45:00Z',
    summary: 'Nigeria\'s national electricity grid suffered its ninth collapse this year, cutting power to over 80 million Nigerians. The Ministry of Power blamed vandalism on transmission lines in Oyo State but energy analysts cited systemic underfunding.',
    topic: 'policy',
    category: 'Governance',
    site_name: 'Punch',
    read_time: 4,
  },
  {
    id: 'n10',
    title: 'Kano State Closes 200 Schools Over Funding Crisis After SUBEB Salary Arrears Hit 8 Months',
    url: 'https://www.dailytrust.com',
    published_at: '2026-06-19T10:00:00Z',
    created_at: '2026-06-19T10:00:00Z',
    summary: 'About 200 public primary schools in Kano State were shut following a teachers\' strike over eight months of unpaid salaries. The Kano State government blamed the salary shortfall on federal allocation delays and urged UBEC for emergency intervention.',
    topic: 'social',
    category: 'Social',
    site_name: 'Daily Trust',
    read_time: 4,
  },
  {
    id: 'n11',
    title: 'Governors of Southwest Geopolitical Zone Form Regional Development Commission',
    url: 'https://www.thecable.ng',
    published_at: '2026-06-18T09:00:00Z',
    created_at: '2026-06-18T09:00:00Z',
    summary: 'The six governors of the Southwest zone signed a memorandum establishing a regional development commission to coordinate infrastructure, security, and agricultural investment across Lagos, Ogun, Oyo, Osun, Ekiti, and Ondo states.',
    topic: 'policy',
    category: 'Governance',
    site_name: 'The Cable',
    read_time: 4,
  },
  {
    id: 'n12',
    title: 'PDP Holds Emergency NEC Meeting Over 2027 Presidential Ticket Crisis',
    url: 'https://www.premiumtimesng.com',
    published_at: '2026-06-17T12:00:00Z',
    created_at: '2026-06-17T12:00:00Z',
    summary: 'The PDP National Executive Committee convened an emergency session amid internal disagreements over who should fly the party\'s 2027 presidential flag. Atiku Abubakar\'s camp and a Wike-aligned faction are reportedly at loggerheads over zoning arrangements.',
    topic: 'politics',
    category: 'Election',
    site_name: 'Premium Times',
    read_time: 5,
  },
  {
    id: 'n13',
    title: 'Nigeria Records 5.2% GDP Growth in Q1 2026, Non-Oil Sector Leads',
    url: 'https://www.businessday.ng',
    published_at: '2026-06-15T08:30:00Z',
    created_at: '2026-06-15T08:30:00Z',
    summary: 'The National Bureau of Statistics reported 5.2% GDP growth for the first quarter of 2026, driven by telecommunications, agriculture, and trade. However, inflation remained at 31%, with food prices still squeezing household purchasing power.',
    topic: 'economy',
    category: 'Economy',
    site_name: 'BusinessDay',
    read_time: 5,
  },
  {
    id: 'n14',
    title: 'Minimum Wage Committee Recommends ₦100,000 as New National Minimum — Workers Reject It',
    url: 'https://www.vanguardngr.com',
    published_at: '2026-06-12T11:00:00Z',
    created_at: '2026-06-12T11:00:00Z',
    summary: 'A tripartite committee on minimum wage recommended ₦100,000 as the new national monthly baseline. The NLC and TUC immediately rejected the figure, insisting workers need at least ₦250,000 given current inflation, and threatened a general strike.',
    topic: 'social',
    category: 'Social',
    site_name: 'Vanguard',
    read_time: 4,
  },
  {
    id: 'n15',
    title: 'Abuja Explosions: Police Neutralise Suicide Bomber Near National Assembly Gate',
    url: 'https://www.channelstv.com',
    published_at: '2026-06-10T07:00:00Z',
    created_at: '2026-06-10T07:00:00Z',
    summary: 'Police and DSS operatives foiled a suspected bombing attempt near the Three Arms Zone in Abuja, neutralising a would-be suicide attacker. Security was immediately raised to the highest alert level across the FCT following the incident.',
    topic: 'security',
    category: 'Security',
    site_name: 'Channels TV',
    read_time: 3,
  },
  {
    id: 'n16',
    title: 'House of Reps Passes NASS Reform Bill Reducing Constituency Projects by 40%',
    url: 'https://www.guardian.ng',
    published_at: '2026-06-08T10:30:00Z',
    created_at: '2026-06-08T10:30:00Z',
    summary: 'The House of Representatives passed a controversial bill to reduce constituency project allocations by 40%, redirecting funds to a National Infrastructure Trust Fund. The bill now requires Senate concurrence and presidential assent.',
    topic: 'policy',
    category: 'Governance',
    site_name: 'The Guardian',
    read_time: 4,
  },
  {
    id: 'n17',
    title: 'Nnamdi Kanu\'s Continued Detention Violates Rights — ECOWAS Court Rules',
    url: 'https://www.thecable.ng',
    published_at: '2026-06-05T08:00:00Z',
    created_at: '2026-06-05T08:00:00Z',
    summary: 'The ECOWAS Court of Justice ruled that the continued detention of IPOB leader Nnamdi Kanu breaches the African Charter on Human and Peoples\' Rights and ordered Nigeria to pay $600,000 in damages. The federal government is expected to appeal the verdict.',
    topic: 'social',
    category: 'Social',
    site_name: 'The Cable',
    read_time: 4,
  },
];

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
        if (items.length > 0) {
          setArticles(items);
        } else {
          setArticles(FALLBACK_NEWS);
        }
      } catch {
        setArticles(FALLBACK_NEWS);
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
