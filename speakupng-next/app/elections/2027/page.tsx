'use client';

import { useState, useEffect } from 'react';

interface VoteTotal {
  candidate_name: string;
  party: string;
  vote_count: string | number;
}

interface RegionalBreakdown {
  voter_region: string;
  candidate_name: string;
  vote_count: string | number;
}

interface GovVoteTotal {
  candidate_name: string;
  party: string;
  state: string;
  vote_count: string | number;
}

interface Candidate {
  id?: string;
  candidate_name: string;
  party: string;
  party_code?: string;
  running_mate?: string;
  state?: string;
}

export default function Race2027Page() {
  const [activeTab, setActiveTab] = useState<'presidential' | 'governorship'>('presidential');
  
  // Presidential State
  const [totals, setTotals] = useState<VoteTotal[]>([]);
  const [regional, setRegional] = useState<RegionalBreakdown[]>([]);
  const [votingFor, setVotingFor] = useState<{ name: string; party: string } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('South West');
  const [hasVotedPres, setHasVotedPres] = useState(false);
  const [votedPresName, setVotedPresName] = useState<string | null>(null);
  const [presidentialList, setPresidentialList] = useState<Candidate[]>([]);

  // Governorship State
  const [govTotals, setGovTotals] = useState<GovVoteTotal[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [hasVotedGov, setHasVotedGov] = useState<Record<string, boolean>>({});
  const [votedGovNames, setVotedGovNames] = useState<Record<string, string>>({});
  const [governorshipList, setGovernorshipList] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Viral Share Modal State
  const [shareModal, setShareModal] = useState<{
    name: string;
    party?: string;
    race: string;
    state?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Read saved votes from localStorage on mount
  useEffect(() => {
    try {
      const savedPres = localStorage.getItem('evote_voted_pres_2027');
      if (savedPres) {
        setVotedPresName(savedPres);
        setHasVotedPres(true);
      }
      const savedGov = localStorage.getItem('evote_voted_gov_2027');
      if (savedGov) {
        const parsed = JSON.parse(savedGov);
        setVotedGovNames(parsed);
        const votedMap: Record<string, boolean> = {};
        Object.keys(parsed).forEach((st) => {
          votedMap[st] = true;
        });
        setHasVotedGov(votedMap);
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  // Fetch candidates from the database
  const fetchCandidates = async () => {
    try {
      const presRes = await fetch('/api/election-candidates?year=2027&type=presidential');
      const presData = await presRes.json();
      setPresidentialList(presData.candidates || []);

      const govRes = await fetch('/api/election-candidates?year=2027&type=governorship');
      const govData = await govRes.json();
      setGovernorshipList(govData.candidates || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    }
  };

  const fetchVotes = () => {
    setLoading(true);
    if (activeTab === 'presidential') {
      fetch('/api/elections/2027')
        .then((res) => res.json())
        .then((data) => {
          setTotals(data.totalVotes || []);
          setRegional(data.regionalBreakdowns || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      fetch('/api/elections/2027/governorship')
        .then((res) => res.json())
        .then((data) => {
          setGovTotals(data.totalVotes || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    fetchVotes();
  }, [activeTab]);

  const handleVoteSubmit = async () => {
    if (!votingFor) return;
    setSubmittingVote(true);
    try {
      const res = await fetch('/api/elections/2027', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: votingFor.name,
          party: votingFor.party,
          voter_region: selectedRegion
        }),
      });

      if (res.ok) {
        setHasVotedPres(true);
        setVotedPresName(votingFor.name);
        try {
          localStorage.setItem('evote_voted_pres_2027', votingFor.name);
        } catch {}
        setToast({
          message: `Your mock vote for ${votingFor.name} (${votingFor.party}) has been counted!`,
          type: 'success'
        });
        setShareModal({
          name: votingFor.name,
          party: votingFor.party,
          race: 'Presidential General',
        });
        setTimeout(() => setToast(null), 6000);
        setVotingFor(null);
        fetchVotes();
      } else {
        setToast({ message: 'Failed to record vote. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleGovVoteSubmit = async (cand: { name: string; party: string; state: string }) => {
    setSubmittingVote(true);
    try {
      const res = await fetch('/api/elections/2027/governorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: cand.name,
          party: cand.party,
          state: cand.state
        }),
      });

      if (res.ok) {
        setHasVotedGov((prev) => ({ ...prev, [cand.state]: true }));
        setVotedGovNames((prev) => {
          const next = { ...prev, [cand.state]: cand.name };
          try {
            localStorage.setItem('evote_voted_gov_2027', JSON.stringify(next));
          } catch {}
          return next;
        });
        setToast({
          message: `Your mock vote for ${cand.name} (${cand.party}) in ${cand.state} State has been counted!`,
          type: 'success'
        });
        setShareModal({
          name: cand.name,
          party: cand.party,
          race: `${cand.state} State Governorship`,
          state: cand.state,
        });
        setTimeout(() => setToast(null), 6000);
        fetchVotes();
      } else {
        setToast({ message: 'Failed to record governorship vote. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSubmittingVote(false);
    }
  };

  // UI Helpers
  const getPartyColor = (party: string) => {
    const p = party?.toUpperCase();
    if (p === 'APC') return 'border-[#00b368]';
    if (p === 'PDP') return 'border-[#e57368]';
    if (p === 'LP') return 'border-[#e8a020]';
    if (p === 'NDC') return 'border-[#e8a020]';
    if (p === 'NNPP') return 'border-[#8e44ad]';
    if (p === 'ADC') return 'border-[#f39c12]';
    return 'border-zinc-700';
  };

  const getCandidateDescription = (cand: Candidate, isGov: boolean) => {
    if (isGov) {
      return cand.running_mate
        ? `Contesting under the ${cand.party} with running mate ${cand.running_mate} in ${cand.state} State.`
        : `Contesting under the ${cand.party} in ${cand.state} State.`;
    }
    return cand.running_mate
      ? `Presidential candidate for ${cand.party} running with Vice-Presidential candidate ${cand.running_mate}.`
      : `Presidential candidate representing the ${cand.party} in the 2027 General Elections.`;
  };

  // Derived state calculations
  const statesWithRaces = Array.from(new Set(governorshipList.map((c) => c.state || ''))).filter(Boolean).sort();

  const totalVoteCount = activeTab === 'presidential' 
    ? totals.reduce((acc, t) => acc + Number(t.vote_count), 0)
    : govTotals.reduce((acc, t) => acc + Number(t.vote_count), 0);

  // Filter candidates for selected state
  const activeGovCandidates = governorshipList.filter((c) => c.state === selectedState);
  const stateTotalVotes = govTotals
    .filter((t) => t.state === selectedState)
    .reduce((acc, t) => acc + Number(t.vote_count), 0);

  // Dynamically set first state when state list updates
  useEffect(() => {
    if (statesWithRaces.length > 0 && !statesWithRaces.includes(selectedState)) {
      setSelectedState(statesWithRaces[0]);
    }
  }, [statesWithRaces]);

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left border-b border-[#2c312a] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Live Public Ballots</span>
            <h1 className="text-4xl font-extrabold font-display text-white mb-2 mt-1">2027 Mock Elections</h1>
            <p className="text-base text-[#6b7163] max-w-2xl">
              Cast your vote for presidential tickets and state governorship contenders. See live voting breakdowns across all six geopolitical regions.
            </p>
          </div>
          <div className="bg-[#1d211b] border border-[#2c312a] px-6 py-4 rounded-xl text-center shadow-xl flex-shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">Total Mock Votes</span>
            <span className="text-3xl font-black text-white">{totalVoteCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Global Toast Notification */}
        {toast && (
          <div className={`p-4 rounded-xl text-xs font-bold mb-6 flex items-center justify-between border shadow-lg transition-all ${
            toast.type === 'success' 
              ? 'bg-[#008751]/20 border-[#008751]/40 text-[#00b368]' 
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            <span className="flex items-center gap-2">
              <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
              <span>{toast.message}</span>
            </span>
            <button onClick={() => setToast(null)} className="text-zinc-400 hover:text-white ml-2 text-sm">✕</button>
          </div>
        )}

        {/* Interactive Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-[#008751]/15 via-[#1d211b] to-[#1d211b] border border-[#008751]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#008751]/20 border border-[#008751]/40 flex items-center justify-center text-xl flex-shrink-0">
              🗳️
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Public Mock Voting is Open!</h3>
              <p className="text-xs text-zinc-400">
                Vote once per race. You can switch your vote anytime. Real-time percentages and regional leaders update instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00b368]/15 text-[#00b368] border border-[#00b368]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b368] animate-pulse"></span>
              Live Ballots
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-8 gap-6 text-sm font-bold justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('presidential')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presidential' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            <span>Presidential Race</span>
            {hasVotedPres && (
              <span className="w-2 h-2 rounded-full bg-[#00b368]" title="You have voted in this race"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('governorship')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'governorship' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            <span>Governorship Race</span>
            {hasVotedGov[selectedState] && (
              <span className="w-2 h-2 rounded-full bg-[#00b368]" title="You have voted in selected state"></span>
            )}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : activeTab === 'presidential' ? (
          /* Presidential Race View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#2c312a] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">
                  Presidential Candidates ({presidentialList.length})
                </h3>
                <span className="text-[10px] text-zinc-400 font-semibold">
                  {totalVoteCount} total mock {totalVoteCount === 1 ? 'ballot' : 'ballots'} cast
                </span>
              </div>

              {/* Voted Status Callout + Viral Share Buttons */}
              {hasVotedPres && (
                <div className="p-4 bg-[#008751]/10 border border-[#008751]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#00b368] font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#008751]/20 flex items-center justify-center text-xs">✓</span>
                      <span>You voted for <strong>{votedPresName || 'your candidate'}</strong>.</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Mobilize support by sharing this ballot with friends & groups:</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${votedPresName} in Nigeria's 2027 Presidential General Election on evote.ng!\n\nSee who is currently leading the national polls and cast your ballot here: https://evote.ng/elections/2027`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${votedPresName} in Nigeria's 2027 Presidential General Election on evote.ng!\n\nSee who is leading the national polls and vote your candidate: https://evote.ng/elections/2027 #Nigeria2027 #evoteNG`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Post</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink('https://evote.ng/elections/2027')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-[#2c312a] text-zinc-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>{copied ? '✓ Copied' : '🔗 Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setHasVotedPres(false);
                        setVotedPresName(null);
                        try { localStorage.removeItem('evote_voted_pres_2027'); } catch {}
                      }}
                      className="text-xs text-zinc-500 hover:text-white underline font-semibold transition-colors ml-2"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
              
              {presidentialList.length === 0 ? (
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-6 text-center text-zinc-500">
                  No presidential candidates found in database.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {presidentialList.map((cand) => {
                    const totalMatch = totals.find((t) => t.candidate_name === cand.candidate_name);
                    const count = totalMatch ? Number(totalMatch.vote_count) : 0;
                    const percentage = totalVoteCount > 0 ? ((count / totalVoteCount) * 100).toFixed(1) : '0';
                    const isVoted = cand.candidate_name === votedPresName;

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all ${
                          isVoted
                            ? 'border-[#00b368] ring-1 ring-[#00b368]/30 shadow-[#00b368]/10'
                            : `${getPartyColor(cand.party)} hover:border-zinc-500`
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-base text-white">{cand.candidate_name}</h4>
                                {isVoted && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#00b368] text-black">
                                    Your Vote
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-extrabold uppercase mt-0.5 inline-block">{cand.party}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="px-2.5 py-1 bg-zinc-900 border border-[#2c312a] text-zinc-300 font-black text-xs rounded-lg inline-block">
                                {percentage}%
                              </span>
                              <span className="block text-[9px] text-zinc-500 mt-1 font-bold">
                                {count} {count === 1 ? 'vote' : 'votes'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {getCandidateDescription(cand, false)}
                          </p>

                          {cand.running_mate && (
                            <div className="mt-2 text-[11px] text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 font-medium">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Running Mate:</span>
                              <span className="font-semibold">{cand.running_mate}</span>
                            </div>
                          )}
                        </div>

                        {isVoted ? (
                          <div className="w-full mt-6 bg-[#008751]/20 border border-[#008751]/40 text-[#00b368] text-xs font-extrabold py-3 rounded-lg text-center flex items-center justify-center gap-1.5 uppercase tracking-wider">
                            <span>✓ You Voted For This Candidate</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setVotingFor({ name: cand.candidate_name, party: cand.party })}
                            className="w-full mt-6 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wider shadow-sm active:translate-y-0.5"
                          >
                            {hasVotedPres ? 'Switch Vote to This Candidate' : 'Vote Candidate'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Regional Leaderboard */}
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-[#2c312a] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Regional Leaderboard</h3>
                <span className="text-[10px] text-zinc-500">Leading candidate by geopolitical zone</span>
              </div>
              <div className="space-y-4">
                {['North West', 'North East', 'North Central', 'South West', 'South East', 'South South'].map((reg) => {
                  const regionalVotes = regional.filter((r) => r.voter_region === reg);
                  let leader = '—';
                  let maxVotes = 0;
                  
                  regionalVotes.forEach((rv) => {
                    const vc = Number(rv.vote_count);
                    if (vc > maxVotes) {
                      maxVotes = vc;
                      leader = rv.candidate_name;
                    }
                  });

                  return (
                    <div key={reg} className="p-3 bg-[#141714] border border-[#2c312a] rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-400 block">{reg}</span>
                        <span className="text-[11px] text-white font-semibold">{leader}</span>
                      </div>
                      {maxVotes > 0 ? (
                        <span className="text-[10px] bg-[#008751]/10 text-[#00b368] font-black border border-[#008751]/20 px-2 py-0.5 rounded">
                          {maxVotes} {maxVotes === 1 ? 'vote' : 'votes'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-600">No votes yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Grouped Governorship Race View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar State Selector */}
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[650px] overflow-y-auto">
              <div className="border-b border-[#2c312a] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Select State Race</h3>
                <span className="text-[10px] text-zinc-500">28 on-cycle governorship states</span>
              </div>
              {statesWithRaces.length === 0 ? (
                <div className="text-zinc-500 text-sm">No governorship races found.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {statesWithRaces.map((st) => {
                    const isActive = st === selectedState;
                    const votesMatch = govTotals
                      .filter((t) => t.state === st)
                      .reduce((acc, t) => acc + Number(t.vote_count), 0);
                    const hasVotedState = hasVotedGov[st];

                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedState(st)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all ${
                          isActive
                            ? 'bg-[#008751]/15 border-[#008751]/40 text-white shadow-sm'
                            : 'bg-[#141714] border-[#2c312a] text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{st}</span>
                          {hasVotedState && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00b368]" title="Voted in this state"></span>
                          )}
                        </span>
                        <span className="text-[10px] bg-zinc-900 border border-[#2c312a] px-2 py-0.5 rounded text-zinc-300 font-extrabold">
                          {votesMatch} {votesMatch === 1 ? 'vote' : 'votes'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* State Head-to-Head Comparison */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#2c312a] pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{selectedState} State Contestants</h3>
                  <span className="text-xs text-zinc-500">
                    {stateTotalVotes} total mock {stateTotalVotes === 1 ? 'ballot' : 'ballots'} recorded in {selectedState}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2.5 py-1 rounded-md">
                  Active Ballot
                </span>
              </div>

              {/* State Voted Status Callout + Viral Share Buttons */}
              {hasVotedGov[selectedState] && (
                <div className="p-4 bg-[#008751]/10 border border-[#008751]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#00b368] font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#008751]/20 flex items-center justify-center text-xs">✓</span>
                      <span>You voted for <strong>{votedGovNames[selectedState] || 'a candidate'}</strong> in {selectedState}.</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Share with voters in {selectedState} to boost their standing:</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${votedGovNames[selectedState]} in the 2027 ${selectedState} State Governorship election on evote.ng!\n\nSee who is leading the state race and vote your candidate: https://evote.ng/elections/2027`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${votedGovNames[selectedState]} in the 2027 ${selectedState} State Governorship election on evote.ng!\n\nSee who is leading the state race and vote your candidate: https://evote.ng/elections/2027 #Nigeria2027 #${selectedState.replace(/\s+/g, '')}State`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Post</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink('https://evote.ng/elections/2027')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-[#2c312a] text-zinc-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>{copied ? '✓ Copied' : '🔗 Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setHasVotedGov((prev) => ({ ...prev, [selectedState]: false }));
                        setVotedGovNames((prev) => {
                          const next = { ...prev };
                          delete next[selectedState];
                          try { localStorage.setItem('evote_voted_gov_2027', JSON.stringify(next)); } catch {}
                          return next;
                        });
                      }}
                      className="text-xs text-zinc-500 hover:text-white underline font-semibold transition-colors ml-2"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {activeGovCandidates.length === 0 ? (
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-8 text-center text-zinc-500">
                  Select a state to view contestants.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeGovCandidates.map((cand) => {
                    const totalMatch = govTotals.find((t) => t.candidate_name === cand.candidate_name && t.state === cand.state);
                    const count = totalMatch ? Number(totalMatch.vote_count) : 0;
                    const percentage = stateTotalVotes > 0 ? ((count / stateTotalVotes) * 100).toFixed(1) : '0';
                    const isVoted = cand.candidate_name === votedGovNames[selectedState];

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all ${
                          isVoted
                            ? 'border-[#00b368] ring-1 ring-[#00b368]/30 shadow-[#00b368]/10'
                            : `${getPartyColor(cand.party)} hover:border-zinc-500`
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-base text-white">{cand.candidate_name}</h4>
                                {isVoted && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#00b368] text-black">
                                    Your Vote
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-extrabold uppercase mt-0.5 inline-block">{cand.party}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="px-2.5 py-1 bg-zinc-900 border border-[#2c312a] text-zinc-300 font-black text-xs rounded-lg inline-block">
                                {percentage}%
                              </span>
                              <span className="block text-[9px] text-zinc-500 mt-1 font-bold">
                                {count} {count === 1 ? 'vote' : 'votes'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {getCandidateDescription(cand, true)}
                          </p>

                          {cand.running_mate && (
                            <div className="mt-2 text-[11px] text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 font-medium">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Deputy:</span>
                              <span className="font-semibold">{cand.running_mate}</span>
                            </div>
                          )}
                        </div>

                        {isVoted ? (
                          <div className="w-full mt-6 bg-[#008751]/20 border border-[#008751]/40 text-[#00b368] text-xs font-extrabold py-3 rounded-lg text-center flex items-center justify-center gap-1.5 uppercase tracking-wider">
                            <span>✓ You Voted For This Candidate</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGovVoteSubmit({ name: cand.candidate_name, party: cand.party, state: cand.state! })}
                            disabled={submittingVote}
                            className="w-full mt-6 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wider shadow-sm active:translate-y-0.5"
                          >
                            {hasVotedGov[selectedState] ? 'Switch Vote to This Candidate' : 'Vote Candidate'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Voting Modal */}
        {votingFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#2c312a] pb-3">
                <h3 className="text-base font-black text-white">Cast Mock Ballot</h3>
                <button onClick={() => setVotingFor(null)} className="text-zinc-500 hover:text-white text-sm">✕</button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                You are voting for <strong className="text-white">{votingFor.name}</strong> ({votingFor.party}). Select your geopolitical zone to record this ballot on the regional scoreboard:
              </p>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wide">Your Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-[#141714] border border-[#2c312a] text-white p-3 rounded-lg focus:outline-none focus:border-[#00b368] font-bold text-sm"
                >
                  <option value="South West">South West</option>
                  <option value="South East">South East</option>
                  <option value="South South">South South</option>
                  <option value="North West">North West</option>
                  <option value="North East">North East</option>
                  <option value="North Central">North Central</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setVotingFor(null)}
                  disabled={submittingVote}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  disabled={submittingVote}
                  className="flex-1 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-700 text-white text-xs font-bold py-3 rounded-lg transition-colors shadow-md"
                >
                  {submittingVote ? 'Submitting...' : 'Confirm Vote'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration & Viral Share Modal */}
        {shareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#1d211b] border border-[#008751]/60 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl relative">
              <button
                onClick={() => setShareModal(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>

              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#008751]/20 border border-[#008751]/50 flex items-center justify-center text-3xl shadow-lg">
                  🗳️
                </div>
                <h3 className="text-2xl font-black font-display text-white">Mock Vote Counted!</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You voted for <strong className="text-[#00b368]">{shareModal.name}</strong> {shareModal.party && `(${shareModal.party})`} in the <strong>{shareModal.race}</strong> election.
                </p>
              </div>

              <div className="bg-[#141714] border border-[#2c312a] rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368] block">
                  Mobilize Your Community
                </span>
                <p className="text-xs text-zinc-400">
                  Help your candidate take the lead by sharing this poll with your WhatsApp groups and social networks!
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🗳️ I just cast my mock vote for ${shareModal.name}${shareModal.party ? ` (${shareModal.party})` : ''} in Nigeria's 2027 ${shareModal.race} Election on evote.ng!\n\nSee who is leading the polls and cast your vote here: https://evote.ng/elections/2027`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:translate-y-0.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Share to WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🗳️ I just cast my mock vote for ${shareModal.name}${shareModal.party ? ` (${shareModal.party})` : ''} in Nigeria's 2027 ${shareModal.race} Election on evote.ng!\n\nSee who is leading the polls and cast your vote: https://evote.ng/elections/2027 #Nigeria2027 #evoteNG`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-black border border-zinc-700 hover:border-zinc-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:translate-y-0.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Share on X (Twitter)</span>
                </a>

                <button
                  onClick={() => handleCopyLink('https://evote.ng/elections/2027')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#141714] border border-[#2c312a] hover:border-zinc-500 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  <span>{copied ? '✓ Link Copied to Clipboard!' : '🔗 Copy Share Link'}</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setShareModal(null)}
                  className="text-xs text-zinc-500 hover:text-white underline transition-colors"
                >
                  Continue exploring live rankings
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
