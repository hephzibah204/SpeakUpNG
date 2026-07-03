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
  const [presidentialList, setPresidentialList] = useState<Candidate[]>([]);

  // Governorship State
  const [govTotals, setGovTotals] = useState<GovVoteTotal[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [hasVotedGov, setHasVotedGov] = useState<Record<string, boolean>>({});
  const [governorshipList, setGovernorshipList] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(true);

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
        setVotingFor(null);
        alert('Mock presidential vote cast successfully! Thank you for participating.');
        fetchVotes();
      } else {
        alert('Failed to cast vote.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGovVoteSubmit = async (cand: { name: string; party: string; state: string }) => {
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
        setHasVotedGov(prev => ({ ...prev, [cand.state]: true }));
        alert(`Mock vote for ${cand.name} in ${cand.state} State cast successfully!`);
        fetchVotes();
      } else {
        alert('Failed to cast vote.');
      }
    } catch (err) {
      console.error(err);
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
    return 'border-zinc-500';
  };

  const getCandidateDescription = (cand: Candidate, isGov: boolean) => {
    if (isGov) {
      return `Contesting under the ${cand.party} in ${cand.state} State.`;
    }
    return `Presidential candidate representing the ${cand.party} in the 2027 General Elections.`;
  };

  // Derived state calculations
  const statesWithRaces = Array.from(new Set(governorshipList.map(c => c.state || ''))).filter(Boolean).sort();

  const totalVoteCount = activeTab === 'presidential' 
    ? totals.reduce((acc, t) => acc + Number(t.vote_count), 0)
    : govTotals.reduce((acc, t) => acc + Number(t.vote_count), 0);

  // Filter candidates for selected state
  const activeGovCandidates = governorshipList.filter(c => c.state === selectedState);
  const stateTotalVotes = govTotals
    .filter(t => t.state === selectedState)
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
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Preview Elections</span>
            <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">2027 General Elections</h1>
            <p className="text-lg text-[#6b7163]">
              Cast a mock vote for your preferred candidate to preview regional voting trends. (Not an official ballot).
            </p>
          </div>
          <div className="bg-[#1d211b] border border-[#2c312a] px-6 py-4 rounded-xl text-center shadow-xl">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-550 block">Total Mock Votes</span>
            <span className="text-3xl font-black text-white">{totalVoteCount}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-8 gap-6 text-sm font-bold justify-center sm:justify-start">
          <button
            onClick={() => setActiveTab('presidential')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'presidential' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Presidential Race
          </button>
          <button
            onClick={() => setActiveTab('governorship')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'governorship' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Governorship Race
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Select and Cast Your Vote</h3>
              
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

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition-all ${getPartyColor(cand.party)}`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-base text-white">{cand.candidate_name}</h4>
                              <span className="text-[10px] text-zinc-500 font-extrabold uppercase mt-0.5 inline-block">{cand.party}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-zinc-900 border border-[#2c312a] text-zinc-300 font-black text-xs rounded-lg">
                              {percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {getCandidateDescription(cand, false)}
                          </p>
                        </div>

                        <button
                          onClick={() => setVotingFor({ name: cand.candidate_name, party: cand.party })}
                          disabled={hasVotedPres}
                          className="w-full mt-6 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 disabled:text-zinc-550 text-white text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wider"
                        >
                          {hasVotedPres ? 'Vote Cast' : 'Vote Candidate'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Regional Leaderboard</h3>
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
                        <span className="font-bold text-zinc-550 block">{reg}</span>
                        <span className="text-[10px] text-white font-medium">{leader}</span>
                      </div>
                      {maxVotes > 0 && (
                        <span className="text-[10px] bg-[#008751]/10 text-[#00b368] font-black border border-[#008751]/20 px-2 py-0.5 rounded">
                          {maxVotes} votes
                        </span>
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
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Select State Race</h3>
              {statesWithRaces.length === 0 ? (
                <div className="text-zinc-500 text-sm">No governorship races found.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {statesWithRaces.map((st) => {
                    const isActive = st === selectedState;
                    const votesMatch = govTotals
                      .filter(t => t.state === st)
                      .reduce((acc, t) => acc + Number(t.vote_count), 0);

                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedState(st)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                          isActive 
                            ? 'bg-[#008751]/10 border-[#00b368] text-white' 
                            : 'bg-[#141714] border-[#2c312a] text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-bold text-xs">{st} State</span>
                        <span className="text-[10px] bg-zinc-900 border border-[#2c312a] px-2 py-0.5 rounded text-zinc-300 font-extrabold">
                          {votesMatch} votes
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
                <h3 className="text-xl font-extrabold text-white">{selectedState} State Contestants</h3>
                <span className="text-[10px] uppercase font-bold text-[#00b368]">Live Matchup</span>
              </div>

              {activeGovCandidates.length === 0 ? (
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-6 text-center text-zinc-500">
                  Select a state to view contestants.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeGovCandidates.map((cand) => {
                    const totalMatch = govTotals.find((t) => t.candidate_name === cand.candidate_name && t.state === cand.state);
                    const count = totalMatch ? Number(totalMatch.vote_count) : 0;
                    const percentage = stateTotalVotes > 0 ? ((count / stateTotalVotes) * 100).toFixed(1) : '0';

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition-all ${getPartyColor(cand.party)}`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-base text-white">{cand.candidate_name}</h4>
                              <span className="text-[10px] text-zinc-550 font-extrabold uppercase mt-0.5 inline-block">{cand.party}</span>
                            </div>
                            <div className="text-right">
                              <span className="px-2.5 py-1 bg-zinc-900 border border-[#2c312a] text-zinc-300 font-black text-xs rounded-lg inline-block">
                                {percentage}%
                              </span>
                              <span className="block text-[9px] text-zinc-500 mt-1 font-bold">{count} votes</span>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {getCandidateDescription(cand, true)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleGovVoteSubmit({ name: cand.candidate_name, party: cand.party, state: cand.state! })}
                          disabled={hasVotedGov[selectedState]}
                          className="w-full mt-6 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 disabled:text-zinc-550 text-white text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wider"
                        >
                          {hasVotedGov[selectedState] ? 'Vote Cast' : 'Vote Candidate'}
                        </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <h3 className="text-lg font-black text-white">Cast Mock Ballot</h3>
              <p className="text-xs text-zinc-400">
                To submit your vote for <strong className="text-white">{votingFor.name}</strong>, select your primary geopolitical region:
              </p>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide">Select Region</label>
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
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoteSubmit}
                  className="flex-1 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold py-3 rounded-lg transition-colors"
                >
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
