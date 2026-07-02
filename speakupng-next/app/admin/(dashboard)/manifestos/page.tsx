'use client';

import { useState, useEffect } from 'react';

interface Manifesto {
  id: string;
  politician_id?: string;
  official_id?: string;
  politician_name?: string;
  party?: string;
  title: string;
  summary?: string;
  cost_feasibility?: string;
  sdg_alignment?: string;
  milestones?: string;
  created_at: string;
}

export default function AdminManifestosPage() {
  const [manifestos, setManifestos] = useState<Manifesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ politician_id: '', title: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchManifestos(); }, []);

  const fetchManifestos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manifestos');
      const data = await res.json();
      setManifestos(data.manifestos || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/manifestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ politician_id: '', title: '', text: '' });
      setShowForm(false);
      fetchManifestos();
    } catch (err: any) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this manifesto analysis?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/manifestos/${id}`, { method: 'DELETE' });
      // fallback handled by /api/manifestos/[id]/route.ts
      fetchManifestos();
    } catch { /* ignore */ } finally { setDeleting(null); }
  };

  const parseSummary = (m: Manifesto) => {
    if (m.summary) return m.summary;
    try {
      const cf = m.cost_feasibility ? JSON.parse(m.cost_feasibility) : null;
      if (cf?.notes) return cf.notes;
    } catch { /* ignore */ }
    return 'No summary available.';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white mb-2">Manifesto Intelligence</h1>
          <p className="text-[#6b7163] text-sm">Upload manifesto text for AI-powered analysis: cost feasibility, SDG alignment, and milestone extraction.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white font-bold rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          {showForm ? 'Cancel' : '+ Analyse New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">Manifesto Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Tinubu 2027 Re-election Manifesto"
              className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-white focus:outline-none focus:border-[#00b368]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">Politician ID (optional)</label>
            <input
              value={form.politician_id}
              onChange={e => setForm({ ...form, politician_id: e.target.value })}
              placeholder="UUID from politicians table (leave blank if unknown)"
              className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-white focus:outline-none focus:border-[#00b368]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1.5">Manifesto Text</label>
            <textarea
              required
              rows={8}
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
              placeholder="Paste the full manifesto text…"
              className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-white focus:outline-none focus:border-[#00b368]"
            />
          </div>
          {error && <p className="text-[#e57368] text-xs">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg text-sm"
          >
            {submitting ? 'Analysing with AI… (may take ~30s)' : 'Run AI Analysis'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading…</div>
      ) : manifestos.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] bg-[#1d211b] border border-[#2c312a] rounded-xl">No manifestos analysed yet.</div>
      ) : (
        <div className="space-y-4">
          {manifestos.map(m => {
            let sdgCount = 0;
            let milestoneCount = 0;
            let cfRating = '';
            try { sdgCount = m.sdg_alignment ? JSON.parse(m.sdg_alignment).length : 0; } catch { /* ignore */ }
            try { milestoneCount = m.milestones ? JSON.parse(m.milestones).length : 0; } catch { /* ignore */ }
            try { cfRating = m.cost_feasibility ? JSON.parse(m.cost_feasibility).rating : ''; } catch { /* ignore */ }

            return (
              <div key={m.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-white">{m.title}</h3>
                    {m.politician_name && <p className="text-xs text-[#6b7163]">{m.politician_name} {m.party ? `· ${m.party}` : ''}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cfRating && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cfRating === 'High' ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10' :
                        cfRating === 'Moderate' ? 'text-[#e8a020] border-[#e8a020]/30 bg-[#e8a020]/10' :
                        'text-[#e57368] border-[#c0392b]/30 bg-[#c0392b]/10'
                      }`}>
                        {cfRating} Feasibility
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deleting === m.id}
                      className="text-xs text-red-400 hover:underline disabled:opacity-50"
                    >
                      {deleting === m.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{parseSummary(m)}</p>

                <div className="flex gap-3 text-[10px] text-zinc-500">
                  {sdgCount > 0 && <span>📌 {sdgCount} SDGs aligned</span>}
                  {milestoneCount > 0 && <span>📋 {milestoneCount} milestones</span>}
                  <span>{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
