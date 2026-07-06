import React from 'react';
import { ArrowLeft, Power, Trash2, Volume2 } from 'lucide-react';
import { playPreview } from '../utils/audio';

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}) {
  const handleSoundChange = (type) => {
    onUpdateSettings({ ...settings, soundType: type });
    playPreview(type);
  };

  const handleTargetChange = (e) => {
    const val = parseInt(e.target.value) || 5;
    onUpdateSettings({ ...settings, dailyTarget: val });
  };

  const handleQuit = () => {
    if (window.api && window.api.quitApp) {
      window.api.quitApp();
    } else {
      alert('Quit app requested (running in browser mode)');
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

      <div className="overlay-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Daily Goal Configuration */}
        <div className="settings-section">
          <h4 className="settings-section-title">Daily Goal</h4>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Daily Target Sessions</span>
              <p>How many focus blocks per day?</p>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={settings.dailyTarget}
              onChange={handleTargetChange}
              className="form-input"
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>
        </div>

        {/* Workflow Options */}
        <div className="settings-section">
          <h4 className="settings-section-title">Workflow Options</h4>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Long Break Interval</span>
              <p>Sessions before a long break (0 to disable)</p>
            </div>
            <input
              type="number"
              min="0"
              max="10"
              value={settings.longBreakInterval || 0}
              onChange={(e) => onUpdateSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 0 })}
              className="form-input"
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span>Long Break Duration</span>
              <p>Duration in minutes</p>
            </div>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.longBreakDuration || 15}
              onChange={(e) => onUpdateSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
              className="form-input"
              style={{ width: '60px', textAlign: 'center' }}
            />
          </div>
          <div className="settings-row" style={{ marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-main)' }}>
              <input
                type="checkbox"
                checked={settings.autoTransitions || false}
                onChange={(e) => onUpdateSettings({ ...settings, autoTransitions: e.target.checked })}
                style={{ accentColor: 'var(--color-accent-work)' }}
              />
              Auto-start next session after break
            </label>
          </div>
          <div className="settings-row" style={{ marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-main)' }}>
              <input
                type="checkbox"
                checked={settings.strictBreakMode || false}
                onChange={(e) => onUpdateSettings({ ...settings, strictBreakMode: e.target.checked })}
                style={{ accentColor: 'var(--color-accent-break)' }}
              />
              Strict Mode (Hide skip break button)
            </label>
          </div>
        </div>

        {/* Alarm Sounds */}
        <div className="settings-section">
          <h4 className="settings-section-title">Alert Ringtone</h4>
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
            <div className="settings-row-label">
              <span>Ringtone Sound Selection</span>
              <p>Sound that plays when work finishes</p>
            </div>
            <div className="sound-select-group" style={{ marginTop: '4px' }}>
              {['zen', 'chime', 'beep'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`select-btn ${settings.soundType === type ? 'active' : ''}`}
                  onClick={() => handleSoundChange(type)}
                  style={{ flex: 1, textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Volume2 size={12} /> {type === 'zen' ? 'Zen Bell' : type === 'chime' ? 'Chime' : 'Beep'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="settings-section" style={{ marginTop: 'auto' }}>
          <h4 className="settings-section-title">System Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                if (confirm('Are you absolutely sure you want to clear all focus history? This cannot be undone.')) {
                  onClearHistory();
                }
              }}
            >
              <Trash2 size={14} /> Clear Focus History
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleQuit}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
            >
              <Power size={14} /> Quit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
