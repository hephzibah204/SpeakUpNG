'use client';

import { useState } from 'react';

export default function TransparencyPage() {
  const [activeSection, setActiveSection] = useState<'methodology' | 'moderation' | 'governance'>('methodology');

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Transparency & Trust</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Trust Centre</h1>
          <p className="text-lg text-[#6b7163]">
            Our methodologies, moderation processes, and governance guidelines that ensure objective, data-driven civic intelligence.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-8 gap-6 text-sm font-bold justify-center sm:justify-start">
          <button
            onClick={() => setActiveSection('methodology')}
            className={`pb-3 border-b-2 transition-all ${
              activeSection === 'methodology' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Scoring Methodology
          </button>
          <button
            onClick={() => setActiveSection('moderation')}
            className={`pb-3 border-b-2 transition-all ${
              activeSection === 'moderation' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Moderation & Claims
          </button>
          <button
            onClick={() => setActiveSection('governance')}
            className={`pb-3 border-b-2 transition-all ${
              activeSection === 'governance' ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            Governance & Board
          </button>
        </div>

        {/* Section Contents */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {activeSection === 'methodology' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white font-display">Objective Scoring Methodology</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                evote.ng implements a strict mathematical weighting model to evaluate the performance of public officials and candidates. Scores are aggregated automatically using dynamic parameters without editorial bias.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="border border-[#2c312a] p-5 rounded-xl bg-[#141714]">
                  <h4 className="font-extrabold text-[#00b368] text-sm mb-3">Political DNA Formula</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    The Political DNA Score (0-100) measures 12 key leadership dimensions:
                  </p>
                  <div className="bg-zinc-900 p-3 rounded-lg border border-[#2c312a] font-mono text-[10px] text-zinc-300">
                    DNA_Score = (Integrity * 0.15) + (Accountability * 0.15) + (Transparency * 0.15) + (Legislative_Productivity * 0.15) + (Economic_Performance * 0.15) + (Other_Indicators * 0.25)
                  </div>
                </div>

                <div className="border border-[#2c312a] p-5 rounded-xl bg-[#141714]">
                  <h4 className="font-extrabold text-[#00b368] text-sm mb-3">Performance Indexing</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Government Performance is compiled across 12 public sectors (Education, Healthcare, Infrastructure, etc.) mapped directly to verified project achievements.
                  </p>
                  <div className="bg-zinc-900 p-3 rounded-lg border border-[#2c312a] font-mono text-[10px] text-zinc-300">
                    Performance = (Verified_Projects_Count / Total_Budget_Allocation) * Sector_Adjustment_Multiplier
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'moderation' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white font-display">Moderation & Fact-Checking Process</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Claims submitted to our Political Fact Checker undergo a double-blind expert and community review pipeline. This ensures verification accuracy and mitigates coordinated misdirection campaigns.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl flex gap-3 text-xs">
                  <span className="font-black text-[#00b368]">Step 1</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Citizen Claim Ingestion</h4>
                    <p className="text-zinc-400">Claims are indexed anonymously using localized IP and device fingerprints to prevent spam bots.</p>
                  </div>
                </div>

                <div className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl flex gap-3 text-xs">
                  <span className="font-black text-[#e8a020]">Step 2</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Expert Consensus & Truth Labels</h4>
                    <p className="text-zinc-400">Claims are verified against public records, official reports, and media sources. The system assigns truth tags (True, Mostly True, Misleading, False).</p>
                  </div>
                </div>

                <div className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl flex gap-3 text-xs">
                  <span className="font-black text-[#e57368]">Step 3</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Community Oversight</h4>
                    <p className="text-zinc-400">Registered users can upvote/downvote findings and comment with supporting evidence to continuously audit truth ratings.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'governance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white font-display">Platform Governance & Neutrality</h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                evote.ng is non-partisan and operates independently. Our governance framework is supervised by an advisory committee composed of independent actors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714] text-center">
                  <div className="text-xs font-black text-white mb-1">Data Ethics Board</div>
                  <span className="text-[10px] text-zinc-500">Reviews algorithmic scoring models.</span>
                </div>
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714] text-center">
                  <div className="text-xs font-black text-white mb-1">Fact-Check Council</div>
                  <span className="text-[10px] text-zinc-500">Validates controversial truth labels.</span>
                </div>
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714] text-center">
                  <div className="text-xs font-black text-white mb-1">Academic Advisors</div>
                  <span className="text-[10px] text-zinc-500">Supervises political science methodologies.</span>
                </div>
                <div className="border border-[#2c312a] p-4 rounded-xl bg-[#141714] text-center">
                  <div className="text-xs font-black text-white mb-1">Civil Society Partners</div>
                  <span className="text-[10px] text-zinc-500">Ensures accountability compliance.</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
