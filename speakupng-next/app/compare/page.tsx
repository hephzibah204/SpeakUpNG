'use client';

import { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  full_name: string;
  role: string;
  party: string;
  state?: string;
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
}

interface DnaScores {
  leadership: number;
  integrity: number;
  transparency: number;
  accountability: number;
  accessibility: number;
  youth_support: number;
  economic_performance: number;
  education_performance: number;
  healthcare_performance: number;
  innovation: number;
  national_acceptance: number;
  legislative_productivity: number;
  overall_score: number;
}

interface PerformanceScores {
  education_score: number;
  healthcare_score: number;
  roads_score: number;
  agriculture_score: number;
  jobs_score: number;
  security_score: number;
  infrastructure_score: number;
  digital_economy_score: number;
  overall_score: number;
}

interface Manifesto {
  title: string;
  cost_feasibility: {
    rating: string;
    score: number;
    notes: string;
  };
}

export default function ComparePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');

  const [dnaA, setDnaA] = useState<DnaScores | null>(null);
  const [dnaB, setDnaB] = useState<DnaScores | null>(null);

  const [perfA, setPerfA] = useState<PerformanceScores | null>(null);
  const [perfB, setPerfB] = useState<PerformanceScores | null>(null);

  const [manifestoA, setManifestoA] = useState<Manifesto | null>(null);
  const [manifestoB, setManifestoB] = useState<Manifesto | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch candidates list
    fetch('/api/officials?limit=100')
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data.officials || []);
        if (data.officials && data.officials.length > 1) {
          setSelectedIdA(data.officials[0].id);
          setSelectedIdB(data.officials[1].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch metrics for Candidate A
  useEffect(() => {
    if (!selectedIdA) return;
    
    // DNA
    fetch(`/api/officials/dna?official_id=${selectedIdA}`)
      .then((res) => res.json())
      .then((data) => {
        setDnaA(data.dnaScore || null);
      }).catch(() => setDnaA(null));

    // Performance
    fetch('/api/performance')
      .then((res) => res.json())
      .then((data) => {
        const match = data.performance?.find((p: any) => p.official_id === selectedIdA);
        setPerfA(match || null);
      }).catch(() => setPerfA(null));

    // Manifesto
    fetch(`/api/manifestos?politician_id=${selectedIdA}`)
      .then((res) => res.json())
      .then((data) => {
        setManifestoA(data.manifestos?.[0] || null);
      }).catch(() => setManifestoA(null));
  }, [selectedIdA]);

  // Fetch metrics for Candidate B
  useEffect(() => {
    if (!selectedIdB) return;

    // DNA
    fetch(`/api/officials/dna?official_id=${selectedIdB}`)
      .then((res) => res.json())
      .then((data) => {
        setDnaB(data.dnaScore || null);
      }).catch(() => setDnaB(null));

    // Performance
    fetch('/api/performance')
      .then((res) => res.json())
      .then((data) => {
        const match = data.performance?.find((p: any) => p.official_id === selectedIdB);
        setPerfB(match || null);
      }).catch(() => setPerfB(null));

    // Manifesto
    fetch(`/api/manifestos?politician_id=${selectedIdB}`)
      .then((res) => res.json())
      .then((data) => {
        setManifestoB(data.manifestos?.[0] || null);
      }).catch(() => setManifestoB(null));
  }, [selectedIdB]);

  const candidateA = candidates.find((c) => c.id === selectedIdA);
  const candidateB = candidates.find((c) => c.id === selectedIdB);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Candidate Evaluation</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Compare Candidates</h1>
          <p className="text-lg text-[#6b7163]">
            Compare political figures side-by-side across user ratings, DNA radar metrics, manifesto cost/feasibility, and sector performance.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dropdown Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl shadow-xl">
              <div>
                <label className="block text-xs font-bold text-[#6b7163] uppercase tracking-wider mb-2">Candidate A</label>
                <select
                  value={selectedIdA}
                  onChange={(e) => setSelectedIdA(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-xl focus:outline-none focus:border-[#00b368] font-bold text-sm"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === selectedIdB}>
                      {c.full_name} ({c.party})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6b7163] uppercase tracking-wider mb-2">Candidate B</label>
                <select
                  value={selectedIdB}
                  onChange={(e) => setSelectedIdB(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-xl focus:outline-none focus:border-[#00b368] font-bold text-sm"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.id === selectedIdA}>
                      {c.full_name} ({c.party})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-side comparison tables */}
            {candidateA && candidateB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Candidate A Column */}
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center gap-4 border-b border-[#2c312a] pb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#2c312a] bg-zinc-905 flex-shrink-0">
                      <img
                        src={candidateA.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateA.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={candidateA.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white leading-tight">{candidateA.full_name}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{candidateA.role}</p>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Citizens Rating</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        {candidateA.rating_avg ? Number(candidateA.rating_avg).toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-zinc-500">/5.0 ({candidateA.rating_count} reviews)</span>
                    </div>
                  </div>

                  {/* DNA Scores */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Political DNA Indicators</h4>
                    {dnaA ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Overall DNA Score:</span>
                          <strong className="text-[#00b368]">{dnaA.overall_score}/100</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                          <div>Leadership: <strong>{dnaA.leadership}</strong></div>
                          <div>Integrity: <strong>{dnaA.integrity}</strong></div>
                          <div>Transparency: <strong>{dnaA.transparency}</strong></div>
                          <div>Accountability: <strong>{dnaA.accountability}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No DNA metrics recorded.</p>
                    )}
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Sector Performance</h4>
                    {perfA ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Governance Average:</span>
                          <strong className="text-[#00b368]">{perfA.overall_score}/100</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                          <div>Education: <strong>{perfA.education_score}</strong></div>
                          <div>Healthcare: <strong>{perfA.healthcare_score}</strong></div>
                          <div>Roads: <strong>{perfA.roads_score}</strong></div>
                          <div>Security: <strong>{perfA.security_score}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No performance ratings logged.</p>
                    )}
                  </div>
                </div>

                {/* Candidate B Column */}
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center gap-4 border-b border-[#2c312a] pb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#2c312a] bg-zinc-905 flex-shrink-0">
                      <img
                        src={candidateB.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateB.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={candidateB.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white leading-tight">{candidateB.full_name}</h2>
                      <p className="text-xs text-zinc-400 mt-1">{candidateB.role}</p>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Citizens Rating</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        {candidateB.rating_avg ? Number(candidateB.rating_avg).toFixed(1) : '—'}
                      </span>
                      <span className="text-xs text-zinc-500">/5.0 ({candidateB.rating_count} reviews)</span>
                    </div>
                  </div>

                  {/* DNA Scores */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Political DNA Indicators</h4>
                    {dnaB ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Overall DNA Score:</span>
                          <strong className="text-[#00b368]">{dnaB.overall_score}/100</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                          <div>Leadership: <strong>{dnaB.leadership}</strong></div>
                          <div>Integrity: <strong>{dnaB.integrity}</strong></div>
                          <div>Transparency: <strong>{dnaB.transparency}</strong></div>
                          <div>Accountability: <strong>{dnaB.accountability}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No DNA metrics recorded.</p>
                    )}
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Sector Performance</h4>
                    {perfB ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Governance Average:</span>
                          <strong className="text-[#00b368]">{perfB.overall_score}/100</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                          <div>Education: <strong>{perfB.education_score}</strong></div>
                          <div>Healthcare: <strong>{perfB.healthcare_score}</strong></div>
                          <div>Roads: <strong>{perfB.roads_score}</strong></div>
                          <div>Security: <strong>{perfB.security_score}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No performance ratings logged.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
