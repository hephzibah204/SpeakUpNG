'use client';

import { useState, useEffect } from 'react';

interface ZoneProjection {
  zone: string;
  apc: number;
  ndc: number;
  pdp: number;
  winner: string;
  winnerColor: string;
}

export default function PredictionsPage() {
  // Simulator State
  const [economicSatisfaction, setEconomicSatisfaction] = useState(50); // 0-100
  const [securityIndex, setSecurityIndex] = useState(50); // 0-100
  const [oppositionConsolidation, setOppositionConsolidation] = useState(50); // 0-100
  const [voterTurnout, setVoterTurnout] = useState(45); // 0-100 %

  // Presets
  const applyPreset = (eco: number, sec: number, opp: number, turn: number) => {
    setEconomicSatisfaction(eco);
    setSecurityIndex(sec);
    setOppositionConsolidation(opp);
    setVoterTurnout(turn);
  };

  // Calculations
  const calculateProjections = () => {
    // Geopolitical zones baseline support
    // South West baseline: APC: 55%, NDC: 35%, PDP: 10%
    // South East baseline: APC: 10%, NDC: 80%, PDP: 10%
    // South South baseline: APC: 20%, NDC: 55%, PDP: 25%
    // North West baseline: APC: 50%, NDC: 35%, PDP: 15%
    // North East baseline: APC: 45%, NDC: 20%, PDP: 35%
    // North Central baseline: APC: 40%, NDC: 35%, PDP: 25%

    const zones = [
      { name: 'South West', apc: 55, ndc: 35, pdp: 10 },
      { name: 'South East', apc: 10, ndc: 80, pdp: 10 },
      { name: 'South South', apc: 20, ndc: 55, pdp: 25 },
      { name: 'North West', apc: 50, ndc: 35, pdp: 15 },
      { name: 'North East', apc: 45, ndc: 20, pdp: 35 },
      { name: 'North Central', apc: 40, ndc: 35, pdp: 25 }
    ];

    // Multipliers
    // Lower economic/security satisfaction decreases APC support and increases NDC/PDP support
    const apcEcoSecImpact = ((economicSatisfaction - 50) * 0.4) + ((securityIndex - 50) * 0.3);
    // Higher opposition consolidation boosts NDC support significantly
    const ndcConsolidationImpact = (oppositionConsolidation - 50) * 0.6;
    const pdpConsolidationImpact = (50 - oppositionConsolidation) * 0.2;

    const projectedZones: ZoneProjection[] = zones.map(z => {
      let apcVal = z.apc + apcEcoSecImpact;
      let ndcVal = z.ndc + ndcConsolidationImpact;
      let pdpVal = z.pdp + pdpConsolidationImpact;

      // Normalize to sum up to 100
      const total = Math.max(1, apcVal + ndcVal + pdpVal);
      apcVal = Math.round((apcVal / total) * 100);
      ndcVal = Math.round((ndcVal / total) * 100);
      pdpVal = Math.round((pdpVal / total) * 100);

      // Determine winner
      let winner = 'APC';
      let winnerColor = 'text-[#00b368]';
      if (ndcVal > apcVal && ndcVal > pdpVal) {
        winner = 'NDC';
        winnerColor = 'text-[#e8a020]';
      } else if (pdpVal > apcVal && pdpVal > ndcVal) {
        winner = 'PDP';
        winnerColor = 'text-[#e57368]';
      }

      return {
        zone: z.name,
        apc: apcVal,
        ndc: ndcVal,
        pdp: pdpVal,
        winner,
        winnerColor
      };
    });

    // Compute national totals based on electoral weights (voter population weights)
    // NW: 24%, SW: 19%, SS: 15%, NC: 14%, NE: 14%, SE: 14%
    const weights = { 'North West': 0.24, 'South West': 0.19, 'South South': 0.15, 'North Central': 0.14, 'North East': 0.14, 'South East': 0.14 };
    let nationalApc = 0;
    let nationalNdc = 0;
    let nationalPdp = 0;

    projectedZones.forEach(z => {
      const w = weights[z.zone as keyof typeof weights] || 0.16;
      nationalApc += z.apc * w;
      nationalNdc += z.ndc * w;
      nationalPdp += z.pdp * w;
    });

    // Normalize national scores to 100
    const nationalTotal = nationalApc + nationalNdc + nationalPdp;
    const finalApc = Math.round((nationalApc / nationalTotal) * 100);
    const finalNdc = Math.round((nationalNdc / nationalTotal) * 100);
    const finalPdp = Math.round((nationalPdp / nationalTotal) * 100);

    return { projectedZones, finalApc, finalNdc, finalPdp };
  };

  const { projectedZones, finalApc, finalNdc, finalPdp } = calculateProjections();

  // Dynamic analysis text
  const getAnalysis = () => {
    if (finalNdc > finalApc && finalNdc > finalPdp) {
      return `The model predicts an **NDC victory** with ${finalNdc}% of the national votes. Highly consolidated opposition turnout paired with economic grievances pushes key swing regions (North West and South South) into the NDC column.`;
    }
    if (finalApc > finalNdc && finalApc > finalPdp) {
      return `The model predicts an **APC victory** with ${finalApc}% of the national votes. The ruling party leverages strong baselines in the South West and North West, benefiting from fragmented opposition blocks and moderate economic ratings.`;
    }
    return `The model predicts a **closely contested election**. No candidate secures an outright landslide. Key swing zones like North Central and North East remain volatile with high splits between APC, NDC, and PDP.`;
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Predictive Analysis</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Election Prediction Engine</h1>
          <p className="text-lg text-[#6b7163]">
            A probabilistic forecasting tool calculated using demographic baselines, economic indicators, and opposition turnout metrics.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mb-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Select Scenario Preset</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => applyPreset(50, 50, 50, 45)}
              className="bg-[#1d211b] hover:bg-[#2c312a] text-white px-4 py-2.5 rounded-xl border border-[#2c312a] text-xs font-bold transition-all"
            >
              Status Quo (2026 Baseline)
            </button>
            <button
              onClick={() => applyPreset(25, 30, 85, 55)}
              className="bg-[#1d211b] hover:bg-[#2c312a] text-white px-4 py-2.5 rounded-xl border border-[#2c312a] text-xs font-bold transition-all"
            >
              Consolidated Opposition Wave
            </button>
            <button
              onClick={() => applyPreset(70, 75, 25, 40)}
              className="bg-[#1d211b] hover:bg-[#2c312a] text-white px-4 py-2.5 rounded-xl border border-[#2c312a] text-xs font-bold transition-all"
            >
              Ruling Party Consolidation
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders Configuration */}
          <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Adjust Parameters</h3>

            <div className="space-y-4">
              {/* Economic Sliders */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-300">Economic Index</span>
                  <span className="text-[#00b368]">{economicSatisfaction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={economicSatisfaction}
                  onChange={(e) => setEconomicSatisfaction(Number(e.target.value))}
                  className="w-full accent-[#00b368] h-1 bg-[#141714] rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Reflects general inflation & employment index.</p>
              </div>

              {/* Security Sliders */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-300">Security Index</span>
                  <span className="text-[#00b368]">{securityIndex}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={securityIndex}
                  onChange={(e) => setSecurityIndex(Number(e.target.value))}
                  className="w-full accent-[#00b368] h-1 bg-[#141714] rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Satisfaction with security operations & stability.</p>
              </div>

              {/* Opposition Consolidation */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-300">Opposition Turnout</span>
                  <span className="text-[#00b368]">{oppositionConsolidation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={oppositionConsolidation}
                  onChange={(e) => setOppositionConsolidation(Number(e.target.value))}
                  className="w-full accent-[#00b368] h-1 bg-[#141714] rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Level of turnout in South/Middle Belt coalitions.</p>
              </div>

              {/* Voter Turnout */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-zinc-300">National Turnout</span>
                  <span className="text-[#00b368]">{voterTurnout}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voterTurnout}
                  onChange={(e) => setVoterTurnout(Number(e.target.value))}
                  className="w-full accent-[#00b368] h-1 bg-[#141714] rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Estimated voter participation rate nationwide.</p>
              </div>
            </div>
          </div>

          {/* Results Summary and Map */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* National Probability Share */}
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Projected National Share</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714]">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00b368] block">APC Share</span>
                  <span className="text-4xl font-black text-white">{finalApc}%</span>
                </div>
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714]">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#e8a020] block">NDC Share</span>
                  <span className="text-4xl font-black text-white">{finalNdc}%</span>
                </div>
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714]">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#e57368] block">PDP Share</span>
                  <span className="text-4xl font-black text-white">{finalPdp}%</span>
                </div>
              </div>

              {/* Dynamic Analysis Card */}
              <div className="p-4 bg-zinc-900 border border-[#2c312a] rounded-xl text-xs text-zinc-300 leading-relaxed">
                <h4 className="font-extrabold text-white mb-2 text-sm">Forecaster Rationale</h4>
                <p dangerouslySetInnerHTML={{ __html: getAnalysis().replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
              </div>
            </div>

            {/* Geopolitical Zone Projections */}
            <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Geopolitical Zones Breakdown</h3>

              <div className="space-y-4">
                {projectedZones.map((z) => (
                  <div key={z.zone} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-[150px]">
                      <span className="font-bold text-sm text-white block">{z.zone}</span>
                      <span className="text-[10px] text-zinc-550">Projected: <strong className={z.winnerColor}>{z.winner} Lead</strong></span>
                    </div>

                    {/* Progress Ratios */}
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                        <div style={{ width: `${z.apc}%` }} className="bg-[#008751] h-full" title={`APC: ${z.apc}%`}></div>
                        <div style={{ width: `${z.ndc}%` }} className="bg-[#e8a020] h-full" title={`NDC: ${z.ndc}%`}></div>
                        <div style={{ width: `${z.pdp}%` }} className="bg-[#e57368] h-full" title={`PDP: ${z.pdp}%`}></div>
                      </div>
                      <div className="flex gap-4 text-[10px] text-zinc-400 justify-between">
                        <span>APC: <strong className="text-white">{z.apc}%</strong></span>
                        <span>NDC: <strong className="text-white">{z.ndc}%</strong></span>
                        <span>PDP: <strong className="text-white">{z.pdp}%</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
