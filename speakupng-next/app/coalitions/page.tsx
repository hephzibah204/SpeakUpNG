'use client';

import { useState, useEffect, useMemo } from 'react';

interface CoalitionEvent {
  id: string;
  event_type: 'defection' | 'coalition' | 'endorsement' | 'running_mate';
  politician_name: string;
  from_party?: string;
  to_party?: string;
  description?: string;
  source_url?: string;
  event_date?: string;
  created_at: string;
}

const EVENT_TYPES = ['All', 'defection', 'coalition', 'endorsement', 'running_mate'];

const EVENT_TYPE_META: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  defection: {
    label: 'Defection',
    color: 'text-red-400',
    dot: 'bg-red-500',
    bg: 'bg-red-500/15 border-red-500/30 text-red-400',
  },
  coalition: {
    label: 'Coalition',
    color: 'text-[#00b368]',
    dot: 'bg-[#00b368]',
    bg: 'bg-[#00b368]/15 border-[#00b368]/30 text-[#00b368]',
  },
  endorsement: {
    label: 'Endorsement',
    color: 'text-blue-400',
    dot: 'bg-blue-500',
    bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  },
  running_mate: {
    label: 'Running Mate',
    color: 'text-purple-400',
    dot: 'bg-purple-500',
    bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
  },
};

function formatDate(dateString?: string) {
  if (!dateString) return 'Date unknown';
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CoalitionsPage() {
  const [events, setEvents] = useState<CoalitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/coalitions');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setEvents(data.events || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchType = activeType === 'All' || e.event_type === activeType;
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        e.politician_name.toLowerCase().includes(term) ||
        (e.from_party || '').toLowerCase().includes(term) ||
        (e.to_party || '').toLowerCase().includes(term) ||
        (e.description || '').toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [events, activeType, search]);

  const stats = useMemo(() => ({
    defections: events.filter((e) => e.event_type === 'defection').length,
    coalitions: events.filter((e) => e.event_type === 'coalition').length,
    endorsements: events.filter((e) => e.event_type === 'endorsement').length,
    running_mates: events.filter((e) => e.event_type === 'running_mate').length,
  }), [events]);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-20">
      {/* Header */}
      <div className="border-b border-[#2c312a] bg-[#1a1e19]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00b368]/15 text-[#00b368] border border-[#00b368]/25">
              🗳 Political Intelligence
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Coalition & Defection Tracker
          </h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Track every political defection, coalition formation, endorsement, and running mate selection shaping Nigeria&apos;s 2023–2027 political landscape.
          </p>

          {/* Stats row */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { label: 'Defections', count: stats.defections, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { label: 'Coalitions', count: stats.coalitions, color: 'text-[#00b368]', bg: 'bg-[#00b368]/10 border-[#00b368]/20' },
                { label: 'Endorsements', count: stats.endorsements, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { label: 'Running Mates', count: stats.running_mates, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} border rounded-xl p-4 text-center`}>
                  <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</div>
                  <div className="text-xs text-[#6b7163] font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search politicians, parties..."
              className="w-full pl-10 pr-4 py-3 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#f8f7f2] placeholder-zinc-500 text-sm focus:outline-none focus:border-[#00b368] transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => {
              const meta = type === 'All' ? null : EVENT_TYPE_META[type];
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all whitespace-nowrap ${
                    isActive
                      ? type === 'All'
                        ? 'bg-[#00b368] text-black border-[#00b368]'
                        : `${meta?.bg} border`
                      : 'bg-[#1d211b] text-[#6b7163] border-[#2c312a] hover:text-[#f8f7f2] hover:border-zinc-600'
                  }`}
                >
                  {type === 'All' ? 'All Events' : meta?.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
            <p className="mt-4 text-[#6b7163] text-sm">Loading political events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-[#1d211b] border border-[#2c312a] rounded-2xl">
            <p className="text-[#6b7163] text-lg font-medium">No events found for this filter.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6b7163] mb-6">
              Showing <span className="text-[#f8f7f2] font-semibold">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
            </p>

            {/* Timeline */}
            <div className="relative">
              {/* Animated vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00b368]/60 via-[#2c312a] to-transparent pointer-events-none" />

              <div className="space-y-6 pl-16">
                {filtered.map((event, idx) => {
                  const meta = EVENT_TYPE_META[event.event_type];
                  return (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[2.75rem] top-5 w-3.5 h-3.5 rounded-full ${meta.dot} ring-4 ring-[#141714] group-hover:scale-125 transition-transform`}
                      />

                      {/* Event number */}
                      <div className="absolute -left-[4.5rem] top-4 text-xs text-[#6b7163] font-mono w-6 text-right">
                        {String(idx + 1).padStart(2, '0')}
                      </div>

                      {/* Card */}
                      <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 hover:border-[#00b368]/30 hover:shadow-[0_0_24px_rgba(0,179,104,0.06)] transition-all duration-300">
                        {/* Top row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${meta.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                            {/* Party Change */}
                            {(event.from_party || event.to_party) && (
                              <div className="flex items-center gap-1.5 text-sm font-semibold">
                                {event.from_party && (
                                  <span className="px-2 py-0.5 rounded-md bg-zinc-700/30 text-zinc-300 text-xs border border-zinc-700/50">
                                    {event.from_party}
                                  </span>
                                )}
                                {event.from_party && event.to_party && event.from_party !== event.to_party && (
                                  <span className="text-[#6b7163] text-sm">→</span>
                                )}
                                {event.to_party && event.from_party !== event.to_party && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#00b368]/15 text-[#00b368] text-xs border border-[#00b368]/25">
                                    {event.to_party}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-[#6b7163] whitespace-nowrap shrink-0">
                            {formatDate(event.event_date || event.created_at)}
                          </span>
                        </div>

                        {/* Politician name */}
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00b368] transition-colors">
                          {event.politician_name}
                        </h3>

                        {/* Description */}
                        {event.description && (
                          <p className="text-sm text-zinc-400 leading-relaxed mb-3 line-clamp-3">
                            {event.description}
                          </p>
                        )}

                        {/* Source */}
                        {event.source_url && (
                          <a
                            href={event.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#00b368] hover:underline font-semibold"
                          >
                            View Source ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="mt-12 text-center">
              <p className="text-xs text-[#6b7163]">
                Showing all {filtered.length} tracked political events · Data updated regularly
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
