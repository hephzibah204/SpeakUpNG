'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source_id: string;
  source_name?: string;
  published_at: string | null;
  summary?: string;
  sentiment_score?: number;
  topic?: string;
  moderation_status: string;
  is_politics: number;
  matched_profiles: any[];
  image_url?: string;
}

interface NewsSource {
  id: string;
  name: string;
  home_url: string;
  is_active: number;
  credibility_tier: string;
}

type Tab = 'items' | 'sources';

export default function AdminNewsPage() {
  const [tab, setTab] = useState<Tab>('items');

  // News items state
  const [items, setItems] = useState<NewsItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Sources state
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // Source form
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [sourceForm, setSourceForm] = useState({ name: '', home_url: '', feed_url: '', credibility_tier: 'tier2' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchItems(); }, [statusFilter, searchQuery]);
  useEffect(() => { if (tab === 'sources') fetchSources(); }, [tab]);

  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/admin/news/items?${params}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch { /* ignore */ } finally { setItemsLoading(false); }
  };

  const fetchSources = async () => {
    setSourcesLoading(true);
    try {
      const res = await fetch('/api/admin/news/sources');
      const data = await res.json();
      setSources(data.sources || []);
    } catch { /* ignore */ } finally { setSourcesLoading(false); }
  };

  const updateItemStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/news/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moderation_status: status }),
    });
    fetchItems();
  };

  const toggleSource = async (id: string, isActive: number) => {
    await fetch(`/api/admin/news/sources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
    });
    fetchSources();
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/admin/news/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceForm),
      });
      setShowSourceForm(false);
      setSourceForm({ name: '', home_url: '', feed_url: '', credibility_tier: 'tier2' });
      fetchSources();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const sentimentColor = (score?: number) => {
    if (!score) return 'text-[#6b7163]';
    if (score > 0.3) return 'text-[#00b368]';
    if (score < -0.3) return 'text-[#e57368]';
    return 'text-[#e8a020]';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">News Intelligence</h1>
        <p className="text-[#6b7163] text-sm">Moderate ingested news items and manage RSS/API sources.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2c312a]">
        {(['items', 'sources'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
              tab === t ? 'border-[#008751] text-[#00b368]' : 'border-transparent text-[#6b7163] hover:text-white'
            }`}>
            {t === 'items' ? 'News Items' : 'RSS Sources'}
          </button>
        ))}
      </div>

      {tab === 'items' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1">
              {['pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]'
                      : 'border-[#2c312a] text-[#6b7163] hover:text-white'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search titles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#1d211b] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] transition-colors"
            />
          </div>

          {itemsLoading ? (
            <div className="text-center py-12 text-[#6b7163] text-sm">Loading news items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-[#6b7163] text-sm">No items with status "{statusFilter}".</div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <a href={item.url} target="_blank" rel="noreferrer"
                        className="font-bold text-white text-sm hover:text-[#00b368] transition-colors leading-snug block">
                        {item.title}
                      </a>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-[#6b7163]">
                        <span>{item.source_name || item.source_id}</span>
                        {item.published_at && <span>{new Date(item.published_at).toLocaleDateString()}</span>}
                        {item.topic && <span className="bg-[#2c312a] px-1.5 py-0.5 rounded">{item.topic}</span>}
                        {item.sentiment_score !== undefined && (
                          <span className={sentimentColor(item.sentiment_score)}>
                            sentiment: {item.sentiment_score?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                      item.moderation_status === 'approved' ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10' :
                      item.moderation_status === 'rejected' ? 'text-red-400 border-red-900/30 bg-red-950/20' :
                      'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10'
                    }`}>{item.moderation_status}</span>
                  </div>
                  {item.summary && <p className="text-[#6b7163] text-xs leading-relaxed">{item.summary}</p>}
                  <div className="flex gap-2 pt-2 border-t border-[#2c312a]">
                    {item.moderation_status !== 'approved' && (
                      <button onClick={() => updateItemStatus(item.id, 'approved')}
                        className="text-xs font-bold text-[#00b368] hover:underline">Approve</button>
                    )}
                    {item.moderation_status !== 'rejected' && (
                      <button onClick={() => updateItemStatus(item.id, 'rejected')}
                        className="text-xs font-bold text-red-400 hover:underline">Reject</button>
                    )}
                    {item.moderation_status !== 'pending' && (
                      <button onClick={() => updateItemStatus(item.id, 'pending')}
                        className="text-xs font-bold text-[#6b7163] hover:underline">Reset to Pending</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sources' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowSourceForm(true)}
              className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl transition-colors">
              + Add Source
            </button>
          </div>

          {showSourceForm && (
            <form onSubmit={addSource} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-sm">Add RSS/API Source</h3>
              {[
                { id: 'name', label: 'Source Name', placeholder: 'e.g. Punch Nigeria' },
                { id: 'home_url', label: 'Home URL', placeholder: 'https://punchng.com' },
                { id: 'feed_url', label: 'RSS Feed URL', placeholder: 'https://punchng.com/feed/' },
              ].map(f => (
                <div key={f.id}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">{f.label}</label>
                  <input
                    type="url" required
                    value={(sourceForm as any)[f.id]}
                    onChange={e => setSourceForm(p => ({ ...p, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Credibility Tier</label>
                <select value={sourceForm.credibility_tier}
                  onChange={e => setSourceForm(p => ({ ...p, credibility_tier: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368]">
                  <option value="tier1">Tier 1 (High credibility)</option>
                  <option value="tier2">Tier 2 (Standard)</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : 'Save Source'}
                </button>
                <button type="button" onClick={() => setShowSourceForm(false)}
                  className="px-4 py-2 border border-[#2c312a] text-[#6b7163] text-sm font-bold rounded-xl hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {sourcesLoading ? (
            <div className="text-center py-12 text-[#6b7163] text-sm">Loading sources...</div>
          ) : (
            <div className="space-y-3">
              {sources.map(src => (
                <div key={src.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm">{src.name}</div>
                    <a href={src.home_url} target="_blank" rel="noreferrer"
                      className="text-[#6b7163] text-xs hover:text-[#00b368] transition-colors">{src.home_url}</a>
                    <div className="mt-1 flex gap-2">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                        src.credibility_tier === 'tier1' ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10' :
                        src.credibility_tier === 'blocked' ? 'text-red-400 border-red-900/30 bg-red-950/20' :
                        'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10'
                      }`}>{src.credibility_tier}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleSource(src.id, src.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      src.is_active
                        ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30'
                        : 'text-red-400 border-red-900/30 bg-red-950/20 hover:bg-[#008751]/10 hover:text-[#00b368] hover:border-[#008751]/30'
                    }`}>
                    {src.is_active ? 'Active — Disable' : 'Disabled — Enable'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
