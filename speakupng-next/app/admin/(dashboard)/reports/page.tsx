'use client';

import { useState, useEffect } from 'react';

interface MisconductReport {
  id: string;
  official_id?: string;
  report_title: string;
  report_detail: string;
  evidence_url?: string;
  status: string; // 'pending', 'reviewed', 'dismissed'
  created_at: string;
  official_name?: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<MisconductReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">Misconduct Reports</h1>
        <p className="text-[#6b7163] text-sm">Review, verify, and moderate citizen-reported misconduct cases.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163]">No misconduct reports found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className="p-6 bg-[#1d211b] border border-[#2c312a] rounded-2xl space-y-4 text-xs">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[#6b7163] uppercase font-bold text-[9px]">Target Official</span>
                  <div className="font-bold text-white text-sm mt-0.5">{rep.official_name || 'General / Unknown'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                    rep.status === 'reviewed' ? 'bg-[#008751]/15 text-[#00b368] border border-[#008751]/25' :
                    rep.status === 'dismissed' ? 'bg-zinc-800 text-zinc-400' : 'bg-red-950/20 text-red-400 border border-red-900/30'
                  }`}>
                    {rep.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm">{rep.report_title}</h3>
                <p className="text-zinc-300 leading-relaxed text-xs">{rep.report_detail}</p>
              </div>

              {rep.evidence_url && (
                <div>
                  <a
                    href={rep.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00b368] hover:underline font-semibold"
                  >
                    View Attached Evidence &rarr;
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#2c312a] text-[10px] text-[#6b7163] font-semibold">
                <span>Submitted on {new Date(rep.created_at).toLocaleString()}</span>
                <div className="space-x-3">
                  {rep.status !== 'reviewed' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'reviewed')}
                      className="text-[#00b368] hover:underline"
                    >
                      Approve/Verify
                    </button>
                  )}
                  {rep.status !== 'dismissed' && (
                    <button
                      onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                      className="text-zinc-400 hover:underline"
                    >
                      Dismiss
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rep.id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
