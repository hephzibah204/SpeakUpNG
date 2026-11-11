'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  desc: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const MENU: NavCategory[] = [
  {
    title: 'Directory',
    items: [
      { href: '/politicians', label: 'Politicians', desc: 'Candidates & political figures' },
      { href: '/agencies', label: 'MDAs & Agencies', desc: 'Government ministries & parastatals' },
      { href: '/parties', label: 'Political Parties', desc: 'Registered parties & manifestos' },
      { href: '/who-rep', label: 'Who Reps Me', desc: 'Find your federal & state reps' },
      { href: '/bills', label: 'Bills & Acts', desc: 'National Assembly legislative pipeline' },
      { href: '/transparency', label: 'Transparency', desc: 'FOI tracking & governance records' },
      { href: '/champions', label: 'Civic Champions', desc: 'Top contributors & community' },
    ]
  },
  {
    title: 'Trackers',
    items: [
      { href: '/promise', label: 'Mandate Scorecard', desc: 'Track official promises & progress' },
      { href: '/budgets', label: 'Budget Tracker', desc: 'Federal & state budget allocations' },
      { href: '/performance', label: 'Performance', desc: 'Cabinet KPI tracking index' },
      { href: '/polls', label: 'Civic Polls', desc: 'Citizen sentiment & opinion' },
      { href: '/predictions', label: 'Predictions', desc: 'Electoral forecasts & trends' },
      { href: '/elections', label: 'Elections Hub', desc: 'Historical election datasets' },
      { href: '/elections/2027', label: '2027 Elections', desc: 'Race tracker & candidate roster' },
      { href: '/fact-check', label: 'Fact Checks', desc: 'Verifications of political claims' },
      { href: '/political-events', label: 'Events Radar', desc: 'Campaigns, summits & protests' },
      { href: '/coalitions', label: 'Coalitions', desc: 'Political alliances & alignments' },
      { href: '/manifestos', label: 'Manifestos', desc: 'Party agendas & commitments' },
    ]
  },
  {
    title: 'Civic Intelligence',
    items: [
      { href: '/compare', label: 'Compare', desc: 'Side-by-side performance' },
      { href: '/leaderboard', label: 'Rankings', desc: 'Top & lowest rated officials' },
      { href: '/dna', label: 'DNA Score', desc: 'Political alignment index' },
      { href: '/influence-index', label: 'Influence', desc: 'Power & network dynamics' },
      { href: '/heatmap', label: 'Heat Map', desc: 'Geographic sentiment' },
      { href: '/states', label: 'States', desc: 'State-level metrics' },
      { href: '/governance', label: 'Petitions', desc: 'Civic action & requests' },
      { href: '/ask', label: 'Ask AI', desc: 'Ask civic questions' },
      { href: '/incidents', label: 'Incidents', desc: 'Reported civic issues' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { href: '/news', label: 'News', desc: 'Latest governance updates' },
      { href: '/blog', label: 'Blog', desc: 'In-depth civic articles' },
      { href: '/admin/blog', label: 'Blog Admin', desc: 'Admin posts & SEO editor' },
      { href: '/media', label: 'Media & Data', desc: 'Open data downloads' },
      { href: '/learn', label: 'Learn', desc: 'Civic education hub' },
    ]
  }
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isCategoryActive = (category: NavCategory) => 
    category.items.some(item => isActive(item.href));

  return (
    <nav className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 mr-8 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 rounded-lg"
        >
          <img src="/images/logo.png" alt="evote.ng" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Mega Menu */}
        <div className="hidden lg:flex flex-1 items-center gap-2">
          {MENU.map((category) => (
            <div key={category.title} className="relative group h-16 flex items-center">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 ${
                  isCategoryActive(category)
                    ? 'text-accent-light bg-paper-2'
                    : 'text-muted group-hover:text-ink group-hover:bg-paper-2'
                }`}
              >
                {category.title}
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 opacity-70 group-hover:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Dropdown Panel */}
              <div className="absolute top-16 left-0 w-[480px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                <div className="bg-paper-2 border border-rule rounded-xl p-4 shadow-card">
                  <div className="grid grid-cols-2 gap-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group/item flex flex-col p-3 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-focus ${
                          isActive(item.href)
                            ? 'bg-paper-3 border border-rule text-accent-light'
                            : 'hover:bg-paper-3 border border-transparent'
                        }`}
                      >
                        <span className={`text-sm font-bold transition-colors ${
                          isActive(item.href) ? 'text-accent-light' : 'text-ink group-hover/item:text-accent-light'
                        }`}>
                          {item.label}
                        </span>
                        <span className="text-xs text-muted mt-0.5 font-medium leading-snug">
                          {item.desc}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mock Vote CTA */}
        <div className="hidden sm:flex items-center gap-3 ml-4">
          <Link
            href="/elections/2027"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#008751] hover:bg-[#00b368] text-white transition-all shadow-sm active:translate-y-0.5"
          >
            <span>Mock vote 2027</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="lg:hidden p-2 rounded-lg border border-rule text-ink hover:bg-paper-2 transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-paper-2 border-t border-rule px-4 pb-6 pt-3 space-y-2 max-h-[80vh] overflow-y-auto">
          <div className="pb-2">
            <Link
              href="/elections/2027"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#008751] hover:bg-[#00b368] text-white font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              <span>Cast 2027 mock vote</span>
            </Link>
          </div>
          {MENU.map((category) => {
            const isExpanded = openCategory === category.title;
            const hasActiveItem = isCategoryActive(category);
            
            return (
              <div key={category.title} className="border border-rule rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenCategory(isExpanded ? null : category.title)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 ${
                    hasActiveItem || isExpanded ? 'bg-paper-3 text-ink' : 'bg-paper text-muted'
                  }`}
                >
                  {category.title}
                  <svg
                    aria-hidden="true"
                    className={`w-4 h-4 motion-safe:transition-transform motion-safe:duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="bg-paper px-2 py-2 space-y-1 border-t border-rule">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus ${
                          isActive(item.href)
                            ? 'text-accent-light bg-paper-2'
                            : 'text-muted hover:text-ink hover:bg-paper-2'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
