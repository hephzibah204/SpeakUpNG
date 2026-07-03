'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type NavItem = { href: string; label: string; desc: string };
type NavCategory = { title: string; items: NavItem[] };

const MENU: NavCategory[] = [
  {
    title: 'Directory',
    items: [
      { href: '/', label: 'Officials', desc: 'Elected leaders in office' },
      { href: '/politicians', label: 'Politicians', desc: 'Profiles of all politicians' },
      { href: '/candidates', label: 'Candidates', desc: 'Election contenders' },
      { href: '/agencies', label: 'Agencies', desc: 'Government institutions' },
      { href: '/parties', label: 'Parties', desc: 'Political party info' },
      { href: '/champions', label: 'Champions', desc: 'Top-rated performers' },
    ]
  },
  {
    title: 'Elections',
    items: [
      { href: '/elections', label: 'Elections', desc: 'Past & present polls' },
      { href: '/elections/2027', label: '2027 Race', desc: 'Upcoming general elections' },
      { href: '/manifestos', label: 'Manifestos', desc: 'Campaign promises & docs' },
      { href: '/predictions', label: 'Forecaster', desc: 'Data-driven predictions' },
      { href: '/political-events', label: 'Defections', desc: 'Party movements & events' },
      { href: '/polls', label: 'Polls', desc: 'Public opinion surveys' },
    ]
  },
  {
    title: 'Accountability',
    items: [
      { href: '/tracker', label: 'Tracker', desc: 'Promise & policy tracking' },
      { href: '/performance', label: 'Performance', desc: 'Metric scorecards' },
      { href: '/bills', label: 'Bills', desc: 'Legislative tracking' },
      { href: '/budgets', label: 'Budgets', desc: 'Financial transparency' },
      { href: '/compare', label: 'Compare', desc: 'Side-by-side analysis' },
      { href: '/fact-check', label: 'Fact Check', desc: 'Verified public claims' },
      { href: '/transparency', label: 'Trust Centre', desc: 'Platform methodology' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { href: '/leaderboard', label: 'Rankings', desc: 'Official leaderboards' },
      { href: '/dna', label: 'DNA Score', desc: 'Political alignment index' },
      { href: '/influence-index', label: 'Influence', desc: 'Power & network dynamics' },
      { href: '/heatmap', label: 'Heat Map', desc: 'Geographic sentiment' },
      { href: '/states', label: 'States', desc: 'State-level metrics' },
      { href: '/governance', label: 'Petitions', desc: 'Civic action & requests' },
      { href: '/incidents', label: 'Incidents', desc: 'Reported civic issues' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { href: '/news', label: 'News', desc: 'Latest governance updates' },
      { href: '/blog', label: 'Blog', desc: 'In-depth civic articles' },
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
    <nav
      style={{ background: 'rgba(20,23,20,.96)', backdropFilter: 'blur(14px)' }}
      className="sticky top-0 z-50 border-b border-[#2c312a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-8">
          <img src="/images/logo.png" alt="evote.ng" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Mega Menu */}
        <div className="hidden lg:flex flex-1 items-center gap-2">
          {MENU.map((category) => (
            <div key={category.title} className="relative group h-16 flex items-center">
              <button
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  isCategoryActive(category)
                    ? 'text-[#00b368] bg-[#008751]/10'
                    : 'text-[#6b7163] group-hover:text-[#f8f7f2] group-hover:bg-[#1d211b]'
                }`}
              >
                {category.title}
                <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Dropdown Panel */}
              <div className="absolute top-16 left-0 w-[480px] pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="bg-[#141714]/95 backdrop-blur-2xl border border-[#2c312a] rounded-xl shadow-2xl p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group/item flex flex-col p-3 rounded-lg transition-all ${
                          isActive(item.href)
                            ? 'bg-[#008751]/10 border border-[#008751]/20'
                            : 'hover:bg-[#1d211b] border border-transparent'
                        }`}
                      >
                        <span className={`text-sm font-bold transition-colors ${
                          isActive(item.href) ? 'text-[#00b368]' : 'text-[#f8f7f2] group-hover/item:text-[#00b368]'
                        }`}>
                          {item.label}
                        </span>
                        <span className="text-xs text-[#6b7163] mt-0.5 font-medium leading-snug">
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

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="lg:hidden p-2 rounded-lg border border-[#2c312a] text-[#f8f7f2] hover:bg-[#1d211b] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#1d211b] border-t border-[#2c312a] px-4 pb-6 pt-2 space-y-2 max-h-[80vh] overflow-y-auto">
          {MENU.map((category) => {
            const isExpanded = openCategory === category.title;
            const hasActiveItem = isCategoryActive(category);
            
            return (
              <div key={category.title} className="border border-[#2c312a] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenCategory(isExpanded ? null : category.title)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
                    hasActiveItem || isExpanded ? 'bg-[#2c312a]/50 text-[#f8f7f2]' : 'bg-[#141714] text-[#6b7163]'
                  }`}
                >
                  {category.title}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <div className="bg-[#141714] px-2 py-2 space-y-1 border-t border-[#2c312a]">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-[#00b368] bg-[#008751]/10'
                            : 'text-[#9ba192] hover:text-[#f8f7f2] hover:bg-[#1d211b]'
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
