'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PartyFlag, { getPartyColorHex } from '@/components/PartyFlag';
import { getCandidatePhoto, getFallbackAvatar } from '@/lib/candidate-portraits';

type RaceTier = 'presidential' | 'governorship' | 'senate' | 'reps' | 'assembly' | 'lga';

interface Candidate {
  id: string;
  candidate_name: string;
  party: string;
  party_code?: string;
  state?: string;
  district?: string;
  running_mate?: string;
  status: 'confirmed' | 'expected';
  cleared_at?: string;
  source_url: string;
  photo_url?: string;
}

export default function CandidatesPage() {
  const [tab, setTab] = useState<RaceTier>('presidential');
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
    c.state?.toLowerCase().includes(search.toLowerCase()) ||
    c.district?.toLowerCase().includes(search.toLowerCase())
  );

  const tierLabels: Record<RaceTier, { label: string; icon: string }> = {
    presidential: { label: 'Presidential', icon: '🗳️' },
    governorship: { label: 'Governorship', icon: '🏛️' },
    senate: { label: 'Senate (109 Districts)', icon: '📜' },
    reps: { label: 'House of Reps (360 Constituencies)', icon: '👥' },
    assembly: { label: 'State Assembly', icon: '🏢' },
    lga: { label: 'LGA Chairmanship', icon: '🏘️' },
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white mb-2">2027 Candidate Directory</h1>
            <p className="text-[#6b7163] text-sm">Official party flagbearers and declared contestants across all tiers of the 2027 general elections.</p>
          </div>
          <Link
            href="/elections/2027"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md self-start sm:self-auto"
          >
            <span>🗳️ Cast Mock Vote</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Race Tier Switcher */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {(['presidential', 'governorship', 'senate', 'reps', 'assembly', 'lga'] as RaceTier[]).map((tierKey) => (
            <button
              key={tierKey}
              onClick={() => setTab(tierKey)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                tab === tierKey
                  ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]'
                  : 'border-[#2c312a] text-[#6b7163] hover:text-zinc-300'
              }`}
            >
              <span>{tierLabels[tierKey].icon}</span>
              <span>{tierLabels[tierKey].label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 p-4 bg-[#008751]/10 border border-[#008751]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[#00b368] text-sm font-bold mb-0.5">🗳️ 2027 {tierLabels[tab].label} Mock Poll Active</p>
            <p className="text-[#6b7163] text-xs leading-relaxed">
              Cast your mock ballot for declared contestants and view real-time citizen rankings.
            </p>
          </div>
          <Link
            href="/elections/2027"
            className="px-4 py-1.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg flex-shrink-0 uppercase tracking-wider"
          >
            Vote Now &rarr;
          </Link>
        </div>

        <p className="text-xs text-[#6b7163] mb-6">
          Showing {filtered.length} candidates in {tierLabels[tab].label}.
        </p>

        <input
          type="text"
          placeholder="Search by candidate name, party, district, or state..."
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
            {filtered.map(c => {
              const photoSrc = getCandidatePhoto(c.candidate_name, c.photo_url, c.party, c.party_code);
              const partyColor = getPartyColorHex(c.party, c.party_code);

              return (
                <div key={c.id} className="bg-[#1d211b] border border-[#2c312a] hover:border-zinc-600 transition-colors rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3.5 items-start mb-3">
                      {/* Candidate Picture */}
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-zinc-900 shadow-md"
                        style={{ borderColor: partyColor }}
                      >
                        <img
                          src={photoSrc}
                          alt={c.candidate_name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackAvatar(c.candidate_name, c.party, c.party_code);
                          }}
                        />
                      </div>

                      {/* Info & Party Flag */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <PartyFlag party={c.party} partyCode={c.party_code} size="sm" />
                          {(c.district || c.state) && (
                            <span className="px-2 py-0.5 bg-zinc-900 border border-[#2c312a] text-zinc-300 rounded text-[9px] font-bold truncate max-w-[150px]">
                              {c.district || `${c.state} State`}
                            </span>
                          )}
                          {c.status === 'expected' && (
                            <span className="px-2 py-0.5 bg-[#e8a020]/10 text-[#e8a020] rounded text-[9px] font-bold uppercase">Expected</span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-white text-base leading-snug truncate">{c.candidate_name}</h3>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{c.party}</p>
                      </div>
                    </div>

                    {c.running_mate && (
                      <p className="text-xs text-[#6b7163] bg-[#141714] border border-[#2c312a] p-2 rounded-lg mt-2">
                        Running mate: <span className="text-zinc-200 font-semibold">{c.running_mate}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2c312a] flex justify-end">
                    <Link
                      href="/elections/2027"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#008751]/15 hover:bg-[#008751]/30 text-[#00b368] text-xs font-bold transition-colors"
                    >
                      <span>🗳️ Vote {c.candidate_name.split(' ')[0]}</span>
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
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
