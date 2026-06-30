'use client';

import { useState, useEffect } from 'react';

interface Party {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  headquarters?: string;
  manifesto_summary?: string;
  founded_year?: number;
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/parties')
      .then((res) => res.json())
      .then((data) => setParties(data.parties || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Political Parties</h1>
          <p className="text-lg text-[#6b7163]">
            Explore registered political parties, their founding details, and core manifesto agendas.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {parties.map((p) => (
              <div key={p.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:border-zinc-750 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#141714] border border-[#2c312a] flex items-center justify-center font-black text-lg text-[#00b368] font-display">
                      {p.acronym}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{p.name}</h2>
                      <p className="text-xs text-[#6b7163]">Founded {p.founded_year || 'N/A'}</p>
                    </div>
                  </div>

                  {p.manifesto_summary && (
                    <div className="p-4 bg-[#141714] border border-[#2c312a]/40 rounded-xl">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Core Agenda / Manifesto</h3>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{p.manifesto_summary}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#2c312a]/30 flex flex-wrap justify-between items-center gap-2 text-[11px] text-zinc-500">
                  {p.headquarters && (
                    <span>HQ: <strong className="text-zinc-400">{p.headquarters}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
