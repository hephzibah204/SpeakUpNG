'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const next = searchParams.get('next') || '/admin';
        router.push(next);
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#1d211b] border border-[#2c312a] p-8 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00b368]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#e8a020]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#008751]/10 rounded-xl border border-[#00b368]/25 mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-white">SpeakUpNG Admin</h1>
        <p className="text-[#6b7163] text-sm mt-1">Authorized personnel only</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#c0392b]/15 border border-[#c0392b]/35 text-[#e57368] text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-600 focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-600 focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-[#008751]/50 text-white font-bold rounded-lg transition-all text-sm mt-2 flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center text-[#6b7163] text-sm">
          Loading login portal...
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
