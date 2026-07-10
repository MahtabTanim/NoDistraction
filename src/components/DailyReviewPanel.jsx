import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Zap, Target, Star } from 'lucide-react';
import { saveDailyReview } from '../utils/storage';

export default function DailyReviewPanel({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    workRating: 5,
    energyRating: 5,
    focusLostReason: '',
    goodThing: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const renderRatingPills = (field, currentValue) => (
    <div className="pill-rating-container">
      {[...Array(10)].map((_, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            className={`pill-rating-btn ${currentValue === val ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, [field]: val }))}
          >
            {val}
          </button>
        );
      })}
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    saveDailyReview(formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        workRating: 5,
        energyRating: 5,
        focusLostReason: '',
        goodThing: ''
      });
    }, 1500);
  };

  return (
    <div className={`overlay-panel ${isOpen ? 'open' : ''}`}>
      <div className="overlay-header">
        <button className="icon-btn" onClick={onClose} title="Back">
          <ArrowLeft size={16} />
        </button>
        <h3 className="overlay-title">Daily Review</h3>
      </div>

      <div className="overlay-content">
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--color-accent-break)' }}>
            <Sparkles size={48} />
            <h2>Review Saved!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Great work today. See you tomorrow.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Take a moment to reflect on your day before fully disconnecting.
            </p>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> How do you rate yourself out of 10 for today's work?</label>
              {renderRatingPills('workRating', formData.workRating)}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> How was your energy out of 10?</label>
              {renderRatingPills('energyRating', formData.energyRating)}
            </div>

            <div className="form-group">
              <label>If you lost focus, what was the reason? How do you plan to overcome this?</label>
              <textarea
                className="form-input textarea-input"
                style={{ height: '80px' }}
                value={formData.focusLostReason}
                onChange={e => setFormData(prev => ({ ...prev, focusLostReason: e.target.value }))}
                placeholder="e.g. Got sidetracked by a Slack ping. Tomorrow I'll use DND mode."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} /> Good thing that happened today, thing you are proud of</label>
              <textarea
                className="form-input textarea-input"
                style={{ height: '80px' }}
                value={formData.goodThing}
                onChange={e => setFormData(prev => ({ ...prev, goodThing: e.target.value }))}
                placeholder="e.g. Successfully cracked the complex state management bug."
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              <Save size={18} /> Save Daily Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
