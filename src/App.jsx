import React, { useState, useEffect, useRef } from 'react';
import { History, Settings, X, LogIn, Sun, Moon } from 'lucide-react';

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

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export default function App() {
  // Navigation & Sub-panels state
  const [screen, setScreen] = useState('SETUP'); // 'SETUP' | 'ACTIVE' | 'CLOSING' | 'BREAK'
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());

  // App-wide configurations
  const [settings, setSettings] = useState(getSettings());
  const [history, setHistory] = useState(getHistory());
  const [lastConfig, setLastConfig] = useState(getLastSessionConfig());
  const [completedToday, setCompletedToday] = useState(getCompletedTodayCount());

  // Active Session State
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedActivationItems, setCompletedActivationItems] = useState([]);
  const [completedAvoidItems, setCompletedAvoidItems] = useState([]);
  const [updateInfo, setUpdateInfo] = useState(null);

  // Wall-clock end time ref — never freezes when window is hidden
  const sessionEndTimeRef = useRef(null);

  // Apply theme to document body and persist
  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(`${theme}-mode`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for update-available IPC notifications on mount
  useEffect(() => {
    if (window.api && window.api.onUpdateAvailable) {
      window.api.onUpdateAvailable((info) => {
        setUpdateInfo(info);
      });
    }
  }, []);

  // Synchronize history count today
  useEffect(() => {
    setCompletedToday(getCompletedTodayCount());
  }, [history]);

  // Main countdown ticking logic — wall-clock anchored so hiding the window never freezes it
  useEffect(() => {
    if (isPaused || (screen !== 'ACTIVE' && screen !== 'BREAK')) {
      return;
    }

    // On every (re)start (new session, resume from pause, screen change),
    // recalibrate the end time using the current timeLeft so accumulated
    // paused time is correctly excluded.
    setTimeLeft((current) => {
      sessionEndTimeRef.current = Date.now() + current * 1000;
      return current;
    });

    const timerId = setInterval(() => {
      const remaining = Math.round((sessionEndTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerId);
        setTimeLeft(0);
        if (screen === 'ACTIVE') {
          handleWorkFinished();
        } else if (screen === 'BREAK') {
          handleBreakFinished();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 500); // Poll every 500ms so re-opening window catches up within half a second

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
    setCompletedActivationItems([]);
    setCompletedAvoidItems([]);
    // Anchor end time to wall clock
    sessionEndTimeRef.current = Date.now() + config.duration * 60 * 1000;
    setScreen('ACTIVE');
  };

  const handleToggleActivationItem = (item) => {
    setCompletedActivationItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleToggleAvoidItem = (item) => {
    setCompletedAvoidItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
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
    const breakMs = activeSession.breakDuration * 60 * 1000;
    setTimeLeft(activeSession.breakDuration * 60);
    sessionEndTimeRef.current = Date.now() + breakMs;
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
                className="icon-btn"
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
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
        {screen === 'SETUP' && updateInfo && (
          <div className="update-banner-card" style={{
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeIn 0.5s ease'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-break)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--color-accent-break)', borderRadius: '50%' }}></span>
                Update Available!
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Version {updateInfo.version} is ready to download.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.api.openUpdateLink(updateInfo.url)}
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent-break), #0d9488)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px var(--color-accent-break-glow)'
                }}
              >
                Get
              </button>
              <button
                onClick={() => setUpdateInfo(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

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
            completedActivationItems={completedActivationItems}
            onToggleActivationItem={handleToggleActivationItem}
            completedAvoidItems={completedAvoidItems}
            onToggleAvoidItem={handleToggleAvoidItem}
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
