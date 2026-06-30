'use client';

import { useState, useEffect } from 'react';

interface Bill {
  id: string;
  title: string;
  sponsor_name?: string;
  sponsor_role?: string;
  status: 'first_reading' | 'second_reading' | 'committee' | 'passed_house' | 'passed_senate' | 'assented' | 'vetoed';
  category?: string;
  full_text?: string;
  date_introduced?: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bills')
      .then((res) => res.json())
      .then((data) => setBills(data.bills || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stages = [
    { key: 'first_reading', label: '1st Reading' },
    { key: 'second_reading', label: '2nd Reading' },
    { key: 'committee', label: 'Committee' },
    { key: 'passed_house', label: 'Passed House' },
    { key: 'passed_senate', label: 'Passed Senate' },
    { key: 'assented', label: 'Assented' }
  ];

  const getStageIndex = (status: string) => {
    if (status === 'vetoed') return -1;
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Legislative Bills</h1>
          <p className="text-lg text-[#6b7163]">
            Track the status, sponsors, and progress of bills currently in the National Assembly.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {bills.map((b) => {
              const currentStageIdx = getStageIndex(b.status);

              return (
                <div key={b.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                        {b.category || 'General'}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-2 leading-snug">{b.title}</h2>
                      <div className="text-xs text-zinc-450 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {b.sponsor_name && (
                          <span>Sponsor: <strong className="text-zinc-300">{b.sponsor_name}</strong> ({b.sponsor_role})</span>
                        )}
                        {b.date_introduced && (
                          <span>Introduced: <strong className="text-zinc-300">{b.date_introduced}</strong></span>
                        )}
                      </div>
                    </div>

                    <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                      b.status === 'assented'
                        ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10'
                        : b.status === 'vetoed'
                        ? 'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10'
                        : 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  {b.full_text && (
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">{b.full_text}</p>
                  )}

                  {/* Legislative Pipeline Visual Tracker */}
                  {b.status !== 'vetoed' && (
                    <div className="pt-4 border-t border-[#2c312a]/30">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6b7163] mb-4">Legislative Progress</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-2">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx <= currentStageIdx;
                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center space-y-1">
                              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-[#00b368] border-[#00b368] text-white shadow-[0_0_8px_rgba(0,179,104,0.4)]'
                                  : 'bg-transparent border-[#2c312a]'
                              }`}>
                                {isCompleted && (
                                  <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-[9px] font-bold ${isCompleted ? 'text-zinc-200 font-extrabold' : 'text-zinc-500'}`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
