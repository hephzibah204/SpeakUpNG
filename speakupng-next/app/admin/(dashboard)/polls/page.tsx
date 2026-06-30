'use client';

import { useState, useEffect } from 'react';
import { randomUUID } from 'crypto';

interface PollOption { text: string; votes: number; }
interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  status: string;
  closes_at: string | null;
  created_at: string;
}

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState('');
  const [optionTexts, setOptionTexts] = useState(['', '']);
  const [closesAt, setClosesAt] = useState('');

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/polls');
      const data = await res.json();
      setPolls(data.polls || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const addOption = () => setOptionTexts(p => [...p, '']);
  const removeOption = (i: number) => setOptionTexts(p => p.filter((_, idx) => idx !== i));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = optionTexts.filter(t => t.trim());
    if (validOptions.length < 2) return;
    setSubmitting(true);
    try {
      await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions.map(text => ({ text, votes: 0 })),
          closes_at: closesAt || null,
        }),
      });
      setShowForm(false);
      setQuestion('');
      setOptionTexts(['', '']);
      setClosesAt('');
      fetchPolls();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const closePoll = async (id: string) => {
    await fetch(`/api/admin/polls/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    fetchPolls();
  };

  const deletePoll = async (id: string) => {
    if (!confirm('Delete this poll and all its votes?')) return;
    await fetch(`/api/admin/polls/${id}`, { method: 'DELETE' });
    fetchPolls();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Polls Management</h1>
          <p className="text-[#6b7163] text-sm">Create, manage, and close civic polls.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl transition-colors">
          + New Poll
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-white text-sm">Create Poll</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Question</label>
            <textarea required value={question} onChange={e => setQuestion(e.target.value)} rows={2}
              placeholder="e.g. How would you rate the current economic policies?"
              className="w-full px-4 py-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Options (min 2)</label>
            <div className="space-y-2">
              {optionTexts.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={opt} onChange={e => setOptionTexts(p => p.map((o, idx) => idx === i ? e.target.value : o))}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]" />
                  {optionTexts.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption}
              className="mt-2 text-xs text-[#00b368] hover:underline font-semibold">+ Add option</button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Closes At (optional)</label>
            <input type="datetime-local" value={closesAt} onChange={e => setClosesAt(e.target.value)}
              className="px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
              {submitting ? 'Creating...' : 'Create Poll'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#2c312a] text-[#6b7163] text-sm font-bold rounded-xl hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">No polls yet. Create one above.</div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => (
            <div key={poll.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-white text-sm leading-snug">{poll.question}</h3>
                <span className={`flex-shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                  poll.status === 'active' ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10' :
                  'text-[#6b7163] border-[#2c312a]'
                }`}>{poll.status}</span>
              </div>

              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const pct = poll.total_votes > 0 ? Math.round((opt.votes / poll.total_votes) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#f8f7f2]">
                        <span>{opt.text}</span>
                        <span className="text-[#6b7163]">{opt.votes} votes ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-[#2c312a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#008751] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2c312a] text-xs text-[#6b7163]">
                <span>{poll.total_votes} total votes</span>
                <div className="flex gap-3">
                  {poll.status === 'active' && (
                    <button onClick={() => closePoll(poll.id)} className="text-[#e8a020] hover:underline font-semibold">Close</button>
                  )}
                  <button onClick={() => deletePoll(poll.id)} className="text-red-400 hover:underline font-semibold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
