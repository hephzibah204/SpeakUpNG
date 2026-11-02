'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CountdownTarget {
  label: string;
  date: string; // ISO date
}

// Dates per INEC's published 2027 election timetable.
const TARGETS: CountdownTarget[] = [
  { label: 'Presidential & National Assembly', date: '2027-01-16T00:00:00' },
  { label: 'Governorship & State Assembly', date: '2027-02-06T00:00:00' },
];

function getTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function ElectionCountdown() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(TARGETS[0].date));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(TARGETS[activeIdx].date));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeIdx]);

  const target = TARGETS[activeIdx];

  return (
    <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {TARGETS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              activeIdx === i ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-[#6b7163] mb-4">
        {new Date(target.date).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {timeLeft ? (
        <div className="grid grid-cols-4 gap-3">
          {[
            { v: timeLeft.days, l: 'Days' },
            { v: timeLeft.hours, l: 'Hours' },
            { v: timeLeft.minutes, l: 'Minutes' },
            { v: timeLeft.seconds, l: 'Seconds' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-[#141714] border border-[#2c312a] rounded-xl p-3 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#00b368] tabular-nums">{String(v).padStart(2, '0')}</div>
              <div className="text-[9px] uppercase tracking-wider text-[#6b7163] font-bold mt-1">{l}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-[#00b368] font-bold py-4">Election day has arrived.</p>
      )}

      <div className="mt-5 text-center border-t border-[#2c312a] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-zinc-400">
          The 2027 Mock Voting Ballot is now live nationwide.
        </span>
        <Link
          href="/elections/2027"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors shadow-md active:translate-y-0.5"
        >
          <span>🗳️ Cast Your Mock Vote</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
