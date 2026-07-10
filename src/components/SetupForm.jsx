import React, { useState } from 'react';
import { Play } from 'lucide-react';

const DISTRACTION_OPTIONS = ['Phone', 'Noise', 'Internet', 'Other', 'None'];

export default function SetupForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({ ...initialData, preset: initialData.preset || 'custom', cycles: initialData.cycles || 1 });

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    if (preset === 'standard') {
      setFormData(prev => ({ ...prev, preset, duration: 25, breakDuration: 5, cycles: 4 }));
    } else if (preset === 'focus') {
      setFormData(prev => ({ ...prev, preset, duration: 90, breakDuration: 20, cycles: 1 }));
    } else {
      setFormData(prev => ({ ...prev, preset }));
    }
  };

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

  const renderRatingPills = (field, currentValue) => (
    <div className="pill-rating-container">
      {[...Array(10)].map((_, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            className={`pill-rating-btn ${currentValue === val ? 'active' : ''}`}
            onClick={() => handleRatingClick(field, val)}
          >
            {val}
          </button>
        );
      })}
    </div>
  );

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

      <div className="form-group">
        <label>Session Preset</label>
        <select 
          className="form-input" 
          value={formData.preset} 
          onChange={handlePresetChange}
          style={{ cursor: 'pointer' }}
        >
          <option value="custom">Custom</option>
          <option value="standard">Standard (4x 25m/5m)</option>
          <option value="focus">Focus Protocol (1x 90m/20m)</option>
        </select>
      </div>

      {/* 1. Outcome */}
      <div className="form-group">
        <label>Define the win (one concrete sentence)</label>
        <input
          type="text"
          value={formData.outcome}
          onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
          className="form-input"
          placeholder="e.g. Finish the API integration for the checkout flow"
          required
        />
      </div>

      {/* 2. Workspace Rating */}
      <div className="form-group">
        <label>Rate your current place of work</label>
        {renderRatingPills('workspaceRating', formData.workspaceRating)}
      </div>

      {/* 3. Distractions */}
      <div className="form-group">
        <label>Is there any active distraction?</label>
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
        <label>What is your activation ritual? (comma-separated)</label>
        <input
          type="text"
          value={formData.activationRitual}
          onChange={(e) => setFormData((prev) => ({ ...prev, activationRitual: e.target.value }))}
          className="form-input"
          placeholder="e.g. Phone in another room, clear desk, close Slack, deep breath"
        />
      </div>

      {/* 6 (skip 5 as per user requirements). Energy Rating */}
      <div className="form-group">
        <label>How energized are you?</label>
        {renderRatingPills('energyRating', formData.energyRating)}
      </div>

      {/* 6. Things Not To Do */}
      <div className="form-group">
        <label>Things not to do in this session (comma-separated)</label>
        <input
          type="text"
          value={formData.thingsNotToDo}
          onChange={(e) => setFormData((prev) => ({ ...prev, thingsNotToDo: e.target.value }))}
          className="form-input"
          placeholder="e.g. No checking email, no social media, no opening new browser tabs"
        />
      </div>

      {/* 7. Closing Ritual */}
      <div className="form-group">
        <label>Closing ritual steps (comma-separated)</label>
        <textarea
          value={formData.closingRitual}
          onChange={(e) => setFormData((prev) => ({ ...prev, closingRitual: e.target.value }))}
          className="form-input textarea-input"
          placeholder="e.g. Commit code, clear desk, write down top priority for tomorrow"
        />
      </div>

      {/* 8. Session Time */}
      {formData.preset === 'custom' && (
        <>
          <div className="form-group slider-group">
            <div className="slider-header">
              <label>Work Duration</label>
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

          <div className="form-group slider-group">
            <div className="slider-header">
              <label>Break Duration</label>
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

          <div className="form-group slider-group">
            <div className="slider-header">
              <label>Number of Cycles</label>
              <span className="slider-val">{formData.cycles} {formData.cycles === 1 ? 'cycle' : 'cycles'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={formData.cycles}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cycles: parseInt(e.target.value) }))
              }
              className="slider-input"
            />
          </div>
        </>
      )}

      {formData.preset !== 'custom' && (
        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {formData.preset === 'standard' && (
            <p>Will run 4 cycles of 25m work / 5m break.</p>
          )}
          {formData.preset === 'focus' && (
            <p>Will run 1 deep cycle of 90m work / 20m break.</p>
          )}
        </div>
      )}

      <button type="submit" className="btn-primary">
        <Play size={18} fill="currentColor" /> Start Focus Session
      </button>
    </form>
  );
}
