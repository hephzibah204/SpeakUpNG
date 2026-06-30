'use client';

import { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  candidate_name: string;
  party: string;
  party_code?: string;
  state?: string;
  running_mate?: string;
  status: 'confirmed' | 'expected';
  cleared_at?: string;
  source_url: string;
}

export default function CandidatesPage() {
  const [tab, setTab] = useState<'presidential' | 'governorship'>('presidential');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/election-candidates?year=2027&type=${tab}`)
      .then(res => res.json())
      .then(data => setCandidates(data.candidates || []))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = candidates.filter(c =>
    c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
    c.party.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold font-display text-white mb-3">2027 Candidate Directory</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('presidential')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${tab === 'presidential' ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163]'}`}>
            Presidential
          </button>
          <button onClick={() => setTab('governorship')}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${tab === 'governorship' ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163]'}`}>
            Governorship
          </button>
        </div>

        {tab === 'presidential' ? (
          <div className="mb-2 p-4 bg-[#4f8ef7]/10 border border-[#4f8ef7]/30 rounded-lg">
            <p className="text-[#4f8ef7] text-sm font-bold mb-1">ℹ️ Party-confirmed flagbearers, INEC list pending</p>
            <p className="text-[#6b7163] text-xs leading-relaxed">
              These candidates have been nominated through party primaries, as reported by BBC News Pidgin (31 May 2026). INEC's own
              final consolidated candidate list for the 16 January 2027 election has not yet been published. PDP and Labour Party each
              have unresolved internal leadership disputes, producing two rival flagbearers per party — both are shown below.
            </p>
          </div>
        ) : (
          <div className="mb-2 p-4 bg-[#e8a020]/10 border border-[#e8a020]/30 rounded-lg">
            <p className="text-[#e8a020] text-sm font-bold mb-1">⚠️ Not yet confirmed by INEC</p>
            <p className="text-[#6b7163] text-xs leading-relaxed">
              Governorship elections are scheduled for 6 February 2027. Party primaries and candidate clearance for most states have not concluded.
              The names below are widely-reported incumbents expected to seek re-election — not an official candidate list. Most states have no listed candidate yet.
            </p>
          </div>
        )}

        <p className="text-xs text-[#6b7163] mb-8">
          {tab === 'presidential'
            ? `${candidates.length} party flagbearers across 10 parties (PDP and Labour Party each have 2 rival faction candidates)`
            : `${candidates.length} of 28 on-cycle states have a reported name · 8 states (Anambra, Bayelsa, Edo, Ekiti, Imo, Kogi, Ondo, Osun) are off-cycle and not included`}
        </p>

        <input
          type="text"
          placeholder={tab === 'presidential' ? 'Search by name or party...' : 'Search by name, party, or state...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mb-8 px-4 py-3 border border-[#2c312a] rounded-lg bg-[#1d211b] text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] text-sm"
        />

        {loading ? (
          <div className="text-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#6b7163]">No candidates found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-lg">{c.candidate_name}</h3>
                    {c.state && <p className="text-xs text-[#6b7163]">{c.state} State</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {c.party_code && (
                      <span className="px-2 py-0.5 bg-[#008751]/10 text-[#00b368] rounded text-[10px] font-bold uppercase">{c.party_code}</span>
                    )}
                    {c.status === 'expected' && (
                      <span className="px-2 py-0.5 bg-[#e8a020]/10 text-[#e8a020] rounded text-[9px] font-bold uppercase">Expected</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-400">{c.party}</p>
                {c.running_mate && <p className="text-xs text-[#6b7163] mt-1">Running mate: <span className="text-zinc-300">{c.running_mate}</span></p>}
              </div>
            ))}
          </div>
        )}

        {candidates[0]?.source_url && (
          <p className="text-[10px] text-[#6b7163] mt-8">
            Source: <a href={candidates[0].source_url} target="_blank" rel="noreferrer" className="text-[#00b368] hover:underline">{candidates[0].source_url}</a>
          </p>
        )}
      </div>
    </div>
  );
}
