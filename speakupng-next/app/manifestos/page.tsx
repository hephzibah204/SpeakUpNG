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

interface Politician {
  id: string;
  full_name: string;
  party: string;
}

export default function ManifestosPage() {
  const [manifestos, setManifestos] = useState<Manifesto[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [selectedPoliticianId, setSelectedPoliticianId] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [manifestoText, setManifestoText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');

  const fetchManifestos = () => {
    setLoading(true);
    fetch('/api/manifestos')
      .then((res) => res.json())
      .then((data) => {
        setManifestos(data.manifestos || []);
        if (data.manifestos && data.manifestos.length > 0 && !selectedId) {
          setSelectedId(data.manifestos[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchManifestos();

    // Fetch politicians for selection dropdown
    fetch('/api/politicians?limit=100')
      .then((res) => res.json())
      .then((data) => {
        setPoliticians(data.politicians || []);
        if (data.politicians && data.politicians.length > 0) {
          setSelectedPoliticianId(data.politicians[0].id);
        }
      })
      .catch(console.error);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoliticianId || !titleInput || !manifestoText) {
      alert('Please fill out all fields.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStatus('Connecting to Gemini policy engine...');
    
    // Micro-status simulation for visual polish
    const intervals = [
      { msg: 'Extracting key political promises...', time: 2500 },
      { msg: 'Evaluating budget feasibility and economic notes...', time: 6000 },
      { msg: 'Cross-referencing implementation timelines & UN SDGs...', time: 10000 },
    ];

    intervals.forEach((step) => {
      setTimeout(() => {
        if (analyzing) setAnalysisStatus(step.msg);
      }, step.time);
    });

    try {
      const res = await fetch('/api/manifestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          politician_id: selectedPoliticianId,
          title: titleInput,
          text: manifestoText
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('Manifesto analyzed and saved successfully!');
        setTitleInput('');
        setManifestoText('');
        setShowForm(false);
        setSelectedId(data.id);
        fetchManifestos();
      } else {
        alert('Failed to analyze manifesto. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error analyzing manifesto.');
    } finally {
      setAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white mb-3">Manifesto Intelligence</h1>
            <p className="text-lg text-[#6b7163]">
              AI-assisted analysis of candidate manifestos, including estimated costs, implementation timelines, and SDG alignments.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#008751] hover:bg-[#00b368] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            {showForm ? 'View Manifestos' : 'Analyze New Manifesto'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : showForm ? (
          /* Upload/Paste Form */
          <div className="max-w-3xl mx-auto bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-white">Paste Manifesto for AI Assessment</h3>
            <p className="text-xs text-zinc-400">
              Paste the official manifesto of a candidate below. The system will leverage Google Gemini to perform semantic analysis, feasibility ratings, and UN SDG alignments.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-550 mb-2 uppercase tracking-wide">Candidate</label>
                <select
                  value={selectedPoliticianId}
                  onChange={(e) => setSelectedPoliticianId(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-lg focus:outline-none focus:border-[#00b368] font-bold text-sm"
                >
                  {politicians.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.party})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 mb-2 uppercase tracking-wide">Manifesto Title</label>
                <input
                  type="text"
                  placeholder="e.g. My Covenant with Nigerians, Agenda 2027"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-lg focus:outline-none focus:border-[#00b368] font-bold text-sm placeholder:text-zinc-650"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-550 mb-2 uppercase tracking-wide">Manifesto Text Content</label>
                <textarea
                  rows={8}
                  placeholder="Paste the raw text of the policy promises or manifesto document here..."
                  value={manifestoText}
                  onChange={(e) => setManifestoText(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-lg focus:outline-none focus:border-[#00b368] text-sm placeholder:text-zinc-650"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-xs"
              >
                {analyzing ? 'Analyzing...' : 'Begin Analysis'}
              </button>

              {analyzing && (
                <div className="mt-4 p-4 bg-[#141714] border border-[#2c312a] rounded-xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00b368]"></div>
                  <span className="text-xs text-zinc-400 font-medium">{analysisStatus}</span>
                </div>
              )}
            </form>
          </div>
        ) : manifestos.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-550">No manifestos analyzed yet. Click "Analyze New Manifesto" to get started.</p>
          </div>
        ) : (
          /* Main Dash View */
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
                        <div className="flex items-start gap-4">
                          <div className={`px-4 py-3 rounded-xl border text-center font-display flex-shrink-0 ${getScoreColor(cost.score)}`}>
                            <div className="text-3xl font-black">{cost.score}</div>
                            <div className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Score</div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-300 font-bold">Financial Rating: <span className="text-white">{cost.rating}</span></div>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{cost.notes}</p>
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
                                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{sdg.details}</p>
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
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00b368] border border-[#141714]"></div>
                            <div className="flex justify-between items-center text-xs">
                              <h4 className="font-bold text-white">{ms.title}</h4>
                              <span className="text-[10px] text-[#e8a020] bg-[#e8a020]/10 border border-[#e8a020]/20 px-2 py-0.5 rounded font-black">{ms.timeline}</span>
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
