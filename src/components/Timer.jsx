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
  completedActivationItems,
  onToggleActivationItem,
  completedAvoidItems,
  onToggleAvoidItem,
  completedOutcomes,
  onToggleOutcome,
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

  const activationItems = activationRitual
    ? activationRitual.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const avoidItems = thingsNotToDo
    ? thingsNotToDo.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const outcomeItems = outcome
    ? outcome.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

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
            style={{ strokeDashoffset }}
          />
        </svg>
        <div className="timer-digits-container">
          <div className="timer-digits" aria-live="polite">{formatTime(timeLeft)}</div>
          <span className="timer-mode-tag">Deep Work</span>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="timer-details-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', margin: '12px 0' }}>
        
        {/* Activation Ritual Box */}
        {activationItems.length > 0 && (
          <div className="goal-context-card activation-checklist">
            <div style={{ width: '100%' }}>
              <div className="context-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', marginBottom: '8px' }}>
                <Sparkles size={12} /> Activation Ritual
              </div>
              <div className="checklist-items">
                {activationItems.map((item, idx) => {
                  const isDone = completedActivationItems.includes(item);
                  return (
                    <div
                      key={idx}
                      className={`checklist-item ${isDone ? 'checked' : ''}`}
                      onClick={() => onToggleActivationItem(item)}
                    >
                      <div className="checkbox-visual">
                        {isDone && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="item-text">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Target Outcomes Card */}
        {outcomeItems.length > 0 && (
          <div className="goal-context-card target-outcome">
            <div style={{ width: '100%' }}>
              <div className="context-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', marginBottom: '8px', color: 'var(--color-accent-work)' }}>
                <Target size={12} /> Target Outcomes
              </div>
              <div className="checklist-items">
                {outcomeItems.map((item, idx) => {
                  const isDone = completedOutcomes.includes(item);
                  return (
                    <div
                      key={idx}
                      className={`checklist-item ${isDone ? 'checked' : ''}`}
                      onClick={() => onToggleOutcome(item)}
                    >
                      <div className="checkbox-visual">
                        {isDone && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="item-text">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Things NOT to do Card */}
        {avoidItems.length > 0 && (
          <div className="goal-context-card avoid-list">
            <div style={{ width: '100%' }}>
              <div className="context-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', marginBottom: '8px', color: 'var(--color-warning)' }}>
                <AlertTriangle size={12} /> Things to avoid
              </div>
              <div className="checklist-items">
                {avoidItems.map((item, idx) => {
                  const isDone = completedAvoidItems.includes(item);
                  return (
                    <div
                      key={idx}
                      className={`checklist-item avoid ${isDone ? 'checked' : ''}`}
                      onClick={() => onToggleAvoidItem(item)}
                    >
                      <div className="checkbox-visual warning">
                        {isDone && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="item-text">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="timer-controls">
        <button className="btn-control" onClick={onCancel} title="Cancel Session" aria-label="Cancel Session">
          <X size={18} />
        </button>
        <button
          className="btn-control primary"
          onClick={onTogglePause}
          title={isPaused ? 'Resume Session' : 'Pause Session'}
          aria-label={isPaused ? 'Resume Session' : 'Pause Session'}
        >
          {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}
