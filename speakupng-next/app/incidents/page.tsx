'use client';

import { useState, useEffect } from 'react';

interface IncidentReport {
  id: string;
  description: string;
  photo_url?: string;
  category: string;
  status: string;
  created_at: string;
  state?: string;
  lga?: string;
  polling_unit?: string;
}

const INCIDENT_CATEGORIES = [
  { key: 'vote_buying', label: '💸 Vote Buying / Inducement' },
  { key: 'violence', label: '⚠️ Violence / Clashes' },
  { key: 'ballot_snatching', label: '🗳️ Ballot Box Snatching' },
  { key: 'missing_materials', label: '📦 Missing / Insufficient Materials' },
  { key: 'delayed_officials', label: '⏳ Delayed INEC Officials' },
  { key: 'card_reader_failure', label: '📱 BVAS / Card Reader Failure' },
  { key: 'intimidation', label: '🛑 Voter Intimidation / Harassment' },
  { key: 'fake_polling_unit', label: '🏠 Fake Polling Unit' },
  { key: 'other', label: '❓ Other' },
];

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

export default function IncidentsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('vote_buying');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('');
  const [pollingUnit, setPollingUnit] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [submitSuccess]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setReports(data.incidents || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    let device_hash = localStorage.getItem('nr_anon_id');
    if (!device_hash) {
      device_hash = 'anon-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nr_anon_id', device_hash);
    }

    const payload = {
      category,
      description,
      state,
      lga,
      polling_unit: pollingUnit,
      photo_url: evidenceUrl,
      lat: coords?.lat,
      lng: coords?.lng,
      device_hash,
    };

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setDescription('');
        setLga('');
        setPollingUnit('');
        setEvidenceUrl('');
        setCoords(null);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center sm:text-left border-b border-[#2c312a] pb-6">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Election Incident Reporting</h1>
          <p className="text-lg text-[#6b7163]">
            Crowdsource and monitor verified election day anomalies in real-time. Secure, anonymous, and powered by citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Report Form */}
          <div className="lg:col-span-5 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold font-display text-white mb-6">Submit Incident Report</h2>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-[#008751]/10 border border-[#008751]/20 rounded-lg text-[#00b368] text-sm text-center">
                ✓ Report submitted successfully. Our moderators will verify the incident.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Incident Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors">
                  {INCIDENT_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368] transition-colors">
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">LGA (Optional)</label>
                  <input type="text" placeholder="e.g. Ikeja" value={lga} onChange={(e) => setLga(e.target.value)}
                    className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] placeholder-zinc-650 focus:outline-none focus:border-[#00b368] transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Polling Unit / Ward (Optional)</label>
                <input type="text" placeholder="e.g. PU 02, Ward 4" value={pollingUnit} onChange={(e) => setPollingUnit(e.target.value)}
                  className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] placeholder-zinc-650 focus:outline-none focus:border-[#00b368] transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">GPS Location (Optional)</label>
                <button type="button" onClick={captureLocation} disabled={locating}
                  className="px-4 py-2 border border-[#2c312a] hover:border-zinc-600 text-[#00b368] text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
                  {locating ? 'Getting location…' : coords ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '📍 Capture GPS Location'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Describe what happened</label>
                <textarea rows={4} required placeholder="Provide details about the incident. Avoid mentioning names of private citizens."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-zinc-650 resize-vertical focus:outline-none focus:border-[#00b368]" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Evidence Link (Photo/Video URL)</label>
                <input type="url" placeholder="https://example.com/photo.jpg" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-[#2c312a] rounded-lg bg-[#141714] text-sm text-[#f8f7f2] placeholder-zinc-650 focus:outline-none focus:border-[#00b368] transition-colors" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors mt-4 shadow-lg">
                {submitting ? 'Submitting Report...' : 'Submit Report 🔒'}
              </button>
              <p className="text-[10px] text-[#6b7163] text-center">Reports are submitted anonymously by device, with no personal data required.</p>
            </form>
          </div>

          {/* Incident Feed */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold font-display text-white">Recent Incident Feed</h2>

            {loading ? (
              <div className="text-center py-20 bg-[#1d211b]/50 border border-[#2c312a] rounded-2xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
                <p className="mt-2 text-xs text-[#6b7163]">Loading incident feed...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 bg-[#1d211b]/50 border border-[#2c312a] rounded-2xl">
                <p className="text-sm text-[#6b7163]">No incidents reported yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const catLabel = INCIDENT_CATEGORIES.find(c => c.key === report.category)?.label || report.category;
                  return (
                    <div key={report.id} className="bg-[#1d211b] border border-[#2c312a] rounded-xl p-5 shadow-lg">
                      <div className="flex flex-wrap justify-between items-center gap-3 mb-3 text-xs">
                        <span className="px-2.5 py-0.5 bg-[#141714] border border-[#2c312a] text-white rounded font-bold uppercase tracking-wider">
                          {catLabel}
                        </span>
                        <span className="text-[#6b7163] font-semibold">{new Date(report.created_at).toLocaleString()}</span>
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{report.description}</p>

                      <div className="flex flex-wrap justify-between items-center gap-3 pt-3.5 border-t border-[#2c312a]/45 text-xs text-[#6b7163] font-bold">
                        <span>📍 {report.state} {report.lga ? `· ${report.lga}` : ''} {report.polling_unit ? `· ${report.polling_unit}` : ''}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                            report.status === 'verified' ? 'border-[#008751]/30 bg-[#008751]/10 text-[#00b368]' :
                            report.status === 'escalated' ? 'border-[#e8a020]/30 bg-[#e8a020]/10 text-[#e8a020]' :
                            report.status === 'rejected' ? 'border-[#c0392b]/30 bg-[#c0392b]/10 text-[#e57368]' :
                            'border-zinc-700 bg-zinc-800 text-zinc-400'
                          }`}>
                            {report.status || 'pending'}
                          </span>
                          {report.photo_url && (
                            <a href={report.photo_url} target="_blank" rel="noopener noreferrer" className="text-[#00b368] hover:underline">
                              Evidence 🔗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
