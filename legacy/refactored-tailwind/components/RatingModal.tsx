'use client';

import { useState } from 'react';

interface RatingModalProps {
  targetId: string;
  targetType: 'official' | 'politician';
  targetName: string;
  onClose: () => void;
  onSubmit?: () => void;
}

const CATEGORIES = [
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

export function RatingModal({ targetId, targetType, targetName, onClose, onSubmit }: RatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overall, setOverall] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerState, setReviewerState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCategoryRating = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (overall === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: targetId,
          target_type: targetType,
          overall,
          ...ratings,
          review_text: reviewText,
          reviewer_state: reviewerState,
          device_hash: '',
        }),
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
          <div className="modal-body" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Thank You!</h2>
            <p style={{ color: 'var(--muted)' }}>Your rating for {targetName} has been submitted anonymously.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Rate {targetName}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Overall Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={`star-pick ${n <= overall ? 'on' : ''}`} onClick={() => setOverall(n)}>★</span>
              ))}
            </div>
          </div>

          <div className="cat-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.key}>
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
            <label className="form-label">Your State (Optional)</label>
            <input
              className="form-control"
              placeholder="e.g. Lagos, Oyo, FCT..."
              value={reviewerState}
              onChange={e => setReviewerState(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
            All ratings are 100% anonymous. No personal data is stored.
          </div>

          <button className="submit-btn" disabled={overall === 0 || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
