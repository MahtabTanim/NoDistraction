import React from 'react';
import { Play, Pause, X, AlertTriangle, Target, Check, Sparkles } from 'lucide-react';

export default function Timer({
  timeLeft,
  duration,
  outcome,
  thingsNotToDo,
  activationRitual,
  isPaused,
  onTogglePause,
  onCancel,
  activationCompleted,
  onToggleActivation,
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalSeconds = duration * 60;
  const strokeDashoffset = totalSeconds > 0 
    ? 565.48 * (1 - (timeLeft / totalSeconds)) 
    : 0;

  return (
    <div className="timer-screen">
      {/* Circular Progress Ring */}
      <div className="timer-ring-container">
        <svg className="timer-ring-svg">
          <circle
            cx="100"
            cy="100"
            r="90"
            className="timer-ring-bg"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            className="timer-ring-progress work"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="565.48"
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="timer-digits-container">
          <div className="timer-digits">{formatTime(timeLeft)}</div>
          <span className="timer-mode-tag">Deep Work</span>
        </div>
      </div>

      {/* Activation Ritual Box */}
      {activationRitual && (
        <div
          className={`activation-card ${activationCompleted ? 'checked' : ''}`}
          onClick={onToggleActivation}
        >
          <div className="checkbox-visual">
            {activationCompleted && <Check size={12} strokeWidth={3} />}
          </div>
          <div className="activation-text-group">
            <span className="context-title" style={{ fontSize: '9px', display: 'block' }}>
              Activation Ritual
            </span>
            <span className="activation-text">{activationRitual}</span>
          </div>
        </div>
      )}

      {/* Focus & Warning Banners */}
      <div className="goal-context-card">
        <div className="context-row">
          <Target size={16} className="context-title" style={{ color: 'var(--color-accent-work)' }} />
          <div style={{ flex: 1 }}>
            <div className="context-title">Target Outcome</div>
            <div className="context-val">{outcome}</div>
          </div>
        </div>

        {thingsNotToDo && (
          <div className="context-row warning-banner" style={{ paddingLeft: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
            <div style={{ flex: 1 }}>
              <div className="context-title" style={{ color: 'var(--color-warning)' }}>
                Things NOT to do
              </div>
              <div className="context-val" style={{ color: 'var(--color-warning)', fontWeight: 500 }}>
                {thingsNotToDo}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="timer-controls">
        <button className="btn-control" onClick={onCancel} title="Cancel Session">
          <X size={18} />
        </button>
        <button
          className="btn-control primary"
          onClick={onTogglePause}
          title={isPaused ? 'Resume Session' : 'Pause Session'}
        >
          {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}
