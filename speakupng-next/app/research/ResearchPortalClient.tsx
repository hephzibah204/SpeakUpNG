'use client';

import { useState } from 'react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  rowsCount: string;
  fileSize: string;
  updatedAt: string;
}

const DATASETS: Dataset[] = [
  {
    id: 'presidential-polling-2027',
    name: '2027 Presidential Polling Data',
    description: 'Anonymized citizen mock votes, regional sentiments, and candidate selections representing simulated elections 2027 polling analytics.',
    rowsCount: '300+ entries',
    fileSize: 'approx. 24 KB',
    updatedAt: 'Daily (Real-time)',
  },
  {
    id: 'governorship-candidates-2027',
    name: 'State-by-State Governorship Candidates',
    description: 'Expected and confirmed political party flagbearers for the 2027 governorship elections across on-cycle Nigerian states.',
    rowsCount: '8 states populated',
    fileSize: 'approx. 4 KB',
    updatedAt: 'Weekly update',
  },
  {
    id: 'citizen-project-verifications',
    name: 'Citizen Project Verifications',
    description: 'Crowdsourced verification records, status comments, and status audits for projects tracked under public offices.',
    rowsCount: '15+ audit records',
    fileSize: 'approx. 8 KB',
    updatedAt: 'Monthly update',
  },
];

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/officials',
    description: 'Search and filter active public officials with aggregated rating statistics.',
    queryParams: [
      { name: 'search', type: 'string', desc: 'Fuzzy search by name, common name, or role.' },
      { name: 'state', type: 'string', desc: 'Filter by state (e.g. Lagos, Oyo, Kano).' },
      { name: 'tier', type: 'string', desc: 'Filter by tier (e.g. federal_executive, state_executive, federal_agency).' },
      { name: 'sort', type: 'string', desc: 'Sort criteria: rating_count, rating_avg_desc, rating_avg_asc, name.' },
      { name: 'page', type: 'number', desc: 'Page number (default: 1).' },
      { name: 'limit', type: 'number', desc: 'Items per page (default: 12).' },
    ],
    response: `{
  "officials": [
    {
      "id": "626f6c61-2d61-486d-6564-2d74696e7562",
      "full_name": "Bola Ahmed Tinubu",
      "common_name": "Tinubu",
      "role": "President",
      "tier": "federal_executive",
      "state": "FCT",
      "rating_avg": 4.2,
      "rating_count": 1245,
      "status": "active"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 12
}`,
  },
  {
    method: 'GET',
    path: '/api/performance',
    description: 'Retrieve calculated performance metrics based on real citizen ratings across core categories.',
    queryParams: [],
    response: `{
  "performance": [
    {
      "id": "73657969-2d6d-416b-696e-646500000000",
      "official_name": "Seyi Makinde",
      "role": "Governor",
      "state": "Oyo",
      "overall_score": 90,
      "categories": {
        "accountability": 90,
        "service": 100,
        "transparency": 80,
        "responsiveness": 100,
        "power": 80,
        "security": 100,
        "economic_stability": 100,
        "education": 100,
        "healthcare": 100
      }
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/heatmap',
    description: 'Get geo-political regional citizen sentiment strengths and top-rated candidates by zone.',
    queryParams: [],
    response: `{
  "zones": {
    "sw": {
      "name": "South West",
      "states": ["Lagos", "Oyo", "Ogun", "Ondo", "Osun", "Ekiti"],
      "strength": "84%",
      "candidates": [
        {
          "name": "Seyi Makinde",
          "role": "Governor",
          "rating": 90
        }
      ]
    }
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/elections/2027',
    description: 'Retrieve real-time consolidated mock polling statistics and regional voter breakdowns for 2027.',
    queryParams: [],
    response: `{
  "totalVotes": [
    {
      "candidate_name": "Peter Obi",
      "party": "NDC",
      "vote_count": 120
    }
  ],
  "regionalBreakdowns": [
    {
      "voter_region": "South East",
      "candidate_name": "Peter Obi",
      "vote_count": 84
    }
  ]
}`,
  },
];

export default function ResearchPortalClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-16">
      {/* Datasets Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2c312a] pb-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Dataset Download Center</h2>
            <p className="text-[#6b7163] text-sm mt-1">
              Export verified data dumps in standard formats for offline analysis and reporting.
            </p>
          </div>
          <span className="text-xs text-[#00b368] font-bold bg-[#008751]/10 border border-[#008751]/20 px-3 py-1 rounded-full mt-2 md:mt-0 w-fit">
            Public Domain Dedication (CC0)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {DATASETS.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-[#1d211b] border border-[#2c312a] hover:border-[#00b368]/30 transition-all rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white font-display">{dataset.name}</h3>
                  <span className="text-[10px] font-semibold text-[#e8a020] bg-[#e8a020]/10 border border-[#e8a020]/20 px-2 py-0.5 rounded">
                    {dataset.updatedAt}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{dataset.description}</p>
                <div className="flex gap-4 text-xs text-[#6b7163]">
                  <span>Entries: <strong className="text-zinc-400">{dataset.rowsCount}</strong></span>
                  <span>Size: <strong className="text-zinc-400">{dataset.fileSize}</strong></span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                <a
                  href={`/api/research/download?dataset=${dataset.id}&format=json`}
                  download
                  className="flex-1 text-center bg-[#232820] hover:bg-[#2c312a] border border-[#2c312a] hover:border-[#6b7163] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  JSON Format
                </a>
                <a
                  href={`/api/research/download?dataset=${dataset.id}&format=csv`}
                  download
                  className="flex-1 text-center bg-[#008751] hover:bg-[#00b368] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV Format
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer API Documentation Section */}
      <section className="space-y-6">
        <div className="border-b border-[#2c312a] pb-4">
          <h2 className="text-2xl font-bold font-display text-white">Developer API Reference</h2>
          <p className="text-[#6b7163] text-sm mt-1">
            Build third-party civic monitoring apps, research tools, or news widgets with our read-only endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-4 space-y-2">
            {API_ENDPOINTS.map((endpoint, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                  activeTab === index
                    ? 'bg-[#1d211b] border-[#00b368] shadow-lg shadow-[#008751]/5'
                    : 'bg-[#1d211b]/40 border-[#2c312a] hover:border-[#2c312a] hover:bg-[#1d211b]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-[#008751]/15 text-[#00b368] px-2 py-0.5 rounded tracking-wide">
                    {endpoint.method}
                  </span>
                  <code className="text-xs text-white font-mono font-bold">{endpoint.path}</code>
                </div>
                <p className="text-[11px] text-[#6b7163] line-clamp-1 mt-1">{endpoint.description}</p>
              </button>
            ))}
          </div>

          {/* Docs Details */}
          <div className="lg:col-span-8 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase bg-[#008751]/20 text-[#00b368] px-2.5 py-1 rounded">
                  {API_ENDPOINTS[activeTab].method}
                </span>
                <code className="text-base sm:text-lg text-white font-mono font-bold">
                  {API_ENDPOINTS[activeTab].path}
                </code>
              </div>
              <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                {API_ENDPOINTS[activeTab].description}
              </p>
            </div>

            {/* Query parameters table if any */}
            {API_ENDPOINTS[activeTab].queryParams.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Query Parameters</h4>
                <div className="border border-[#2c312a] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#232820] border-b border-[#2c312a] text-zinc-400">
                        <th className="p-3 font-semibold">Parameter</th>
                        <th className="p-3 font-semibold">Type</th>
                        <th className="p-3 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2c312a]">
                      {API_ENDPOINTS[activeTab].queryParams.map((param, pIdx) => (
                        <tr key={pIdx} className="hover:bg-[#232820]/30">
                          <td className="p-3 font-mono font-bold text-white">{param.name}</td>
                          <td className="p-3 text-[#e8a020] font-mono">{param.type}</td>
                          <td className="p-3 text-zinc-300">{param.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Response Structure Code Block */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Response Structure</h4>
                <button
                  onClick={() => copyToClipboard(API_ENDPOINTS[activeTab].response, activeTab)}
                  className="text-[10px] text-[#00b368] font-bold hover:text-white transition-all bg-[#008751]/10 border border-[#008751]/20 px-2.5 py-1 rounded"
                >
                  {copiedIndex === activeTab ? 'Copied ✓' : 'Copy JSON'}
                </button>
              </div>
              <div className="relative">
                <pre className="bg-[#141714] border border-[#2c312a] rounded-xl p-4 overflow-x-auto text-[11px] sm:text-xs text-[#00b368] font-mono leading-relaxed max-h-[350px]">
                  <code>{API_ENDPOINTS[activeTab].response}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
