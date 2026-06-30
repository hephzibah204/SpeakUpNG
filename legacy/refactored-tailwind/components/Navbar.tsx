'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">evote.ng</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">Officials</Link>
            <Link href="/agencies" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">Agencies</Link>
            <Link href="/politicians" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">Politicians</Link>
            <Link href="/leaderboard" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">Rankings</Link>
            <Link href="/blog" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">Blog</Link>
            <Link href="/news" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-green-600 transition-colors">News</Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Officials</Link>
            <Link href="/agencies" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Agencies</Link>
            <Link href="/politicians" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Politicians</Link>
            <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Rankings</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">Blog</Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">News</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
