'use client';

import { useState, useEffect } from 'react';

interface ZoneData {
  id: string;
  name: string;
  party: string;
  color: string;
  strength: string;
  states: string[];
  topCandidates: { name: string; party: string; rating: number }[];
}

export default function HeatMapPage() {
  const [selectedZone, setSelectedZone] = useState<string>('sw');
  const [zones, setZones] = useState<Record<string, ZoneData>>({
    nw: { id: 'nw', name: 'North West', party: 'APC', color: 'rgba(0, 180, 104, 0.7)', strength: '65%', states: [], topCandidates: [] },
    ne: { id: 'ne', name: 'North East', party: 'PDP', color: 'rgba(229, 115, 104, 0.7)', strength: '54%', states: [], topCandidates: [] },
    nc: { id: 'nc', name: 'North Central', party: 'APC', color: 'rgba(0, 180, 104, 0.55)', strength: '48%', states: [], topCandidates: [] },
    sw: { id: 'sw', name: 'South West', party: 'APC', color: 'rgba(0, 180, 104, 0.8)', strength: '78%', states: [], topCandidates: [] },
    se: { id: 'se', name: 'South East', party: 'LP', color: 'rgba(232, 160, 32, 0.8)', strength: '84%', states: [], topCandidates: [] },
    ss: { id: 'ss', name: 'South South', party: 'PDP', color: 'rgba(229, 115, 104, 0.65)', strength: '52%', states: [], topCandidates: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/heatmap')
      .then((res) => res.json())
      .then((data) => {
        if (data.zones) {
          const updated = { ...zones };
          Object.keys(data.zones).forEach((key) => {
            if (updated[key]) {
              updated[key].states = data.zones[key].states || [];
              updated[key].topCandidates = data.zones[key].candidates || [];
              updated[key].party = data.zones[key].party || updated[key].party;
              updated[key].strength = data.zones[key].strength || updated[key].strength;
            }
          });
          setZones(updated);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentZone = zones[selectedZone];

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Political Heat Map</h1>
          <p className="text-lg text-[#6b7163]">
            Interactive map displaying party support strength, candidate popularity, and regional sentiment trends across geopolitical zones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SVG Map Section */}
          <div className="lg:col-span-7 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-6 self-start">Interactive Geopolitical Map</h3>
            
            <svg viewBox="0 0 500 400" className="w-full max-w-md h-auto cursor-pointer drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              {/* Schematic Polygonal Nigeria Geopolitical Zones */}
              {/* North West */}
              <polygon
                points="80,50 200,30 240,120 180,180 80,150"
                fill={zones.nw.color}
                stroke={selectedZone === 'nw' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'nw' ? 3 : 1.5}
                onClick={() => setSelectedZone('nw')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="130" y="100" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North West</text>

              {/* North East */}
              <polygon
                points="200,30 380,40 420,180 320,190 240,120"
                fill={zones.ne.color}
                stroke={selectedZone === 'ne' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'ne' ? 3 : 1.5}
                onClick={() => setSelectedZone('ne')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="300" y="110" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North East</text>

              {/* North Central */}
              <polygon
                points="80,150 180,180 320,190 280,250 160,250 110,210"
                fill={zones.nc.color}
                stroke={selectedZone === 'nc' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'nc' ? 3 : 1.5}
                onClick={() => setSelectedZone('nc')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="180" y="210" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">North Central</text>

              {/* South West */}
              <polygon
                points="60,220 160,250 200,310 110,340 50,300"
                fill={zones.sw.color}
                stroke={selectedZone === 'sw' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'sw' ? 3 : 1.5}
                onClick={() => setSelectedZone('sw')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="100" y="290" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">South West</text>

              {/* South East */}
              <polygon
                points="200,310 280,310 270,360 210,360"
                fill={zones.se.color}
                stroke={selectedZone === 'se' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'se' ? 3 : 1.5}
                onClick={() => setSelectedZone('se')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="220" y="335" fill="#fff" fontSize="10" fontWeight="bold" className="pointer-events-none select-none">South East</text>

              {/* South South */}
              <polygon
                points="160,250 280,250 360,270 330,340 280,310 200,310"
                fill={zones.ss.color}
                stroke={selectedZone === 'ss' ? '#fff' : '#2c312a'}
                strokeWidth={selectedZone === 'ss' ? 3 : 1.5}
                onClick={() => setSelectedZone('ss')}
                className="transition-all duration-300 hover:brightness-125"
              />
              <text x="270" y="285" fill="#fff" fontSize="12" fontWeight="bold" className="pointer-events-none select-none">South South</text>
            </svg>

            {/* Map Legend */}
            <div className="w-full border-t border-[#2c312a] mt-6 pt-4 flex justify-around text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#00b468] opacity-80"></span>
                <span>APC (Green)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#e57368] opacity-80"></span>
                <span>PDP (Red)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#e8a020] opacity-80"></span>
                <span>LP (Yellow)</span>
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Selected Zone</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">{currentZone.name}</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-zinc-400">Leading Party:</span>
                <span className="text-xs font-black text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                  {currentZone.party}
                </span>
                <span className="text-xs text-zinc-400">Strength: <strong className="text-white">{currentZone.strength}</strong></span>
              </div>
            </div>

            {/* States List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">States Covered</h4>
              <div className="flex flex-wrap gap-2">
                {currentZone.states.map((st, i) => (
                  <span key={i} className="px-3 py-1 bg-[#141714] border border-[#2c312a] text-zinc-300 rounded-lg text-xs font-medium">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Regional Candidates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Top Candidates & Sentiment</h4>
              <div className="space-y-2">
                {currentZone.topCandidates.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[#141714] border border-[#2c312a] rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-white block">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{c.party}</span>
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
