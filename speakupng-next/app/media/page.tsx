'use client';

import { useState } from 'react';

const DATASETS = [
  {
    id: 'officials',
    label: 'Officials & Ratings',
    description: 'All tracked government officials with their aggregate citizen rating scores across 9 performance categories.',
    rows: '1,200+',
    fields: ['id', 'full_name', 'role', 'tier', 'state', 'party', 'rating_avg', 'rating_count', 'accountability_avg', 'service_avg', 'transparency_avg', '…'],
  },
  {
    id: 'ratings_summary',
    label: 'Individual Ratings',
    description: 'Raw citizen rating submissions (last 5,000) with per-category scores. Anonymised — no PII included.',
    rows: 'up to 5,000',
    fields: ['official_id', 'full_name', 'role', 'state', 'accountability', 'service_delivery', 'transparency', 'responsiveness', 'power_management', 'security', 'economic_stability', 'education', 'healthcare', 'created_at'],
  },
  {
    id: 'promises',
    label: 'Mandate Promises',
    description: 'Tracked campaign and office promises with status, progress percentage, and source citation.',
    rows: '500+',
    fields: ['id', 'politician_name', 'title', 'description', 'status', 'progress_percent', 'source_url', 'due_date', 'created_at'],
  },
  {
    id: 'historical_elections',
    label: 'Historical Elections',
    description: '2015, 2019, and 2023 presidential election results with vote shares. Source: INEC / Wikipedia.',
    rows: '228',
    fields: ['year', 'election_type', 'candidate_name', 'party', 'votes', 'vote_share_percent', 'position', 'state', 'source_url'],
  },
  {
    id: 'candidates',
    label: '2027 Candidates',
    description: 'Party-confirmed and expected 2027 presidential and governorship candidates. Source: BBC Pidgin, civic.ng.',
    rows: '20+',
    fields: ['full_name', 'party', 'position', 'election_type', 'election_year', 'state', 'running_mate', 'status', 'source_url', 'cleared_at'],
  },
];

const ENDPOINTS = [
  { method: 'GET', path: '/api/officials', description: 'List officials with rating averages. Supports ?tier=&state=&limit=' },
  { method: 'GET', path: '/api/officials/[id]', description: 'Single official profile with full rating breakdown.' },
  { method: 'GET', path: '/api/politicians', description: 'List politicians with party affiliation and profile data.' },
  { method: 'GET', path: '/api/election-candidates', description: 'Candidates by year/type. ?year=2027&type=presidential' },
  { method: 'GET', path: '/api/historical-elections', description: 'Historical election results grouped by year.' },
  { method: 'GET', path: '/api/fact-checks', description: 'Published fact-checked political claims with verdicts.' },
  { method: 'GET', path: '/api/coalitions', description: 'Party defections, coalitions, and endorsements tracker.' },
  { method: 'GET', path: '/api/mandates', description: 'Promise tracker — mandate promises with status.' },
  { method: 'GET', path: '/api/performance', description: 'Aggregate government performance derived from citizen ratings.' },
  { method: 'GET', path: '/api/export?dataset=officials&format=csv', description: 'Download any dataset as CSV or JSON.' },
];

export default function MediaPortalPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (datasetId: string, format: 'csv' | 'json') => {
    const key = `${datasetId}-${format}`;
    setDownloading(key);
    try {
      const url = `/api/export?dataset=${datasetId}&format=${format}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `evoteng-${datasetId}-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* ignore */ } finally { setDownloading(null); }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-10 border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Open Data</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Media & Research Portal</h1>
          <p className="text-lg text-[#6b7163] max-w-3xl">
            Freely downloadable civic datasets for journalists, researchers, and developers. All data is citizen-generated unless otherwise stated. Not an official government dataset.
          </p>
        </div>

        {/* Data Attribution */}
        <div className="mb-8 bg-[#008751]/10 border border-[#008751]/30 rounded-xl p-4 text-sm text-zinc-300">
          <strong className="text-white">Attribution:</strong> Data sourced from evote.ng citizen ratings, INEC filings, BBC Pidgin, Wikipedia, civic.ng, and other cited sources. Free for non-commercial use with attribution: <span className="text-[#00b368] font-mono">evote.ng</span>
        </div>

        {/* Downloadable Datasets */}
        <h2 className="text-xl font-extrabold text-white mb-4">Downloadable Datasets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {DATASETS.map(ds => (
            <div key={ds.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white">{ds.label}</h3>
                <span className="text-[10px] text-[#6b7163] bg-[#141714] px-2 py-0.5 rounded border border-[#2c312a] font-mono">{ds.rows} rows</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{ds.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {ds.fields.slice(0, 5).map(f => (
                  <span key={f} className="text-[10px] font-mono text-zinc-500 bg-[#141714] px-1.5 py-0.5 rounded border border-[#2c312a]">{f}</span>
                ))}
                {ds.fields.length > 5 && (
                  <span className="text-[10px] text-zinc-600">+{ds.fields.length - 5} more</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(ds.id, 'csv')}
                  disabled={downloading === `${ds.id}-csv`}
                  className="flex-1 px-3 py-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  {downloading === `${ds.id}-csv` ? '…' : '↓ CSV'}
                </button>
                <button
                  onClick={() => handleDownload(ds.id, 'json')}
                  disabled={downloading === `${ds.id}-json`}
                  className="flex-1 px-3 py-2 bg-[#1d211b] hover:bg-[#2c312a] border border-[#2c312a] hover:border-zinc-600 text-zinc-300 font-bold rounded-lg text-xs transition-colors"
                >
                  {downloading === `${ds.id}-json` ? '…' : '↓ JSON'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Public API Docs */}
        <h2 className="text-xl font-extrabold text-white mb-2">Public REST API</h2>
        <p className="text-sm text-zinc-500 mb-4">Base URL: <span className="font-mono text-[#00b368]">https://evote.ng</span> — No authentication required for GET endpoints. Rate limit: 60 req/min.</p>

        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden mb-12">
          <div className="grid grid-cols-[80px_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-[#6b7163] px-5 py-3 border-b border-[#2c312a]">
            <span>Method</span>
            <span>Endpoint</span>
            <span className="hidden sm:block">Description</span>
          </div>
          {ENDPOINTS.map((ep, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr] px-5 py-3 gap-1 sm:gap-0 ${i < ENDPOINTS.length - 1 ? 'border-b border-[#2c312a]' : ''} hover:bg-[#2c312a]/30`}
            >
              <span className="text-[10px] font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-1.5 py-0.5 rounded w-fit">{ep.method}</span>
              <span className="font-mono text-xs text-[#f8f7f2] break-all">{ep.path}</span>
              <span className="text-xs text-zinc-500">{ep.description}</span>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-2">For Journalists & Researchers</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Need bulk data, a custom dataset, or want to verify our methodology? We support civic journalism and academic research.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:data@evote.ng"
              className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-lg text-sm transition-colors"
            >
              Contact Data Team
            </a>
            <a
              href="/api/export?dataset=officials&format=json"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1d211b] border border-[#2c312a] hover:border-zinc-600 text-zinc-300 font-bold rounded-lg text-sm transition-colors"
            >
              Preview API Response
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
