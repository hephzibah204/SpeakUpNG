'use client';

import { useState, useEffect } from 'react';
import PartyFlag, { getPartyColorHex } from '@/components/PartyFlag';
import { getCandidatePhoto, getFallbackAvatar } from '@/lib/candidate-portraits';
import { getDeviceFingerprint } from '@/lib/device-fingerprint';

type RaceTier = 'presidential' | 'governorship' | 'senate' | 'reps' | 'assembly' | 'lga';

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

interface RaceVoteTotal {
  candidate_name: string;
  party: string;
  state: string;
  district?: string;
  vote_count: string | number;
}

interface Candidate {
  id?: string;
  candidate_name: string;
  party: string;
  party_code?: string;
  running_mate?: string;
  state?: string;
  district?: string;
  photo_url?: string;
}

export default function Race2027Page() {
  const [activeTab, setActiveTab] = useState<RaceTier>('presidential');
  
  // Presidential State
  const [totals, setTotals] = useState<VoteTotal[]>([]);
  const [regional, setRegional] = useState<RegionalBreakdown[]>([]);
  const [votingFor, setVotingFor] = useState<{ name: string; party: string; partyCode?: string; photoUrl?: string } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('South West');
  const [hasVotedPres, setHasVotedPres] = useState(false);
  const [votedPresName, setVotedPresName] = useState<string | null>(null);
  const [presidentialList, setPresidentialList] = useState<Candidate[]>([]);

  // Other Races State (Governorship, Senate, Reps, Assembly, LGA)
  const [candidatesByTier, setCandidatesByTier] = useState<Record<string, Candidate[]>>({
    governorship: [],
    senate: [],
    reps: [],
    assembly: [],
    lga: [],
  });

  const [votesByTier, setVotesByTier] = useState<Record<string, RaceVoteTotal[]>>({
    governorship: [],
    senate: [],
    reps: [],
    assembly: [],
    lga: [],
  });

  const [selectedFilterByTier, setSelectedFilterByTier] = useState<Record<string, string>>({
    governorship: 'Lagos',
    senate: 'Lagos West',
    reps: 'Eti-Osa Federal Constituency',
    assembly: 'Agege I Constituency',
    lga: 'Ikeja Local Government',
  });

  const [userVotesByTier, setUserVotesByTier] = useState<Record<string, Record<string, string>>>({
    governorship: {},
    senate: {},
    reps: {},
    assembly: {},
    lga: {},
  });

  const [deviceHash, setDeviceHash] = useState<string>('');
  const [deviceLoaded, setDeviceLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Viral Share Modal State
  const [shareModal, setShareModal] = useState<{
    name: string;
    party?: string;
    partyCode?: string;
    photoUrl?: string;
    race: string;
    district?: string;
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

  // Read saved votes from localStorage & sync cryptographically with device fingerprint
  useEffect(() => {
    try {
      const savedPres = localStorage.getItem('evote_voted_pres_2027');
      if (savedPres) {
        setVotedPresName(savedPres);
        setHasVotedPres(true);
      }

      const tiers: RaceTier[] = ['governorship', 'senate', 'reps', 'assembly', 'lga'];
      const loaded: Record<string, Record<string, string>> = {};
      tiers.forEach((t) => {
        const item = localStorage.getItem(`evote_voted_${t}_2027`);
        if (item) {
          try {
            loaded[t] = JSON.parse(item);
          } catch {
            loaded[t] = {};
          }
        } else {
          loaded[t] = {};
        }
      });
      setUserVotesByTier((prev) => ({ ...prev, ...loaded }));
    } catch {
      // ignore storage access errors
    }

    // Cryptographic device fingerprinting: 1 Device = 1 Certified Ballot
    getDeviceFingerprint().then(async (hash) => {
      setDeviceHash(hash);
      setDeviceLoaded(true);

      try {
        const res = await fetch(`/api/elections/2027/my-votes?device_hash=${encodeURIComponent(hash)}`);
        if (res.ok) {
          const data = await res.json();
          const serverVotes = data.votes || {};

          if (serverVotes.presidential?.candidate_name) {
            setVotedPresName(serverVotes.presidential.candidate_name);
            setHasVotedPres(true);
            try {
              localStorage.setItem('evote_voted_pres_2027', serverVotes.presidential.candidate_name);
            } catch {}
          }

          const newTiers: Record<string, Record<string, string>> = {};
          const tiers: RaceTier[] = ['governorship', 'senate', 'reps', 'assembly', 'lga'];
          for (const t of tiers) {
            const map = serverVotes[t] || {};
            newTiers[t] = {};
            for (const [key, val] of Object.entries(map as Record<string, { candidate_name: string }>)) {
              if (val?.candidate_name) {
                newTiers[t][key] = val.candidate_name;
              }
            }
            if (Object.keys(newTiers[t]).length > 0) {
              try {
                localStorage.setItem(`evote_voted_${t}_2027`, JSON.stringify(newTiers[t]));
              } catch {}
            }
          }

          setUserVotesByTier((prev) => {
            const merged: Record<string, Record<string, string>> = { ...prev };
            for (const t of tiers) {
              merged[t] = { ...merged[t], ...newTiers[t] };
            }
            return merged;
          });
        }
      } catch (err) {
        console.error('Failed to sync device votes from server:', err);
      }
    });
  }, []);

  // Fetch candidates for current active race
  const fetchCandidates = async (tier: RaceTier) => {
    try {
      const res = await fetch(`/api/election-candidates?year=2027&type=${tier}`);
      const data = await res.json();
      const list = data.candidates || [];
      if (tier === 'presidential') {
        setPresidentialList(list);
      } else {
        setCandidatesByTier((prev) => ({ ...prev, [tier]: list }));
        // Auto-select first available district/state if current selection is empty
        const keys = tier === 'governorship'
          ? Array.from(new Set(list.map((c: Candidate) => c.state || ''))).filter(Boolean).sort()
          : Array.from(new Set(list.map((c: Candidate) => c.district || c.state || ''))).filter(Boolean).sort();
        if (keys.length > 0 && !keys.includes(selectedFilterByTier[tier])) {
          setSelectedFilterByTier((prev) => ({ ...prev, [tier]: keys[0] }));
        }
      }
    } catch (err) {
      console.error(`Failed to load ${tier} candidates:`, err);
    }
  };

  // Fetch votes for active tab
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
      fetch(`/api/elections/2027/race?type=${activeTab}`)
        .then((res) => res.json())
        .then((data) => {
          setVotesByTier((prev) => ({ ...prev, [activeTab]: data.totalVotes || [] }));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchCandidates(activeTab);
    fetchVotes();
  }, [activeTab]);

  // Handle Presidential Vote Submit
  const handleVoteSubmit = async () => {
    if (!votingFor) return;
    setSubmittingVote(true);
    try {
      const activeHash = deviceHash || await getDeviceFingerprint();
      const res = await fetch('/api/elections/2027', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_name: votingFor.name,
          party: votingFor.party,
          voter_region: selectedRegion,
          device_hash: activeHash,
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
          partyCode: votingFor.partyCode,
          photoUrl: votingFor.photoUrl,
          race: 'Presidential General Election',
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

  // Handle Non-Presidential Vote Submit (Governorship, Senate, Reps, Assembly, LGA)
  const handleRaceVoteSubmit = async (cand: {
    tier: RaceTier;
    name: string;
    party: string;
    state: string;
    district?: string;
    partyCode?: string;
    photoUrl?: string;
  }) => {
    setSubmittingVote(true);
    try {
      const activeHash = deviceHash || await getDeviceFingerprint();
      const res = await fetch('/api/elections/2027/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: cand.tier,
          candidate_name: cand.name,
          party: cand.party,
          state: cand.state,
          district: cand.district || cand.state,
          device_hash: activeHash,
        }),
      });

      if (res.ok) {
        const filterKey = cand.tier === 'governorship' ? cand.state : (cand.district || cand.state);
        setUserVotesByTier((prev) => {
          const nextTier = { ...prev[cand.tier], [filterKey]: cand.name };
          try {
            localStorage.setItem(`evote_voted_${cand.tier}_2027`, JSON.stringify(nextTier));
          } catch {}
          return { ...prev, [cand.tier]: nextTier };
        });

        const raceLabels: Record<string, string> = {
          governorship: `${cand.state} State Governorship`,
          senate: `${cand.district || cand.state} Senatorial District`,
          reps: `${cand.district || cand.state}`,
          assembly: `${cand.district || cand.state} House of Assembly`,
          lga: `${cand.district || cand.state} Council Chairmanship`,
        };

        setToast({
          message: `Your mock vote for ${cand.name} (${cand.party}) in ${raceLabels[cand.tier]} has been recorded!`,
          type: 'success'
        });

        setShareModal({
          name: cand.name,
          party: cand.party,
          partyCode: cand.partyCode,
          photoUrl: cand.photoUrl,
          race: raceLabels[cand.tier],
          district: cand.district,
          state: cand.state,
        });

        setTimeout(() => setToast(null), 6000);
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

  const getCandidateDescription = (cand: Candidate, tier: RaceTier) => {
    if (tier === 'presidential') {
      return cand.running_mate
        ? `Presidential flagbearer for ${cand.party} running with Vice-Presidential candidate ${cand.running_mate}.`
        : `Presidential flagbearer representing ${cand.party} in Nigeria's 2027 General Elections.`;
    }
    if (tier === 'governorship') {
      return cand.running_mate
        ? `Contesting for Governor of ${cand.state} State with deputy running mate ${cand.running_mate}.`
        : `Contesting for Governor of ${cand.state} State under the ${cand.party}.`;
    }
    if (tier === 'senate') {
      return `Contesting for the Senate of the Federal Republic of Nigeria representing ${cand.district || cand.state}.`;
    }
    if (tier === 'reps') {
      return `Contesting for the House of Representatives representing ${cand.district || cand.state}.`;
    }
    if (tier === 'assembly') {
      return `Contesting for the State House of Assembly representing ${cand.district || cand.state}.`;
    }
    return `Contesting for Local Government Area Chairmanship in ${cand.district || cand.state}.`;
  };

  // Calculations for current active tier
  const currentList = activeTab === 'presidential' ? presidentialList : (candidatesByTier[activeTab] || []);
  const currentVotes = activeTab === 'presidential' ? totals : (votesByTier[activeTab] || []);

  const availableFilters = activeTab === 'governorship'
    ? Array.from(new Set(currentList.map((c) => c.state || ''))).filter(Boolean).sort()
    : Array.from(new Set(currentList.map((c) => c.district || c.state || ''))).filter(Boolean).sort();

  const activeFilter = selectedFilterByTier[activeTab] || availableFilters[0] || '';

  const activeContestants = activeTab === 'presidential'
    ? presidentialList
    : currentList.filter((c) => (activeTab === 'governorship' ? c.state === activeFilter : (c.district || c.state) === activeFilter));

  const totalTierVotes = currentVotes.reduce((acc, t) => acc + Number(t.vote_count), 0);

  const activeDistrictVotes = activeTab === 'presidential'
    ? totalTierVotes
    : (votesByTier[activeTab] || [])
        .filter((t) => (activeTab === 'governorship' ? t.state === activeFilter : (t.district || t.state) === activeFilter))
        .reduce((acc, t) => acc + Number(t.vote_count), 0);

  const userVotedCandidate = activeTab === 'presidential'
    ? votedPresName
    : userVotesByTier[activeTab]?.[activeFilter];

  const raceTitles: Record<RaceTier, { label: string; subtitle: string; filterLabel: string }> = {
    presidential: {
      label: 'Presidential race',
      subtitle: 'Cast your mock vote for certified presidential tickets and running mates across Nigeria.',
      filterLabel: 'Geopolitical zone',
    },
    governorship: {
      label: 'Governorship race',
      subtitle: 'State governor mock ballots across all on-cycle states.',
      filterLabel: 'Select state race',
    },
    senate: {
      label: 'Senate (109 districts)',
      subtitle: 'Senatorial mock ballots across the 109 Senatorial Districts of Nigeria.',
      filterLabel: 'Select senatorial district',
    },
    reps: {
      label: 'House of Representatives',
      subtitle: 'Federal Constituency mock ballots for the 360 House of Representatives seats.',
      filterLabel: 'Select federal constituency',
    },
    assembly: {
      label: 'State House of Assembly',
      subtitle: 'State legislative assembly constituencies across Nigeria.',
      filterLabel: 'Select state constituency',
    },
    lga: {
      label: 'LGA Chairmanship',
      subtitle: 'Local government area chairmen and council leadership mock ballots.',
      filterLabel: 'Select local government area',
    },
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left border-b border-[#2c312a] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Live Public Ballots</span>
            <h1 className="text-4xl font-extrabold font-display text-white mb-2 mt-1">2027 Mock Elections</h1>
            <p className="text-base text-[#6b7163] max-w-2xl">
              Cast your ballot for all election tiers: Presidential tickets, State Governors, Senators, House of Reps members, State Assembly, and LGA Chairmen.
            </p>
          </div>
          <div className="bg-[#1d211b] border border-[#2c312a] px-6 py-4 rounded-xl text-center shadow-xl flex-shrink-0">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block">{raceTitles[activeTab].label} Votes</span>
            <span className="text-3xl font-black text-white">{totalTierVotes.toLocaleString()}</span>
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
              {raceTitles[activeTab].icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{raceTitles[activeTab].label} Mock Ballots</h3>
              <p className="text-xs text-zinc-400">
                {raceTitles[activeTab].subtitle} Vote once per constituency and switch anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end flex-shrink-0">
            <div 
              title={deviceHash ? `SHA-256 Hardware Fingerprint: ${deviceHash}` : 'Authenticating device hardware...'}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shadow-sm cursor-help"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>🔒 1 Device = 1 Ballot</span>
              {deviceHash ? (
                <span className="text-[9px] font-mono text-emerald-400/90 bg-emerald-900/50 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {deviceHash.slice(0, 6)}...{deviceHash.slice(-4)}
                </span>
              ) : (
                <span className="text-[9px] text-zinc-400">verifying...</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00b368]/15 text-[#00b368] border border-[#00b368]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b368] animate-pulse"></span>
              Live Ballots
            </span>
          </div>
        </div>

        {/* Tab Navigation across all 6 race tiers */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-8 gap-2 sm:gap-4 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar">
          {(['presidential', 'governorship', 'senate', 'reps', 'assembly', 'lga'] as RaceTier[]).map((tier) => {
            const isActive = activeTab === tier;
            const hasVotedAny = tier === 'presidential'
              ? hasVotedPres
              : Object.keys(userVotesByTier[tier] || {}).length > 0;

            return (
              <button
                key={tier}
                onClick={() => setActiveTab(tier)}
                className={`pb-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 px-2 ${
                  isActive ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
                }`}
              >
                <span>{raceTitles[tier].icon}</span>
                <span>{raceTitles[tier].label}</span>
                {hasVotedAny && (
                  <span className="w-2 h-2 rounded-full bg-[#00b368]" title="You have cast ballots in this category"></span>
                )}
              </button>
            );
          })}
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
                  {totalTierVotes} total mock {totalTierVotes === 1 ? 'ballot' : 'ballots'} cast
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
                      <span>Post on X</span>
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
                    const percentage = totalTierVotes > 0 ? ((count / totalTierVotes) * 100).toFixed(1) : '0';
                    const isVoted = cand.candidate_name === votedPresName;
                    const photoSrc = getCandidatePhoto(cand.candidate_name, cand.photo_url, cand.party, cand.party_code);
                    const partyColor = getPartyColorHex(cand.party, cand.party_code);

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all group ${
                          isVoted
                            ? 'border-[#00b368] ring-1 ring-[#00b368]/30 shadow-[#00b368]/10'
                            : 'border-[#2c312a] hover:border-zinc-600'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex gap-3.5 items-start">
                            {/* Candidate Photo */}
                            <div
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-zinc-900 shadow-md transition-transform group-hover:scale-105"
                              style={{ borderColor: partyColor }}
                            >
                              <img
                                src={photoSrc}
                                alt={cand.candidate_name}
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackAvatar(cand.candidate_name, cand.party, cand.party_code);
                                }}
                              />
                            </div>

                            {/* Candidate Details & Party Flag */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <PartyFlag party={cand.party} partyCode={cand.party_code} size="sm" />
                                {isVoted && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#00b368] text-black">
                                    Your Vote
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#00b368] transition-colors leading-tight">
                                {cand.candidate_name}
                              </h4>
                              <span className="text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                                {cand.party}
                              </span>
                            </div>

                            {/* Percentage / Vote Count */}
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
                            {getCandidateDescription(cand, 'presidential')}
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
                            onClick={() => setVotingFor({ name: cand.candidate_name, party: cand.party, partyCode: cand.party_code, photoUrl: photoSrc })}
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

                  const leaderCand = presidentialList.find((c) => c.candidate_name === leader);

                  return (
                    <div key={reg} className="p-3 bg-[#141714] border border-[#2c312a] rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {maxVotes > 0 && leaderCand && (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2c312a] flex-shrink-0 bg-zinc-900">
                            <img
                              src={getCandidatePhoto(leaderCand.candidate_name, leaderCand.photo_url, leaderCand.party, leaderCand.party_code)}
                              alt={leaderCand.candidate_name}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackAvatar(leaderCand.candidate_name, leaderCand.party, leaderCand.party_code);
                              }}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-zinc-400 block text-[10px] uppercase">{reg}</span>
                          <span className="text-[11px] text-white font-semibold flex items-center gap-1.5 truncate">
                            <span className="truncate">{leader}</span>
                            {leaderCand && <PartyFlag party={leaderCand.party} partyCode={leaderCand.party_code} size="sm" showCode={false} />}
                          </span>
                        </div>
                      </div>
                      {maxVotes > 0 ? (
                        <span className="text-[10px] bg-[#008751]/10 text-[#00b368] font-black border border-[#008751]/20 px-2 py-0.5 rounded flex-shrink-0 ml-2">
                          {maxVotes} {maxVotes === 1 ? 'vote' : 'votes'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">No votes yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* District & Constituency Race View (Governorship, Senate, Reps, Assembly, LGA) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar District / State Selector */}
            <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[650px] overflow-y-auto">
              <div className="border-b border-[#2c312a] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">{raceTitles[activeTab].filterLabel}</h3>
                <span className="text-[10px] text-zinc-500">{availableFilters.length} constituencies available</span>
              </div>
              {availableFilters.length === 0 ? (
                <div className="text-zinc-500 text-sm">No contestants found for this tier yet.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableFilters.map((filterKey) => {
                    const isActive = filterKey === activeFilter;
                    const votesMatch = (votesByTier[activeTab] || [])
                      .filter((t) => (activeTab === 'governorship' ? t.state === filterKey : (t.district || t.state) === filterKey))
                      .reduce((acc, t) => acc + Number(t.vote_count), 0);
                    const hasVotedThisDistrict = !!userVotesByTier[activeTab]?.[filterKey];

                    return (
                      <button
                        key={filterKey}
                        onClick={() => setSelectedFilterByTier((prev) => ({ ...prev, [activeTab]: filterKey }))}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all ${
                          isActive
                            ? 'bg-[#008751]/15 border-[#008751]/40 text-white shadow-sm'
                            : 'bg-[#141714] border-[#2c312a] text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="truncate">{filterKey}</span>
                          {hasVotedThisDistrict && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00b368] flex-shrink-0" title="Voted in this race"></span>
                          )}
                        </span>
                        <span className="text-[10px] bg-zinc-900 border border-[#2c312a] px-2 py-0.5 rounded text-zinc-300 font-extrabold flex-shrink-0 ml-2">
                          {votesMatch} {votesMatch === 1 ? 'vote' : 'votes'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Contestants Grid */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#2c312a] pb-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{activeFilter || 'Select Constituency'} Contestants</h3>
                  <span className="text-xs text-zinc-500">
                    {activeDistrictVotes} total mock {activeDistrictVotes === 1 ? 'ballot' : 'ballots'} recorded in {activeFilter}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2.5 py-1 rounded-md">
                  Active Ballot
                </span>
              </div>

              {/* Voted Status Callout */}
              {userVotedCandidate && (
                <div className="p-4 bg-[#008751]/10 border border-[#008751]/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#00b368] font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#008751]/20 flex items-center justify-center text-xs">✓</span>
                      <span>You voted for <strong>{userVotedCandidate}</strong> in {activeFilter}.</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Share with voters in {activeFilter} to boost your candidate:</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${userVotedCandidate} in the 2027 ${activeFilter} ${raceTitles[activeTab].label} election on evote.ng!\n\nSee who is leading and vote your candidate: https://evote.ng/elections/2027`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `🗳️ I just cast my mock vote for ${userVotedCandidate} in the 2027 ${activeFilter} ${raceTitles[activeTab].label} election on evote.ng!\n\nSee who is leading: https://evote.ng/elections/2027 #Nigeria2027`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-zinc-700 hover:border-zinc-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                    >
                      <span>Post on X</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink('https://evote.ng/elections/2027')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-[#2c312a] text-zinc-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      <span>{copied ? '✓ Copied' : '🔗 Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserVotesByTier((prev) => {
                          const nextTier = { ...prev[activeTab] };
                          delete nextTier[activeFilter];
                          try {
                            localStorage.setItem(`evote_voted_${activeTab}_2027`, JSON.stringify(nextTier));
                          } catch {}
                          return { ...prev, [activeTab]: nextTier };
                        });
                      }}
                      className="text-xs text-zinc-500 hover:text-white underline font-semibold transition-colors ml-2"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {activeContestants.length === 0 ? (
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-8 text-center text-zinc-500">
                  Select a constituency from the sidebar to view contestants.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeContestants.map((cand) => {
                    const totalMatch = (votesByTier[activeTab] || []).find((t) => 
                      t.candidate_name === cand.candidate_name && 
                      (activeTab === 'governorship' ? t.state === cand.state : (t.district || t.state) === (cand.district || cand.state))
                    );
                    const count = totalMatch ? Number(totalMatch.vote_count) : 0;
                    const percentage = activeDistrictVotes > 0 ? ((count / activeDistrictVotes) * 100).toFixed(1) : '0';
                    const isVoted = cand.candidate_name === userVotedCandidate;
                    const photoSrc = getCandidatePhoto(cand.candidate_name, cand.photo_url, cand.party, cand.party_code);
                    const partyColor = getPartyColorHex(cand.party, cand.party_code);

                    return (
                      <div
                        key={cand.id || cand.candidate_name}
                        className={`bg-[#1d211b] border rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition-all group ${
                          isVoted
                            ? 'border-[#00b368] ring-1 ring-[#00b368]/30 shadow-[#00b368]/10'
                            : 'border-[#2c312a] hover:border-zinc-600'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex gap-3.5 items-start">
                            {/* Candidate Photo */}
                            <div
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-zinc-900 shadow-md transition-transform group-hover:scale-105"
                              style={{ borderColor: partyColor }}
                            >
                              <img
                                src={photoSrc}
                                alt={cand.candidate_name}
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackAvatar(cand.candidate_name, cand.party, cand.party_code);
                                }}
                              />
                            </div>

                            {/* Candidate Details & Party Flag */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <PartyFlag party={cand.party} partyCode={cand.party_code} size="sm" />
                                {cand.district && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-900 border border-[#2c312a] text-zinc-300 truncate max-w-[140px]">
                                    {cand.district}
                                  </span>
                                )}
                                {isVoted && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#00b368] text-black">
                                    Your Vote
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#00b368] transition-colors leading-tight">
                                {cand.candidate_name}
                              </h4>
                              <span className="text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                                {cand.party}
                              </span>
                            </div>

                            {/* Percentage / Vote Count */}
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
                            {getCandidateDescription(cand, activeTab)}
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
                            onClick={() => handleRaceVoteSubmit({
                              tier: activeTab,
                              name: cand.candidate_name,
                              party: cand.party,
                              state: cand.state || activeFilter,
                              district: cand.district || activeFilter,
                              partyCode: cand.party_code,
                              photoUrl: photoSrc,
                            })}
                            disabled={submittingVote}
                            className="w-full mt-6 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wider shadow-sm active:translate-y-0.5"
                          >
                            {userVotedCandidate ? 'Switch Vote to This Candidate' : 'Vote Candidate'}
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

        {/* Presidential Voting Region Modal */}
        {votingFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-[#2c312a] pb-3">
                <h3 className="text-base font-black text-white">Cast Presidential Ballot</h3>
                <button onClick={() => setVotingFor(null)} className="text-zinc-500 hover:text-white text-sm">✕</button>
              </div>

              {/* Candidate Info with Photo and Party Flag */}
              <div className="flex items-center gap-3 p-3 bg-[#141714] border border-[#2c312a] rounded-xl">
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-zinc-900"
                  style={{ borderColor: getPartyColorHex(votingFor.party, votingFor.partyCode) }}
                >
                  <img
                    src={votingFor.photoUrl || getCandidatePhoto(votingFor.name, null, votingFor.party, votingFor.partyCode)}
                    alt={votingFor.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackAvatar(votingFor.name, votingFor.party, votingFor.partyCode);
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm truncate">{votingFor.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <PartyFlag party={votingFor.party} partyCode={votingFor.partyCode} size="sm" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                You are voting for <strong className="text-white">{votingFor.name}</strong>. Select your geopolitical zone to record this ballot on the regional scoreboard:
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

              <div className="text-center space-y-3">
                <div
                  className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 bg-zinc-900 shadow-xl"
                  style={{ borderColor: getPartyColorHex(shareModal.party, shareModal.partyCode) }}
                >
                  <img
                    src={shareModal.photoUrl || getCandidatePhoto(shareModal.name, null, shareModal.party, shareModal.partyCode)}
                    alt={shareModal.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackAvatar(shareModal.name, shareModal.party, shareModal.partyCode);
                    }}
                  />
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <PartyFlag party={shareModal.party} partyCode={shareModal.partyCode} size="sm" />
                </div>
                <h3 className="text-2xl font-black font-display text-white">Mock Vote Counted!</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You voted for <strong className="text-[#00b368]">{shareModal.name}</strong> {shareModal.party && `(${shareModal.party})`} in the <strong>{shareModal.race}</strong>.
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
                    `🗳️ I just cast my mock vote for ${shareModal.name}${shareModal.party ? ` (${shareModal.party})` : ''} in Nigeria's 2027 ${shareModal.race} on evote.ng!\n\nSee who is leading the polls and cast your vote: https://evote.ng/elections/2027`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:translate-y-0.5"
                >
                  <span>Share to WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🗳️ I just cast my mock vote for ${shareModal.name}${shareModal.party ? ` (${shareModal.party})` : ''} in Nigeria's 2027 ${shareModal.race} on evote.ng!\n\nSee who is leading the polls and cast your vote: https://evote.ng/elections/2027 #Nigeria2027 #evoteNG`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-black border border-zinc-700 hover:border-zinc-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:translate-y-0.5"
                >
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
