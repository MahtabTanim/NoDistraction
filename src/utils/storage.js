const KEYS = {
  SETTINGS: 'nodistraction_settings',
  HISTORY: 'nodistraction_history',
  LAST_CONFIG: 'nodistraction_last_config',
};

const DEFAULT_SETTINGS = {
  dailyTarget: 5,
  soundType: 'zen',
};

const DEFAULT_CONFIG = {
  outcome: '',
  workspaceRating: 8,
  distractions: ['None'],
  activationRitual: '',
  energyRating: 7,
  duration: 40,
  breakDuration: 10,
  thingsNotToDo: '',
  closingRitual: 'Clean desk, stretch, drink water',
};

export const getSettings = () => {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

export const getHistory = () => {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading history:', err);
    return [];
  }
};

export const saveSession = (session) => {
  try {
    const history = getHistory();
    const newSession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...session,
    };
    history.unshift(newSession);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    return newSession;
  } catch (err) {
    console.error('Error saving session:', err);
    return null;
  }
};

export const deleteSession = (id) => {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting session:', err);
    return getHistory();
  }
};

export const clearHistory = () => {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
  } catch (err) {
    console.error('Error clearing history:', err);
  }
};

export const getLastSessionConfig = () => {
  try {
    const data = localStorage.getItem(KEYS.LAST_CONFIG);
    return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
  } catch (err) {
    console.error('Error reading last config:', err);
    return DEFAULT_CONFIG;
  }
};

export const saveLastSessionConfig = (config) => {
  try {
    localStorage.setItem(KEYS.LAST_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving last config:', err);
  }
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
