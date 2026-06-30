'use client';

import { useState, useEffect } from 'react';

interface Claim {
  id: string;
  claim: string;
  context?: string;
  official_name?: string;
  politician_name?: string;
  evidence_url?: string;
  status: string;
  label?: string;
  ai_assessment?: string;
  expert_note?: string;
  credible_votes: number;
  not_credible_votes: number;
  created_at: string;
}

const LABELS = ['true', 'mostly_true', 'misleading', 'false', 'unverified'];

export default function AdminFactChecksPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClaims(); }, [statusFilter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/fact-checks?${params}`);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openReview = (c: Claim) => {
    setEditingId(c.id);
    setLabelDraft(c.label || 'unverified');
    setNoteDraft(c.expert_note || '');
  };

  const submitReview = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`/api/fact-checks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', label: labelDraft, expert_note: noteDraft, reviewed_by: 'admin' }),
      });
      setEditingId(null);
      fetchClaims();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this claim?')) return;
    await fetch(`/api/fact-checks/${id}`, { method: 'DELETE' });
    fetchClaims();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">Fact Check Queue</h1>
        <p className="text-[#6b7163] text-sm">Review submitted claims, read the AI preliminary assessment, and assign a final label.</p>
      </div>

      <div className="flex gap-1">
        {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'community_review', label: 'Community Review' }, { key: 'resolved', label: 'Resolved' }].map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              statusFilter === f.key ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163] hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading…</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] bg-[#1d211b] border border-[#2c312a] rounded-xl">No claims found.</div>
      ) : (
        <div className="space-y-4">
          {claims.map(c => (
            <div key={c.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5">
              <div className="flex justify-between items-start gap-4 mb-2">
                <p className="text-white font-semibold text-sm flex-1">{c.claim}</p>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 whitespace-nowrap">{c.status.replace(/_/g, ' ')}</span>
              </div>
              {c.context && <p className="text-xs text-[#6b7163] mb-2">{c.context}</p>}
              {(c.official_name || c.politician_name) && <p className="text-xs text-[#6b7163] mb-2">Subject: {c.official_name || c.politician_name}</p>}
              {c.ai_assessment && (
                <div className="bg-[#141714] border border-[#2c312a] rounded-lg p-3 mb-3 text-xs text-zinc-400">
                  <span className="text-[#e8a020] font-bold uppercase text-[10px]">AI: </span>{c.ai_assessment}
                </div>
              )}
              <div className="text-xs text-[#6b7163] mb-3">👍 {c.credible_votes || 0} credible · 👎 {c.not_credible_votes || 0} not credible</div>

              {editingId === c.id ? (
                <div className="space-y-3 border-t border-[#2c312a] pt-3">
                  <div className="flex gap-2 flex-wrap">
                    {LABELS.map(l => (
                      <button key={l} onClick={() => setLabelDraft(l)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border ${labelDraft === l ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-zinc-400'}`}>
                        {l.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} rows={2} placeholder="Expert note explaining the verdict…"
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]" />
                  <div className="flex gap-2">
                    <button onClick={() => submitReview(c.id)} disabled={saving} className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white text-xs font-bold rounded-lg">
                      {saving ? 'Saving…' : 'Save Verdict'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-[#2c312a] pt-3">
                  <button onClick={() => openReview(c)} className="px-3 py-1.5 bg-[#008751]/10 border border-[#008751]/30 text-[#00b368] text-xs font-bold rounded-lg">Review &amp; Label</button>
                  <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 text-red-400 text-xs font-bold hover:underline">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
