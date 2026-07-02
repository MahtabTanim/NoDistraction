import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

const DISTRACTION_OPTIONS = ['Phone', 'Noise', 'Internet', 'Other', 'None'];

export default function SetupForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({ ...initialData });

  const handleRatingClick = (field, rating) => {
    setFormData((prev) => ({ ...prev, [field]: rating }));
  };

  const handleDistractionClick = (option) => {
    setFormData((prev) => {
      let current = [...prev.distractions];
      if (option === 'None') {
        current = ['None'];
      } else {
        current = current.filter((item) => item !== 'None');
        if (current.includes(option)) {
          current = current.filter((item) => item !== option);
        } else {
          current.push(option);
        }
        if (current.length === 0) {
          current = ['None'];
        }
      }
      return { ...prev, distractions: current };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.outcome.trim()) {
      alert('Please define the outcome of the session.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="setup-form">
      <h3 className="form-title">Configure Focus Session</h3>

      {/* 1. Outcome */}
      <div className="form-group">
        <label>1. What will be the outcome of the session?</label>
        <input
          type="text"
          value={formData.outcome}
          onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
          className="form-input"
          placeholder="e.g. Code the login UI, write draft article"
          required
        />
      </div>

      {/* 2. Workspace Rating */}
      <div className="form-group">
        <label>2. Rate your place of work (1 - 10)</label>
        <div className="pill-rating-container">
          {[...Array(10)].map((_, i) => {
            const val = i + 1;
            return (
              <button
                key={val}
                type="button"
                className={`pill-rating-btn ${formData.workspaceRating === val ? 'active' : ''}`}
                onClick={() => handleRatingClick('workspaceRating', val)}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Distractions */}
      <div className="form-group">
        <label>3. Is there any active distraction?</label>
        <div className="tag-container">
          {DISTRACTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`tag-btn ${formData.distractions.includes(opt) ? 'active' : ''} ${
                opt === 'None' ? 'none-tag' : ''
              }`}
              onClick={() => handleDistractionClick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Activation Ritual */}
      <div className="form-group">
        <label>4. What is your activation ritual?</label>
        <input
          type="text"
          value={formData.activationRitual}
          onChange={(e) => setFormData((prev) => ({ ...prev, activationRitual: e.target.value }))}
          className="form-input"
          placeholder="e.g. Put phone in drawer, take 3 deep breaths"
        />
      </div>

      {/* 6 (skip 5 as per user requirements). Energy Rating */}
      <div className="form-group">
        <label>5. How energized are you? (1 - 10)</label>
        <div className="pill-rating-container">
          {[...Array(10)].map((_, i) => {
            const val = i + 1;
            return (
              <button
                key={val}
                type="button"
                className={`pill-rating-btn ${formData.energyRating === val ? 'active' : ''}`}
                onClick={() => handleRatingClick('energyRating', val)}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Things Not To Do */}
      <div className="form-group">
        <label>6. Things NOT to do in this session</label>
        <input
          type="text"
          value={formData.thingsNotToDo}
          onChange={(e) => setFormData((prev) => ({ ...prev, thingsNotToDo: e.target.value }))}
          className="form-input"
          placeholder="e.g. No Twitter, no email checks, no phone"
        />
      </div>

      {/* 7. Closing Ritual */}
      <div className="form-group">
        <label>7. Closing ritual steps (separated by commas)</label>
        <textarea
          value={formData.closingRitual}
          onChange={(e) => setFormData((prev) => ({ ...prev, closingRitual: e.target.value }))}
          className="form-input textarea-input"
          placeholder="e.g. Tidy workspace, close project tabs, write notes for tomorrow"
        />
      </div>

      {/* 8. Session Time */}
      <div className="form-group slider-group">
        <div className="slider-header">
          <label>8. Session Duration</label>
          <span className="slider-val">{formData.duration} mins</span>
        </div>
        <input
          type="range"
          min="5"
          max="120"
          step="5"
          value={formData.duration}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))
          }
          className="slider-input"
        />
      </div>

      {/* 9. Expected Break */}
      <div className="form-group slider-group">
        <div className="slider-header">
          <label>9. Expected Break Duration</label>
          <span className="slider-val">{formData.breakDuration} mins</span>
        </div>
        <input
          type="range"
          min="1"
          max="60"
          step="1"
          value={formData.breakDuration}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, breakDuration: parseInt(e.target.value) }))
          }
          className="slider-input"
        />
      </div>

      <button type="submit" className="btn-primary">
        <Play size={18} fill="currentColor" /> Start Focus Session
      </button>
    </form>
  );
}
