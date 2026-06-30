'use client';

import { useState, useEffect } from 'react';

interface CoalitionEvent {
  id: string;
  event_type: string;
  politician_name: string;
  from_party?: string;
  to_party?: string;
  description?: string;
  source_url?: string;
  event_date?: string;
}

const EVENT_TYPES = ['defection', 'coalition', 'endorsement', 'running_mate'];

export default function AdminPoliticalEventsPage() {
  const [events, setEvents] = useState<CoalitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CoalitionEvent | null>(null);
  const [form, setForm] = useState<Partial<CoalitionEvent>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coalitions');
      const data = await res.json();
      setEvents(data.events || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ event_type: 'defection', politician_name: '', from_party: '', to_party: '', description: '', source_url: '', event_date: '' });
    setShowModal(true);
  };

  const openEdit = (ev: CoalitionEvent) => {
    setEditing(ev);
    setForm({ ...ev, event_date: ev.event_date ? ev.event_date.slice(0, 10) : '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/coalitions/${editing.id}` : '/api/coalitions';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setShowModal(false); fetchEvents(); }
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/coalitions/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white mb-2">Defections &amp; Coalitions</h1>
          <p className="text-[#6b7163] text-sm">Log party defections, coalitions, endorsements, and running-mate announcements. These appear live on the public /political-events page.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg">+ Add Event</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading…</div>
      ) : (
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2c312a] bg-[#141714] text-[#6b7163] uppercase tracking-wider font-bold">
                <th className="p-4">Person</th><th className="p-4">Type</th><th className="p-4">Party Change</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c312a]">
              {events.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-[#6b7163]">No events yet.</td></tr>
              ) : events.map(ev => (
                <tr key={ev.id} className="hover:bg-[#232820]/40 text-zinc-300">
                  <td className="p-4 font-semibold text-white">{ev.politician_name}</td>
                  <td className="p-4 capitalize">{ev.event_type.replace(/_/g, ' ')}</td>
                  <td className="p-4">{[ev.from_party, ev.to_party].filter(Boolean).join(' → ') || '—'}</td>
                  <td className="p-4">{ev.event_date ? new Date(ev.event_date).toLocaleDateString() : '—'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(ev)} className="text-[#00b368] hover:underline">Edit</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1d211b] border border-[#2c312a] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#2c312a] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Event' : 'Add Event'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#6b7163] hover:text-white text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Event Type</label>
                <select value={form.event_type || 'defection'} onChange={e => setForm({ ...form, event_type: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs">
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Politician Name</label>
                <input type="text" required value={form.politician_name || ''} onChange={e => setForm({ ...form, politician_name: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">From Party</label>
                  <input type="text" value={form.from_party || ''} onChange={e => setForm({ ...form, from_party: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">To Party</label>
                  <input type="text" value={form.to_party || ''} onChange={e => setForm({ ...form, to_party: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Event Date</label>
                <input type="date" value={form.event_date || ''} onChange={e => setForm({ ...form, event_date: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
              </div>
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
              </div>
              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Source URL</label>
                <input type="text" value={form.source_url || ''} onChange={e => setForm({ ...form, source_url: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white text-xs" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2c312a]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-zinc-800 text-[#f8f7f2] font-bold rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-lg">{submitting ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
