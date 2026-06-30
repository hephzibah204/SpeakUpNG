'use client';

import { useState, useEffect } from 'react';

interface FactCheck {
  id: string;
  claim: string;
  evidence_url?: string;
  status: 'pending' | 'true' | 'mostly_true' | 'misleading' | 'false' | 'unverified';
  expert_notes?: string;
  community_upvotes: number;
  community_downvotes: number;
  created_at: string;
}

export default function FactCheckPage() {
  const [claims, setClaims] = useState<FactCheck[]>([]);
  const [newClaim, setNewClaim] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchClaims = () => {
    fetch('/api/fact-check')
      .then((res) => res.json())
      .then((data) => {
        setClaims(data.factChecks || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: newClaim, evidence_url: evidenceUrl }),
      });

      if (res.ok) {
        setNewClaim('');
        setEvidenceUrl('');
        alert('Claim submitted for verification successfully!');
        fetchClaims();
      } else {
        alert('Failed to submit claim.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'true': return 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10';
      case 'mostly_true': return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      case 'misleading': return 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10';
      case 'false': return 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10';
      default: return 'text-zinc-400 border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Political Fact Checker</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Fact Check Directory</h1>
          <p className="text-lg text-[#6b7163]">
            Submit claims made by political figures and view verified findings, supporting evidence, and analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submit Claim Panel */}
          <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Submit a Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-450 mb-2">Claim Text</label>
                <textarea
                  placeholder="Paste the political quote, claim, or statement here..."
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white text-xs p-3 rounded-lg focus:outline-none focus:border-[#00b368] h-28"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-450 mb-2">Source Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/news-source"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white text-xs p-3 rounded-lg focus:outline-none focus:border-[#00b368]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white text-xs font-bold py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </form>
          </div>

          {/* Fact Checks Directory */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-6">Recent Verifications</h3>
              
              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-500">No claims submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((c) => (
                    <div key={c.id} className="p-5 bg-[#141714] border border-[#2c312a] rounded-xl space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-extrabold text-sm text-white leading-snug">{c.claim}</h4>
                        <span className={`px-2 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-wide whitespace-nowrap ${getStatusColor(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      {c.expert_notes && (
                        <div className="p-3 bg-[#1d211b] border-l-2 border-[#00b368] rounded-r-lg text-xs leading-relaxed text-zinc-350">
                          <strong className="text-white block mb-1">Fact-Check Verdict:</strong>
                          {c.expert_notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-zinc-550 border-t border-[#2c312a]/30 pt-3">
                        <div className="flex gap-4">
                          {c.evidence_url && (
                            <a href={c.evidence_url} target="_blank" rel="noopener noreferrer" className="text-[#00b368] hover:underline">
                              Source Evidence 🔗
                            </a>
                          )}
                          <span>Submitted: {new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="hover:text-white transition-colors">👍 {c.community_upvotes}</button>
                          <button className="hover:text-white transition-colors">👎 {c.community_downvotes}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
