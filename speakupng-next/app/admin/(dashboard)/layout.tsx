'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
  href: string;
  label: string;
  iconPath: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    iconPath: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  },
  {
    href: '/admin/officials',
    label: 'Officials',
    iconPath: 'M12 3L2 9l10 6 10-6-10-6zm0 14l-8-4.8V17l8 4.8 8-4.8v-4.8L12 17z',
  },
  {
    href: '/admin/politicians',
    label: 'Politicians',
    iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  {
    href: '/admin/mandate',
    label: 'Mandates',
    iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13z',
  },
  {
    href: '/admin/profiles',
    label: 'Profile Enrichment',
    iconPath: 'M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6L12 2z',
  },
  {
    href: '/admin/news',
    label: 'News Intelligence',
    iconPath: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z',
  },
  {
    href: '/admin/alerts',
    label: 'News Alerts',
    iconPath: 'M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z',
  },
  {
    href: '/admin/polls',
    label: 'Polls',
    iconPath: 'M5 9.2h3V19H5zM10.5 5h3v14h-3zm5.5 8h3v6h-3z',
  },
  {
    href: '/admin/content',
    label: 'Content / Blog',
    iconPath: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  },
  {
    href: '/admin/reports',
    label: 'Misconduct Reports',
    iconPath: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  },
  {
    href: '/admin/ratings',
    label: 'Citizen Ratings',
    iconPath: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
  {
    href: '/admin/fact-checks',
    label: 'Fact Checks',
    iconPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
  {
    href: '/admin/incidents',
    label: 'Election Incidents',
    iconPath: 'M18 13v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6m14-4l-8-6-8 6m16 0v2H4V9m4 0V7a4 4 0 018 0v2',
  },
  {
    href: '/admin/political-events',
    label: 'Defections & Coalitions',
    iconPath: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.42l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.05-3.13-3.13z',
  },
  {
    href: '/admin/manifestos',
    label: 'Manifestos',
    iconPath: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z',
  },
  {
    href: '/admin/ai-manager',
    label: 'Intelligence Engine',
    iconPath: 'M12 2a2 2 0 012 2c0 .74-.4 1.38-1 1.72V7h2a3 3 0 013 3v1h1a2 2 0 012 2v4a2 2 0 01-2 2h-1v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1H3a2 2 0 01-2-2v-4a2 2 0 012-2h1v-1a3 3 0 013-3h2V5.72A2 2 0 018 4a2 2 0 012-2h2zm4 7H8a1 1 0 00-1 1v7a1 1 0 001 1h8a1 1 0 001-1v-7a1 1 0 00-1-1zm-6 2a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z',
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-paper-2 border-r border-rule flex-shrink-0">
        <div className="p-6 border-b border-rule">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="font-semibold text-ink text-sm tracking-tight">SpeakUpNG Console</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-paper-3 text-ink border border-rule'
                    : 'text-muted hover:text-ink hover:bg-paper-3/50'
                }`}
              >
                <svg
                  className="w-4 h-4 text-current flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={item.iconPath} />
                </svg>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-rule">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-error/90 hover:text-error hover:bg-error/5 transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-paper-2 border-b border-rule flex items-center justify-between px-6 lg:px-8">
          <button
            className="lg:hidden text-muted hover:text-ink"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[11px] font-mono text-muted bg-paper-3 px-2.5 py-1 rounded border border-rule">
              Administrator
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-paper/80" onClick={() => setMobileMenuOpen(false)} />
            
            <aside className="relative flex flex-col w-64 max-w-xs bg-paper-2 border-r border-rule h-full z-10">
              <div className="p-5 border-b border-rule flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="font-semibold text-ink text-sm">SpeakUpNG</span>
                </Link>
                <button
                  className="text-muted hover:text-ink text-lg leading-none"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  &times;
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-paper-3 text-ink border border-rule'
                          : 'text-muted hover:text-ink hover:bg-paper-3/50'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-current flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={item.iconPath} />
                      </svg>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-rule">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-error/90 hover:text-error hover:bg-error/5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
