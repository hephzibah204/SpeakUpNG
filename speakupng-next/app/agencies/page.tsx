'use client';

import { useState, useEffect, useMemo } from 'react';

interface Agency {
  id: string;
  full_name: string;
  common_name?: string;
  role?: string;
  tier: string;
  state?: string;
  website?: string;
  photo_url?: string;
  rating_avg?: number;
  rating_count?: number;
  sector?: string;
}

const SECTORS = [
  { value: 'power', label: 'Power' },
  { value: 'health', label: 'Health' },
  { value: 'economy', label: 'Finance/Economy' },
  { value: 'security', label: 'Security' },
  { value: 'education', label: 'Education' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'transport', label: 'Transport' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'general', label: 'General' },
];

const TIERS = [
  { value: 'federal_agency', label: 'Federal Agencies' },
  { value: 'state_agency', label: 'State Agencies' },
];

const SORT_OPTIONS = [
  { value: 'rating_count', label: 'Most Rated' },
  { value: 'rating_avg_desc', label: 'Highest Rated' },
  { value: 'rating_avg_asc', label: 'Lowest Rated' },
  { value: 'name', label: 'A–Z' },
];

function detectSector(agency: Agency): string {
  const hay = `${agency.full_name || ''} ${agency.common_name || ''} ${agency.role || ''} ${agency.website || ''}`.toLowerCase();
  if (/electricity|disco|distribution company|transmission company of nigeria|nerc|nbet|rea|nemsa|niso|ikeja electric|eko electricity|ibedc|aedc|phed|kaedco|kedco|yedc|eedc|jos electric|benin electricity/.test(hay)) return 'power';
  if (/nafdac|nphcda|health|hospital|medical|phc|nhis|aids|drug|vaccine|disease/.test(hay)) return 'health';
  if (/finance|budget|econom|revenue|tax|customs|trade|industry|investment|fiscal|cbn|firs|sec|nnpc|petroleum|oil|gas|energy/.test(hay)) return 'economy';
  if (/interior|defen[cs]e|police|security|intelligence|immigration|nscdc|ndlea|military|army|navy|air force/.test(hay)) return 'security';
  if (/education|school|university|polytechnic|teaching|student/.test(hay)) return 'education';
  if (/works|housing|infrastructure|urban|water resources|environment|housing|works/.test(hay)) return 'infrastructure';
  if (/transport|aviation|marine|maritime|rail|ports|waterways/.test(hay)) return 'transport';
  if (/agric|livestock|food|fertilizer/.test(hay)) return 'agriculture';
  return 'general';
}const AGENCY_HEAD_ROLE_RE = /minister|commissioner|director general|\bdg\b|managing director|\bmd\b|ceo|executive secretary|chairman|comptroller-?general|inspector general|administrator|head/i;
const AGENCY_ORG_NAME_RE = /agency|authority|commission|corporation|company|plc|ltd|limited|board|service|department|ministry|bureau|office|council|secretariat|bank|electricity|distribution|transmission|power|disco|discos|nnpc|nafdac/i;

function isAgencyBodyName(name: string) {
  const s = String(name || '').trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (AGENCY_ORG_NAME_RE.test(lower)) return true;
  if (/^[A-Z0-9]{2,12}$/.test(s)) return true;
  return false;
}

function isAgencyBody(a: Agency): boolean {
  const isAgencyTier = a.tier === 'federal_agency' || a.tier === 'state_agency';
  return isAgencyTier && isAgencyBodyName(a.full_name) && !AGENCY_HEAD_ROLE_RE.test(String(a.role || ''));
}

export default function AgenciesPage() {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [sector, setSector] = useState('');
  const [sort, setSort] = useState('rating_count');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 18;

  useEffect(() => {
    const params = new URLSearchParams({
      limit: '100',
      sort,
    });
    if (tier) params.set('tier', tier);
    
    fetch(`/api/officials?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        const agenciesWithSector = (data.officials || []).map((a: Agency) => ({
          ...a,
          sector: detectSector(a),
        }));
        setAgencies(agenciesWithSector);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load agencies');
      })
      .finally(() => setLoading(false));
  }, [sort, tier]);

  const filtered = useMemo(() => {
    return agencies.filter(a => {
      if (search) {
        const term = search.toLowerCase();
        if (!a.full_name.toLowerCase().includes(term) &&
            a.role?.toLowerCase().includes(term) === false &&
            a.state?.toLowerCase().includes(term) === false &&
            a.website?.toLowerCase().includes(term) === false) {
          return false;
        }
      }
      
      // Ensure only federal or state owned agencies are listed (no individuals/president/governors)
      if (!isAgencyBody(a)) return false;

      if (tier && a.tier !== tier) return false;
      if (sector && a.sector !== sector) return false;
      return true;
    });
  }, [agencies, search, tier, sector]);

  const slicedAgencies = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    const params = new URLSearchParams({
      limit: '100',
      sort: newSort,
    });
    if (tier) params.set('tier', tier);
    fetch(`/api/officials?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        const agenciesWithSector = (data.officials || []).map((a: Agency) => ({
          ...a,
          sector: detectSector(a),
        }));
        setAgencies(agenciesWithSector);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load agencies');
      });
  };

  const slugify = (name: string) => {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Government Agencies</h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Monitor, rate, and review performance for federal and state government agencies across Nigeria.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#1d211b] border border-[#2c312a] p-5 rounded-xl">
          <div className="relative flex-1 min-w-[260px]">
            <input
              type="text"
              placeholder="Search agencies by name, sector, or state..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 pl-10 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-500 focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            />
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors"
            >
              <option value="">All Tiers</option>
              {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors"
            >
              <option value="">All Sectors</option>
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors"
            >
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          
          <span className="text-xs font-bold uppercase tracking-wider text-[#6b7163] self-center">
            {filtered.length} Results
          </span>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-[#c0392b]/15 border border-[#c0392b]/35 text-[#e57368] text-sm rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
            <p className="mt-4 text-[#6b7163] text-sm">Loading agencies...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slicedAgencies.map((agency) => (
                <a
                  key={agency.id}
                  href={`/official/${slugify(agency.full_name)}`}
                  className="bg-[#1d211b] border border-[#2c312a] hover:border-zinc-700 rounded-xl p-6 hover:shadow-2xl transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#2c312a] flex-shrink-0">
                        <img
                          src={agency.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                          alt={agency.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agency.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white group-hover:text-[#00b368] transition-colors truncate text-base">
                          {agency.full_name}
                        </h3>
                        <p className="text-xs text-[#6b7163] truncate mt-0.5">{agency.role}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {agency.state && (
                            <span className="px-2 py-0.5 bg-zinc-800 text-xs rounded text-zinc-400 font-medium">
                              {agency.state}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-zinc-800 text-xs rounded text-[#00b368] font-semibold capitalize">
                            {agency.sector}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#2c312a] mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#e8a020] text-sm">★</span>
                      <span className="font-extrabold text-sm text-[#e8a020]">
                        {agency.rating_avg ? Number(agency.rating_avg).toFixed(1) : '—'}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7163] font-semibold">
                      {agency.rating_count || 0} reviews
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                {(() => {
                  const maxVisible = 10;
                  let start = Math.max(1, page - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }
                  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                })().map(p => (
                  <button
                    key={p}
                    className={`tab ${page === p ? 'active' : ''}`}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-[#6b7163] text-lg font-medium">No agencies found matching your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}


