'use client';

import { useState, useEffect } from 'react';

interface Candidate {
  candidate_name: string;
  party: string;
  votes: number;
  is_winner: boolean;
  registered_voters?: number;
  valid_votes?: number;
  turnout_percent?: number;
  source_url: string;
}

export default function ElectionsArchivePage() {
  const [years, setYears] = useState<number[]>([]);
  const [elections, setElections] = useState<Record<number, Candidate[]>>({});
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/historical-elections')
      .then(res => res.json())
      .then(data => {
        setYears(data.years || []);
        setElections(data.elections || {});
        if (data.years?.length) setActiveYear(data.years[0]);
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const candidates = activeYear ? elections[activeYear] || [] : [];
  const maxVotes = Math.max(...candidates.map(c => c.votes), 1);
  const meta = candidates[0];

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold font-display text-white mb-3">Historical Election Archive</h1>
        <p className="text-[#6b7163] text-lg mb-8 max-w-2xl">
          Verified presidential election results, sourced from public records. Gubernatorial and National Assembly archives are not yet available.
        </p>

        {loading ? (
          <div className="text-center py-20"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div></div>
        ) : years.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#6b7163]">No election records available yet.</div>
        ) : (
          <>
            <div className="flex gap-2 mb-8">
              {years.map(y => (
                <button key={y} onClick={() => setActiveYear(y)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                    activeYear === y ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163] hover:text-white'
                  }`}>
                  {y}
                </button>
              ))}
            </div>

            {meta && (meta.registered_voters || meta.turnout_percent) && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {meta.registered_voters && (
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-4 text-center">
                    <div className="text-xl font-extrabold font-display text-white">{(meta.registered_voters / 1_000_000).toFixed(1)}M</div>
                    <div className="text-[10px] uppercase text-[#6b7163] font-bold mt-1">Registered Voters</div>
                  </div>
                )}
                {meta.valid_votes && (
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-4 text-center">
                    <div className="text-xl font-extrabold font-display text-white">{(meta.valid_votes / 1_000_000).toFixed(1)}M</div>
                    <div className="text-[10px] uppercase text-[#6b7163] font-bold mt-1">Valid Votes Cast</div>
                  </div>
                )}
                {meta.turnout_percent && (
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-4 text-center">
                    <div className="text-xl font-extrabold font-display text-[#e8a020]">{Number(meta.turnout_percent).toFixed(1)}%</div>
                    <div className="text-[10px] uppercase text-[#6b7163] font-bold mt-1">Turnout</div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#6b7163]">{activeYear} Presidential Election Results</h2>
              {candidates.map((c, i) => {
                const pct = Math.round((c.votes / maxVotes) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-sm font-bold ${c.is_winner ? 'text-[#00b368]' : 'text-white'}`}>
                        {c.candidate_name} {c.is_winner && '👑'}
                        <span className="text-[#6b7163] font-normal ml-2">{c.party}</span>
                      </span>
                      <span className="text-sm font-bold text-zinc-300">{c.votes.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#141714] h-2.5 rounded-full overflow-hidden border border-[#2c312a]">
                      <div className={`h-full rounded-full ${c.is_winner ? 'bg-[#00b368]' : 'bg-zinc-600'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {meta?.source_url && (
                <p className="text-[10px] text-[#6b7163] pt-3 border-t border-[#2c312a]">
                  Source: <a href={meta.source_url} target="_blank" rel="noreferrer" className="text-[#00b368] hover:underline">{meta.source_url}</a>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
