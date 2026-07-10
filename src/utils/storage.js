const KEYS = {
  SETTINGS: 'nodistraction_settings',
  HISTORY: 'nodistraction_history',
  LAST_CONFIG: 'nodistraction_last_config',
  ACTIVE_SESSION: 'nodistraction_active_session',
  DAILY_REVIEW: 'nodistraction_daily_review',
};

const DEFAULT_SETTINGS = {
  dailyTarget: 5,
  soundType: 'zen',
  autoTransitions: false,
  strictBreakMode: false,
};

const DEFAULT_CONFIG = {
  preset: 'custom',
  outcome: '',
  workspaceRating: 8,
  distractions: ['None'],
  activationRitual: '',
  energyRating: 7,
  duration: 40,
  breakDuration: 10,
  cycles: 1,
  thingsNotToDo: '',
  closingRitual: 'Clean desk, stretch, drink water',
};

const safeRead = (key, fallback = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

export const getSettings = () => {
  const data = safeRead(KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...data };
};

export const saveSettings = (settings) => {
  safeWrite(KEYS.SETTINGS, settings);
};

export const getHistory = () => {
  return safeRead(KEYS.HISTORY, []);
};

export const saveSession = (session) => {
  const history = getHistory();
  const newSession = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...session,
  };
  history.unshift(newSession);
  safeWrite(KEYS.HISTORY, history);
  return newSession;
};

export const deleteSession = (id) => {
  const history = getHistory();
  const updated = history.filter((item) => item.id !== id);
  safeWrite(KEYS.HISTORY, updated);
  return updated;
};

export const clearHistory = () => {
  safeWrite(KEYS.HISTORY, []);
};

export const getLastSessionConfig = () => {
  const data = safeRead(KEYS.LAST_CONFIG, {});
  return { ...DEFAULT_CONFIG, ...data };
};

export const saveLastSessionConfig = (config) => {
  safeWrite(KEYS.LAST_CONFIG, config);
};

export const getCompletedTodayCount = () => {
  try {
    const history = getHistory();
    const today = new Date().toDateString();
    return history.filter((item) => {
      const itemDate = new Date(item.timestamp).toDateString();
      return itemDate === today;
    }).length;
  } catch (err) {
    console.error('Error calculating completed today:', err);
    return 0;
  }
};

export const getActiveSessionState = () => {
  return safeRead(KEYS.ACTIVE_SESSION, null);
};

export const saveActiveSessionState = (state) => {
  safeWrite(KEYS.ACTIVE_SESSION, state);
};

export const clearActiveSessionState = () => {
  localStorage.removeItem(KEYS.ACTIVE_SESSION);
};

export const saveDailyReview = (review) => {
  const reviews = safeRead(KEYS.DAILY_REVIEW, []);
  reviews.push({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...review,
  });
  safeWrite(KEYS.DAILY_REVIEW, reviews);
};

export const getDailyReviews = () => {
  return safeRead(KEYS.DAILY_REVIEW, []);
};

export const exportHistoryToCSV = () => {
  const history = getHistory();
  const reviews = getDailyReviews();
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Export Sessions
  csvContent += "--- SESSIONS ---\n";
  csvContent += "Date,Outcome,Duration,Break Duration,Total Cycles,Interrupted,Workspace Rating,Energy Rating,Distractions,Distraction Dump\n";
  
  history.forEach(row => {
    const date = row.timestamp ? new Date(row.timestamp).toLocaleString() : '';
    const outcome = `"${(row.outcome || '').replace(/"/g, '""')}"`;
    const dist = `"${(row.distractions || []).join(', ')}"`;
    const dump = `"${(row.distractionDump || '').replace(/"/g, '""')}"`;
    csvContent += `"${date}",${outcome},${row.duration},${row.breakDuration},${row.totalCycles || 1},${row.interrupted || false},${row.workspaceRating},${row.energyRating},${dist},${dump}\n`;
  });
  
  // Export Daily Reviews
  csvContent += "\n--- DAILY REVIEWS ---\n";
  csvContent += "Date,Work Rating,Energy Rating,Focus Lost Reason,Good Thing\n";
  
  reviews.forEach(row => {
    const date = row.timestamp ? new Date(row.timestamp).toLocaleString() : '';
    const focusReason = `"${(row.focusLostReason || '').replace(/"/g, '""')}"`;
    const goodThing = `"${(row.goodThing || '').replace(/"/g, '""')}"`;
    csvContent += `"${date}",${row.workRating},${row.energyRating},${focusReason},${goodThing}\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `NoDistraction_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

