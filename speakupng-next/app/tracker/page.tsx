'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Official {
  id: string;
  full_name: string;
  role: string;
  tier: string;
  state?: string;
  photo_url?: string;
  rating_avg: number;
}

interface PromiseItem {
  id: string;
  promise_title: string;
  promise_detail?: string;
  status: string;
  progress_percent: number;
}

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  budget?: string;
  date_delivered?: string;
  evidence_url?: string;
}

export default function TrackerPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>('');
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    // Fetch all officials
    fetch('/api/officials?limit=100')
      .then(res => res.json())
      .then(data => {
        setOfficials(data.officials || []);
        if (data.officials && data.officials.length > 0) {
          setSelectedOfficialId(data.officials[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedOfficialId) return;

    setLoadingDetails(true);
    // Fetch promises and projects for selected official
    Promise.all([
      fetch(`/api/politicians/promises?official_id=${encodeURIComponent(selectedOfficialId)}`).then(r => r.url.includes('promises') ? r.json() : { promises: [] }),
      fetch(`/api/projects?official_id=${encodeURIComponent(selectedOfficialId)}`).then(r => r.json()),
    ])
      .then(([promData, projData]) => {
        setPromises(promData.promises || []);
        setProjects(projData.projects || []);
      })
      .catch(console.error)
      .finally(() => setLoadingDetails(false));
  }, [selectedOfficialId]);

  const selectedOfficial = officials.find(o => o.id === selectedOfficialId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
      case 'completed': return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
      case 'in_progress': return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
      case 'ongoing': return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
      case 'broken': return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
      case 'abandoned': return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
      default: return 'text-zinc-400 border-zinc-700 bg-zinc-805';
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">
            Promises vs. Projects Tracker
          </h1>
          <p className="text-lg text-[#6b7163]">
            Track campaign promises side-by-side with verified projects delivered by Nigerian public officials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Officials Selection list */}
          <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Select Public Official</h3>
            {loadingList ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {officials.map(o => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOfficialId(o.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedOfficialId === o.id
                        ? 'bg-[#008751]/10 border-[#00b368] text-white'
                        : 'bg-[#141714] border-[#2c312a] hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2c312a] flex-shrink-0 bg-zinc-900">
                      <img
                        src={o.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.full_name)}&size=128&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={o.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm truncate">{o.full_name}</h4>
                      <p className="text-[10px] text-zinc-550 truncate">{o.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Panels */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOfficial && (
              <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b border-[#2c312a]">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#2c312a] bg-zinc-905">
                      <img
                        src={selectedOfficial.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOfficial.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                        alt={selectedOfficial.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-white leading-tight">{selectedOfficial.full_name}</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">{selectedOfficial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="bg-[#141714] border border-[#2c312a] px-4 py-2 rounded-xl">
                      <div className="text-lg font-black text-[#e8a020]">{promises.length}</div>
                      <div className="text-[9px] uppercase font-bold text-[#6b7163]">Promises</div>
                    </div>
                    <div className="bg-[#141714] border border-[#2c312a] px-4 py-2 rounded-xl">
                      <div className="text-lg font-black text-[#00b368]">{projects.length}</div>
                      <div className="text-[9px] uppercase font-bold text-[#6b7163]">Projects</div>
                    </div>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
                    <p className="mt-2 text-xs text-[#6b7163]">Loading tracker data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Promises Column */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#2c312a]/50 flex justify-between">
                        <span>Campaign Promises</span>
                        <span className="text-xs text-zinc-500 font-medium">Manifesto</span>
                      </h3>

                      {promises.length === 0 ? (
                        <div className="text-center py-10 bg-[#141714]/30 border border-[#2c312a] rounded-xl">
                          <p className="text-xs text-[#6b7163]">No campaign promises logged.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {promises.map(p => (
                            <div key={p.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl space-y-2">
                              <div className="flex justify-between items-start gap-3">
                                <h4 className="font-bold text-xs text-white leading-snug">{p.promise_title}</h4>
                                <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide whitespace-nowrap ${getStatusColor(p.status)}`}>
                                  {p.status}
                                </span>
                              </div>
                              {p.promise_detail && <p className="text-[11px] text-zinc-400 leading-relaxed">{p.promise_detail}</p>}
                              {p.progress_percent > 0 && (
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1">
                                  <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-[#2c312a]">
                                    <div className="bg-[#00b368] h-full" style={{ width: `${p.progress_percent}%` }}></div>
                                  </div>
                                  <span>{p.progress_percent}%</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Projects Column */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#2c312a]/50 flex justify-between">
                        <span>Projects Delivered</span>
                        <span className="text-xs text-zinc-500 font-medium">Physical Track</span>
                      </h3>

                      {projects.length === 0 ? (
                        <div className="text-center py-10 bg-[#141714]/30 border border-[#2c312a] rounded-xl">
                          <p className="text-xs text-[#6b7163]">No delivered projects logged yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                          {projects.map(p => {
                            // Local state for interactive verification panel
                            const [showVerify, setShowVerify] = useState(false);
                            const [vStatus, setVStatus] = useState<'completed' | 'ongoing' | 'abandoned'>('completed');
                            const [vPhoto, setVPhoto] = useState('');
                            const [vComment, setVComment] = useState('');
                            const [vCount, setVCount] = useState({ completed: 0, ongoing: 0, abandoned: 0 });
                            const [hasVoted, setHasVoted] = useState(false);

                            const fetchVerifications = async () => {
                              try {
                                const res = await fetch(`/api/projects/verify?project_id=${p.id}`);
                                const data = await res.json();
                                const counts = { completed: 0, ongoing: 0, abandoned: 0 };
                                if (data.stats) {
                                  data.stats.forEach((s: any) => {
                                    if (s.status in counts) {
                                      counts[s.status as keyof typeof counts] = Number(s.count);
                                    }
                                  });
                                }
                                setVCount(counts);
                              } catch (err) {
                                console.error(err);
                              }
                            };

                            const handleVerifySubmit = async (e: React.FormEvent) => {
                              e.preventDefault();
                              let deviceHash = localStorage.getItem('evote_device_fingerprint');
                              if (!deviceHash) {
                                deviceHash = 'dev-' + Math.random().toString(36).substring(2, 15);
                                localStorage.setItem('evote_device_fingerprint', deviceHash);
                              }

                              try {
                                const res = await fetch('/api/projects/verify', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    project_id: p.id,
                                    status: vStatus,
                                    photo_url: vPhoto,
                                    comment: vComment,
                                    device_hash: deviceHash
                                  })
                                });

                                if (res.ok) {
                                  setHasVoted(true);
                                  alert('Project verification submitted successfully!');
                                  fetchVerifications();
                                } else {
                                  const errData = await res.json();
                                  alert(errData.error || 'Failed to submit verification.');
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            };

                            return (
                              <div key={p.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                  <h4 className="font-bold text-xs text-white leading-snug">{p.title}</h4>
                                  <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide whitespace-nowrap ${getStatusColor(p.status)}`}>
                                    {p.status}
                                  </span>
                                </div>
                                {p.description && <p className="text-[11px] text-zinc-400 leading-relaxed">{p.description}</p>}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-zinc-500 pt-1.5 border-t border-[#2c312a]/30">
                                  <div className="flex gap-3">
                                    {p.budget && <span>Budget: <strong className="text-zinc-400">{p.budget}</strong></span>}
                                    {p.date_delivered && <span>Delivered: <strong className="text-zinc-400">{p.date_delivered}</strong></span>}
                                  </div>
                                  <div className="flex gap-2">
                                    {p.evidence_url && (
                                      <a href={p.evidence_url} target="_blank" rel="noopener noreferrer" className="text-[#00b368] hover:underline">
                                        Evidence 🔗
                                      </a>
                                    )}
                                    <button
                                      onClick={() => {
                                        setShowVerify(!showVerify);
                                        if (!showVerify) fetchVerifications();
                                      }}
                                      className="text-[#e8a020] hover:underline font-bold"
                                    >
                                      Verify Status (Citizen)
                                    </button>
                                  </div>
                                </div>

                                {showVerify && (
                                  <div className="mt-3 p-3 bg-[#1d211b] border border-[#2c312a]/50 rounded-lg space-y-3">
                                    <div className="text-[10px] font-bold text-zinc-400 border-b border-[#2c312a]/30 pb-1.5 flex justify-between">
                                      <span>Citizen Consensus Status</span>
                                      <span className="text-[#00b368]">
                                        C: {vCount.completed} | O: {vCount.ongoing} | A: {vCount.abandoned}
                                      </span>
                                    </div>

                                    {!hasVoted ? (
                                      <form onSubmit={handleVerifySubmit} className="space-y-2">
                                        <div className="flex gap-2">
                                          <select
                                            value={vStatus}
                                            onChange={(e) => setVStatus(e.target.value as any)}
                                            className="bg-[#141714] border border-[#2c312a] text-white text-[10px] px-2 py-1 rounded w-full focus:outline-none"
                                          >
                                            <option value="completed">Completed</option>
                                            <option value="ongoing">Ongoing / In Progress</option>
                                            <option value="abandoned">Abandoned / Not Done</option>
                                          </select>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="On-the-ground photo URL (optional)"
                                          value={vPhoto}
                                          onChange={(e) => setVPhoto(e.target.value)}
                                          className="w-full bg-[#141714] border border-[#2c312a] text-white text-[10px] px-2 py-1 rounded focus:outline-none"
                                        />
                                        <textarea
                                          placeholder="Short comment or verification notes..."
                                          value={vComment}
                                          onChange={(e) => setVComment(e.target.value)}
                                          className="w-full bg-[#141714] border border-[#2c312a] text-white text-[10px] px-2 py-1 rounded focus:outline-none h-12"
                                        />
                                        <button
                                          type="submit"
                                          className="w-full bg-[#008751] hover:bg-[#00b368] text-white text-[10px] font-bold py-1 rounded transition-colors"
                                        >
                                          Submit Verification
                                        </button>
                                      </form>
                                    ) : (
                                      <p className="text-[10px] text-[#00b368] text-center font-bold">
                                        ✓ Verification submitted! Thank you for auditing this project.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
