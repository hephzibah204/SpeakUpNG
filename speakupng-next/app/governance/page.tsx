'use client';

import { useState, useEffect } from 'react';

interface Petition {
  id: string;
  title: string;
  summary: string;
  target_official_id?: string;
  signatures_count: number;
  created_at: string;
  target_official_name?: string;
  target_official_role?: string;
}

interface Official {
  id: string;
  full_name: string;
  role: string;
  state?: string;
}

const REQUIRED_SIGNATURES = 5000;

export default function GovernancePage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [targetOfficialId, setTargetOfficialId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPetitions = async () => {
    try {
      const res = await fetch('/api/governance/petitions');
      if (!res.ok) throw new Error('Failed to fetch petitions');
      const data = await res.json();
      setPetitions(data.petitions || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOfficials = async () => {
    try {
      const res = await fetch('/api/officials?limit=100');
      if (!res.ok) throw new Error('Failed to fetch officials');
      const data = await res.json();
      setOfficials(data.officials || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPetitions(), fetchOfficials()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSign = async (petitionId: string) => {
    setSigningId(petitionId);
    try {
      const res = await fetch('/api/governance/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign', petitionId }),
      });
      if (!res.ok) {
        throw new Error('Failed to sign petition');
      }
      await fetchPetitions();
    } catch (error: any) {
      alert(error.message || 'Error signing petition');
    } finally {
      setSigningId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/governance/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          target_official_id: targetOfficialId || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit petition');
      }

      setMessage({ type: 'success', text: 'Petition submitted successfully!' });
      setTitle('');
      setSummary('');
      setTargetOfficialId('');
      await fetchPetitions();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error submitting petition' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-20">
      {/* Hero Header */}
      <div className="border-b border-[#2c312a] bg-[#1a1e19]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00b368]/15 text-[#00b368] border border-[#00b368]/25">
              🏛 Long-term Governance
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Citizen Petitions & Audits
          </h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
            Submit policy proposals, request audits, and sign active petitions to hold public representatives accountable.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Petitions List (Left 2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Active Petitions
            </h2>

            {loading ? (
              <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-2xl">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
                <p className="mt-3 text-[#6b7163] text-sm">Loading petitions...</p>
              </div>
            ) : petitions.length === 0 ? (
              <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-2xl">
                <p className="text-[#6b7163] text-lg font-medium">No petitions found. Be the first to start one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {petitions.map((petition) => {
                  const percent = Math.min(100, (petition.signatures_count / REQUIRED_SIGNATURES) * 100);
                  return (
                    <div
                      key={petition.id}
                      className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 hover:border-[#00b368]/30 transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        {petition.target_official_name && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#2c312a] text-[#f8f7f2]">
                            Target: {petition.target_official_name} ({petition.target_official_role || 'Representative'})
                          </span>
                        )}
                        <span className="text-xs text-[#6b7163]">
                          Started {new Date(petition.created_at).toLocaleDateString('en-NG')}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{petition.title}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed mb-6 whitespace-pre-wrap">
                        {petition.summary}
                      </p>

                      {/* Progress Bar & Signature Actions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#00b368]">
                            {petition.signatures_count.toLocaleString()} signatures
                          </span>
                          <span className="text-[#6b7163]">
                            Goal: {REQUIRED_SIGNATURES.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="w-full bg-[#141714] rounded-full h-2 overflow-hidden border border-[#2c312a]">
                          <div
                            className="bg-[#00b368] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-[#6b7163]">
                            {percent.toFixed(1)}% Completed
                          </span>
                          <button
                            onClick={() => handleSign(petition.id)}
                            disabled={signingId === petition.id}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00b368] text-black hover:bg-[#009b58] disabled:opacity-50 transition-colors"
                          >
                            {signingId === petition.id ? 'Signing...' : 'Sign Petition'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form to submit petition (Right 1 column on desktop) */}
          <div className="space-y-6">
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-white mb-4">Start a Petition</h2>
              
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm font-semibold mb-4 border ${
                    message.type === 'success'
                      ? 'bg-[#00b368]/15 border-[#00b368]/25 text-[#00b368]'
                      : 'bg-red-500/15 border-red-500/25 text-red-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">
                    Petition Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Request Audit on Local Road Projects"
                    className="w-full px-3 py-2 bg-[#141714] border border-[#2c312a] rounded-xl text-[#f8f7f2] placeholder-zinc-600 text-sm focus:outline-none focus:border-[#00b368] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">
                    Target Representative (Optional)
                  </label>
                  <select
                    value={targetOfficialId}
                    onChange={(e) => setTargetOfficialId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141714] border border-[#2c312a] rounded-xl text-[#f8f7f2] text-sm focus:outline-none focus:border-[#00b368] transition-colors"
                  >
                    <option value="" className="bg-[#1d211b] text-[#6b7163]">Select Representative</option>
                    {officials.map((official) => (
                      <option key={official.id} value={official.id} className="bg-[#1d211b] text-white">
                        {official.full_name} ({official.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">
                    Summary / Demands
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Detail the policies, reforms, or audits you are demanding..."
                    className="w-full px-3 py-2 bg-[#141714] border border-[#2c312a] rounded-xl text-[#f8f7f2] placeholder-zinc-600 text-sm focus:outline-none focus:border-[#00b368] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-[#00b368] text-black hover:bg-[#009b58] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Launch Petition'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
