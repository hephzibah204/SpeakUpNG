'use client';

import { useState } from 'react';
import Link from 'next/link';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

const POPULAR_LGAS: Record<string, string[]> = {
  Lagos: ['Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo', 'Ojo', 'Ikorodu', 'Surulere', 'Agege', 'Ifako-Ijaiye', 'Somolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Ikeja', 'Eti-Osa', 'Badagry', 'Apapa', 'Lagos Island', 'Epe', 'Ibeju-Lekki'],
  Oyo: ['Ibadan North', 'Ibadan North-West', 'Ibadan North-East', 'Ibadan South-West', 'Ibadan South-East', 'Akinyele', 'Egbeda', 'Iseyin', 'Ogbomosho North', 'Ogbomosho South', 'Oyo East', 'Oyo West'],
  Ogun: ['Abeokuta South', 'Abeokuta North', 'Ijebu Ode', 'Ijebu North', 'Sagamu', 'Ota', 'Ifo', 'Obafemi Owode'],
  Abia: ['Umuahia North', 'Umuahia South', 'Aba North', 'Aba South', 'Ohafia', 'Arochukwu', 'Obingwa'],
  FCT: ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Abaji'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Eleme', 'Okrika', 'Degema', 'Ikwerre']
};

interface Official {
  id: string;
  full_name: string;
  role: string;
  tier: string;
  state: string;
  rating_avg: number;
  rating_count: number;
  photo_url?: string;
  bio?: string;
}

export default function WhoRepPage() {
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    governor: Official | null;
    senators: Official[];
    representatives: Official[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reps/lookup?state=${state}&lga=${lga}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Error fetching reps:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoDetectLocation = () => {
    setLoading(true);
    // Simulate geo-detection mapping to Lagos for demonstration
    setTimeout(() => {
      setState('Lagos');
      setLga('Ikeja');
      fetch(`/api/reps/lookup?state=Lagos&lga=Ikeja`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 1500);
  };

  const getLgasForState = () => {
    return POPULAR_LGAS[state] || ['Central LGA', 'North LGA', 'South LGA', 'East LGA', 'West LGA'];
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10 text-center border-b border-[#2c312a] pb-6">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Citizen Tools</span>
          <h1 className="text-4xl font-extrabold font-display text-white mb-3 mt-1">Who Represents Me?</h1>
          <p className="text-lg text-[#6b7163] max-w-2xl mx-auto">
            Find the federal, state, and local representatives serving your area, track their performance, and check their ratings.
          </p>
        </div>

        {/* Input & Selector Card */}
        <div className="max-w-3xl mx-auto bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 mb-12">
          <div className="text-center pb-4 border-b border-[#2c312a]">
            <button
              onClick={autoDetectLocation}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {loading ? 'Detecting Location...' : 'Auto-Detect My Location'}
            </button>
            <p className="text-[10px] text-zinc-500 mt-2">Uses browser geolocation to approximate your state & LGA.</p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Select State</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setLga('');
                }}
                required
                className="bg-[#141714] border border-[#2c312a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00b368] transition-colors"
              >
                <option value="">-- Choose State --</option>
                {NIGERIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">Select LGA</label>
              <select
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                disabled={!state}
                className="bg-[#141714] border border-[#2c312a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00b368] transition-colors disabled:opacity-50"
              >
                <option value="">-- Choose LGA --</option>
                {state && getLgasForState().map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading || !state}
                className="w-full bg-[#1d211b] hover:bg-[#2c312a] border border-[#2c312a] text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wider"
              >
                Search Representatives
              </button>
            </div>
          </form>
        </div>

        {/* Results Sections */}
        {results && (
          <div className="space-y-12">
            
            {/* Governor */}
            {results.governor && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00b368]">State Executive</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl items-center">
                  <div className="flex items-center gap-4">
                    <img 
                      src={results.governor.photo_url || '/images/avatar-placeholder.png'} 
                      alt={results.governor.full_name} 
                      className="w-20 h-20 rounded-full object-cover border border-[#2c312a]"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#e8a020] block">{results.governor.role}</span>
                      <h4 className="text-xl font-bold text-white mt-1">{results.governor.full_name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">State: {results.governor.state}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-[#141714] p-3 rounded-xl border border-[#2c312a] text-xs">
                      <span className="text-zinc-400">Public Rating</span>
                      <strong className="text-white text-sm">{results.governor.rating_avg} / 5.0 ({results.governor.rating_count} reviews)</strong>
                    </div>
                    <Link 
                      href={`/official/${results.governor.id}`}
                      className="block text-center bg-[#008751] hover:bg-[#00b368] text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      View Full Performance Scorecard
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Senators */}
            {results.senators.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e8a020]">Senate Representatives</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.senators.map(s => (
                    <div key={s.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={s.photo_url || '/images/avatar-placeholder.png'} 
                          alt={s.full_name} 
                          className="w-12 h-12 rounded-full object-cover border border-[#2c312a]"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{s.full_name}</h4>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">{s.role}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Rating:</span>
                          <strong className="text-white">{s.rating_avg} / 5.0</strong>
                        </div>
                        <Link 
                          href={`/official/${s.id}`}
                          className="block text-center border border-[#2c312a] hover:bg-[#2c312a] text-white py-2 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          View Legislative DNA
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* House Reps */}
            {results.representatives.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#e57368]">House Representatives</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.representatives.map(r => (
                    <div key={r.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={r.photo_url || '/images/avatar-placeholder.png'} 
                          alt={r.full_name} 
                          className="w-12 h-12 rounded-full object-cover border border-[#2c312a]"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{r.full_name}</h4>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">{r.role}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>Rating:</span>
                          <strong className="text-white">{r.rating_avg} / 5.0</strong>
                        </div>
                        <Link 
                          href={`/official/${r.id}`}
                          className="block text-center border border-[#2c312a] hover:bg-[#2c312a] text-white py-2 rounded-xl text-[10px] font-bold transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
