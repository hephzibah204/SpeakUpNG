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
  expert_notes?: string;
  credible_votes: number;
  not_credible_votes: number;
  created_at: string;
}

const LABEL_STYLES: Record<string, string> = {
  true: 'bg-[#008751]/15 text-[#00b368] border-[#008751]/30',
  mostly_true: 'bg-[#7bc96f]/15 text-[#7bc96f] border-[#7bc96f]/30',
  misleading: 'bg-[#e8a020]/15 text-[#e8a020] border-[#e8a020]/30',
  false: 'bg-[#c0392b]/15 text-[#e57368] border-[#c0392b]/30',
  unverified: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  community_review: 'Community Review',
  expert_review: 'Expert Review',
  resolved: 'Resolved',
};

export default function FactCheckPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ claim: '', context: '', evidence_url: '' });
  const [voted, setVoted] = useState<Record<string, string>>({});

  useEffect(() => { fetchClaims(); }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fact-checks');
      const data = await res.json();
      setClaims(data.claims || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const getDeviceHash = () => {
    let id = localStorage.getItem('nr_anon_id');
    if (!id) {
      id = 'anon-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nr_anon_id', id);
    }
    return id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.claim.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/fact-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, device_hash: getDeviceHash() }),
      });
      if (res.ok) {
        setForm({ claim: '', context: '', evidence_url: '' });
        setShowForm(false);
        fetchClaims();
      }
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const handleVote = async (claimId: string, stance: 'credible' | 'not_credible') => {
    const device_hash = getDeviceHash();
    setVoted(v => ({ ...v, [claimId]: stance }));
    try {
      await fetch(`/api/fact-checks/${claimId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_hash, stance }),
      });
      fetchClaims();
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-start gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white mb-3">Political Fact Checker</h1>
            <p className="text-[#6b7163] text-lg max-w-2xl">
              Submit a political claim for verification. Claims move through community review and expert review before receiving a final label.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {showForm ? 'Cancel' : '+ Submit a Claim'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 mb-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Claim</label>
              <textarea
                required
                rows={3}
                value={form.claim}
                onChange={e => setForm({ ...form, claim: e.target.value })}
                placeholder="e.g. 'Senator X sponsored 15 bills this session.'"
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Context (optional)</label>
              <textarea
                rows={2}
                value={form.context}
                onChange={e => setForm({ ...form, context: e.target.value })}
                placeholder="Where did you see/hear this claim?"
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Evidence URL (optional)</label>
              <input
                type="text"
                value={form.evidence_url}
                onChange={e => setForm({ ...form, evidence_url: e.target.value })}
                placeholder="https://..."
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl text-[#6b7163]">
            No claims submitted yet. Be the first to submit one for verification.
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map(c => (
              <div key={c.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-6">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-3">
                  <p className="text-white font-semibold leading-relaxed flex-1">{c.claim}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    {c.label ? (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${LABEL_STYLES[c.label] || LABEL_STYLES.unverified}`}>
                        {c.label.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    )}
                  </div>
                </div>

                {(c.official_name || c.politician_name) && (
                  <p className="text-xs text-[#6b7163] mb-2">Subject: <span className="text-zinc-300">{c.official_name || c.politician_name}</span></p>
                )}

                {c.ai_assessment && (
                  <div className="bg-[#141714] border border-[#2c312a] rounded-lg p-3 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#e8a020] mb-1">AI Preliminary Assessment (advisory, not a verdict)</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{c.ai_assessment}</p>
                  </div>
                )}

                {c.expert_notes && (
                  <div className="bg-[#008751]/5 border border-[#008751]/20 rounded-lg p-3 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#00b368] mb-1">Expert Note</p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{c.expert_notes}</p>
                  </div>
                )}

                {c.evidence_url && (
                  <a href={c.evidence_url} target="_blank" rel="noreferrer" className="text-xs text-[#00b368] hover:underline">Evidence link →</a>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2c312a]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(c.id, 'credible')}
                      disabled={!!voted[c.id]}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors disabled:opacity-50 ${
                        voted[c.id] === 'credible' ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      👍 Credible ({c.credible_votes || 0})
                    </button>
                    <button
                      onClick={() => handleVote(c.id, 'not_credible')}
                      disabled={!!voted[c.id]}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors disabled:opacity-50 ${
                        voted[c.id] === 'not_credible' ? 'bg-[#c0392b]/15 border-[#c0392b]/30 text-[#e57368]' : 'border-[#2c312a] text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      👎 Not Credible ({c.not_credible_votes || 0})
                    </button>
                  </div>
                  <span className="text-[10px] text-[#6b7163]">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
