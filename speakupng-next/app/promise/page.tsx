'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AuditEvent {
  event_type: string;
  record_table: string;
  actor_user_id?: string;
  created_at: string;
  payload?: any;
}

interface PromiseDetail {
  id: string;
  promise_title: string;
  promise_detail?: string;
  promise_source?: string;
  promise_date?: string;
  promise_category?: string;
  status: string;
  evidence_url?: string;
}

interface CompletionStats {
  total_votes: number;
  yes_votes: number;
  no_votes: number;
  completion_score: number | null;
}

interface Assessment {
  fulfilled: boolean;
  completion_percent?: number;
  comment?: string;
  created_at: string;
}

interface AiVerification {
  model: string;
  verdict: string;
  confidence: number;
  evidence_canonical_url?: string;
  explanation?: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  fulfilled: 'bg-[#008751]/15 text-[#00b368] border-[#008751]/30',
  in_progress: 'bg-[#e8a020]/15 text-[#e8a020] border-[#e8a020]/30',
  broken: 'bg-[#c0392b]/15 text-[#e57368] border-[#c0392b]/30',
  disputed: 'bg-[#e87720]/15 text-[#e87720] border-[#e87720]/30',
  pending: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

function PromiseContent() {
  const searchParams = useSearchParams();
  const promiseId = searchParams.get('id') || '';

  const [promise, setPromise] = useState<PromiseDetail | null>(null);
  const [official, setOfficial] = useState<any>(null);
  const [politician, setPolitician] = useState<any>(null);
  const [completion, setCompletion] = useState<CompletionStats>({ total_votes: 0, yes_votes: 0, no_votes: 0, completion_score: null });
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [aiVerifications, setAiVerifications] = useState<AiVerification[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [fulfilledVote, setFulfilledVote] = useState<boolean | null>(null);
  const [completionPercent, setCompletionPercent] = useState<number>(100);
  const [commentText, setCommentText] = useState('');
  const [submittingVote, setSubmittingVote] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const loadData = () => {
    if (!promiseId) return;

    fetch(`/api/promise/${encodeURIComponent(promiseId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.promise) {
          setPromise(data.promise);
          setOfficial(data.official);
          setPolitician(data.politician);
          setCompletion(data.completion);
          setAssessments(data.assessments || []);
          setAiVerifications(data.aiVerifications || []);
          setAuditTrail(data.auditTrail || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    const votedList = JSON.parse(localStorage.getItem('nr_promise_votes') || '{}');
    if (votedList[promiseId]) {
      setAlreadyVoted(true);
    }
  }, [promiseId]);

  const handleSubmitAssessment = async () => {
    if (fulfilledVote === null) return;
    setSubmittingVote(true);

    const anonId = localStorage.getItem('nr_anon_id') || 'anon-' + Math.random().toString(36).substring(2, 12);
    if (!localStorage.getItem('nr_anon_id')) {
      localStorage.setItem('nr_anon_id', anonId);
    }

    const payload = {
      promise_id: promiseId,
      device_hash: anonId,
      anon_id: anonId,
      fulfilled: fulfilledVote,
      completion_percent: fulfilledVote ? completionPercent : null,
      comment: commentText.trim() || undefined,
    };

    try {
      const res = await fetch('/api/promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const votedList = JSON.parse(localStorage.getItem('nr_promise_votes') || '{}');
        votedList[promiseId] = true;
        localStorage.setItem('nr_promise_votes', JSON.stringify(votedList));
        setAlreadyVoted(true);
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit vote.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission.');
    } finally {
      setSubmittingVote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141714] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
      </div>
    );
  }

  if (!promise) {
    return (
      <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex items-center justify-center font-sans">
        <div className="text-center max-w-md p-6 bg-[#1d211b] border border-[#2c312a] rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold font-display text-[#e84040] mb-3">Promise Not Found</h1>
          <p className="text-[#6b7163] mb-6">We could not find the selected promise scorecard.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white font-medium rounded-lg transition-all">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  const slugify = (name: string) =>
    name
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

  const statusStyle = STATUS_STYLES[promise.status] || STATUS_STYLES.pending;

  const getProfilePath = () => {
    if (official) return `/official/${slugify(official.full_name)}--${official.id}`;
    if (politician) return `/politician/${slugify(politician.full_name)}--${politician.id}`;
    return '/';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5">

        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#6b7163] font-bold">Mandate Promise</div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              {promise.promise_title}
            </h1>
          </div>
          <Link href={getProfilePath()} className="px-4 py-2 border border-[#2c312a] hover:border-zinc-600 text-[#6b7163] hover:text-white text-xs font-bold rounded-lg whitespace-nowrap transition-colors">
            ← Back to Profile
          </Link>
        </div>

        {/* Promise Meta & Details Card */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="flex gap-2 flex-wrap items-center mb-3">
            {promise.promise_category && (
              <span className="px-2.5 py-0.5 bg-[#232820] border border-[#2c312a] text-[#00b368] rounded text-[10px] font-bold uppercase tracking-wider">
                {promise.promise_category}
              </span>
            )}
            <span className={`px-2.5 py-0.5 border rounded text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
              {promise.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-[#6b7163]">
              {official ? `${official.full_name} (${official.role})` : politician ? `${politician.full_name} (${politician.party})` : ''}
              {promise.promise_date ? ` · Promise date: ${promise.promise_date}` : ''}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">
            {promise.promise_detail || 'No detailed promise record has been added yet.'}
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            {promise.evidence_url && (
              <a href={promise.evidence_url} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 border border-[#2c312a] hover:border-zinc-600 text-[#00b368] text-xs font-bold rounded-lg transition-colors">
                View Evidence →
              </a>
            )}
            <Link href={getProfilePath()} className="px-3 py-1.5 border border-[#2c312a] hover:border-zinc-600 text-[#6b7163] hover:text-white text-xs font-bold rounded-lg transition-colors">
              View Profile →
            </Link>
          </div>
        </div>

        {/* Completion Assessment Card */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#6b7163] font-bold mb-1">Citizen Completion Check</div>
              <div className="text-sm text-zinc-300 leading-relaxed">Answer the question below. One submission per device.</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-[#6b7163] font-bold">Crowd Completion</div>
              <div className="text-2xl font-extrabold font-display text-[#00b368] leading-none">
                {completion.completion_score !== null ? `${Math.round(completion.completion_score)}%` : '—'}
              </div>
              <div className="text-xs text-[#6b7163] mt-1">
                {completion.yes_votes} yes · {completion.no_votes} no · {completion.total_votes} total
              </div>
            </div>
          </div>

          {!alreadyVoted ? (
            <div className="mt-5 space-y-4">
              <div>
                <div className="text-sm font-bold text-zinc-200 mb-2">Was this promise fulfilled?</div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setFulfilledVote(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      fulfilledVote === true ? 'bg-[#008751] border-[#008751] text-white' : 'border-[#2c312a] text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    ✅ Yes
                  </button>
                  <button
                    onClick={() => setFulfilledVote(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      fulfilledVote === false ? 'bg-[#c0392b] border-[#c0392b] text-white' : 'border-[#2c312a] text-[#e57368] hover:border-zinc-600'
                    }`}
                  >
                    ❌ No
                  </button>
                </div>
              </div>

              {fulfilledVote === true && (
                <div>
                  <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="text-sm font-bold text-zinc-200">How complete is it?</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={completionPercent}
                        onChange={e => setCompletionPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                        className="w-20 p-2 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00b368]"
                      />
                      <span className="text-[#6b7163] text-sm">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={completionPercent}
                    onChange={e => setCompletionPercent(parseInt(e.target.value))}
                    className="w-full mt-3 accent-[#00b368]"
                  />
                </div>
              )}

              <textarea
                rows={4}
                placeholder="Optional note (what you know, context, links)…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] resize-vertical focus:outline-none focus:border-[#00b368]"
              />
              <button
                disabled={fulfilledVote === null || submittingVote}
                onClick={handleSubmitAssessment}
                className="w-full py-3 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
              >
                {submittingVote ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          ) : (
            <div className="mt-5 p-4 bg-[#008751]/10 border border-[#008751]/20 rounded-lg text-[#00b368] text-sm text-center">
              ✓ Your device has already submitted an assessment for this promise. Thank you.
            </div>
          )}
        </div>

        {/* Citizen Notes List */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="text-[10px] uppercase tracking-wider text-[#6b7163] font-bold mb-3">Recent Citizen Notes</div>
          <div className="space-y-3">
            {assessments.length === 0 ? (
              <p className="text-sm text-[#6b7163]">No citizen notes submitted yet.</p>
            ) : (
              assessments.map((a, idx) => (
                <div key={idx} className="border border-[#2c312a] bg-white/[0.02] rounded-lg p-4">
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${a.fulfilled ? STATUS_STYLES.fulfilled : STATUS_STYLES.broken}`}>
                      {a.fulfilled ? `yes (${a.completion_percent || 0}%)` : 'no'}
                    </span>
                    <span className="text-xs text-[#6b7163]">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{a.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Validation Card */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="text-[10px] uppercase tracking-wider text-[#6b7163] font-bold mb-3">AI Verification (Advisory)</div>
          <div className="space-y-3">
            {aiVerifications.length === 0 ? (
              <p className="text-sm text-[#6b7163]">No AI verification has been recorded yet.</p>
            ) : (
              aiVerifications.map((r, idx) => (
                <div key={idx} className="border border-[#2c312a] bg-white/[0.02] rounded-lg p-4">
                  <div className="flex justify-between gap-3 flex-wrap items-start mb-1">
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        r.verdict === 'supports' ? STATUS_STYLES.fulfilled : r.verdict === 'contradicts' ? STATUS_STYLES.broken : STATUS_STYLES.disputed
                      }`}>
                        {r.verdict}
                      </span>
                      <span className="text-xs text-[#6b7163]">{r.model}</span>
                      <span className="text-xs text-[#6b7163]">{Math.round(r.confidence * 100)}% confidence</span>
                    </div>
                    <span className="text-xs text-[#6b7163]">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  {r.explanation && <p className="text-sm text-zinc-300 mt-2">{r.explanation}</p>}
                  {r.evidence_canonical_url && (
                    <a href={r.evidence_canonical_url} target="_blank" rel="noopener noreferrer" className="text-[#00b368] text-sm hover:underline inline-block mt-2">
                      Evidence Source →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Trail Card */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="text-[10px] uppercase tracking-wider text-[#6b7163] font-bold mb-3">Audit Trail</div>
          <div>
            {auditTrail.length === 0 ? (
              <p className="text-sm text-[#6b7163]">No audit events recorded yet.</p>
            ) : (
              auditTrail.map((ev, idx) => {
                const actor = ev.actor_user_id ? ev.actor_user_id.slice(0, 8) : 'anon';
                let detail = '';
                if (ev.event_type === 'promise_assessment_insert') {
                  detail = ev.payload?.fulfilled ? `yes (${ev.payload?.completion_percent || 0}%)` : 'no';
                }
                return (
                  <div key={idx} className="py-3 border-t border-white/5 first:border-0">
                    <div className="flex justify-between gap-4 flex-wrap">
                      <div className="text-sm font-bold text-zinc-200">
                        {ev.event_type}
                        {detail && <span className="text-zinc-400 font-semibold"> · {detail}</span>}
                      </div>
                      <div className="text-xs text-[#6b7163]">{new Date(ev.created_at).toLocaleString()} · {actor}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromiseDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141714] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
      </div>
    }>
      <PromiseContent />
    </Suspense>
  );
}
