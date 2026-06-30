'use client';

import { useState, useEffect } from 'react';

interface Politician {
  id: string;
  full_name: string;
  common_name?: string;
  party: string;
  aspiration_title?: string;
  photo_url?: string;
  profile_bio?: string;
  bio?: string;
  status: string;
}

export default function AdminPoliticiansPage() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit/Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPolitician, setEditingPolitician] = useState<Politician | null>(null);
  const [formData, setFormData] = useState<Partial<Politician>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPoliticians();
  }, [search, page]);

  const fetchPoliticians = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/politicians?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      setPoliticians(data.politicians || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load politicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPolitician(null);
    setFormData({
      full_name: '',
      common_name: '',
      party: '',
      aspiration_title: '',
      photo_url: '',
      profile_bio: '',
      bio: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pol: Politician) => {
    setEditingPolitician(pol);
    setFormData({ ...pol });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingPolitician ? `/api/admin/politicians/${editingOfficialId(editingPolitician.id)}` : '/api/admin/politicians';
      const method = editingPolitician ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchPoliticians();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save politician');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const editingOfficialId = (id: string) => id;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to set this politician as inactive?')) return;
    try {
      const res = await fetch(`/api/admin/politicians/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPoliticians();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white mb-2">Manage Politicians</h1>
          <p className="text-[#6b7163] text-sm">Add, update, or deactivate political figures and aspirants.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg transition-all"
        >
          + Add Politician
        </button>
      </div>

      <div className="bg-[#1d211b] border border-[#2c312a] p-5 rounded-xl flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, party..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-[#2c312a] rounded-lg bg-[#141714] text-[#f8f7f2] placeholder-zinc-500 focus:outline-none focus:border-[#00b368] text-xs w-64"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6b7163]">Loading politicians...</div>
      ) : (
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2c312a] bg-[#141714] text-[#6b7163] uppercase tracking-wider font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Party</th>
                  <th className="p-4">Aspiration</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2c312a]">
                {politicians.map((pol) => (
                  <tr key={pol.id} className="hover:bg-[#232820]/40 text-zinc-300">
                    <td className="p-4 font-semibold text-white">{pol.full_name}</td>
                    <td className="p-4 uppercase">{pol.party}</td>
                    <td className="p-4">{pol.aspiration_title || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pol.status === 'active' ? 'bg-[#008751]/15 text-[#00b368]' : 'bg-red-950/20 text-red-400'
                      }`}>
                        {pol.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(pol)}
                        className="text-[#00b368] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pol.id)}
                        className="text-red-400 hover:underline"
                      >
                        Deactivate
                      </button>
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
              <h3 className="text-lg font-bold text-white">
                {editingPolitician ? `Edit ${editingPolitician.full_name}` : 'Add Politician'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-450 hover:text-white">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name || ''}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Common Name</label>
                  <input
                    type="text"
                    value={formData.common_name || ''}
                    onChange={e => setFormData({ ...formData, common_name: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Political Party</label>
                  <input
                    type="text"
                    required
                    value={formData.party || ''}
                    onChange={e => setFormData({ ...formData, party: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Aspiration / Title</label>
                  <input
                    type="text"
                    value={formData.aspiration_title || ''}
                    onChange={e => setFormData({ ...formData, aspiration_title: e.target.value })}
                    className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                    placeholder="e.g. Presidential Aspirant 2027"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Photo URL</label>
                <input
                  type="text"
                  value={formData.photo_url || ''}
                  onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Mandate / Profile Bio Summary</label>
                <textarea
                  value={formData.profile_bio || ''}
                  onChange={e => setFormData({ ...formData, profile_bio: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[#6b7163] font-bold mb-1.5 uppercase">Detailed Biography</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-white"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2c312a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-[#f8f7f2] font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 bg-[#008751] hover:bg-[#00b368] disabled:bg-[#008751]/50 text-white font-bold rounded-lg"
                >
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
