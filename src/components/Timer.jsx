import React from 'react';
import { AlertTriangle, Check, Pause, Play, Sparkles, Target, X } from 'lucide-react';

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
  completedOutcomes,
  onToggleOutcome,
  currentCycle,
  totalCycles,
  distractionDump,
  setDistractionDump,
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const splitItems = (value) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []);
  const activationItems = splitItems(activationRitual);
  const avoidItems = splitItems(thingsNotToDo);
  const outcomeItems = splitItems(outcome);
  const totalSeconds = duration * 60;
  const strokeDashoffset = totalSeconds > 0 ? 565.48 * (1 - timeLeft / totalSeconds) : 0;

  const checklist = (items, completed, onToggle) => (
    <div className="checklist-items">
      {items.map((item) => {
        const isDone = completed.includes(item);
        return (
          <button
            key={item}
            type="button"
            className={`checklist-item ${isDone ? 'checked' : ''}`}
            onClick={() => onToggle(item)}
          >
            <span className="checkbox-visual">{isDone && <Check size={12} strokeWidth={3} />}</span>
            <span className="item-text">{item}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="timer-screen">
      <div className="timer-ring-container">
        <svg className="timer-ring-svg">
          <circle cx="100" cy="100" r="90" className="timer-ring-bg" strokeWidth="4" fill="none" />
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
          <div className="timer-digits" aria-live="polite">
            {formatTime(timeLeft)}
          </div>
          <span className="timer-mode-tag">Deep Work - Cycle {currentCycle} of {totalCycles}</span>
        </div>
      </div>

      <div className="timer-details-container">
        {activationItems.length > 0 && (
          <div className="goal-context-card">
            <div className="context-title">
              <Sparkles size={12} />
              Activation Ritual
            </div>
            {checklist(activationItems, completedActivationItems, onToggleActivationItem)}
          </div>
        )}

        {outcomeItems.length > 0 && (
          <div className="goal-context-card target-outcome">
            <div className="context-title work-title">
              <Target size={12} />
              Target Outcome
            </div>
            {checklist(outcomeItems, completedOutcomes, onToggleOutcome)}
          </div>
        )}

        {avoidItems.length > 0 && (
          <div className="goal-context-card avoid-list">
            <div className="context-title warning-title">
              <AlertTriangle size={12} />
              Avoid
            </div>
            <div className="avoid-chip-list">
              {avoidItems.map((item) => (
                <span key={item} className="avoid-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="goal-context-card distraction-dump-card">
          <div className="context-title muted-title">Distraction Dump</div>
          <textarea
            className="form-input textarea-input dump-textarea"
            placeholder="Park distracting thoughts here."
            value={distractionDump}
            onChange={(e) => setDistractionDump(e.target.value)}
          />
        </div>
      </div>

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
