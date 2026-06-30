'use client';

import { useState, useEffect } from 'react';

interface CostFeasibility {
  rating: string;
  score: number;
  notes: string;
}

interface SdgAlign {
  goal: number;
  title: string;
  details: string;
}

interface Milestone {
  title: string;
  timeline: string;
  status: string;
}

interface Manifesto {
  id: string;
  politician_id: string;
  politician_name: string;
  party: string;
  title: string;
  summary: string;
  cost_feasibility: string | CostFeasibility;
  sdg_alignment: string | SdgAlign[];
  milestones: string | Milestone[];
}

export default function ManifestosPage() {
  const [manifestos, setManifestos] = useState<Manifesto[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/manifestos')
      .then((res) => res.json())
      .then((data) => {
        setManifestos(data.manifestos || []);
        if (data.manifestos && data.manifestos.length > 0) {
          setSelectedId(data.manifestos[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedManifesto = manifestos.find((m) => m.id === selectedId);

  // Parse JSON columns safely
  const parseJson = <T,>(val: any, fallback: T): T => {
    if (!val) return fallback;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val) as T;
      } catch {
        return fallback;
      }
    }
    return val as T;
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
    if (score >= 50) return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
    return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Manifesto Intelligence</h1>
          <p className="text-lg text-[#6b7163]">
            AI-assisted analysis of candidate manifestos, including estimated costs, implementation timelines, and SDG alignments.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : manifestos.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-500">No manifestos analyzed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar List */}
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Candidates</h3>
              <div className="space-y-2">
                {manifestos.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                      selectedId === m.id
                        ? 'bg-[#008751]/10 border-[#00b368] text-white'
                        : 'bg-[#141714] border-[#2c312a] hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm truncate">{m.politician_name}</h4>
                      <p className="text-[10px] text-zinc-550 mt-1 truncate">{m.title}</p>
                    </div>
                    <span className="text-[9px] font-black text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                      {m.party}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Pane */}
            {selectedManifesto && (
              <div className="lg:col-span-8 space-y-6 animate-fadeIn">
                {/* Summary Card */}
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
                  <h2 className="text-2xl font-black text-white font-display">{selectedManifesto.title}</h2>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedManifesto.summary}</p>
                </div>

                {/* Feasibility & SDG Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cost & Feasibility */}
                  {(() => {
                    const cost = parseJson<CostFeasibility>(selectedManifesto.cost_feasibility, { rating: 'N/A', score: 0, notes: '' });
                    return (
                      <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#6b7163]">Cost & Feasibility Analysis</h3>
                        <div className="flex items-center gap-4">
                          <div className={`px-4 py-3 rounded-xl border text-center font-display ${getScoreColor(cost.score)}`}>
                            <div className="text-3xl font-black">{cost.score}</div>
                            <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Score</div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Financial Rating: <strong className="text-white">{cost.rating}</strong></div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{cost.notes}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* SDG Alignment */}
                  {(() => {
                    const sdgs = parseJson<SdgAlign[]>(selectedManifesto.sdg_alignment, []);
                    return (
                      <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#6b7163]">UN SDG Alignment</h3>
                        <div className="space-y-3">
                          {sdgs.map((sdg, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                              <span className="w-8 h-8 rounded-lg bg-[#008751]/10 border border-[#008751]/20 text-[#00b368] flex items-center justify-center font-black flex-shrink-0">
                                {sdg.goal}
                              </span>
                              <div>
                                <h4 className="font-bold text-zinc-200">{sdg.title}</h4>
                                <p className="text-[11px] text-zinc-450 mt-0.5 leading-snug">{sdg.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Timelines & Milestones */}
                {(() => {
                  const milestones = parseJson<Milestone[]>(selectedManifesto.milestones, []);
                  return (
                    <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#6b7163]">Key Milestones & Timeline</h3>
                      <div className="border-l border-[#2c312a] ml-2 pl-4 space-y-4 pt-2">
                        {milestones.map((ms, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#00b368]"></div>
                            <div className="flex justify-between items-center text-xs">
                              <h4 className="font-bold text-white">{ms.title}</h4>
                              <span className="text-[10px] text-[#e8a020] font-bold">{ms.timeline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
