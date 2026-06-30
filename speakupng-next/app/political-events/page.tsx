'use client';

import { useState, useEffect } from 'react';

interface CoalitionEvent {
  id: string;
  event_type: 'defection' | 'coalition' | 'endorsement' | 'running_mate';
  politician_name: string;
  from_party?: string;
  to_party?: string;
  description?: string;
  source_url?: string;
  event_date: string;
}

export default function DefectionsPage() {
  const [events, setEvents] = useState<CoalitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetch('/api/coalitions')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter(
    (ev) => filterType === 'all' || ev.event_type === filterType
  );

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'defection': return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
      case 'coalition': return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
      case 'endorsement': return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'running_mate': return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
      default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#e57368]">Alliance & Defection Tracker</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Political Transitions</h1>
          <p className="text-lg text-[#6b7163]">
            Track party defections, alliances, coalitions, and endorsements shaping the Nigerian political landscape in real time.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center sm:justify-start">
          {['all', 'defection', 'coalition', 'endorsement', 'running_mate'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                filterType === t
                  ? 'bg-[#e57368]/15 border-[#e57368] text-white'
                  : 'bg-[#1d211b] border-[#2c312a] hover:border-zinc-700 text-zinc-400'
              }`}
            >
              {t === 'all' ? 'All Events' : t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#e57368]"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-zinc-500">No political events logged under this category.</p>
          </div>
        ) : (
          /* Vertical Timeline UI */
          <div className="relative border-l border-[#2c312a] ml-4 pl-6 space-y-8">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="relative">
                {/* Timeline Dot Indicator */}
                <div className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full border-2 border-[#141714] ${
                  ev.event_type === 'defection' ? 'bg-[#e57368]' : 'bg-[#00b368]'
                }`}></div>

                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 shadow-2xl space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-[#e57368]">
                      {new Date(ev.event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide ${getBadgeStyle(ev.event_type)}`}>
                      {ev.event_type.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {ev.politician_name}
                  </h3>

                  {ev.event_type === 'defection' && ev.from_party && ev.to_party && (
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded uppercase">{ev.from_party}</span>
                      <span className="text-zinc-550">➔</span>
                      <span className="px-2 py-0.5 bg-[#008751]/10 text-[#00b368] border border-[#008751]/20 rounded uppercase">{ev.to_party}</span>
                    </div>
                  )}

                  {ev.description && (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                      {ev.description}
                    </p>
                  )}

                  {ev.source_url && (
                    <div className="text-[10px] pt-2 border-t border-[#2c312a]/30">
                      <a href={ev.source_url} target="_blank" rel="noopener noreferrer" className="text-[#e57368] hover:underline font-bold">
                        Source Verification 🔗
                      </a>
                    </div>
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
