'use client';

import { useState, useEffect } from 'react';

interface ZoneData {
  id: string;
  name: string;
  strength: string | null;
  states: string[];
  topCandidates: { name: string; role: string; rating: number }[];
}

const ZONE_IDS = ['nw', 'ne', 'nc', 'sw', 'se', 'ss'] as const;
const ZONE_NAMES: Record<string, string> = {
  nw: 'North West', ne: 'North East', nc: 'North Central', sw: 'South West', se: 'South East', ss: 'South South',
};

function strengthColor(strength: string | null): string {
  if (!strength) return 'rgba(108, 113, 99, 0.35)'; // muted gray — no data
  const pct = parseInt(strength);
  if (pct >= 70) return 'rgba(0, 179, 104, 0.8)';
  if (pct >= 50) return 'rgba(0, 179, 104, 0.5)';
  if (pct >= 30) return 'rgba(232, 160, 32, 0.55)';
  return 'rgba(229, 115, 104, 0.55)';
}

export default function HeatMapPage() {
  const [selectedZone, setSelectedZone] = useState<string>('sw');
  const [zones, setZones] = useState<Record<string, ZoneData>>(
    Object.fromEntries(ZONE_IDS.map(id => [id, { id, name: ZONE_NAMES[id], strength: null, states: [], topCandidates: [] }]))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heatmap')
      .then((res) => res.json())
      .then((data) => {
        if (data.zones) {
          setZones(prev => {
            const updated = { ...prev };
            for (const key of Object.keys(data.zones)) {
              if (updated[key]) {
                updated[key] = {
                  ...updated[key],
                  states: data.zones[key].states || [],
                  topCandidates: data.zones[key].candidates || [],
                  strength: data.zones[key].strength,
                };
              }
            }
            return updated;
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentZone = zones[selectedZone];

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Citizen Sentiment Map</h1>
          <p className="text-lg text-[#6b7163]">
            Average citizen rating strength by geopolitical zone, based on actual platform reviews of officials.
          </p>
        </div>

        <div className="mb-10 p-4 bg-[#4f8ef7]/10 border border-[#4f8ef7]/30 rounded-lg">
          <p className="text-[#4f8ef7] text-sm font-bold mb-1">ℹ️ Not a polling or electoral prediction</p>
          <p className="text-[#6b7163] text-xs leading-relaxed">
            This map shows only the average citizen rating of officials with reviews on this platform, by zone. It does not represent
            party support, voting intention, or any electoral forecast — coverage depends entirely on how many officials in a zone
            have been rated, and ratings reflect citizen opinion, not verified fact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-6 self-start">Interactive Geopolitical Map</h3>

            <svg viewBox="0 0 500 400" className="w-full max-w-md h-auto cursor-pointer drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <polygon points="80,50 200,30 240,120 180,180 80,150" fill={strengthColor(zones.nw.strength)}
                stroke={selectedZone === 'nw' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'nw' ? 3 : 1.5}
                onClick={() => setSelectedZone('nw')} className="transition-all duration-300 hover:brightness-125" />
              <text x="130" y="100" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North West</text>

              <polygon points="200,30 380,40 420,180 320,190 240,120" fill={strengthColor(zones.ne.strength)}
                stroke={selectedZone === 'ne' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'ne' ? 3 : 1.5}
                onClick={() => setSelectedZone('ne')} className="transition-all duration-300 hover:brightness-125" />
              <text x="300" y="110" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North East</text>

              <polygon points="80,150 180,180 320,190 280,250 160,250 110,210" fill={strengthColor(zones.nc.strength)}
                stroke={selectedZone === 'nc' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'nc' ? 3 : 1.5}
                onClick={() => setSelectedZone('nc')} className="transition-all duration-300 hover:brightness-125" />
              <text x="180" y="210" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North Central</text>

              <polygon points="60,220 160,250 200,310 110,340 50,300" fill={strengthColor(zones.sw.strength)}
                stroke={selectedZone === 'sw' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'sw' ? 3 : 1.5}
                onClick={() => setSelectedZone('sw')} className="transition-all duration-300 hover:brightness-125" />
              <text x="100" y="290" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">South West</text>

              <polygon points="200,310 280,310 270,360 210,360" fill={strengthColor(zones.se.strength)}
                stroke={selectedZone === 'se' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'se' ? 3 : 1.5}
                onClick={() => setSelectedZone('se')} className="transition-all duration-300 hover:brightness-125" />
              <text x="220" y="335" fill="#fff" fontSize="10" fontWeight="bold" className="pointer-events-none select-none">South East</text>

              <polygon points="160,250 280,250 360,270 330,340 280,310 200,310" fill={strengthColor(zones.ss.strength)}
                stroke={selectedZone === 'ss' ? '#fff' : '#2c312a'} strokeWidth={selectedZone === 'ss' ? 3 : 1.5}
                onClick={() => setSelectedZone('ss')} className="transition-all duration-300 hover:brightness-125" />
              <text x="270" y="285" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">South South</text>
            </svg>

            <div className="w-full border-t border-[#2c312a] mt-6 pt-4 flex flex-wrap justify-around text-xs gap-3">
              <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-[#00b368] opacity-80"></span><span>High rating (70%+)</span></div>
              <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded" style={{ background: 'rgba(232,160,32,0.8)' }}></span><span>Moderate (30–50%)</span></div>
              <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded" style={{ background: 'rgba(229,115,104,0.8)' }}></span><span>Low (&lt;30%)</span></div>
              <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-zinc-700"></span><span>No ratings yet</span></div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Selected Zone</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">{currentZone.name}</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-zinc-400">Average rating strength:</span>
                <span className="text-xs font-black text-white">{currentZone.strength || 'No ratings yet'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">States Covered</h4>
              <div className="flex flex-wrap gap-2">
                {currentZone.states.map((st, i) => (
                  <span key={i} className="px-3 py-1 bg-[#141714] border border-[#2c312a] text-zinc-300 rounded-lg text-xs font-medium">{st}</span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Top Rated Officials in Zone</h4>
              <div className="space-y-2">
                {currentZone.topCandidates.length === 0 ? (
                  <p className="text-xs text-[#6b7163]">No rated officials in this zone yet.</p>
                ) : currentZone.topCandidates.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[#141714] border border-[#2c312a] rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{c.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-[#2c312a]">
                        <div className="bg-[#00b368] h-full" style={{ width: `${c.rating}%` }}></div>
                      </div>
                      <span className="font-black text-white">{c.rating}%</span>
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
