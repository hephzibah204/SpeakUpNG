'use client';

import { useState, useEffect } from 'react';

interface Official {
  id: string;
  full_name: string;
  role: string;
  tier: string;
  profile_bio?: string;
  profile_generated?: boolean;
  profile_verified?: boolean;
  profile_updated_at?: string;
  date_of_birth?: string;
  state_of_origin?: string;
  education_summary?: string;
}

export default function AdminProfilesPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'no_bio' | 'generated' | 'verified'>('no_bio');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{ enriched: number; failed: number; total: number } | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchOfficials(); }, [search, filter]);

  const fetchOfficials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/officials?${params}`);
      const data = await res.json();
      let list: Official[] = data.officials || [];
      if (filter === 'no_bio') list = list.filter(o => !o.profile_bio);
      else if (filter === 'generated') list = list.filter(o => o.profile_generated);
      else if (filter === 'verified') list = list.filter(o => o.profile_verified);
      setOfficials(list);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const generateProfile = async (official: Official) => {
    setGeneratingId(official.id);
    try {
      const res = await fetch('/api/ai/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ official_id: official.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setToast(`Profile generated for ${official.full_name}`);
        fetchOfficials();
      } else {
        setToast(`Error: ${data.error || 'Generation failed'}`);
      }
    } catch {
      setToast('Network error during profile generation');
    } finally {
      setGeneratingId(null);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const enrichAll = async (force = false) => {
    if (!confirm(`This will generate biographies for all profiles${force ? ' (including those that already have one)' : ' missing a bio'} using Wikipedia + AI. Continue?`)) return;
    setEnrichingAll(true);
    setEnrichResult(null);
    try {
      const res = await fetch('/api/ai/enrich-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      setEnrichResult({ enriched: data.enriched || 0, failed: data.failed || 0, total: data.total || 0 });
      setToast(`Enrichment complete: ${data.enriched}/${data.total} profiles updated`);
      fetchOfficials();
    } catch {
      setToast('Enrichment request failed');
    } finally {
      setEnrichingAll(false);
      setTimeout(() => setToast(''), 6000);
    }
  };

  const verifyProfile = async (id: string) => {
    await fetch(`/api/admin/officials/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_verified: true }),
    });
    fetchOfficials();
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1d211b] border border-[#008751]/30 text-[#00b368] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Profile Enrichment</h1>
          <p className="text-[#6b7163] text-sm">Generate biographies using Wikipedia + AI for all officials and politicians.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => enrichAll(false)}
            disabled={enrichingAll}
            className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {enrichingAll ? 'Enriching…' : '✨ Enrich Missing Bios'}
          </button>
          <button
            onClick={() => enrichAll(true)}
            disabled={enrichingAll}
            className="px-4 py-2 border border-[#2c312a] hover:border-[#3c4139] text-[#6b7163] hover:text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Regenerate All
          </button>
        </div>
      </div>

      {enrichResult && (
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 text-sm">
          <div className="font-bold text-white mb-2">Last Enrichment Run</div>
          <div className="flex gap-6 text-[#6b7163]">
            <span>Total: <strong className="text-white">{enrichResult.total}</strong></span>
            <span>Enriched: <strong className="text-[#00b368]">{enrichResult.enriched}</strong></span>
            <span>Failed: <strong className="text-red-400">{enrichResult.failed}</strong></span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'no_bio', label: 'No Bio Yet' },
            { key: 'generated', label: 'AI Generated' },
            { key: 'verified', label: 'Verified' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                filter === f.key
                  ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]'
                  : 'border-[#2c312a] text-[#6b7163] hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#1d211b] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">Loading officials...</div>
      ) : officials.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">No officials match the current filter.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {officials.map(o => (
            <div key={o.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-sm">{o.full_name}</div>
                  <div className="text-[#6b7163] text-xs mt-0.5">{o.role} · {o.tier.replace(/_/g, ' ')}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {o.profile_generated && (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#e8a020]/10 border border-[#e8a020]/30 text-[#e8a020]">AI</span>
                  )}
                  {o.profile_verified && (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#008751]/10 border border-[#008751]/30 text-[#00b368]">Verified</span>
                  )}
                </div>
              </div>

              {o.profile_bio ? (
                <p className="text-[#6b7163] text-xs leading-relaxed line-clamp-3">{o.profile_bio}</p>
              ) : (
                <p className="text-[#6b7163]/60 text-xs italic">No bio generated yet.</p>
              )}

              <div className="flex gap-2 pt-2 border-t border-[#2c312a]">
                <button
                  onClick={() => generateProfile(o)}
                  disabled={generatingId === o.id}
                  className="flex-1 py-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                  {generatingId === o.id ? 'Generating…' : o.profile_bio ? 'Regenerate' : 'Generate Bio'}
                </button>
                {o.profile_bio && !o.profile_verified && (
                  <button onClick={() => verifyProfile(o.id)}
                    className="flex-1 py-2 border border-[#008751]/30 text-[#00b368] text-xs font-bold rounded-lg hover:bg-[#008751]/10 transition-colors">
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
