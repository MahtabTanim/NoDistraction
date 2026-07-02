import React, { useState, useEffect } from 'react';
import { History, Settings, X, LogIn } from 'lucide-react';

// Utilities
import { startAlarm, stopAlarm, playPreview } from './utils/audio';
import {
  getSettings,
  saveSettings,
  getHistory,
  saveSession,
  deleteSession,
  clearHistory,
  getLastSessionConfig,
  saveLastSessionConfig,
  getCompletedTodayCount,
} from './utils/storage';

// Components
import SetupForm from './components/SetupForm';
import Timer from './components/Timer';
import ClosingRitual from './components/ClosingRitual';
import BreakTimer from './components/BreakTimer';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  // Navigation & Sub-panels state
  const [screen, setScreen] = useState('SETUP'); // 'SETUP' | 'ACTIVE' | 'CLOSING' | 'BREAK'
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App-wide configurations
  const [settings, setSettings] = useState(getSettings());
  const [history, setHistory] = useState(getHistory());
  const [lastConfig, setLastConfig] = useState(getLastSessionConfig());
  const [completedToday, setCompletedToday] = useState(getCompletedTodayCount());

  // Active Session State
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activationCompleted, setActivationCompleted] = useState(false);

  // Synchronize history count today
  useEffect(() => {
    setCompletedToday(getCompletedTodayCount());
  }, [history]);

  // Main countdown ticking logic
  useEffect(() => {
    if (isPaused || (screen !== 'ACTIVE' && screen !== 'BREAK')) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          if (screen === 'ACTIVE') {
            handleWorkFinished();
          } else if (screen === 'BREAK') {
            handleBreakFinished();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, screen]);

  // Sync timer display to macOS system tray menu bar
  useEffect(() => {
    if (window.api && window.api.updateTrayTitle) {
      if (screen === 'ACTIVE') {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        window.api.updateTrayTitle(`${m}:${s}`);
      } else if (screen === 'BREAK') {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        window.api.updateTrayTitle(`☕ ${m}:${s}`);
      } else {
        window.api.updateTrayTitle('');
      }
    }
  }, [timeLeft, screen]);

  // Session start
  const handleStartSession = (config) => {
    saveLastSessionConfig(config);
    setLastConfig(config);
    setActiveSession(config);
    setTimeLeft(config.duration * 60);
    setIsPaused(false);
    setActivationCompleted(false);
    setScreen('ACTIVE');
  };

  // Active Focus timer reaches 0
  const handleWorkFinished = () => {
    setScreen('CLOSING');
    startAlarm(settings.soundType);
  };

  // Closing ritual marked complete
  const handleClosingCompleted = () => {
    stopAlarm();

    // Log focus session record to storage
    const sessionRecord = {
      outcome: activeSession.outcome,
      workspaceRating: activeSession.workspaceRating,
      distractions: activeSession.distractions,
      activationRitual: activeSession.activationRitual,
      energyRating: activeSession.energyRating,
      duration: activeSession.duration,
      breakDuration: activeSession.breakDuration,
      thingsNotToDo: activeSession.thingsNotToDo,
      closingRitual: activeSession.closingRitual,
      closingRitualCompleted: true,
    };

    saveSession(sessionRecord);
    setHistory(getHistory()); // Refresh history logs

    // Instantly transition to Break Timer
    setTimeLeft(activeSession.breakDuration * 60);
    setIsPaused(false);
    setScreen('BREAK');
  };

  // Break timer reaches 0
  const handleBreakFinished = () => {
    // Play a friendly finish chime
    playPreview(settings.soundType);
    setScreen('SETUP');
    setActiveSession(null);
  };

  const handleCancelSession = () => {
    if (confirm('Cancel this focus session? The progress will not be saved.')) {
      setScreen('SETUP');
      setActiveSession(null);
    }
  };

  const handleSkipBreak = () => {
    setScreen('SETUP');
    setActiveSession(null);
  };

  // Settings & History actions
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = deleteSession(id);
    setHistory(updated);
  };

  const handleCloseAppWindow = () => {
    if (window.api && window.api.hideWindow) {
      window.api.hideWindow();
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-dot"></div>
          <span className="app-title">NoDistraction</span>
        </div>

        {screen === 'SETUP' && (
          <div className="today-summary">
            Today <span>{completedToday}</span>/{settings.dailyTarget}
          </div>
        )}

        <div className="header-actions">
          {screen === 'SETUP' && (
            <>
              <button
                className={`icon-btn ${isHistoryOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsHistoryOpen(!isHistoryOpen);
                  setIsSettingsOpen(false);
                }}
                title="History Log"
              >
                <History size={16} />
              </button>
              <button
                className={`icon-btn ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsHistoryOpen(false);
                }}
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </>
          )}

          <button className="icon-btn" onClick={handleCloseAppWindow} title="Close Window">
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Screen Router */}
      <div className="scrollable-content">
        {screen === 'SETUP' && (
          <SetupForm initialData={lastConfig} onSubmit={handleStartSession} />
        )}

        {screen === 'ACTIVE' && (
          <Timer
            timeLeft={timeLeft}
            duration={activeSession.duration}
            outcome={activeSession.outcome}
            thingsNotToDo={activeSession.thingsNotToDo}
            activationRitual={activeSession.activationRitual}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            onCancel={handleCancelSession}
            activationCompleted={activationCompleted}
            onToggleActivation={() => setActivationCompleted(!activationCompleted)}
          />
        )}

        {screen === 'CLOSING' && (
          <ClosingRitual
            closingRitualText={activeSession.closingRitual}
            onComplete={handleClosingCompleted}
            onMuteAlarm={() => {}}
          />
        )}

        {screen === 'BREAK' && (
          <BreakTimer
            timeLeft={timeLeft}
            duration={activeSession.breakDuration}
            onSkip={handleSkipBreak}
          />
        )}
      </div>

      {/* Sliding Side-Panels */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteItem={handleDeleteHistoryItem}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
