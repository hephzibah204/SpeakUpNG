'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RatingModal } from '@/components/RatingModal';
import { POLITICIAN_CATEGORY_PROFILE } from '@/lib/categories';
import { RadarChart } from '@/components/RadarChart';
import { AiAssistant } from '@/components/AiAssistant';
import { computeDnaScore, dnaScoreBand } from '@/lib/dna-score';

export default function PoliticianProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [politician, setPolitician] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [promises, setPromises] = useState<any[]>([]);
  const [mandateStats, setMandateStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bio');
  const [error, setError] = useState('');

  const getScoreColor = (val: number) => {
    if (val >= 4.0) return 'text-[#00b368]';
    if (val >= 3.0) return 'text-[#e8a020]';
    if (val >= 2.0) return 'text-[#e87720]';
    return 'text-[#e57368]';
  };

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/politicians/${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(pData => {
        if (pData.error || !pData.politician) {
          setError(pData.error || 'Politician not found');
          setLoading(false);
        } else {
          const polRecord = pData.politician;
          setPolitician(polRecord);
          
          // Fetch promises/mandates, news, and ratings matches for this politician
          Promise.all([
            fetch(`/api/politicians/promises?politician_id=${encodeURIComponent(polRecord.id)}`).then(r => r.json()),
            fetch(`/api/news?politician_id=${encodeURIComponent(polRecord.id)}`).then(r => r.json()),
            fetch(`/api/ratings?politician_id=${encodeURIComponent(polRecord.id)}`).then(r => r.json()),
          ])
            .then(([promData, newsData, ratingsData]) => {
              setPromises(promData.promises || []);
              setMandateStats(promData.stats || null);
              setNews(newsData.news || []);
              setRatings(ratingsData.ratings || ratingsData.results || ratingsData || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        }
      }).catch(err => {
      console.error(err);
      setError('Failed to fetch politician profile');
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141714] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
      </div>
    );
  }

  if (error || !politician) {
    return (
      <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex items-center justify-center font-sans">
        <div className="text-center max-w-md p-6 bg-[#1d211b] border border-[#2c312a] rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold font-display text-[#e84040] mb-3">Profile Not Found</h1>
          <p className="text-[#6b7163] mb-6">{error || "The politician you're looking for doesn't exist."}</p>
          <a href="/politicians" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white font-medium rounded-lg transition-all">
            ← Back to Politicians
          </a>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'text-[#00b368] bg-[#008751]/10 border-[#008751]/30';
      case 'broken': return 'text-[#e57368] bg-[#c0392b]/10 border-[#c0392b]/30';
      case 'in_progress': return 'text-[#e8a020] bg-[#e8a020]/10 border-[#e8a020]/30';
      case 'disputed': return 'text-[#e87720] bg-[#e87720]/10 border-[#e87720]/30';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-20">
      
      {/* Premium Hero Banner Background */}
      <div className="h-48 w-full bg-gradient-to-r from-[#008751]/30 via-[#1d211b] to-[#141714] border-b border-[#2c312a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,160,32,0.08),transparent)]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <a href="/politicians" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#00b368] transition-colors text-sm font-semibold">
            &larr; Back to Browse Politicians
          </a>
        </div>

        {/* Profile Card */}
        <div className="bg-[#1d211b]/95 backdrop-blur-md border border-[#2c312a] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-10 mb-8 transition-all hover:border-[#3a4138]">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar / Left Side */}
            <div className="lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative w-56 h-56 rounded-2xl overflow-hidden border-2 border-[#2c312a] shadow-inner mb-6 bg-[#141714] group">
                <img
                  src={politician.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                  alt={politician.full_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                  }}
                />
              </div>

              {/* Sidebar Info */}
              <div className="w-full space-y-5 pt-5 border-t border-[#2c312a]">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">Political Party</h3>
                  <span className="inline-flex px-3 py-1 bg-zinc-905 border border-[#2c312a] text-[#e8a020] rounded-full text-xs font-extrabold uppercase tracking-wide">
                    {politician.party}
                  </span>
                </div>
                {politician.aspiration_title && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163] mb-1">Aspiration</h3>
                    <p className="text-[#f8f7f2] font-semibold text-sm">{politician.aspiration_title}</p>
                  </div>
                )}
                {politician.previous_offices && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163] mb-1">Previous Offices</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">{politician.previous_offices}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content / Right Side */}
            <div className="lg:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-[#e8a020]/15 border border-[#e8a020]/30 text-[#e8a020] rounded text-[10px] font-bold uppercase tracking-wider">
                    Political Profile
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white mb-2 leading-tight">
                  {politician.full_name}
                </h1>
                {politician.common_name && (
                  <p className="text-sm text-zinc-450 font-medium mb-6">
                    Popularly known as: <strong className="text-zinc-300 font-semibold">{politician.common_name}</strong>
                  </p>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-[#2c312a] mb-6 gap-6 font-display font-bold text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none">
                  <button
                    onClick={() => setActiveTab('bio')}
                    className={`pb-3 border-b-2 transition-all ${activeTab === 'bio' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'}`}
                  >
                    Biography
                  </button>
                  <button
                    onClick={() => setActiveTab('mandate')}
                    className={`pb-3 border-b-2 transition-all ${activeTab === 'mandate' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'}`}
                  >
                    Manifesto & Promises ({promises.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`pb-3 border-b-2 transition-all ${activeTab === 'news' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'}`}
                  >
                    In The News ({news.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-3 border-b-2 transition-all ${activeTab === 'reviews' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'}`}
                  >
                    Citizen Reviews ({ratings.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`pb-3 border-b-2 transition-all ${activeTab === 'ai' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'}`}
                  >
                    AI Assistant (Beta)
                  </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'ai' && (
                  <div className="animate-fadeIn">
                    <AiAssistant politicianId={politician.id} subjectName={politician.full_name} />
                  </div>
                )}
                {activeTab === 'bio' && (
                  <div className="space-y-6 animate-fadeIn">
                    {politician.bio && (
                      <div className="bg-[#232820]/40 border border-[#2c312a] rounded-xl p-5">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7163] mb-2 font-display">Biography</h2>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">{politician.bio}</p>
                      </div>
                    )}
                    {politician.profile_bio && (
                      <div className="bg-[#232820]/40 border border-[#2c312a] rounded-xl p-5">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7163] mb-2 font-display">Mandate & Profile</h2>
                        <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">{politician.profile_bio}</p>
                      </div>
                    )}
                    {politician.social_links && Object.keys(politician.social_links).length > 0 && (
                      <div className="pt-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163] mb-3">Social Profiles</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {Object.entries(politician.social_links).map(([platform, url]) => (
                            <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                              className="px-4 py-2 bg-zinc-900 hover:bg-[#141714] border border-[#2c312a] hover:border-[#00b368]/40 rounded-lg text-xs font-bold transition-all text-zinc-300">
                              {platform.toUpperCase()} &rarr;
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mandate' && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Mandate Summary Cards */}
                    {mandateStats && mandateStats.total > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#232820]/40 border border-[#2c312a] p-4 rounded-xl">
                        <div className="text-center p-2 bg-[#1d211b]/50 rounded-lg border border-[#2c312a]">
                          <div className="text-2xl font-bold font-display text-white">{mandateStats.total}</div>
                          <div className="text-[10px] uppercase font-bold text-[#6b7163]">Total</div>
                        </div>
                        <div className="text-center p-2 bg-[#1d211b]/50 rounded-lg border border-[#2c312a]">
                          <div className="text-2xl font-bold font-display text-[#00b368]">{mandateStats.fulfilled}</div>
                          <div className="text-[10px] uppercase font-bold text-[#6b7163]">Fulfilled</div>
                        </div>
                        <div className="text-center p-2 bg-[#1d211b]/50 rounded-lg border border-[#2c312a]">
                          <div className="text-2xl font-bold font-display text-[#e8a020]">{mandateStats.in_progress}</div>
                          <div className="text-[10px] uppercase font-bold text-[#6b7163]">In Progress</div>
                        </div>
                        <div className="text-center p-2 bg-[#1d211b]/50 rounded-lg border border-[#2c312a]">
                          <div className="text-2xl font-bold font-display text-[#e57368]">{mandateStats.broken}</div>
                          <div className="text-[10px] uppercase font-bold text-[#6b7163]">Broken</div>
                        </div>
                        <div className="text-center p-2 col-span-2 sm:col-span-1 bg-[#1d211b]/50 rounded-lg border border-[#2c312a]">
                          <div className="text-2xl font-bold font-display text-[#e8a020]">{mandateStats.mandate_score}%</div>
                          <div className="text-[10px] uppercase font-bold text-[#6b7163]">Score</div>
                        </div>
                      </div>
                    )}

                    {promises.length === 0 ? (
                      <div className="text-center py-12 bg-[#232820]/20 border border-[#2c312a] rounded-xl text-[#6b7163] font-medium text-sm">
                        No campaign promises listed yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {promises.map(p => (
                          <a key={p.id} href={`/promise?id=${p.id}`} className="block p-5 bg-[#232820]/40 border border-[#2c312a] rounded-xl hover:border-[#00b368] hover:bg-[#1d211b] transition-all cursor-pointer">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                              <h3 className="font-bold text-white leading-snug text-sm sm:text-base">{p.promise_title}</h3>
                              <span className={`inline-block px-2.5 py-0.5 border rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap self-start ${getStatusColor(p.status)}`}>
                                {p.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {p.promise_detail && (
                              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">{p.promise_detail}</p>
                            )}
                            <div className="flex items-center justify-between text-xs text-[#6b7163] font-semibold pt-3 border-t border-[#2c312a]/40">
                              <span>Sector: <strong className="text-zinc-400 capitalize">{p.promise_category}</strong></span>
                              {p.progress_percent !== undefined && (
                                <div className="flex items-center gap-3">
                                  <span>Progress</span>
                                  <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden border border-[#2c312a]">
                                    <div className="bg-[#00b368] h-full" style={{ width: `${p.progress_percent}%` }}></div>
                                  </div>
                                  <span className="text-zinc-400">{p.progress_percent}%</span>
                                </div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'news' && (
                  <div className="space-y-4 animate-fadeIn">
                    {news.length === 0 ? (
                      <div className="text-center py-12 bg-[#232820]/20 border border-[#2c312a] rounded-xl text-[#6b7163] font-medium text-sm">
                        No recent news updates found matching this profile.
                      </div>
                    ) : (
                      news.map(item => (
                        <div key={item.id} className="p-5 bg-[#232820]/40 border border-[#2c312a] rounded-xl hover:border-zinc-750 transition-colors flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center gap-4 mb-2.5 text-[10px] text-[#6b7163] font-bold uppercase tracking-wider">
                              <span>{item.site_name || 'News Source'}</span>
                              <span>{new Date(item.published_at || item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2 leading-snug">
                              {item.title}
                            </h3>
                            {item.summary && (
                              <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed mb-4 line-clamp-3">
                                {item.summary}
                              </p>
                            )}
                          </div>
                          <div className="flex justify-end pt-3 border-t border-[#2c312a]/40 mt-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-[#00b368] hover:underline flex items-center gap-1"
                            >
                              Read Full Article &rarr;
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4 animate-fadeIn">
                    {ratings.length === 0 ? (
                      <div className="text-center py-12 bg-[#232820]/20 border border-[#2c312a] rounded-xl text-[#6b7163] font-medium text-sm">
                        No citizen reviews have been submitted for this leader yet.
                      </div>
                    ) : (
                      ratings.slice(0, 15).map((r: any, i: number) => (
                        <div key={r.id || i} className="p-5 bg-[#232820]/40 border border-[#2c312a] rounded-xl space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, sIdx) => (
                                  <span key={sIdx} className={`text-xs ${sIdx < Math.round(r.overall || 0) ? 'text-[#e8a020]' : 'text-zinc-800'}`}>★</span>
                                ))}
                              </div>
                              <span className="font-extrabold text-xs text-[#e8a020] bg-zinc-900/80 border border-[#2c312a] px-2 py-0.5 rounded">
                                {Number(r.overall || 0).toFixed(1)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-zinc-300 block">
                                {r.reviewer_name || 'Anonymous'}
                              </span>
                              {r.reviewer_state && (
                                <span className="text-[10px] text-[#6b7163] font-bold uppercase tracking-wider">
                                  Verified Citizen in {r.reviewer_state}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Individual Category Star Breakdown inside Review Card */}
                          {(() => {
                            const ratedCategories = POLITICIAN_CATEGORY_PROFILE.visible.filter(key => r[key] !== null && r[key] !== undefined);
                            if (ratedCategories.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-2 border-t border-[#2c312a]/30">
                                {ratedCategories.map(key => (
                                  <div key={key} className="flex items-center gap-1 text-[10px] text-zinc-400">
                                    <span className="font-semibold">{(POLITICIAN_CATEGORY_PROFILE.labels as any)[key] || key}:</span>
                                    <span className="text-[#e8a020] font-extrabold">{r[key]}★</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {r.review_text && (
                            <p className="text-[#f8f7f2]/90 text-sm leading-relaxed bg-[#141714]/60 p-4 rounded-xl border border-[#2c312a]/60">
                              {r.review_text}
                            </p>
                          )}
                          <p className="text-[9px] text-[#6b7163] uppercase tracking-wider font-extrabold">
                            Submitted on {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Rating Summary & Breakdown Scorecard */}
              <div className="mt-10 bg-[#232820]/40 border border-[#2c312a] rounded-2xl p-6 flex flex-col lg:flex-row gap-8">
                
                {/* Left Side: Overall Score & Submit Button */}
                <div className="lg:w-1/4 flex flex-col items-center justify-center text-center p-4 lg:border-r border-[#2c312a] last:border-0">
                  <div className="bg-[#141714] border border-[#2c312a] rounded-2xl w-28 h-28 flex flex-col items-center justify-center shadow-lg mb-4">
                    <span className="text-4xl font-extrabold font-display text-[#e8a020]">
                      {politician.rating_avg ? Number(politician.rating_avg).toFixed(1) : '—'}
                    </span>
                    <span className="text-[10px] text-[#6b7163] font-bold uppercase tracking-wider mt-1.5">Average Rating</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const val = Math.round(politician.rating_avg || 0);
                      return (
                        <span key={idx} className={`text-xl ${idx < val ? 'text-[#e8a020]' : 'text-zinc-805'}`}>★</span>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-[#6b7163] mb-6">
                    Based on <strong className="text-[#f8f7f2] font-semibold">{politician.rating_count || 0}</strong> citizen reviews
                  </div>

                  <button 
                    onClick={() => setShowRatingModal(true)}
                    className="w-full px-5 py-3.5 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-xl transition-all text-sm shadow-lg hover:shadow-[#00b368]/10"
                  >
                    Rate Performance
                  </button>
                </div>

                {/* Middle Side: Radar Chart + DNA Score */}
                <div className="lg:w-2/5 flex flex-col items-center justify-center gap-3 p-4 border-t lg:border-t-0 lg:border-r border-[#2c312a]">
                  <RadarChart
                    data={POLITICIAN_CATEGORY_PROFILE.visible.map((key) => ({
                      label: (POLITICIAN_CATEGORY_PROFILE.labels as any)[key] || key,
                      value: parseFloat(politician[`${key}_avg`]) || 0,
                    }))}
                    size={240}
                  />
                  {(() => {
                    const dnaScore = computeDnaScore(politician, POLITICIAN_CATEGORY_PROFILE.visible);
                    const band = dnaScoreBand(dnaScore);
                    return (
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163]">Political DNA Score</span>
                        <div className="text-2xl font-extrabold font-display" style={{ color: band.color }}>
                          {dnaScore}<span className="text-sm text-[#6b7163]">/100</span>
                          <span className="ml-2 text-xs font-bold uppercase" style={{ color: band.color }}>{band.label}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Side: Category Breakdown Bars */}
                <div className="lg:w-1/3 flex flex-col justify-center space-y-3.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7163] mb-1 font-display">Scorecard Breakdown</h3>
                  {(() => {
                    return POLITICIAN_CATEGORY_PROFILE.visible.map((key) => {
                      const val = parseFloat(politician[`${key}_avg`]) || 0;
                      const label = (POLITICIAN_CATEGORY_PROFILE.labels as any)[key] || key;
                      const pct = Math.round((val / 5) * 100);
                      return (
                        <div key={key} className="flex items-center justify-between gap-4 text-xs font-semibold">
                          <span className="w-1/3 text-zinc-300 truncate">{label}</span>
                          <div className="w-1/2 bg-zinc-805 h-2 rounded-full overflow-hidden border border-[#2c312a] bg-[#141714]">
                            <div className="bg-[#00b368] h-full rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className={`w-10 text-right font-bold ${val > 0 ? getScoreColor(val) : 'text-zinc-650'}`}>
                            {val > 0 ? val.toFixed(1) : '—'}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          targetId={politician.id}
          targetType="politician"
          targetName={politician.full_name}
          categoriesConfig={POLITICIAN_CATEGORY_PROFILE}
          onClose={() => setShowRatingModal(false)}
          onSubmit={() => {
            setShowRatingModal(false);
            setTimeout(() => window.location.reload(), 500);
          }}
        />
      )}
    </div>
  );
}
