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
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
  report_count: number;
}

interface Politician {
  id: string;
  full_name: string;
  party: string;
  aspiration_title?: string;
  photo_url?: string;
  rating_avg: number;
  rating_count: number;
}

interface Stats {
  ratings: number;
  officials: number;
}

const TIERS = [
  { key: '', label: 'All' },
  { key: 'executive', label: 'Executive' },
  { key: 'senate', label: 'Senate' },
  { key: 'house_of_reps', label: 'House of Reps' },
  { key: 'governor', label: 'Governors' },
  { key: 'agency', label: 'Agencies' },
];

const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function avatar(name: string, photo?: string): string {
  if (photo) return photo;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d211b&color=00b368&size=128&bold=true`;
}

function StarRow({ avg }: { avg: number }) {
  return (
    <div className="flex gap-1 items-center" aria-label={`Rating: ${avg.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map(star => {
        const fill = Math.min(Math.max(avg - (star - 1), 0), 1);
        return (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${fill >= 0.5 ? 'text-gold fill-current' : 'text-rule fill-transparent stroke-current'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [featuredLeaders, setFeaturedLeaders] = useState<Official[]>([]);
  const [bestOfficials, setBestOfficials] = useState<Official[]>([]);
  const [bestAgencies, setBestAgencies] = useState<Official[]>([]);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [stats, setStats] = useState<Stats>({ ratings: 0, officials: 0 });
  const [totalOfficials, setTotalOfficials] = useState(0);

  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState('rating_count');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<'rate' | 'report' | null>(null);
  const [modalTarget, setModalTarget] = useState<{ id: string; type: 'official' | 'politician'; name: string } | null>(null);

  const limit = 12;

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});

    fetch('/api/officials?sort=rating_count&limit=6&has_ratings=true')
      .then(r => r.json())
      .then(d => setFeaturedLeaders(d.officials || []))
      .catch(() => {});

    fetch('/api/officials?sort=rating_avg_desc&limit=5&tier=all_officials&has_ratings=true')
      .then(r => r.json())
      .then(d => setBestOfficials(d.officials || []))
      .catch(() => {});

    fetch('/api/officials?sort=rating_avg_desc&limit=5&tier=agency&has_ratings=true')
      .then(r => r.json())
      .then(d => setBestAgencies(d.officials || []))
      .catch(() => {});

    fetch('/api/politicians?limit=6')
      .then(r => r.json())
      .then(d => setPoliticians(d.politicians || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
      ...(search ? { search } : {}),
      ...(tier ? { tier } : {}),
      ...(state ? { state } : {}),
    });
    fetch(`/api/officials?${p}`)
      .then(r => r.json())
      .then(d => {
        setOfficials(d.officials || []);
        setTotalOfficials(d.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, tier, state, sort, page]);

  const totalPages = Math.ceil(totalOfficials / limit);

  return (
    <div className="min-h-screen bg-paper text-ink font-body">

      {/* ── HERO ── */}
      <section className="relative py-20 text-center overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper-2 border border-rule text-xs text-accent-light font-medium">
            <span>Civic accountability index</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-ink font-display">
            Rate every public official in Nigeria
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto mb-8">
            Evaluate track records from local councils to the presidency with verified transparency.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => document.getElementById('officials-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-accent hover:bg-accent-light text-accent-ink font-bold rounded-xl transition-colors text-sm focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
            >
              Start rating
            </button>
            <Link
              href="/elections/2027"
              className="px-8 py-3 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-xl transition-colors text-sm focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 inline-flex items-center gap-2 shadow-sm"
            >
              <span>🗳️ Mock Vote 2027</span>
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-3 border border-rule hover:border-accent-light text-ink hover:text-accent-light font-bold rounded-xl transition-colors text-sm focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
            >
              Explore rankings
            </Link>
          </div>
        </div>
      </section>

      {/* ── ELECTION COUNTDOWN ── */}
      <section className="px-4 pb-14">
        <ElectionCountdown />
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-rule bg-paper-2">
        <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: stats.ratings > 0 ? stats.ratings.toLocaleString() : '0', l: 'Total ratings' },
            { n: stats.officials > 0 ? stats.officials.toLocaleString() : '0', l: 'Officials indexed' },
            { n: '36', l: 'States covered' },
            { n: '100%', l: 'Anonymous submissions' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div className="text-3xl font-black text-ink font-display tabular-nums">{n}</div>
              <div className="text-xs text-muted mt-1 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BEST RATED ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold text-ink mb-1 font-display">Highest rated leaders and public bodies</h2>
        <p className="text-muted text-sm mb-6">Aggregate scorecards calculated from citizen reviews submitted nationwide.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Top rated officials', items: bestOfficials },
            { title: 'Top rated agencies', items: bestAgencies },
          ].map(({ title, items }) => (
            <div key={title} className="bg-paper-2 border border-rule rounded-2xl p-5">
              <h3 className="font-bold text-ink text-sm mb-4 font-display">{title}</h3>
              {items.length === 0 ? (
                <p className="text-muted text-sm">No rated entries recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {items.map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-rule last:border-0">
                      <Link
                        href={`/official/${slugify(o.full_name)}`}
                        className="text-sm text-ink hover:text-accent-light transition-colors font-medium truncate"
                      >
                        {o.full_name}
                      </Link>
                      <span className="text-gold text-xs font-bold ml-4 flex-shrink-0 tabular-nums">
                        {o.rating_avg.toFixed(1)} <span className="text-muted font-normal">({o.rating_count})</span>
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
          <h2 className="text-2xl font-extrabold text-ink mb-1 font-display">Featured leader ratings</h2>
          <p className="text-muted text-sm mb-6">Profiles receiving active review activity across constituencies.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredLeaders.map(leader => (
              <Link
                key={leader.id}
                href={`/official/${slugify(leader.full_name)}`}
                className="bg-paper-2 border border-rule hover:border-accent rounded-2xl p-5 flex items-center gap-4 transition-colors"
              >
                <img
                  src={avatar(leader.full_name, leader.photo_url)}
                  alt={leader.full_name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-paper-3"
                  onError={e => { (e.target as HTMLImageElement).src = avatar(leader.full_name); }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-ink text-sm truncate font-display">{leader.full_name}</div>
                  <div className="text-muted text-xs mt-0.5 truncate">{leader.role}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRow avg={leader.rating_avg} />
                    <span className="text-muted text-xs tabular-nums">({leader.rating_count})</span>
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
              <h2 className="text-2xl font-extrabold text-ink mb-1 font-display">Aspirants and political figures</h2>
              <p className="text-muted text-sm">Key candidates and political leaders preparing for upcoming elections.</p>
            </div>
            <Link href="/politicians" className="text-sm text-accent-light hover:underline font-semibold">
              Browse all candidates
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {politicians.map(pol => (
              <Link
                key={pol.id}
                href={`/politician/${slugify(pol.full_name)}`}
                className="bg-paper-2 border border-rule hover:border-accent rounded-2xl p-4 flex items-center gap-4 transition-colors"
              >
                <img
                  src={avatar(pol.full_name, pol.photo_url)}
                  alt={pol.full_name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-paper-3"
                  onError={e => { (e.target as HTMLImageElement).src = avatar(pol.full_name); }}
                />
                <div>
                  <div className="font-bold text-ink text-sm font-display">{pol.full_name}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                    <span className="bg-paper-3 px-2 py-0.5 rounded font-semibold text-ink-2">{pol.party}</span>
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
        <h2 className="text-2xl font-extrabold text-ink mb-1 font-display">Directory of public officials</h2>
        <p className="text-muted text-sm mb-6">Filter by branch or state to submit ratings or flag governance reports.</p>

        {/* Tier tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIERS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTier(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                tier === t.key
                  ? 'bg-paper-3 border-accent-light text-accent-light'
                  : 'border-rule text-muted hover:text-ink hover:border-rule'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search by name, role, or state..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 bg-paper-2 border border-rule rounded-xl text-sm text-ink placeholder-muted focus-visible:outline-2 focus-visible:outline-focus transition-colors"
            />
          </div>
          <select
            value={state}
            onChange={e => { setState(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-paper-2 border border-rule rounded-xl text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus transition-colors"
          >
            <option value="">All states</option>
            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-paper-2 border border-rule rounded-xl text-sm text-ink focus-visible:outline-2 focus-visible:outline-focus transition-colors"
          >
            <option value="rating_count">Most rated</option>
            <option value="rating_avg_desc">Highest score</option>
            <option value="rating_avg_asc">Lowest score</option>
            <option value="name">Alphabetical</option>
          </select>
          <span className="text-xs text-muted font-semibold tabular-nums">{totalOfficials} officials listed</span>
        </div>

        {/* Officials grid */}
        {loading ? (
          <div className="text-center py-20 text-muted">
            <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full motion-safe:animate-spin mb-4" />
            <p className="text-sm">Fetching verified records…</p>
          </div>
        ) : officials.length === 0 ? (
          <div className="text-center py-20 text-muted">No officials match the selected filter.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {officials.map(o => (
              <div key={o.id} className="bg-paper-2 border border-rule hover:border-rule rounded-2xl p-5 flex flex-col gap-4 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar(o.full_name, o.photo_url)}
                    alt={o.full_name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-paper-3"
                    onError={e => { (e.target as HTMLImageElement).src = avatar(o.full_name); }}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/official/${slugify(o.full_name)}`}
                      className="font-bold text-ink text-sm hover:text-accent-light transition-colors block truncate font-display"
                    >
                      {o.full_name}
                    </Link>
                    <div className="text-muted text-xs mt-0.5 truncate">{o.role}</div>
                    <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded border border-rule bg-paper-3 text-ink-2">
                      {o.tier.replace(/_/g, ' ')}{o.state ? ` · ${o.state}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRow avg={o.rating_avg} />
                  <span className="text-ink text-sm font-bold tabular-nums">{o.rating_avg > 0 ? o.rating_avg.toFixed(1) : '—'}</span>
                  <span className="text-muted text-xs tabular-nums">({o.rating_count})</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => { setModalTarget({ id: o.id, type: 'official', name: o.full_name }); setActiveModal('rate'); }}
                    className="flex-1 py-2 bg-accent hover:bg-accent-light text-accent-ink text-xs font-bold rounded-lg transition-colors active:translate-y-0.5"
                  >
                    Rate
                  </button>
                  <button
                    onClick={() => { setModalTarget({ id: o.id, type: 'official', name: o.full_name }); setActiveModal('report'); }}
                    className="flex-1 py-2 border border-rule hover:border-rule text-muted hover:text-ink text-xs font-bold rounded-lg transition-colors active:translate-y-0.5"
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
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
                disabled={page === p}
                onClick={() => { setPage(p); document.getElementById('officials-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors disabled:opacity-75 disabled:cursor-default ${
                  page === p
                    ? 'bg-paper-3 border-accent-light text-accent-light'
                    : 'border-rule text-muted hover:text-ink'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── CIVIC INSIGHTS ── */}
      <section className="border-t border-rule bg-paper-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-extrabold text-ink mb-1 font-display">Civic insights and public briefings</h2>
          <p className="text-muted text-sm mb-8">Explanatory reporting and data guides connected to officials and public institutions.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { kicker: 'Governance guides', title: 'Accountability frameworks and oversight methods', copy: 'Clear guides on statutory budget timelines, constitutional duties, and citizen petition channels.', href: '/blog', cta: 'Read guides' },
              { kicker: 'Policy updates', title: 'Governance decisions and national policy monitoring', copy: 'Track legislative votes, executive orders, and agency compliance records as they develop.', href: '/news', cta: 'Read news coverage' },
              { kicker: 'Editorial reviews', title: 'Contextual analysis on Nigerian public affairs', copy: 'Focused editorial summaries separating signal from noise across key governance sectors.', href: '/news?tab=editorial', cta: 'Read editorial review' },
            ].map(({ kicker, title, copy, href, cta }) => (
              <article key={kicker} className="bg-paper border border-rule rounded-2xl p-6">
                <span className="text-xs font-semibold text-accent-light">{kicker}</span>
                <h3 className="font-bold text-ink mt-2 mb-2 text-sm leading-snug font-display">{title}</h3>
                <p className="text-muted text-xs leading-relaxed mb-4">{copy}</p>
                <Link href={href} className="text-xs font-semibold text-accent-light hover:underline">{cta}</Link>
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
