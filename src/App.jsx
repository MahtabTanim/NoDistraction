import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, History, Moon, Settings, Sun, X } from 'lucide-react';

import { playPreview, startAlarm, stopAlarm } from './utils/audio';
import {
  clearActiveSessionState,
  clearHistory,
  deleteSession,
  getActiveSessionState,
  getCompletedTodayCount,
  getHistory,
  getLastSessionConfig,
  getSettings,
  saveActiveSessionState,
  saveLastSessionConfig,
  saveSession,
  saveSettings,
} from './utils/storage';

import BreakTimer from './components/BreakTimer';
import ClosingRitual from './components/ClosingRitual';
import DailyReviewPanel from './components/DailyReviewPanel';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import SetupForm from './components/SetupForm';
import Timer from './components/Timer';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function App() {
  const [screen, setScreen] = useState('SETUP');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());

  const [settings, setSettings] = useState(getSettings());
  const [history, setHistory] = useState(getHistory());
  const [lastConfig, setLastConfig] = useState(getLastSessionConfig());
  const [completedToday, setCompletedToday] = useState(getCompletedTodayCount());

  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedActivationItems, setCompletedActivationItems] = useState([]);
  const [completedOutcomes, setCompletedOutcomes] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(0);
  const [currentBreakIsLong, setCurrentBreakIsLong] = useState(false);
  const [distractionDump, setDistractionDump] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showInterruptModal, setShowInterruptModal] = useState(false);

  const sessionEndTimeRef = useRef(null);
  const screenRef = useRef(screen);
  const isPausedRef = useRef(isPaused);
  const activeSessionRef = useRef(activeSession);

  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(`${theme}-mode`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (window.api?.onUpdateAvailable) {
      window.api.onUpdateAvailable((info) => setUpdateInfo(info));
    }

    const savedState = getActiveSessionState();
    if (savedState) {
      const {
        activeSession: savedConfig,
        completedActivationItems: savedAct,
        completedOutcomes: savedOutcomes,
        currentBreakDuration: savedBreakDuration,
        currentBreakIsLong: savedBreakIsLong,
        currentCycle: savedCycle,
        distractionDump: savedDump,
        endTime,
        isPaused: savedIsPaused,
        screen: savedScreen,
        timeLeft: savedTimeLeft,
      } = savedState;

      if (endTime > Date.now() || savedIsPaused) {
        setScreen(savedScreen);
        setActiveSession(savedConfig);
        setIsPaused(savedIsPaused);
        setCompletedActivationItems(savedAct || []);
        setCompletedOutcomes(savedOutcomes || []);
        setCurrentCycle(savedCycle || 1);
        setCurrentBreakDuration(savedBreakDuration || savedConfig?.breakDuration || 0);
        setCurrentBreakIsLong(Boolean(savedBreakIsLong));
        setDistractionDump(savedDump || '');

        if (savedIsPaused) {
          setTimeLeft(savedTimeLeft);
          sessionEndTimeRef.current = Date.now() + savedTimeLeft * 1000;
        } else {
          sessionEndTimeRef.current = endTime;
          setTimeLeft(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
        }
      } else {
        clearActiveSessionState();
      }
    }

    if (window.api?.onGlobalAction) {
      window.api.onGlobalAction((action) => {
        if (action === 'pause' && screenRef.current === 'ACTIVE') {
          setIsPaused(!isPausedRef.current);
        }

        if (action === 'skip') {
          if (screenRef.current === 'ACTIVE') {
            setIsPaused(true);
            setShowInterruptModal(true);
          } else if (screenRef.current === 'BREAK') {
            finishBreak();
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    setCompletedToday(getCompletedTodayCount());
  }, [history]);

  const getBreakForCycle = (cycle, sessionConfig = activeSession) => {
    const interval = Number(settings.longBreakInterval) || 0;
    const isLongBreak = interval > 0 && cycle % interval === 0 && cycle < (sessionConfig?.cycles || 1);
    return {
      duration: isLongBreak ? Number(settings.longBreakDuration) || sessionConfig.breakDuration : sessionConfig.breakDuration,
      isLongBreak,
    };
  };

  const finishWork = () => {
    if (!activeSession) return;

    if (currentCycle < (activeSession.cycles || 1)) {
      playPreview(settings.soundType);
      const nextBreak = getBreakForCycle(currentCycle);
      const nextTimeLeft = nextBreak.duration * 60;

      setCurrentBreakDuration(nextBreak.duration);
      setCurrentBreakIsLong(nextBreak.isLongBreak);
      setTimeLeft(nextTimeLeft);
      sessionEndTimeRef.current = Date.now() + nextTimeLeft * 1000;
      setIsPaused(false);
      setScreen('BREAK');
      return;
    }

    startAlarm(settings.soundType);
    setScreen('CLOSING');
  };

  const finishBreak = () => {
    const sessionConfig = activeSessionRef.current;
    if (!sessionConfig) return;

    playPreview(settings.soundType);
    const nextTimeLeft = sessionConfig.duration * 60;
    const shouldPause = !settings.autoTransitions;

    setTimeLeft(nextTimeLeft);
    sessionEndTimeRef.current = Date.now() + nextTimeLeft * 1000;
    setIsPaused(shouldPause);
    setCurrentCycle((prev) => prev + 1);
    setCurrentBreakIsLong(false);
    setScreen('ACTIVE');
  };

  useEffect(() => {
    if (isPaused || (screen !== 'ACTIVE' && screen !== 'BREAK')) return undefined;

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
          finishWork();
        } else {
          finishBreak();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 500);

    return () => clearInterval(timerId);
  }, [isPaused, screen]);

  useEffect(() => {
    if (window.api?.updateTrayTitle) {
      if (screen === 'ACTIVE' || screen === 'BREAK') {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        window.api.updateTrayTitle(screen === 'BREAK' ? `☕ ${m}:${s}` : `${m}:${s}`);
      } else {
        window.api.updateTrayTitle('');
      }
    }
  }, [screen, timeLeft]);

  useEffect(() => {
    if (screen === 'ACTIVE' || screen === 'BREAK') {
      saveActiveSessionState({
        screen,
        activeSession,
        endTime: sessionEndTimeRef.current,
        isPaused,
        timeLeft,
        completedActivationItems,
        completedOutcomes,
        currentCycle,
        currentBreakDuration,
        currentBreakIsLong,
        distractionDump,
      });
    } else {
      clearActiveSessionState();
    }
  }, [
    activeSession,
    completedActivationItems,
    completedOutcomes,
    currentBreakDuration,
    currentBreakIsLong,
    currentCycle,
    distractionDump,
    isPaused,
    screen,
  ]);

  const closePanels = () => {
    setIsHistoryOpen(false);
    setIsSettingsOpen(false);
    setIsDailyReviewOpen(false);
  };

  const handleStartSession = (config) => {
    saveLastSessionConfig(config);
    setLastConfig(config);
    setActiveSession(config);
    setTimeLeft(config.duration * 60);
    setIsPaused(false);
    setCompletedActivationItems([]);
    setCompletedAvoidItems([]);
    setCompletedOutcomes([]);
    setCurrentCycle(1);
    setCurrentBreakDuration(config.breakDuration);
    setCurrentBreakIsLong(false);
    setDistractionDump('');
    sessionEndTimeRef.current = Date.now() + config.duration * 60 * 1000;
    closePanels();
    setScreen('ACTIVE');
  };

  const toggleItem = (setter, item) => {
    setter((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const sessionRecord = (extra = {}) => ({
    outcome: activeSession.outcome,
    workspaceRating: activeSession.workspaceRating,
    distractions: activeSession.distractions,
    activationRitual: activeSession.activationRitual,
    energyRating: activeSession.energyRating,
    duration: activeSession.duration,
    breakDuration: activeSession.breakDuration,
    thingsNotToDo: activeSession.thingsNotToDo,
    closingRitual: activeSession.closingRitual,
    totalCycles: activeSession.cycles || 1,
    completedCycles: currentCycle,
    distractionDump,
    ...extra,
  });

  const handleClosingCompleted = () => {
    stopAlarm();
    saveSession(sessionRecord({ closingRitualCompleted: true }));
    setHistory(getHistory());
    setScreen('SETUP');
    setActiveSession(null);
  };

  const submitInterruption = (reason) => {
    stopAlarm();
    saveSession(sessionRecord({
      interrupted: true,
      interruptionReason: reason,
      interruptedAt: new Date().toISOString(),
    }));
    setHistory(getHistory());
    setShowInterruptModal(false);
    setScreen('SETUP');
    setActiveSession(null);
  };

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleCloseAppWindow = () => {
    if (window.api?.hideWindow) {
      window.api.hideWindow();
    }
  };

  return (
    <div className="app-container">
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
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className={`icon-btn ${isHistoryOpen ? 'active' : ''}`}
                onClick={() => {
                  const nextOpen = !isHistoryOpen;
                  closePanels();
                  setIsHistoryOpen(nextOpen);
                }}
                title="History Log"
                aria-label="History Log"
              >
                <History size={16} />
              </button>
              <button
                className={`icon-btn ${isDailyReviewOpen ? 'active' : ''}`}
                onClick={() => {
                  const nextOpen = !isDailyReviewOpen;
                  closePanels();
                  setIsDailyReviewOpen(nextOpen);
                }}
                title="Daily Review"
                aria-label="Daily Review"
              >
                <ClipboardList size={16} />
              </button>
              <button
                className={`icon-btn ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => {
                  const nextOpen = !isSettingsOpen;
                  closePanels();
                  setIsSettingsOpen(nextOpen);
                }}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
            </>
          )}

          <button className="icon-btn" onClick={handleCloseAppWindow} title="Close Window" aria-label="Close Window">
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="scrollable-content">
        {screen === 'SETUP' && updateInfo && (
          <div className="update-banner-card">
            <div>
              <div className="update-banner-title">
                <span></span>
                Update Available
              </div>
              <p>Version {updateInfo.version} is ready to download.</p>
            </div>
            <div className="update-banner-actions">
              <button type="button" className="btn-small-accent" onClick={() => window.api.openUpdateLink(updateInfo.url)}>
                Get
              </button>
              <button type="button" className="icon-btn" onClick={() => setUpdateInfo(null)} aria-label="Dismiss update">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {screen === 'SETUP' && <SetupForm initialData={lastConfig} onSubmit={handleStartSession} />}

        {screen === 'ACTIVE' && activeSession && (
          <Timer
            timeLeft={timeLeft}
            duration={activeSession.duration}
            outcome={activeSession.outcome}
            thingsNotToDo={activeSession.thingsNotToDo}
            activationRitual={activeSession.activationRitual}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((paused) => !paused)}
            onCancel={() => {
              setIsPaused(true);
              setShowInterruptModal(true);
            }}
            completedActivationItems={completedActivationItems}
            onToggleActivationItem={(item) => toggleItem(setCompletedActivationItems, item)}
            completedOutcomes={completedOutcomes}
            onToggleOutcome={(item) => toggleItem(setCompletedOutcomes, item)}
            currentCycle={currentCycle}
            totalCycles={activeSession.cycles || 1}
            distractionDump={distractionDump}
            setDistractionDump={setDistractionDump}
          />
        )}

        {screen === 'CLOSING' && activeSession && (
          <ClosingRitual closingRitualText={activeSession.closingRitual} onComplete={handleClosingCompleted} />
        )}

        {screen === 'BREAK' && activeSession && (
          <BreakTimer
            timeLeft={timeLeft}
            duration={currentBreakDuration || activeSession.breakDuration}
            onSkip={finishBreak}
            isLongBreak={currentBreakIsLong}
            strictBreakMode={settings.strictBreakMode}
          />
        )}
      </div>

      {showInterruptModal && (
        <div className="overlay-panel open interrupt-panel">
          <div className="overlay-header">
            <h3 className="overlay-title">Interrupt Session?</h3>
          </div>
          <div className="overlay-content interrupt-content">
            <p>Why are you stopping early?</p>
            <div className="interrupt-actions">
              {['Finished Early', 'External Distraction', 'Internal Distraction', 'Emergency', 'Other'].map((reason) => (
                <button key={reason} type="button" className="btn-secondary" onClick={() => submitInterruption(reason)}>
                  {reason}
                </button>
              ))}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowInterruptModal(false);
                  setIsPaused(false);
                }}
              >
                Resume Working
              </button>
            </div>
          </div>
        </div>
      )}

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteItem={(id) => setHistory(deleteSession(id))}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearHistory={handleClearHistory}
      />
      <DailyReviewPanel isOpen={isDailyReviewOpen} onClose={() => setIsDailyReviewOpen(false)} />
    </div>
  );
}
