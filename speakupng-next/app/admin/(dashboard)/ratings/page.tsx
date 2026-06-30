'use client';

import { useState, useEffect } from 'react';

interface CitizenRating {
  id: string;
  type: 'official' | 'politician';
  target_id: string;
  overall: number;
  review_text?: string;
  reviewer_state?: string;
  device_hash?: string;
  created_at: string;
  official_name?: string;
  politician_name?: string;
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<CitizenRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ratings');
      const data = await res.json();
      setRatings(data.ratings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'official' | 'politician') => {
    if (!confirm('Are you sure you want to delete this rating? This action is permanent.')) return;
    try {
      const res = await fetch(`/api/admin/ratings/${id}?type=${type}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRatings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">Citizen Ratings</h1>
        <p className="text-[#6b7163] text-sm">Audit and moderate submitted citizen ratings and reviews.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading ratings...</div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163]">No citizen ratings found.</div>
      ) : (
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2c312a] bg-[#141714] text-[#6b7163] uppercase tracking-wider font-bold">
                <th className="p-4">Leader/Agency</th>
                <th className="p-4">Type</th>
                <th className="p-4">Score</th>
                <th className="p-4">Review Comment</th>
                <th className="p-4">Device Hash</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c312a]">
              {ratings.map((r) => (
                <tr key={r.id} className="hover:bg-[#232820]/40 text-zinc-350">
                  <td className="p-4 font-bold text-white">
                    {r.official_name || r.politician_name || '—'}
                  </td>
                  <td className="p-4 capitalize">{r.type}</td>
                  <td className="p-4 font-bold text-[#e8a020]">★ {Number(r.overall).toFixed(1)}</td>
                  <td className="p-4 max-w-xs truncate italic">
                    {r.review_text ? `"${r.review_text}"` : '—'}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-zinc-500">{r.device_hash?.slice(0, 12)}...</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(r.id, r.type)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
