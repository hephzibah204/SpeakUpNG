'use client';

import { useState, useEffect } from 'react';

interface PromiseItem {
  id: string;
  official_id?: string;
  politician_id?: string;
  promise_title: string;
  promise_category: string;
  promise_detail?: string;
  status: string;
  evidence_url?: string;
  progress_percent?: number;
  official_name?: string;
  politician_name?: string;
}

interface SelectionItem {
  id: string;
  full_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  fulfilled: 'bg-[#008751]/15 text-[#00b368]',
  in_progress: 'bg-[#e8a020]/15 text-[#e8a020]',
  broken: 'bg-red-900/20 text-red-400',
  disputed: 'bg-purple-900/20 text-purple-400',
  pending: 'bg-zinc-800 text-zinc-400',
};

export default function AdminMandatesPage() {
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [officials, setOfficials] = useState<SelectionItem[]>([]);
  const [politicians, setPoliticians] = useState<SelectionItem[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPromise, setEditingPromise] = useState<PromiseItem | null>(null);
  const [formData, setFormData] = useState<Partial<PromiseItem>>({});
  const [submitting, setSubmitting] = useState(false);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{ id: string; data: any } | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchPromises(); }, [search, statusFilter]);
  useEffect(() => { fetchSelectionLists(); }, []);

  const fetchPromises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/mandates?${params}`);
      const data = await res.json();
      setPromises(data.promises || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectionLists = async () => {
    try {
      const [offRes, polRes] = await Promise.all([
        fetch('/api/officials?limit=1000'),
        fetch('/api/politicians?limit=1000'),
      ]);
      const offData = await offRes.json();
      const polData = await polRes.json();
      setOfficials(offData.officials || []);
      setPoliticians(polData.politicians || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingPromise(null);
    setFormData({ promise_title: '', promise_category: 'Governance', promise_detail: '', status: 'pending', evidence_url: '', progress_percent: 0, official_id: '', politician_id: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (p: PromiseItem) => {
    setEditingPromise(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingPromise ? `/api/admin/mandates/${editingPromise.id}` : '/api/admin/mandates';
      const method = editingPromise ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setShowModal(false); fetchPromises(); }
      else { const data = await res.json(); alert(data.error || 'Failed to save mandate'); }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promise?')) return;
    await fetch(`/api/admin/mandates/${id}`, { method: 'DELETE' });
    fetchPromises();
  };

  const handleVerify = async (p: PromiseItem) => {
    const officialName = p.official_name || p.politician_name || '';
    if (!officialName) { alert('Promise must be assigned to an official or politician before AI verification.'); return; }

    setVerifyingId(p.id);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/ai/verify-promise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promise_id: p.id, official_name: officialName, promise_title: p.promise_title }),
      });
      const data = await res.json();
      if (data.ok && data.verification) {
        setVerifyResult({ id: p.id, data: data.verification });

        // Auto-apply suggested values
        const v = data.verification;
        if (v.suggested_status) {
          await fetch(`/api/admin/mandates/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...p,
              status: v.suggested_status,
              progress_percent: v.suggested_progress_percent ?? p.progress_percent,
              evidence_url: v.evidence_url || p.evidence_url,
            }),
          });
          fetchPromises();
          showToast(`AI verified: ${p.promise_title.slice(0, 40)}… → ${v.suggested_status}`);
        }
      } else {
        showToast('AI verification returned no result');
      }
    } catch {
      showToast('Verification request failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1d211b] border border-[#008751]/30 text-[#00b368] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white mb-2">Manage Mandates</h1>
          <p className="text-[#6b7163] text-sm">Track campaign and official promises, update completion status, and verify progress with AI.</p>
        </div>
        <button onClick={handleOpenCreate} className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg transition-all">
          + Add Promise
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1d211b] border border-[#2c312a] p-4 rounded-xl flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search promises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] text-xs w-64"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] text-xs focus:outline-none focus:border-[#00b368]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="broken">Broken</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* AI Verification Result Panel */}
      {verifyResult && (
        <div className="bg-[#1d211b] border border-[#e8a020]/30 rounded-2xl p-5 text-sm space-y-2">
          <div className="font-bold text-[#e8a020] text-xs uppercase tracking-wider mb-3">AI Verification Result</div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div><span className="text-[#6b7163]">Suggested Status</span><div className="font-bold text-white mt-1 capitalize">{verifyResult.data.suggested_status?.replace(/_/g, ' ')}</div></div>
            <div><span className="text-[#6b7163]">Progress</span><div className="font-bold text-white mt-1">{verifyResult.data.suggested_progress_percent ?? '—'}%</div></div>
            {verifyResult.data.evidence_url && (
              <div><span className="text-[#6b7163]">Evidence</span><div className="mt-1"><a href={verifyResult.data.evidence_url} target="_blank" rel="noreferrer" className="text-[#00b368] underline truncate block max-w-xs">{verifyResult.data.evidence_url}</a></div></div>
            )}
          </div>
          {verifyResult.data.ai_summary && <p className="text-[#6b7163] text-xs leading-relaxed pt-2 border-t border-[#2c312a]">{verifyResult.data.ai_summary}</p>}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading promises...</div>
      ) : (
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2c312a] bg-[#141714] text-[#6b7163] uppercase tracking-wider font-bold">
                  <th className="p-4">Promise Title</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c312a]">
                {promises.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-[#6b7163]">No promises found.</td></tr>
                ) : promises.map((p) => (
                  <tr key={p.id} className="hover:bg-[#232820]/40 text-zinc-300">
                    <td className="p-4 font-semibold text-white max-w-xs">
                      <div className="truncate">{p.promise_title}</div>
                      {p.evidence_url && (
                        <a href={p.evidence_url} target="_blank" rel="noreferrer" className="text-[#00b368]/70 text-[10px] hover:underline">Evidence link</a>
                      )}
                    </td>
                    <td className="p-4">{p.official_name || p.politician_name || '—'}</td>
                    <td className="p-4 capitalize">{p.promise_category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#2c312a] rounded-full h-1.5">
                          <div className="bg-[#00b368] h-1.5 rounded-full" style={{ width: `${p.progress_percent || 0}%` }} />
                        </div>
                        <span>{p.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleVerify(p)}
                          disabled={verifyingId === p.id}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-[#e8a020]/10 border border-[#e8a020]/30 text-[#e8a020] hover:bg-[#e8a020]/20 disabled:opacity-50 transition-colors"
                        >
                          {verifyingId === p.id ? 'Verifying…' : 'AI Verify'}
                        </button>
                        <button onClick={() => handleOpenEdit(p)} className="text-[#00b368] hover:underline">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1d211b] border border-[#2c312a] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2c312a] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingPromise ? 'Edit Promise' : 'Add Promise'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6b7163] hover:text-white text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Promise Title</label>
                <input type="text" required value={formData.promise_title || ''} onChange={e => setFormData({ ...formData, promise_title: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Assign to Official</label>
                  <select value={formData.official_id || ''} onChange={e => setFormData({ ...formData, official_id: e.target.value, politician_id: '' })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]">
                    <option value="">-- None --</option>
                    {officials.map(o => <option key={o.id} value={o.id}>{o.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Assign to Politician</label>
                  <select value={formData.politician_id || ''} onChange={e => setFormData({ ...formData, politician_id: e.target.value, official_id: '' })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]">
                    <option value="">-- None --</option>
                    {politicians.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Category</label>
                  <select value={formData.promise_category || 'Governance'} onChange={e => setFormData({ ...formData, promise_category: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]">
                    {['Governance','Infrastructure','Education','Health','Security','Economy','Agriculture','Technology'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Status</label>
                  <select value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="broken">Broken</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.progress_percent || 0} onChange={e => setFormData({ ...formData, progress_percent: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]" />
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Evidence URL</label>
                  <input type="text" value={formData.evidence_url || ''} onChange={e => setFormData({ ...formData, evidence_url: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]" />
                </div>
              </div>

              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Promise Details</label>
                <textarea value={formData.promise_detail || ''} onChange={e => setFormData({ ...formData, promise_detail: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs focus:outline-none focus:border-[#00b368]" rows={4} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2c312a]">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-[#f8f7f2] font-bold rounded-lg text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg text-xs">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
