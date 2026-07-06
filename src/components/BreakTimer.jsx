import React, { useState, useEffect } from 'react';
import { Coffee, SkipForward } from 'lucide-react';

const BREAK_TIPS = [
  'Rest your eyes. Look at something 20 feet away for 20 seconds.',
  'Stand up, stretch your arms, and roll your shoulders.',
  'Hydrate! Go drink a glass of fresh water.',
  'Inhale slowly for 4 seconds, hold for 4, exhale for 6.',
  'Step away from all digital screens. Walk around the room.',
  'Shake out your hands and stretch your wrists.',
];

export default function BreakTimer({ timeLeft, duration, onSkip, isLongBreak, strictBreakMode }) {
  const [tip, setTip] = useState('');

  useEffect(() => {
    // Select a random tip on mount
    const randomTip = BREAK_TIPS[Math.floor(Math.random() * BREAK_TIPS.length)];
    setTip(randomTip);
  }, []);

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
    <div className="break-screen">
      <div className="break-header">
        <h2>{isLongBreak ? 'Long Break' : 'Recharge'}</h2>
        <div className="today-summary" style={{ justifyContent: 'center', marginTop: '4px' }}>
          Rest in progress...
        </div>
      </div>

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
            className="timer-ring-progress break"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="565.48"
            style={{ strokeDashoffset }}
          />
        </svg>
        <div className="timer-digits-container">
          <div className="timer-digits" style={{ color: 'var(--color-accent-break)' }} aria-live="polite">
            {formatTime(timeLeft)}
          </div>
          <span className="timer-mode-tag">Rest Time</span>
        </div>
      </div>

      {/* Healthy Tip Card */}
      <div className="break-tip-card">
        <h4>Healthy Rest Tip</h4>
        <p>{tip}</p>
      </div>

      {/* Skip Button */}
      {!strictBreakMode && (
        <div style={{ width: '100%' }}>
          <button type="button" className="btn-primary" onClick={onSkip} style={{ background: 'linear-gradient(135deg, var(--color-accent-break), #0d9488)', boxShadow: '0 6px 20px var(--color-accent-break-glow)' }}>
            <SkipForward size={16} /> Skip Break
          </button>
        </div>
      )}
    </div>
  );
}
