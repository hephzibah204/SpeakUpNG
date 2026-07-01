'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Officials' },
  { href: '/agencies', label: 'Agencies' },
  { href: '/politicians', label: 'Politicians' },
  { href: '/compare', label: 'Compare' },
  { href: '/tracker', label: 'Tracker' },
  { href: '/manifestos', label: 'Manifestos' },
  { href: '/candidates', label: 'Candidates' },
  { href: '/elections', label: 'Elections' },
  { href: '/elections/2027', label: '2027 Race' },
  { href: '/heatmap', label: 'Heat Map' },
  { href: '/states', label: 'States' },
  { href: '/parties', label: 'Parties' },
  { href: '/bills', label: 'Bills' },
  { href: '/budgets', label: 'Budgets' },
  { href: '/performance', label: 'Performance' },
  { href: '/learn', label: 'Learn' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/fact-check', label: 'Fact Check' },
  { href: '/political-events', label: 'Defections' },
  { href: '/influence-index', label: 'Influence' },
  { href: '/dna', label: 'DNA Score' },
  { href: '/leaderboard', label: 'Rankings' },
  { href: '/champions', label: 'Champions' },
  { href: '/predictions', label: 'Forecaster' },
  { href: '/transparency', label: 'Trust Centre' },
  { href: '/governance', label: 'Petitions' },
  { href: '/polls', label: 'Polls' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Blog' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      style={{ background: 'rgba(20,23,20,.96)', backdropFilter: 'blur(14px)' }}
      className="sticky top-0 z-50 border-b border-[#2c312a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/images/logo.png" alt="evote.ng" className="h-10 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'text-[#00b368] bg-[#008751]/10'
                  : 'text-[#6b7163] hover:text-[#f8f7f2] hover:bg-[#1d211b]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden p-2 rounded-lg border border-[#2c312a] text-[#f8f7f2] hover:bg-[#1d211b] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#1d211b] border-t border-[#2c312a] px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'text-[#00b368] bg-[#008751]/10'
                  : 'text-[#6b7163] hover:text-[#f8f7f2] hover:bg-[#2c312a]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
