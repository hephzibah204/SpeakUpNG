'use client';

import { useState, useEffect } from 'react';

interface Incident {
  id: string;
  category: string;
  description: string;
  state?: string;
  lga?: string;
  polling_unit?: string;
  lat?: number;
  lng?: number;
  photo_url?: string;
  reporter_name?: string;
  reporter_contact?: string;
  status: string;
  reviewer_note?: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-400',
  verified: 'bg-[#008751]/15 text-[#00b368]',
  rejected: 'bg-[#c0392b]/15 text-[#e57368]',
  escalated: 'bg-[#e8a020]/15 text-[#e8a020]',
};

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchIncidents(); }, [statusFilter]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/incidents?${params}`);
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchIncidents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this incident report?')) return;
    await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
    fetchIncidents();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">Election Incident Reports</h1>
        <p className="text-[#6b7163] text-sm">Review and verify citizen-submitted election incident reports.</p>
      </div>

      <div className="flex gap-1">
        {[{ key: '', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'verified', label: 'Verified' }, { key: 'escalated', label: 'Escalated' }, { key: 'rejected', label: 'Rejected' }].map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              statusFilter === f.key ? 'bg-[#008751]/15 border-[#008751]/30 text-[#00b368]' : 'border-[#2c312a] text-[#6b7163] hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading…</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] bg-[#1d211b] border border-[#2c312a] rounded-xl">No incident reports found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {incidents.map(i => (
            <div key={i.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <span className="text-xs font-bold uppercase text-[#e8a020]">{i.category.replace(/_/g, ' ')}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLES[i.status] || STATUS_STYLES.pending}`}>{i.status}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{i.description}</p>
              <div className="text-xs text-[#6b7163] space-y-0.5">
                {(i.state || i.lga || i.polling_unit) && <p>{[i.polling_unit, i.lga, i.state].filter(Boolean).join(', ')}</p>}
                {i.lat && i.lng && <p>📍 {i.lat.toFixed(4)}, {i.lng.toFixed(4)}</p>}
                {i.reporter_name && <p>Reporter: {i.reporter_name} {i.reporter_contact ? `(${i.reporter_contact})` : ''}</p>}
                <p>{new Date(i.created_at).toLocaleString()}</p>
              </div>
              {i.photo_url && <a href={i.photo_url} target="_blank" rel="noreferrer" className="text-xs text-[#00b368] hover:underline">View media →</a>}

              <div className="flex gap-2 pt-2 border-t border-[#2c312a] flex-wrap">
                <button onClick={() => updateStatus(i.id, 'verified')} className="px-2.5 py-1 bg-[#008751]/10 border border-[#008751]/30 text-[#00b368] text-xs font-bold rounded">Verify</button>
                <button onClick={() => updateStatus(i.id, 'escalated')} className="px-2.5 py-1 bg-[#e8a020]/10 border border-[#e8a020]/30 text-[#e8a020] text-xs font-bold rounded">Escalate</button>
                <button onClick={() => updateStatus(i.id, 'rejected')} className="px-2.5 py-1 bg-[#c0392b]/10 border border-[#c0392b]/30 text-[#e57368] text-xs font-bold rounded">Reject</button>
                <button onClick={() => handleDelete(i.id)} className="px-2.5 py-1 text-zinc-500 hover:text-red-400 text-xs font-bold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
