'use client';

import { useState } from 'react';

interface RatingModalProps {
  targetId: string;
  targetType: 'official' | 'politician';
  targetName: string;
  categoriesConfig?: {
    labels: Record<string, string>;
    visible: string[];
  };
  onClose: () => void;
  onSubmit?: () => void;
}

export function RatingModal({ targetId, targetType, targetName, categoriesConfig, onClose, onSubmit }: RatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState('');
  const [reviewerState, setReviewerState] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getCategories = () => {
    if (categoriesConfig) {
      return categoriesConfig.visible.map(key => ({
        key,
        label: categoriesConfig.labels[key] || key
      }));
    }
    return targetType === 'politician' 
      ? [
          { key: 'accountability', label: 'Integrity & Trust' },
          { key: 'service', label: 'Track Record' },
          { key: 'transparency', label: 'Policy Transparency' },
          { key: 'responsiveness', label: 'Public Engagement' },
          { key: 'power', label: 'Leadership Capacity' },
          { key: 'economic_stability', label: 'Economic Plan' },
          { key: 'education', label: 'Education Plan' },
          { key: 'healthcare', label: 'Healthcare Plan' },
        ]
      : [
          { key: 'accountability', label: 'Accountability' },
          { key: 'service', label: 'Service Delivery' },
          { key: 'transparency', label: 'Transparency' },
          { key: 'responsiveness', label: 'Responsiveness' },
          { key: 'power', label: 'Power & Influence' },
          { key: 'security', label: 'Security' },
          { key: 'economic_stability', label: 'Economic Stability' },
          { key: 'education', label: 'Education' },
          { key: 'healthcare', label: 'Healthcare' },
        ];
  };

  const categories = getCategories();

  const handleCategoryRating = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const hasCategoryRatings = Object.values(ratings).some(v => v > 0);
  const canSubmit = hasCategoryRatings && !submitting && (isAnonymous || reviewerName.trim() !== '');

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    
    const anonId = localStorage.getItem('nr_anon_id') || 'anon-' + Math.random().toString(36).substring(2, 12);
    if (!localStorage.getItem('nr_anon_id')) {
      localStorage.setItem('nr_anon_id', anonId);
    }

    const vals = Object.values(ratings).filter(v => v > 0);
    const finalOverall = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;

    const payload: any = {
      overall: finalOverall,
      ...ratings,
      review_text: reviewText,
      reviewer_state: reviewerState,
      reviewer_name: isAnonymous ? 'Anonymous' : reviewerName,
      device_hash: anonId,
    };

    if (targetType === 'official') {
      payload.official_id = targetId;
    } else {
      payload.politician_id = targetId;
    }

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => onSubmit?.(), 1500);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay open" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
          <div className="modal-body" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank You!</h2>
            <p style={{ color: 'var(--muted)' }}>Your rating for {targetName} has been submitted successfully.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rate {targetName}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="cat-grid">
            {categories.map(cat => (
              <div key={cat.key} className="cat-item">
                <div className="cat-label">{cat.label}</div>
                <div className="cat-stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={`cat-star ${n <= (ratings[cat.key] || 0) ? 'on' : ''}`} onClick={() => handleCategoryRating(cat.key, n)}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Review (Optional)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Share your thoughts about this official's performance..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Location / State (Optional)</label>
            <input
              className="form-control"
              placeholder="e.g. Lagos, Oyo, FCT..."
              value={reviewerState}
              onChange={e => setReviewerState(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 mb-4 mt-2">
            <input
              type="checkbox"
              id="anon-checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-[#2c312a] bg-[#141714] text-[#00b368] focus:ring-0"
              style={{ accentColor: '#00b368' }}
            />
            <label htmlFor="anon-checkbox" className="text-xs font-semibold uppercase tracking-wider text-[#6b7163] cursor-pointer select-none">
              Remain Anonymous
            </label>
          </div>

          {!isAnonymous && (
            <div className="form-group animate-fadeIn">
              <label className="form-label">Your Name</label>
              <input
                className="form-control"
                placeholder="Enter your name"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
            {isAnonymous ? 'All ratings are 100% anonymous. No personal data is stored.' : 'Your rating will be submitted with your name.'}
          </div>

          <button className="submit-btn" disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
