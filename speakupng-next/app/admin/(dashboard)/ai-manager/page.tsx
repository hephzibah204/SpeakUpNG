'use client';

import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  official_name: string;
  old_role?: string;
  new_role?: string;
  tier?: string;
  state_code?: string;
  party?: string;
  change_type?: string;
  change_date?: string;
  source?: string;
  headline?: string;
  confidence?: string;
  detected_at?: string;
}

export default function AIManagerPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Article State
  const [artPrompt, setArtPrompt] = useState('');
  const [artTone, setArtTone] = useState('formal');
  const [artResult, setArtResult] = useState('');
  const [generatingArticle, setGeneratingArticle] = useState(false);

  // Social State
  const [socPrompt, setSocPrompt] = useState('');
  const [socPlatform, setSocPlatform] = useState('twitter');
  const [socResult, setSocResult] = useState('');
  const [generatingSocial, setGeneratingSocial] = useState(false);

  // SQL State
  const [sqlPrompt, setSqlPrompt] = useState('');
  const [sqlResult, setSqlResult] = useState('');
  const [generatingSQL, setGeneratingSQL] = useState(false);

  // Audit State
  const [auditResult, setAuditResult] = useState('');
  const [generatingAudit, setGeneratingAudit] = useState(false);

  // Repair State
  const [repairName, setRepairName] = useState('');
  const [repairId, setRepairId] = useState('');
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<any>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch('/api/admin/ai/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    const base = `${alert.official_name} was ${alert.change_type} as ${alert.new_role}${alert.old_role ? ` (previously: ${alert.old_role})` : ''}. Date: ${alert.change_date || 'N/A'}. Source: ${alert.source || 'N/A'}.`;

    setArtPrompt(`Write a news article about: ${base}`);
    setSocPrompt(base);
    setSqlPrompt(`Generate SQL for this government change:\n${JSON.stringify(alert, null, 2)}`);
  };

  const generateArticle = async () => {
    if (!artPrompt.trim()) return;
    setGeneratingArticle(true);
    setArtResult('Generating...');
    try {
      const sys = `You are evote.ng Admin AI. Write a helpful Nigerian governance news article. Tone: ${artTone}. Output plain text with short paragraphs.`;
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: artPrompt },
          ],
          temperature: 0.6,
        }),
      });
      const data = await res.json();
      setArtResult(data.choices?.[0]?.message?.content || 'No output.');
    } catch (err: any) {
      setArtResult(`Error: ${err.message || err}`);
    } finally {
      setGeneratingArticle(false);
    }
  };

  const generateSocial = async () => {
    if (!socPrompt.trim()) return;
    setGeneratingSocial(true);
    setSocResult('Generating...');
    try {
      const limits: Record<string, number> = { twitter: 280, whatsapp: 700, instagram: 2200, facebook: 500 };
      const max = limits[socPlatform] || 280;
      const sys = `You are evote.ng Admin AI. Write 1 social post for ${socPlatform}. Max ${max} characters. Include a clear call-to-action to rate officials on evote.ng. Avoid hashtags spam. Output only the post text.`;
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: socPrompt },
          ],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      setSocResult(data.choices?.[0]?.message?.content || 'No output.');
    } catch (err: any) {
      setSocResult(`Error: ${err.message || err}`);
    } finally {
      setGeneratingSocial(false);
    }
  };

  const generateSQL = async () => {
    if (!sqlPrompt.trim()) return;
    setGeneratingSQL(true);
    setSqlResult('Generating...');
    try {
      const sys = `You are evote.ng Admin AI. Generate PostgreSQL SQL for Vercel/Neon Postgres. Output ONLY SQL (no markdown, no commentary). Keep it safe: prefer SELECT previews, idempotent ALTER TABLE IF NOT EXISTS, and avoid destructive operations unless explicitly requested.`;
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: sqlPrompt },
          ],
          temperature: 0.2,
        }),
      });
      const data = await res.json();
      setSqlResult(data.choices?.[0]?.message?.content || 'No output.');
    } catch (err: any) {
      setSqlResult(`Error: ${err.message || err}`);
    } finally {
      setGeneratingSQL(false);
    }
  };

  const generateAudit = async () => {
    setGeneratingAudit(true);
    setAuditResult('Analyzing site database...');
    try {
      const sys = `You are evote.ng Admin AI. Write concise, actionable site health and database integrity audit reports.`;
      const userPrompt = `Site: evote.ng.\n\nWrite an admin-friendly site health report with:\n- Quick summary (1 paragraph)\n- Top 5 risks\n- Top 10 recommended actions (ordered)\n- SEO checklist\n- Performance checklist\nKeep it concise and actionable.`;
      
      const res = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
        }),
      });
      const data = await res.json();
      setAuditResult(data.choices?.[0]?.message?.content || 'No output.');
    } catch (err: any) {
      setAuditResult(`Error: ${err.message || err}`);
    } finally {
      setGeneratingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">🤖 AI Manager</h1>
        <p className="text-[#6b7163] text-sm">Monitor changes, draft news, generate social content, and audit the system with AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2c312a] pb-3">
        {['monitor', 'articles', 'social', 'sql', 'audit', 'repair'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === tab
                ? 'bg-[#008751]/10 border-[#00b368]/35 text-[#00b368]'
                : 'border-transparent text-[#6b7163] hover:text-zinc-300'
            }`}
          >
            {tab === 'sql' ? 'SQL Patcher' : tab}
          </button>
        ))}
      </div>

      {/* Monitor Tab */}
      {activeTab === 'monitor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-2">Detected Personnel Changes</h2>
              <p className="text-xs text-[#6b7163] mb-6">Select a scan result below to auto-fill the article, social, and SQL tabs.</p>

              {loadingAlerts ? (
                <div className="text-center py-10 text-xs text-[#6b7163]">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#6b7163]">No personnel changes detected recently.</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => handleSelectAlert(a)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between gap-3 ${
                        selectedAlert?.id === a.id
                          ? 'bg-[#008751]/10 border-[#00b368]/40'
                          : 'bg-[#141714] border-[#2c312a] hover:border-zinc-750'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white text-sm">{a.official_name}</div>
                          <div className="text-zinc-450 mt-1">
                            {a.old_role || 'Unknown'} ➔ <strong className="text-[#00b368]">{a.new_role}</strong>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-[#008751]/15 text-[#00b368] rounded font-bold uppercase tracking-wider text-[9px]">
                          {a.change_type}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6b7163] flex gap-3">
                        <span>Source: {a.source}</span>
                        <span>Date: {a.change_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl">
              <h3 className="font-bold text-white mb-4">Selected Change</h3>
              {selectedAlert ? (
                <div className="space-y-4 text-xs">
                  <div className="bg-[#141714] p-4 rounded-xl border border-[#2c312a] space-y-2">
                    <div className="text-[#6b7163] uppercase font-bold text-[9px]">Official Name</div>
                    <div className="font-bold text-white text-sm">{selectedAlert.official_name}</div>

                    <div className="text-[#6b7163] uppercase font-bold text-[9px] mt-3">Action Type</div>
                    <div className="text-[#00b368] font-semibold capitalize">{selectedAlert.change_type}</div>

                    <div className="text-[#6b7163] uppercase font-bold text-[9px] mt-3">New Position</div>
                    <div className="text-zinc-300 font-semibold">{selectedAlert.new_role}</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="w-full py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Generate Announcement Article &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#6b7163]">Select an alert to trigger quick actions.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Write Governance Article</h2>
            <p className="text-xs text-[#6b7163]">Draft formal, accessible, or pidgin news articles using the AI writer.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Prompt & Context</label>
              <textarea
                value={artPrompt}
                onChange={e => setArtPrompt(e.target.value)}
                className="w-full p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-sm text-zinc-250 focus:outline-none focus:border-[#00b368]"
                rows={4}
                placeholder="Enter details of the governance news or event..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Tone & Style</label>
              <div className="flex gap-2">
                {[
                  { id: 'formal', label: '📰 Formal' },
                  { id: 'accessible', label: '📱 Accessible' },
                  { id: 'pidgin', label: '🇳🇬 Pidgin' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setArtTone(t.id)}
                    className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                      artTone === t.id
                        ? 'bg-[#e8a020]/15 border-[#e8a020]/45 text-[#e8a020]'
                        : 'border-[#2c312a] text-[#6b7163]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateArticle}
              disabled={generatingArticle || !artPrompt.trim()}
              className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all"
            >
              {generatingArticle ? 'Drafting Article...' : 'Write Article'}
            </button>
          </div>

          {artResult && (
            <div className="border-t border-[#2c312a] pt-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e8a020]">Generated Output</span>
              <pre className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {artResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Social Tab */}
      {activeTab === 'social' && (
        <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Generate Social Media Posts</h2>
            <p className="text-xs text-[#6b7163]">Draft customized messages for various social networks.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Announcement Subject</label>
              <textarea
                value={socPrompt}
                onChange={e => setSocPrompt(e.target.value)}
                className="w-full p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-sm text-zinc-250 focus:outline-none focus:border-[#00b368]"
                rows={3}
                placeholder="What should this post announce?..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Target Network</label>
              <div className="flex gap-2">
                {[
                  { id: 'twitter', label: '🕩 Twitter/X' },
                  { id: 'whatsapp', label: '📱 WhatsApp' },
                  { id: 'facebook', label: '👥 Facebook' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSocPlatform(p.id)}
                    className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                      socPlatform === p.id
                        ? 'bg-[#a78bfa]/15 border-[#a78bfa]/45 text-[#a78bfa]'
                        : 'border-[#2c312a] text-[#6b7163]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateSocial}
              disabled={generatingSocial || !socPrompt.trim()}
              className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all"
            >
              {generatingSocial ? 'Generating Post...' : 'Write Social Post'}
            </button>
          </div>

          {socResult && (
            <div className="border-t border-[#2c312a] pt-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a78bfa]">Generated Output</span>
              <pre className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {socResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SQL Tab */}
      {activeTab === 'sql' && (
        <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">SQL Patcher</h2>
            <p className="text-xs text-[#6b7163]">Generate Postgres SQL scripts using natural language instructions.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Database Change Description</label>
              <textarea
                value={sqlPrompt}
                onChange={e => setSqlPrompt(e.target.value)}
                className="w-full p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-sm text-zinc-250 focus:outline-none focus:border-[#00b368] font-mono"
                rows={4}
                placeholder="e.g., Change Ondo State Governor to Lucky Aiyedatiwa, APC, sworn in Dec 2023."
              />
            </div>

            <button
              onClick={generateSQL}
              disabled={generatingSQL || !sqlPrompt.trim()}
              className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all"
            >
              {generatingSQL ? 'Generating SQL...' : 'Generate SQL Patch'}
            </button>
          </div>

          {sqlResult && (
            <div className="border-t border-[#2c312a] pt-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4f8ef7]">Generated Postgres SQL</span>
              <pre className="p-4 bg-[#040b14] border border-[#2c312a] rounded-xl text-xs text-emerald-400 font-mono overflow-x-auto">
                {sqlResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Repair Tab */}
      {activeTab === 'repair' && (
        <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Repair Official Profile</h2>
            <p className="text-xs text-[#6b7163]">Fetch missing bio and photo from Wikipedia for a specific official. Paste the official ID from the Officials admin page.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Official ID (UUID)</label>
              <input
                type="text"
                value={repairId}
                onChange={e => setRepairId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-..."
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-xl text-xs text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-2">Official Name (as on Wikipedia)</label>
              <input
                type="text"
                value={repairName}
                onChange={e => setRepairName(e.target.value)}
                placeholder="e.g. Babajide Sanwo-Olu"
                className="w-full p-3 bg-[#141714] border border-[#2c312a] rounded-xl text-xs text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
              />
            </div>
          </div>

          <button
            onClick={async () => {
              if (!repairId.trim() || !repairName.trim()) return;
              setRepairing(true);
              setRepairResult(null);
              try {
                const res = await fetch('/api/ai/repair-official', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ official_id: repairId.trim(), name: repairName.trim() }),
                });
                setRepairResult(await res.json());
              } catch (err: any) {
                setRepairResult({ error: err.message });
              } finally {
                setRepairing(false);
              }
            }}
            disabled={repairing || !repairId.trim() || !repairName.trim()}
            className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all"
          >
            {repairing ? 'Fetching from Wikipedia…' : 'Repair Profile'}
          </button>

          {repairResult && (
            <div className={`border rounded-xl p-4 text-xs ${repairResult.error ? 'border-red-800/40 bg-red-900/10' : 'border-[#008751]/30 bg-[#008751]/5'}`}>
              {repairResult.error ? (
                <p className="text-red-400">{repairResult.error}</p>
              ) : repairResult.updated ? (
                <div className="space-y-2">
                  <p className="font-bold text-[#00b368]">Profile updated successfully</p>
                  <p className="text-[#6b7163]">Fields updated: <span className="text-white">{(repairResult.fields_updated || []).join(', ')}</span></p>
                </div>
              ) : (
                <p className="text-[#6b7163]">{repairResult.message || 'No changes needed.'}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-[#1d211b] border border-[#2c312a] p-6 rounded-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Site & Database Audit</h2>
            <p className="text-xs text-[#6b7163]">Perform an AI-powered diagnostic scan of database health and SEO integrity.</p>
          </div>

          <button
            onClick={generateAudit}
            disabled={generatingAudit}
            className="px-5 py-3 bg-[#008751] hover:bg-[#00b368] disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs transition-all"
          >
            {generatingAudit ? 'Running Audit Scan...' : 'Generate AI Site Report'}
          </button>

          {auditResult && (
            <div className="border-t border-[#2c312a] pt-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00b368]">AI Audit Report</span>
              <pre className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {auditResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
