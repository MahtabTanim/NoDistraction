import React from 'react';
import { ArrowLeft, Power, Trash2, Volume2 } from 'lucide-react';
import { playPreview } from '../utils/audio';

export default function SettingsPanel({ isOpen, onClose, settings, onUpdateSettings, onClearHistory }) {
  const update = (patch) => onUpdateSettings({ ...settings, ...patch });

  const handleSoundChange = (type) => {
    update({ soundType: type });
    playPreview(type);
  };

  const handleQuit = () => {
    if (window.api?.quitApp) {
      window.api.quitApp();
    } else {
      alert('Quit app requested.');
    }
  };

  return (
    <div className={`overlay-panel ${isOpen ? 'open' : ''}`}>
      <div className="overlay-header">
        <button className="icon-btn" onClick={onClose} title="Back" aria-label="Back to Timer">
          <ArrowLeft size={16} />
        </button>
        <h3 className="overlay-title">Settings</h3>
      </div>

      <div className="overlay-content settings-content">
        <div className="settings-section">
          <h4 className="settings-section-title">Daily Goal</h4>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Daily Target Sessions</span>
              <p>Completed focus sessions per day</p>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.dailyTarget}
              onChange={(e) => update({ dailyTarget: parseInt(e.target.value, 10) || 1 })}
              className="form-input compact-number"
            />
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">Cycle Flow</h4>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Auto-start After Break</span>
              <p>Start the next work cycle automatically</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoTransitions || false}
              onChange={(e) => update({ autoTransitions: e.target.checked })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Strict Break Mode</span>
              <p>Hide the early-start button during breaks</p>
            </div>
            <input
              type="checkbox"
              checked={settings.strictBreakMode || false}
              onChange={(e) => update({ strictBreakMode: e.target.checked })}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Long Break Interval</span>
              <p>Every N completed work cycles, 0 disables</p>
            </div>
            <input
              type="number"
              min="0"
              max="10"
              value={settings.longBreakInterval || 0}
              onChange={(e) => update({ longBreakInterval: parseInt(e.target.value, 10) || 0 })}
              className="form-input compact-number"
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Long Break Duration</span>
              <p>Minutes for long breaks</p>
            </div>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.longBreakDuration || 15}
              onChange={(e) => update({ longBreakDuration: parseInt(e.target.value, 10) || 15 })}
              className="form-input compact-number"
            />
          </div>
        </div>

        <div className="settings-section">
          <h4 className="settings-section-title">Alert Sound</h4>
          <div className="sound-select-group">
            {['zen', 'chime', 'beep'].map((type) => (
              <button
                key={type}
                type="button"
                className={`select-btn ${settings.soundType === type ? 'active' : ''}`}
                onClick={() => handleSoundChange(type)}
              >
                <Volume2 size={12} />
                {type === 'zen' ? 'Zen Bell' : type === 'chime' ? 'Chime' : 'Beep'}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section system-actions">
          <h4 className="settings-section-title">System</h4>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (confirm('Clear all focus history? This cannot be undone.')) {
                onClearHistory();
              }
            }}
          >
            <Trash2 size={14} />
            Clear Focus History
          </button>
          <button type="button" className="btn-primary danger-primary" onClick={handleQuit}>
            <Power size={14} />
            Quit Application
          </button>
        </div>
      </div>
    </div>
  );
}
