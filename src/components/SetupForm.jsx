import React, { useMemo, useState } from 'react';
import { Play } from 'lucide-react';

const DISTRACTION_OPTIONS = ['Phone', 'Noise', 'Internet', 'Other', 'None'];

export default function SetupForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    ...initialData,
    preset: initialData.preset || 'custom',
    cycles: initialData.cycles || 1,
  });

  const totalPlannedMinutes = useMemo(() => {
    const work = Number(formData.duration) || 0;
    const rest = Number(formData.breakDuration) || 0;
    const cycles = Number(formData.cycles) || 1;
    return work * cycles + rest * Math.max(0, cycles - 1);
  }, [formData.breakDuration, formData.cycles, formData.duration]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    if (preset === 'standard') {
      setFormData((prev) => ({ ...prev, preset, duration: 25, breakDuration: 5, cycles: 4 }));
    } else if (preset === 'focus') {
      setFormData((prev) => ({ ...prev, preset, duration: 90, breakDuration: 20, cycles: 1 }));
    } else if (preset === 'extended') {
      setFormData((prev) => ({ ...prev, preset, duration: 40, breakDuration: 10, cycles: 3 }));
    } else {
      setFormData((prev) => ({ ...prev, preset }));
    }
  };

  const handleDistractionClick = (option) => {
    setFormData((prev) => {
      let current = [...prev.distractions];
      if (option === 'None') {
        current = ['None'];
      } else {
        current = current.filter((item) => item !== 'None');
        current = current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option];
        if (current.length === 0) current = ['None'];
      }
      return { ...prev, distractions: current };
    });
  };

  const renderRatingPills = (field, currentValue) => (
    <div className="pill-rating-container">
      {Array.from({ length: 10 }, (_, i) => {
        const val = i + 1;
        return (
          <button
            key={val}
            type="button"
            className={`pill-rating-btn ${currentValue === val ? 'active' : ''}`}
            onClick={() => updateField(field, val)}
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
      alert('Define the win before starting.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="setup-form">
      <h3 className="form-title">Configure Focus Session</h3>

      <div className="form-group">
        <label>Session Preset</label>
        <select className="form-input" value={formData.preset} onChange={handlePresetChange}>
          <option value="custom">Custom</option>
          <option value="standard">Standard (4x 25m/5m)</option>
          <option value="focus">Focus Protocol (1x 90m/20m)</option>
          <option value="extended">Extended Protocol (3x 40m/10m)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Define win</label>
        <input
          type="text"
          value={formData.outcome}
          onChange={(e) => updateField('outcome', e.target.value)}
          className="form-input"
          placeholder="e.g. Finish checkout API integration"
          required
        />
      </div>

      {formData.preset === 'custom' ? (
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
              onChange={(e) => updateField('duration', parseInt(e.target.value, 10))}
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
              onChange={(e) => updateField('breakDuration', parseInt(e.target.value, 10))}
              className="slider-input"
            />
          </div>

          <div className="form-group slider-group">
            <div className="slider-header">
              <label>Cycles</label>
              <span className="slider-val">{formData.cycles}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={formData.cycles}
              onChange={(e) => updateField('cycles', parseInt(e.target.value, 10))}
              className="slider-input"
            />
          </div>
        </>
      ) : (
        <p className="preset-summary">
          {formData.cycles}x {formData.duration}m work / {formData.breakDuration}m break
        </p>
      )}

      <p className="session-total">Planned: {totalPlannedMinutes} minutes</p>

      <details className="advanced-session-options">
        <summary>Optional setup</summary>

        <div className="form-group">
          <label>Current workspace</label>
          {renderRatingPills('workspaceRating', formData.workspaceRating)}
        </div>

        <div className="form-group">
          <label>Active distractions</label>
          <div className="tag-container">
            {DISTRACTION_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`tag-btn ${formData.distractions.includes(opt) ? 'active' : ''} ${opt === 'None' ? 'none-tag' : ''}`}
                onClick={() => handleDistractionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Activation ritual</label>
          <input
            type="text"
            value={formData.activationRitual}
            onChange={(e) => updateField('activationRitual', e.target.value)}
            className="form-input"
            placeholder="e.g. Phone away, clear desk, close Slack"
          />
        </div>

        <div className="form-group">
          <label>Energy</label>
          {renderRatingPills('energyRating', formData.energyRating)}
        </div>

        <div className="form-group">
          <label>Things to avoid</label>
          <input
            type="text"
            value={formData.thingsNotToDo}
            onChange={(e) => updateField('thingsNotToDo', e.target.value)}
            className="form-input"
            placeholder="e.g. Email, social media, new browser tabs"
          />
        </div>

        <div className="form-group">
          <label>Closing ritual</label>
          <textarea
            value={formData.closingRitual}
            onChange={(e) => updateField('closingRitual', e.target.value)}
            className="form-input textarea-input"
            placeholder="e.g. Commit code, clear desk, write next priority"
          />
        </div>
      </details>

      <button type="submit" className="btn-primary">
        <Play size={18} fill="currentColor" />
        Start Focus Session
      </button>
    </form>
  );
}
