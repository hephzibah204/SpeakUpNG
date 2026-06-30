'use client';

import { useState } from 'react';

interface ReportModalProps {
  targetId: string;
  targetType: 'official' | 'politician';
  targetName: string;
  onClose: () => void;
  onSubmit?: () => void;
}

const REPORT_TAGS = [
  'Corruption / Bribery',
  'Abuse of Office',
  'Embezzlement',
  'Negligence of Duty',
  'Harassment',
  'Election Malpractice',
  'Human Rights Abuse',
  'Financial Misconduct',
  'Other',
];

export function ReportModal({ targetId, targetType, targetName, onClose, onSubmit }: ReportModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);

    const anonId = localStorage.getItem('nr_anon_id') || 'anon-' + Math.random().toString(36).substring(2, 12);
    if (!localStorage.getItem('nr_anon_id')) {
      localStorage.setItem('nr_anon_id', anonId);
    }

    const payload = {
      official_id: targetType === 'official' ? targetId : undefined,
      politician_id: targetType === 'politician' ? targetId : undefined,
      anon_id: anonId,
      description,
      evidence_url: evidenceUrl || undefined,
      is_anonymous: isAnonymous,
      categories: selectedTags,
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => onSubmit?.(), 1500);
      } else {
        alert('Failed to submit report.');
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
          <div className="modal-body" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Submitted</h2>
            <p style={{ color: 'var(--muted)' }}>Thank you for submitting this report for {targetName}. It will be moderated anonymously.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🚨 Report Misconduct</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <div className="form-label">Category of Misconduct</div>
            <div className="report-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {REPORT_TAGS.map(tag => {
                const isActive = selectedTags.includes(tag);
                return (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`report-tag ${isActive ? 'on' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description of Misconduct</label>
            <textarea
              className="form-control"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Describe the misconduct. Be specific — dates, locations, and details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Evidence / Source Link (Optional)</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://..."
              value={evidenceUrl}
              onChange={e => setEvidenceUrl(e.target.value)}
            />
          </div>

          <div className="toggle-row" onClick={() => setIsAnonymous(!isAnonymous)} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
            <div className={`toggle ${isAnonymous ? 'on' : ''}`} />
            <div>
              <div style={{ fontSize: '0.87rem', fontWeight: 500 }}>Submit Anonymously</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Enabled by default for your protection</div>
            </div>
          </div>

          <button className="submit-btn danger-btn" disabled={!description.trim() || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit Misconduct Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
