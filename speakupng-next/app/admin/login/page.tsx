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
    <div className="w-full max-w-md bg-paper-2 border border-rule p-8 rounded-2xl shadow-card relative overflow-hidden font-body">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-paper-3 rounded-xl border border-rule mb-4 text-accent-light">
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-display text-ink">EVOTE.NG Administration</h1>
        <p className="text-muted text-sm mt-1">Authorized personnel only</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-paper-3 border border-error text-error text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-muted mb-2">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-rule rounded-lg bg-paper text-ink placeholder-muted focus-visible:outline-2 focus-visible:outline-focus transition-colors text-sm"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-rule rounded-lg bg-paper text-ink placeholder-muted focus-visible:outline-2 focus-visible:outline-focus transition-colors text-sm"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent hover:bg-accent-light disabled:opacity-50 text-accent-ink font-bold rounded-lg transition-colors text-sm mt-2 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
        >
          {loading ? 'Authenticating…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4 font-body">
      <Suspense fallback={
        <div className="text-center text-muted text-sm">
          Loading login portal…
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
