'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Official {
  id: string;
  full_name: string;
  role: string;
  photo_url?: string;
  rating_avg: number;
}

interface PromiseItem {
  id: string;
  promise_title: string;
  status: string;
  progress_percent: number;
  official_name: string;
}

interface ProjectItem {
  id: string;
  title: string;
  status: string;
  date_delivered?: string;
  official_name: string;
}

interface Incident {
  id: string;
  category: string;
  description: string;
  polling_unit?: string;
  lga?: string;
  status: string;
  created_at: string;
}

export default function StatesHubPage() {
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingHub, setLoadingHub] = useState(false);

  // Hub Datasets
  const [officials, setOfficials] = useState<Official[]>([]);
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    // Fetch all states for dropdown
    fetch('/api/officials')
      .then(res => res.json())
      .then(data => {
        // Unique states
        const uniqueStates = Array.from(new Set(data.officials?.map((o: any) => o.state).filter(Boolean))) as string[];
        setStates(uniqueStates.map(s => ({ id: s.toLowerCase(), name: s })).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    setLoadingHub(true);
    fetch(`/api/states/hub?state_name=${encodeURIComponent(selectedState)}`)
      .then(res => res.json())
      .then(data => {
        setOfficials(data.officials || []);
        setPromises(data.promises || []);
        setProjects(data.projects || []);
        setIncidents(data.incidents || []);
      })
      .catch(console.error)
      .finally(() => setLoadingHub(false));
  }, [selectedState]);

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
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white mb-3">State Civic Hub</h1>
            <p className="text-lg text-[#6b7163]">
              Track representatives, delivered projects, and local incidents for any Nigerian state.
            </p>
          </div>

          {!loadingList && (
            <div className="w-full sm:w-64">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[#1d211b] border border-[#2c312a] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00b368] font-bold text-sm"
              >
                {states.map(s => (
                  <option key={s.id} value={s.name}>{s.name} State</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loadingHub ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
            <p className="mt-2 text-xs text-[#6b7163]">Loading state directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Representatives & Incidents */}
            <div className="lg:col-span-4 space-y-6">
              {/* Representatives Card */}
              <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Representatives</h3>
                {officials.length === 0 ? (
                  <p className="text-xs text-zinc-500">No representatives logged for this state.</p>
                ) : (
                  <div className="space-y-3">
                    {officials.map(o => (
                      <Link
                        key={o.id}
                        href={`/official/${o.id}`}
                        className="flex items-center gap-3 p-3 bg-[#141714] border border-[#2c312a] rounded-xl hover:border-zinc-700 transition-colors text-left block"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#2c312a] bg-zinc-900 flex-shrink-0">
                          <img
                            src={o.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.full_name)}&size=128&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                            alt={o.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">{o.full_name}</h4>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{o.role}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] bg-[#008751]/10 text-[#00b368] px-2 py-0.5 rounded border border-[#008751]/20 font-bold">
                            ★ {o.rating_avg.toFixed(1)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Incidents Card */}
              <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Recent Local Incidents</h3>
                {incidents.length === 0 ? (
                  <p className="text-xs text-zinc-500">No incident reports logged in this state.</p>
                ) : (
                  <div className="space-y-3">
                    {incidents.map(inc => (
                      <div key={inc.id} className="p-3 bg-[#141714] border border-[#2c312a] rounded-xl space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#e57368] bg-[#c0392b]/10 border border-[#c0392b]/20 px-2 py-0.5 rounded">
                            {inc.category}
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            {new Date(inc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">{inc.description}</p>
                        <p className="text-[9px] text-zinc-500">
                          LGA: {inc.lga || 'N/A'} • PU: {inc.polling_unit || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Projects vs Promises */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Promises Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#2c312a]/50">
                      State Promises ({promises.length})
                    </h3>
                    {promises.length === 0 ? (
                      <div className="text-center py-10 bg-[#141714]/30 border border-[#2c312a] rounded-xl">
                        <p className="text-xs text-[#6b7163]">No campaign promises logged for this state.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {promises.map(p => (
                          <div key={p.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl space-y-2">
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="font-bold text-xs text-white leading-snug">{p.promise_title}</h4>
                              <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide whitespace-nowrap ${getStatusColor(p.status)}`}>
                                {p.status}
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-500">By {p.official_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Projects Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-[#2c312a]/50">
                      State Projects ({projects.length})
                    </h3>
                    {projects.length === 0 ? (
                      <div className="text-center py-10 bg-[#141714]/30 border border-[#2c312a] rounded-xl">
                        <p className="text-xs text-[#6b7163]">No delivered projects logged for this state.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {projects.map(p => (
                          <div key={p.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl space-y-2">
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="font-bold text-xs text-white leading-snug">{p.title}</h4>
                              <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide whitespace-nowrap ${getStatusColor(p.status)}`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-zinc-500 pt-1">
                              <span>By {p.official_name}</span>
                              {p.date_delivered && <span>Delivered: {p.date_delivered}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
