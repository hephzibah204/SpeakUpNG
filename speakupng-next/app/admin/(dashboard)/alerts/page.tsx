'use client';

import { useState, useEffect } from 'react';

interface NewsAlert {
  id: string;
  profile_type: string;
  profile_id: string;
  profile_name?: string;
  trigger_keyword: string;
  is_active: number;
  last_triggered_at?: string;
  created_at: string;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<NewsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [officials, setOfficials] = useState<{ id: string; full_name: string }[]>([]);
  const [politicians, setPoliticians] = useState<{ id: string; full_name: string }[]>([]);
  const [form, setForm] = useState({
    profile_type: 'official' as 'official' | 'politician',
    profile_id: '',
    trigger_keyword: '',
  });

  useEffect(() => {
    fetchAlerts();
    fetchProfiles();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchProfiles = async () => {
    try {
      const [offRes, polRes] = await Promise.all([
        fetch('/api/officials?limit=200'),
        fetch('/api/politicians?limit=200'),
      ]);
      const offData = await offRes.json();
      const polData = await polRes.json();
      setOfficials(offData.officials || []);
      setPoliticians(polData.politicians || []);
    } catch { /* ignore */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ profile_type: 'official', profile_id: '', trigger_keyword: '' });
      fetchAlerts();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const toggleAlert = async (id: string, isActive: number) => {
    await fetch(`/api/admin/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
    });
    fetchAlerts();
  };

  const deleteAlert = async (id: string) => {
    if (!confirm('Delete this alert?')) return;
    await fetch(`/api/admin/alerts/${id}`, { method: 'DELETE' });
    fetchAlerts();
  };

  const profileList = form.profile_type === 'official' ? officials : politicians;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">News Alerts</h1>
          <p className="text-[#6b7163] text-sm">Configure keyword-based news alerts tied to officials and politicians.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl transition-colors">
          + New Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Create News Alert</h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Profile Type</label>
            <select value={form.profile_type}
              onChange={e => setForm(p => ({ ...p, profile_type: e.target.value as any, profile_id: '' }))}
              className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368]">
              <option value="official">Official</option>
              <option value="politician">Politician</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">
              {form.profile_type === 'official' ? 'Official' : 'Politician'}
            </label>
            <select required value={form.profile_id} onChange={e => setForm(p => ({ ...p, profile_id: e.target.value }))}
              className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368]">
              <option value="">Select profile...</option>
              {profileList.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Trigger Keyword</label>
            <input required type="text" value={form.trigger_keyword}
              onChange={e => setForm(p => ({ ...p, trigger_keyword: e.target.value }))}
              placeholder="e.g. corruption, budget cut, resignation..."
              className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
              {submitting ? 'Creating...' : 'Create Alert'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#2c312a] text-[#6b7163] text-sm font-bold rounded-xl hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">No alerts configured. Create one above.</div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                    alert.is_active
                      ? 'text-[#00b368] border-[#008751]/30 bg-[#008751]/10'
                      : 'text-[#6b7163] border-[#2c312a]'
                  }`}>{alert.is_active ? 'Active' : 'Paused'}</span>
                  <span className="text-[#6b7163] text-[10px]">{alert.profile_type}</span>
                </div>
                <div className="font-bold text-white text-sm">
                  {alert.profile_name || alert.profile_id}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7163]">
                  <span>Keyword: <span className="text-[#e8a020] font-semibold">"{alert.trigger_keyword}"</span></span>
                  {alert.last_triggered_at && (
                    <span>Last hit: {new Date(alert.last_triggered_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3 text-xs font-bold flex-shrink-0">
                <button onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={alert.is_active ? 'text-[#e8a020] hover:underline' : 'text-[#00b368] hover:underline'}>
                  {alert.is_active ? 'Pause' : 'Enable'}
                </button>
                <button onClick={() => deleteAlert(alert.id)} className="text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
