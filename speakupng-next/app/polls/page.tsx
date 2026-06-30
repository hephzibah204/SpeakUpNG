'use client';

import { useState, useEffect } from 'react';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  status: string;
  closes_at: string | null;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [anonId, setAnonId] = useState<string>('');

  useEffect(() => {
    // Generate or load anon ID
    let id = localStorage.getItem('nr_anon_id');
    if (!id) {
      id = 'anon-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nr_anon_id', id);
    }
    setAnonId(id);

    // Load saved votes
    try {
      const saved = JSON.parse(localStorage.getItem('nr_poll_votes') || '{}');
      setMyVotes(saved);
    } catch {
      // ignore
    }

    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        setPolls(data.polls || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (myVotes[pollId] !== undefined) return; // already voted

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: pollId, anon_id: anonId, option_index: optionIndex })
      });

      if (res.ok) {
        const newVotes = { ...myVotes, [pollId]: optionIndex };
        setMyVotes(newVotes);
        localStorage.setItem('nr_poll_votes', JSON.stringify(newVotes));

        // Optimistically update poll data
        setPolls(current => current.map(p => {
          if (p.id === pollId) {
            const newOptions = [...p.options];
            newOptions[optionIndex].votes += 1;
            return { ...p, options: newOptions, total_votes: p.total_votes + 1 };
          }
          return p;
        }));
      } else {
        alert('Failed to submit vote or already voted.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting vote.');
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Citizen Polls</h1>
          <p className="text-lg text-[#6b7163]">
            Anonymous votes on key governance questions. Your voice, no login required.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
            <p className="mt-4 text-[#6b7163] text-sm">Loading polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-[#6b7163] text-lg font-medium">No active polls at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {polls.map(poll => {
              const votedOptionIndex = myVotes[poll.id];
              const hasVoted = votedOptionIndex !== undefined;
              
              const daysLeft = poll.closes_at 
                ? Math.ceil((new Date(poll.closes_at).getTime() - Date.now()) / 86400000)
                : null;

              return (
                <div key={poll.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-6 shadow-2xl">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <h2 className="text-xl font-bold font-display text-white leading-snug">{poll.question}</h2>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-800 border border-[#2c312a] px-3 py-1 rounded-full whitespace-nowrap">
                        {daysLeft}d left
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((opt, i) => {
                      const percentage = poll.total_votes > 0 
                        ? Math.round((opt.votes / poll.total_votes) * 100) 
                        : 0;
                      const isMyVote = votedOptionIndex === i;

                      return (
                        <div 
                          key={i}
                          onClick={() => handleVote(poll.id, i)}
                          className={`relative overflow-hidden rounded-lg border p-4 transition-all
                            ${hasVoted ? 'cursor-default border-[#2c312a]' : 'cursor-pointer border-[#2c312a] hover:border-[#00b368] hover:bg-[#232820]/40'}
                            ${isMyVote ? 'border-[#00b368] ring-1 ring-[#00b368]' : ''}
                          `}
                        >
                          {hasVoted && (
                            <div 
                              className="absolute inset-y-0 left-0 bg-[#008751]/15 transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                          <div className="relative z-10 flex justify-between items-center text-sm font-semibold">
                            <span className={isMyVote ? 'text-[#00b368]' : 'text-zinc-200'}>
                              {isMyVote ? '✓ ' : ''}{opt.text}
                            </span>
                            {hasVoted && (
                              <span className="text-[#f8f7f2]">
                                {percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#6b7163] pt-4 border-t border-[#2c312a]">
                    <span>{poll.total_votes.toLocaleString()} vote{poll.total_votes !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1 text-[#00b368]">
                      🔒 Secure & Anonymous
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
