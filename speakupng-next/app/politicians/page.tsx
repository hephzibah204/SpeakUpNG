'use client';

import { useState, useEffect } from 'react';

interface Politician {
  id: string;
  full_name: string;
  common_name: string;
  party: string;
  aspiration_title: string;
  photo_url: string;
  bio: string;
  aliases: string;
  priority: number;
  rating_avg: number;
  rating_count: number;
}

export default function PoliticiansPage() {
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('limit', '100');
        const res = await fetch(`/api/politicians?${params}`);
        const data = await res.json();
        
        let filtered = data.politicians || [];
        if (partyFilter !== 'all') {
          filtered = filtered.filter((p: any) => p.party === partyFilter);
        }
        if (roleFilter !== 'all') {
          filtered = filtered.filter((p: any) => p.aspiration_title.toLowerCase().includes(roleFilter.toLowerCase()));
        }
        setPoliticians(filtered);
      } catch (err) {
        console.error('Failed to fetch politicians:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticians();
  }, [search, partyFilter, roleFilter]);

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
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Political Leaders & Candidates</h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Explore profiles, track manifestos, and view citizen ratings for candidates and serving officials across Nigeria.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 bg-[#1d211b] border border-[#2c312a] p-5 rounded-xl justify-between items-center">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-500 focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            />
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="bg-[#141714] border border-[#2c312a] text-white px-3 py-2.5 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="all">All Parties</option>
              <option value="APC">APC</option>
              <option value="PDP">PDP</option>
              <option value="LP">LP</option>
              <option value="NNPP">NNPP</option>
              <option value="ADC">ADC</option>
              <option value="SDP">SDP</option>
              <option value="PRP">PRP</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#141714] border border-[#2c312a] text-white px-3 py-2.5 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="aspirant">Aspirant</option>
              <option value="governor">Governor</option>
              <option value="president">Presidential</option>
              <option value="leader">Political Leader</option>
            </select>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-[#6b7163] whitespace-nowrap">
            {politicians.length} Leaders Listed
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
            <p className="mt-4 text-[#6b7163] text-sm">Loading profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {politicians.map((politician) => (
              <div key={politician.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-6 hover:shadow-2xl transition-all flex flex-col justify-between items-center text-center group">
                <div className="flex flex-col items-center w-full">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-[#2c312a] mb-4">
                    <img
                      src={politician.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                      alt={politician.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                      }}
                    />
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-[#00b368] transition-colors mb-1 font-display">
                    {politician.full_name}
                  </h2>

                  <p className="text-sm text-[#00b368] font-medium mb-3">
                    {politician.aspiration_title}
                  </p>

                  <span className="inline-block px-3 py-1 bg-zinc-800 border border-[#2c312a] text-[#e8a020] rounded-full text-xs font-bold uppercase mb-4">
                    {politician.party}
                  </span>

                  <p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {politician.bio}
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-[#2c312a] flex flex-col gap-4 items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      <span className="text-[#e8a020] text-sm">★</span>
                      <span className="font-extrabold text-sm text-[#e8a020]">
                        {politician.rating_avg ? Number(politician.rating_avg).toFixed(1) : '—'}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7163] font-semibold">
                      {politician.rating_count || 0} reviews
                    </span>
                  </div>

                  <a
                    href={`/politician/${slugify(politician.full_name)}`}
                    className="w-full px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-center font-bold rounded-lg transition-colors text-sm"
                  >
                    View Full Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && politicians.length === 0 && (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-[#6b7163] text-lg font-medium">No politicians found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
