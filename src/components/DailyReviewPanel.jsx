import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Sparkles, Star, Target, Zap } from 'lucide-react';
import { getTodayDailyReview, saveDailyReview } from '../utils/storage';

const emptyReview = {
  workRating: 5,
  energyRating: 5,
  focusLostReason: '',
  goodThing: '',
};

export default function DailyReviewPanel({ isOpen, onClose }) {
  const [formData, setFormData] = useState(emptyReview);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const todayReview = getTodayDailyReview();
      setFormData(todayReview ? { ...emptyReview, ...todayReview } : emptyReview);
      setSubmitted(false);
    }
  }, [isOpen]);

  const renderRatingPills = (field, currentValue) => (
    <div className="pill-rating-container">
      {Array.from({ length: 10 }, (_, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            className={`pill-rating-btn ${currentValue === val ? 'active' : ''}`}
            onClick={() => setFormData((prev) => ({ ...prev, [field]: val }))}
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
  };

  return (
    <div className={`overlay-panel ${isOpen ? 'open' : ''}`}>
      <div className="overlay-header">
        <button className="icon-btn" onClick={onClose} title="Back" aria-label="Back to Timer">
          <ArrowLeft size={16} />
        </button>
        <h3 className="overlay-title">Daily Review</h3>
      </div>

      <div className="overlay-content">
        {submitted ? (
          <div className="review-saved-state">
            <Sparkles size={44} />
            <h2>Review Saved</h2>
            <p>You can reopen this panel to edit today&apos;s review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="daily-review-form">
            <p className="panel-note">One review is saved per day.</p>

            <div className="form-group">
              <label>
                <Target size={14} />
                Today&apos;s work
              </label>
              {renderRatingPills('workRating', formData.workRating)}
            </div>

            <div className="form-group">
              <label>
                <Zap size={14} />
                Energy
              </label>
              {renderRatingPills('energyRating', formData.energyRating)}
            </div>

            <div className="form-group">
              <label>If focus slipped, what caused it?</label>
              <textarea
                className="form-input textarea-input"
                value={formData.focusLostReason}
                onChange={(e) => setFormData((prev) => ({ ...prev, focusLostReason: e.target.value }))}
                placeholder="e.g. Slack pings. Tomorrow I will enable DND."
              />
            </div>

            <div className="form-group">
              <label>
                <Star size={14} />
                One good thing
              </label>
              <textarea
                className="form-input textarea-input"
                value={formData.goodThing}
                onChange={(e) => setFormData((prev) => ({ ...prev, goodThing: e.target.value }))}
                placeholder="e.g. Finished the hardest part of the feature."
              />
            </div>

            <button type="submit" className="btn-primary">
              <Save size={18} />
              Save Daily Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
