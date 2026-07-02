import React, { useState, useEffect } from 'react';
import { Check, Sparkles, VolumeX } from 'lucide-react';
import { stopAlarm } from '../utils/audio';

export default function ClosingRitual({ closingRitualText, onComplete, onMuteAlarm }) {
  // Parse closing ritual steps
  const steps = closingRitualText
    ? closingRitualText
        .split(/[,\n]/)
        .map((step) => step.trim())
        .filter((step) => step.length > 0)
    : ['Tidy your workspace', 'Close non-essential browser tabs', 'Note down what to work on next'];

  // State to track checked items
  const [checkedStates, setCheckedStates] = useState(
    new Array(steps.length).fill(false)
  );
  
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);

  const handleToggleCheck = (index) => {
    setCheckedStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleMute = () => {
    stopAlarm();
    setIsAlarmMuted(true);
    if (onMuteAlarm) onMuteAlarm();
  };

  const allChecked = checkedStates.every((checked) => checked === true);

  return (
    <div className="closing-screen">
      <div className="closing-header">
        <h2>Session Complete!</h2>
        <p>Take a breath and finish your closing ritual</p>
      </div>

      <div className="checklist-container">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`checklist-item ${checkedStates[idx] ? 'checked' : ''}`}
            onClick={() => handleToggleCheck(idx)}
          >
            <div className="checkbox-visual">
              {checkedStates[idx] && <Check size={12} strokeWidth={3} />}
            </div>
            <span className="checklist-text">{step}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isAlarmMuted && (
          <button type="button" className="btn-danger" onClick={handleMute} style={{ borderStyle: 'dashed' }}>
            <VolumeX size={16} /> Mute Alarm
          </button>
        )}

        <button
          type="button"
          className={`btn-complete ${allChecked ? 'active' : ''}`}
          disabled={!allChecked}
          onClick={onComplete}
        >
          <Sparkles size={16} /> Mark Completed & Start Break
        </button>
      </div>
    </div>
  );
}
