'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingModal } from '@/components/RatingModal';
import { ReportModal } from '@/components/ReportModal';
import { ElectionCountdown } from '@/components/ElectionCountdown';

interface Official {
  id: string;
  full_name: string;
  common_name?: string;
  role: string;
  tier: string;
  state?: string;
  website?: string;
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
}

interface Politician {
  id: string;
  full_name: string;
  common_name?: string;
  party: string;
  aspiration_title?: string;
  photo_url?: string;
}

interface Stats {
  ratings: number;
  officials: number;
}

const TIERS = [
  { key: '', label: 'All' },
  { key: 'federal_executive', label: 'Federal Exec' },
  { key: 'federal_legislature', label: 'Nat. Assembly' },
  { key: 'federal_judiciary', label: 'Judiciary' },
  { key: 'state_executive', label: 'Governors' },
  { key: 'state_legislature', label: 'State Assembly' },
  { key: 'local_government', label: 'Local Govt' },
  { key: 'federal_agency', label: 'Agencies' },
  { key: 'military_security', label: 'Military & Security' },
];

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

function slugify(name: string) {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function avatar(name: string, photo?: string) {
  return photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
}

function StarRow({ avg }: { avg: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-base ${avg >= i ? 'text-[#e8a020]' : avg >= i - 0.5 ? 'text-[#e8a020]/50' : 'text-[#2c312a]'}`}>★</span>
      ))}
    </span>
  );
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ ratings: 0, officials: 0 });
  const [bestOfficials, setBestOfficials] = useState<Official[]>([]);
  const [bestAgencies, setBestAgencies] = useState<Official[]>([]);
  const [featuredLeaders, setFeaturedLeaders] = useState<Official[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);

  const [officials, setOfficials] = useState<Official[]>([]);
  const [totalOfficials, setTotalOfficials] = useState(0);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState('rating_count');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 9;

  const [modalTarget, setModalTarget] = useState<{ id: string; type: 'official' | 'politician'; name: string } | null>(null);
  const [activeModal, setActiveModal] = useState<'rate' | 'report' | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/officials?limit=5&sort=rating_avg_desc&tier=federal_executive')
      .then(r => r.json()).then(d => setBestOfficials((d.officials || []).filter((o: Official) => o.rating_count > 0))).catch(() => {});
    fetch('/api/officials?limit=5&sort=rating_avg_desc&tier=federal_agency')
      .then(r => r.json()).then(d => setBestAgencies((d.officials || []).filter((o: Official) => o.rating_count > 0))).catch(() => {});
    fetch('/api/officials?limit=3&sort=rating_count')
      .then(r => r.json()).then(d => setFeaturedLeaders(d.officials || [])).catch(() => {});
    fetch('/api/politicians?limit=3')
      .then(r => r.json()).then(d => setPoliticians(d.politicians || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ search, tier, state, sort, page: String(page), limit: String(limit) });
    fetch(`/api/officials?${p}`)
      .then(r => r.json())
      .then(d => { setOfficials(d.officials || []); setTotalOfficials(d.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, tier, state, sort, page]);

  const totalPages = Math.ceil(totalOfficials / limit);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2]">

      {/* ── HERO ── */}
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-radial-[circle_at_top,rgba(0,135,81,0.08),transparent_60%] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4">
          <span className="inline-block mb-4 text-xs font-bold uppercase tracking-widest text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-4 py-1.5 rounded-full">
            🇳🇬 Civic Accountability Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
            Rate Every <em className="not-italic text-[#00b368]">Government Official</em> in Nigeria
          </h1>
          <p className="text-[#6b7163] text-lg max-w-xl mx-auto mb-10">
            From your local councillor to the President. Anonymous, transparent, and powered by citizens.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => document.getElementById('officials-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-xl transition-colors text-sm"
            >
              Start Rating ↓
            </button>
            <Link href="/leaderboard"
              className="px-8 py-3 border border-[#2c312a] hover:border-[#00b368]/40 hover:text-[#00b368] text-[#f8f7f2] font-bold rounded-xl transition-colors text-sm">
              View Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* ── ELECTION COUNTDOWN ── */}
      <section className="px-4 pb-16">
        <ElectionCountdown />
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-[#2c312a] bg-[#1d211b]">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: stats.ratings > 0 ? stats.ratings.toLocaleString() : '—', l: 'Total Ratings' },
            { n: stats.officials > 0 ? stats.officials.toLocaleString() : '—', l: 'Officials Listed' },
            { n: '36+', l: 'States Covered' },
            { n: '100%', l: 'Anonymous' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{n}</div>
              <div className="text-xs text-[#6b7163] mt-1 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BEST RATED ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Best Rated Officials & Agencies</h2>
        <p className="text-[#6b7163] text-sm mb-6">Live rankings from citizen reviews submitted on evote.ng.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: '🏛️ Best Rated Officials', items: bestOfficials },
            { title: '🏢 Best Rated Agencies', items: bestAgencies },
          ].map(({ title, items }) => (
            <div key={title} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-4">{title}</h3>
              {items.length === 0 ? (
                <p className="text-[#6b7163] text-sm">No rated entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {items.map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#2c312a] last:border-0">
                      <Link href={`/official/${slugify(o.full_name)}`}
                        className="text-sm text-[#f8f7f2] hover:text-[#00b368] transition-colors font-medium truncate">
                        {o.full_name}
                      </Link>
                      <span className="text-[#e8a020] text-xs font-bold ml-4 flex-shrink-0">
                        ★ {o.rating_avg.toFixed(1)} <span className="text-[#6b7163]">({o.rating_count})</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LEADERS ── */}
      {featuredLeaders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Featured Leader Ratings</h2>
          <p className="text-[#6b7163] text-sm mb-6">Live leader spotlight powered by real user ratings.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredLeaders.map(leader => (
              <Link key={leader.id} href={`/official/${slugify(leader.full_name)}`}
                className="bg-[#1d211b] border border-[#2c312a] hover:border-[#008751]/40 rounded-2xl p-5 flex items-center gap-4 transition-colors">
                <img src={avatar(leader.full_name, leader.photo_url)} alt={leader.full_name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = avatar(leader.full_name); }} />
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{leader.full_name}</div>
                  <div className="text-[#6b7163] text-xs mt-0.5 truncate">{leader.role}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRow avg={leader.rating_avg} />
                    <span className="text-[#6b7163] text-xs">({leader.rating_count})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── POLITICIANS PREVIEW ── */}
      {politicians.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Prominent Politicians</h2>
              <p className="text-[#6b7163] text-sm">Aspirants and political leaders not currently in office.</p>
            </div>
            <Link href="/politicians" className="text-sm text-[#00b368] hover:underline font-semibold">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {politicians.map(pol => (
              <Link key={pol.id} href={`/politician/${slugify(pol.full_name)}`}
                className="bg-[#1d211b] border border-[#2c312a] hover:border-[#008751]/40 rounded-2xl p-4 flex items-center gap-4 transition-colors">
                <img src={avatar(pol.full_name, pol.photo_url)} alt={pol.full_name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = avatar(pol.full_name); }} />
                <div>
                  <div className="font-bold text-white text-sm">{pol.full_name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7163]">
                    <span className="bg-[#2c312a] px-2 py-0.5 rounded font-semibold">{pol.party}</span>
                    <span>{pol.aspiration_title || 'Aspirant'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── BROWSE OFFICIALS ── */}
      <section id="officials-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Browse Officials</h2>
        <p className="text-[#6b7163] text-sm mb-6">Search, filter by tier or state, then rate or report any official.</p>

        {/* Tier tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIERS.map(t => (
            <button key={t.key} onClick={() => { setTier(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                tier === t.key
                  ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]'
                  : 'border-[#2c312a] text-[#6b7163] hover:text-[#f8f7f2] hover:border-[#3c4139]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7163] text-sm">🔎</span>
            <input
              type="text"
              placeholder="Search by name, role, state..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-[#1d211b] border border-[#2c312a] rounded-xl text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] transition-colors"
            />
          </div>
          <select value={state} onChange={e => { setState(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-[#1d211b] border border-[#2c312a] rounded-xl text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors">
            <option value="">All States</option>
            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-[#1d211b] border border-[#2c312a] rounded-xl text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors">
            <option value="rating_count">Most Rated</option>
            <option value="rating_avg_desc">Highest Rated</option>
            <option value="rating_avg_asc">Lowest Rated</option>
            <option value="name">A–Z</option>
          </select>
          <span className="text-xs text-[#6b7163] font-semibold">{totalOfficials} officials</span>
        </div>

        {/* Officials grid */}
        {loading ? (
          <div className="text-center py-20 text-[#6b7163]">
            <div className="inline-block w-8 h-8 border-2 border-[#008751] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading officials...</p>
          </div>
        ) : officials.length === 0 ? (
          <div className="text-center py-20 text-[#6b7163]">No officials found. Try adjusting your filters.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {officials.map(o => {
              const tierColor = o.tier.includes('agency') ? '#888' : '#00b368';
              return (
                <div key={o.id} className="bg-[#1d211b] border border-[#2c312a] hover:border-[#3c4139] rounded-2xl p-5 flex flex-col gap-4 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={avatar(o.full_name, o.photo_url)} alt={o.full_name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = avatar(o.full_name); }} />
                    <div className="min-w-0">
                      <Link href={`/official/${slugify(o.full_name)}`}
                        className="font-bold text-white text-sm hover:text-[#00b368] transition-colors block truncate">
                        {o.full_name}
                      </Link>
                      <div className="text-[#6b7163] text-xs mt-0.5 truncate">{o.role}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                        style={{ color: tierColor, borderColor: `${tierColor}44`, background: `${tierColor}11` }}>
                        {o.tier.replace(/_/g, ' ')}{o.state ? ` · ${o.state}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRow avg={o.rating_avg} />
                    <span className="text-[#f8f7f2] text-sm font-bold">{o.rating_avg > 0 ? o.rating_avg.toFixed(1) : '—'}</span>
                    <span className="text-[#6b7163] text-xs">({o.rating_count})</span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => { setModalTarget({ id: o.id, type: 'official', name: o.full_name }); setActiveModal('rate'); }}
                      className="flex-1 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg transition-colors">
                      Rate
                    </button>
                    <button onClick={() => { setModalTarget({ id: o.id, type: 'official', name: o.full_name }); setActiveModal('report'); }}
                      className="flex-1 py-2 border border-[#2c312a] hover:border-[#3c4139] text-[#6b7163] hover:text-[#f8f7f2] text-xs font-bold rounded-lg transition-colors">
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); document.getElementById('officials-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors ${
                  page === p
                    ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]'
                    : 'border-[#2c312a] text-[#6b7163] hover:text-[#f8f7f2]'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── CIVIC INSIGHTS ── */}
      <section className="border-t border-[#2c312a] bg-[#1d211b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Civic Insights and Updates</h2>
          <p className="text-[#6b7163] text-sm mb-8">Follow policy explainers and fresh political updates linked to the officials you rate.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { kicker: 'Blog', title: 'Governance Explainers and Accountability Guides', copy: 'Read practical breakdowns on budgets, service delivery, elections, and how to evaluate office performance.', href: '/blog', cta: 'Visit Blog →' },
              { kicker: 'News', title: 'Daily Nigerian Governance News Roundup', copy: 'Track recent policy moves, campaign events, and institutional changes shaping citizen priorities.', href: '/news', cta: 'View News Updates →' },
              { kicker: 'Editorial', title: 'Curated Updates and Context for Citizens', copy: 'Editorial updates with context — less noise, more signal about governance changes that affect you.', href: '/news?tab=editorial', cta: 'Read Editorial →' },
            ].map(({ kicker, title, copy, href, cta }) => (
              <article key={kicker} className="bg-[#141714] border border-[#2c312a] rounded-2xl p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00b368]">{kicker}</span>
                <h3 className="font-bold text-white mt-2 mb-2 text-sm leading-snug">{title}</h3>
                <p className="text-[#6b7163] text-xs leading-relaxed mb-4">{copy}</p>
                <Link href={href} className="text-xs font-semibold text-[#00b368] hover:underline">{cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {activeModal === 'rate' && modalTarget && (
        <RatingModal
          targetId={modalTarget.id}
          targetType={modalTarget.type}
          targetName={modalTarget.name}
          onClose={() => { setModalTarget(null); setActiveModal(null); }}
          onSubmit={() => { setModalTarget(null); setActiveModal(null); setPage(1); }}
        />
      )}
      {activeModal === 'report' && modalTarget && (
        <ReportModal
          targetId={modalTarget.id}
          targetType={modalTarget.type}
          targetName={modalTarget.name}
          onClose={() => { setModalTarget(null); setActiveModal(null); }}
          onSubmit={() => { setModalTarget(null); setActiveModal(null); }}
        />
      )}
    </div>
  );
}
