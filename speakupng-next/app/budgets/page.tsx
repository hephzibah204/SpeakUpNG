'use client';

import { useState, useEffect } from 'react';

interface Budget {
  id: string;
  year: number;
  entity_type: 'federal' | 'state';
  entity_name: string;
  sector: string;
  amount_allocated: string | number;
  amount_released: string | number;
  description?: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/budgets')
      .then((res) => res.json())
      .then((data) => setBudgets(data.budgets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBudgets = budgets.filter((b) => {
    if (filterType === 'all') return true;
    return b.entity_type === filterType;
  });

  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + Number(b.amount_allocated), 0);
  const totalReleased = filteredBudgets.reduce((sum, b) => sum + Number(b.amount_released || 0), 0);
  const averageReleaseRate = totalAllocated > 0 ? (totalReleased / totalAllocated) * 100 : 0;

  const formatNaira = (amount: number) => {
    if (amount >= 1e12) return `₦${(amount / 1e12).toFixed(2)} Trillion`;
    if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)} Billion`;
    if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(2)} Million`;
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Budget & Allocation Explorer</h1>
          <p className="text-lg text-[#6b7163]">
            Monitor public sector budget allocations and track the actual release of funds.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Total Budget Allocated</h3>
                <p className="text-2xl sm:text-3xl font-black text-white font-display">{formatNaira(totalAllocated)}</p>
              </div>
              <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Total Funds Released</h3>
                <p className="text-2xl sm:text-3xl font-black text-[#00b368] font-display">{formatNaira(totalReleased)}</p>
              </div>
              <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Average Release Rate</h3>
                <p className="text-2xl sm:text-3xl font-black text-[#e8a020] font-display">{averageReleaseRate.toFixed(1)}%</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex justify-center sm:justify-start gap-2 bg-[#1d211b] p-1.5 border border-[#2c312a] rounded-xl w-max">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all' ? 'bg-[#008751] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Budgets
              </button>
              <button
                onClick={() => setFilterType('federal')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'federal' ? 'bg-[#008751] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Federal
              </button>
              <button
                onClick={() => setFilterType('state')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'state' ? 'bg-[#008751] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                State
              </button>
            </div>

            {/* Budgets List */}
            <div className="grid grid-cols-1 gap-6">
              {filteredBudgets.map((b) => {
                const allocatedVal = Number(b.amount_allocated);
                const releasedVal = Number(b.amount_released || 0);
                const rate = allocatedVal > 0 ? (releasedVal / allocatedVal) * 100 : 0;

                return (
                  <div key={b.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                            {b.sector}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            {b.year}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-white mt-2">{b.entity_name} Allocation</h2>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-zinc-400">Allocated: <strong className="text-white font-display">{formatNaira(allocatedVal)}</strong></div>
                        <div className="text-sm text-zinc-400 mt-0.5">Released: <strong className="text-[#00b368] font-display">{formatNaira(releasedVal)}</strong></div>
                      </div>
                    </div>

                    {b.description && (
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">{b.description}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-2 border-t border-[#2c312a]/30">
                      <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                        <span>Fund Release Progress</span>
                        <span className="text-[#e8a020]">{rate.toFixed(1)}% Released</span>
                      </div>
                      <div className="w-full bg-[#141714] h-2.5 rounded-full overflow-hidden border border-[#2c312a]">
                        <div
                          className="bg-[#00b368] h-full shadow-[0_0_8px_rgba(0,179,104,0.4)]"
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
