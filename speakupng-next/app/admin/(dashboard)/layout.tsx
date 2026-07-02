'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const MENU_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/officials', label: 'Officials', icon: '🏛️' },
  { href: '/admin/politicians', label: 'Politicians', icon: '👨‍💼' },
  { href: '/admin/mandate', label: 'Mandates', icon: '📝' },
  { href: '/admin/profiles', label: 'Profile Enrichment', icon: '✨' },
  { href: '/admin/news', label: 'News Intelligence', icon: '📰' },
  { href: '/admin/alerts', label: 'News Alerts', icon: '🔔' },
  { href: '/admin/polls', label: 'Polls', icon: '📊' },
  { href: '/admin/content', label: 'Content / Blog', icon: '✍️' },
  { href: '/admin/reports', label: 'Misconduct Reports', icon: '🚨' },
  { href: '/admin/ratings', label: 'Citizen Ratings', icon: '⭐' },
  { href: '/admin/fact-checks', label: 'Fact Checks', icon: '🔍' },
  { href: '/admin/incidents', label: 'Election Incidents', icon: '🗳️' },
  { href: '/admin/political-events', label: 'Defections & Coalitions', icon: '🔀' },
  { href: '/admin/manifestos', label: 'Manifestos', icon: '📜' },
  { href: '/admin/ai-manager', label: 'AI Manager', icon: '🤖' },
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
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1d211b] border-r border-[#2c312a] flex-shrink-0">
        <div className="p-6 border-b border-[#2c312a]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🟢</span>
            <span className="font-extrabold font-display text-white tracking-wider">SpeakUpNG Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#008751]/10 border border-[#00b368]/20 text-white'
                    : 'text-[#6b7163] hover:text-white hover:bg-zinc-850 border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2c312a]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-transparent hover:border-red-900/20 transition-all"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#1d211b] border-b border-[#2c312a] flex items-center justify-between px-6 lg:px-8">
          <button
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-xs font-bold bg-[#2c312a] px-3 py-1 rounded-full text-zinc-400">
              System Admin
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            <aside className="relative flex flex-col w-64 max-w-xs bg-[#1d211b] border-r border-[#2c312a] h-full z-10">
              <div className="p-6 border-b border-[#2c312a] flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <span className="text-xl">🟢</span>
                  <span className="font-bold font-display text-white">SpeakUpNG</span>
                </Link>
                <button className="text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  &times;
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#008751]/10 border border-[#00b368]/20 text-white'
                          : 'text-[#6b7163] hover:text-white hover:bg-zinc-850 border border-transparent'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#2c312a]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/10 transition-all"
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
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
