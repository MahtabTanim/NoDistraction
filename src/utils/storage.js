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
  longBreakInterval: 0,
  longBreakDuration: 15,
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

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const saveDailyReview = (review) => {
  const reviews = safeRead(KEYS.DAILY_REVIEW, []);
  const date = getLocalDateKey();
  const existingIndex = reviews.findIndex((item) => item.date === date);
  const nextReview = {
    id: reviews[existingIndex]?.id || Date.now().toString(),
    date,
    timestamp: reviews[existingIndex]?.timestamp || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...review,
  };

  if (existingIndex >= 0) {
    reviews[existingIndex] = nextReview;
  } else {
    reviews.push(nextReview);
  }

  safeWrite(KEYS.DAILY_REVIEW, reviews);
  return nextReview;
};

export const getDailyReviews = () => {
  return safeRead(KEYS.DAILY_REVIEW, []);
};

export const getTodayDailyReview = () => {
  const date = getLocalDateKey();
  return getDailyReviews().find((review) => review.date === date) || null;
};

const csvCell = (value) => {
  const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

export const exportHistoryToCSV = () => {
  const history = getHistory();
  const reviews = getDailyReviews();

  const rows = [
    [
      'record_type',
      'timestamp',
      'date',
      'outcome',
      'work_minutes',
      'break_minutes',
      'total_cycles',
      'interrupted',
      'interruption_reason',
      'workspace_rating',
      'energy_rating',
      'distractions',
      'distraction_dump',
      'work_rating',
      'focus_lost_reason',
      'good_thing',
    ],
  ];

  history.forEach((row) => {
    rows.push([
      'session',
      row.timestamp || '',
      row.timestamp ? getLocalDateKey(new Date(row.timestamp)) : '',
      row.outcome || '',
      row.duration || '',
      row.breakDuration || '',
      row.totalCycles || 1,
      Boolean(row.interrupted),
      row.interruptionReason || '',
      row.workspaceRating || '',
      row.energyRating || '',
      row.distractions || [],
      row.distractionDump || '',
      '',
      '',
      '',
    ]);
  });

  reviews.forEach((row) => {
    rows.push([
      'daily_review',
      row.updatedAt || row.timestamp || '',
      row.date || (row.timestamp ? getLocalDateKey(new Date(row.timestamp)) : ''),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      row.energyRating || '',
      '',
      '',
      row.workRating || '',
      row.focusLostReason || '',
      row.goodThing || '',
    ]);
  });

  const csvContent = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `NoDistraction_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
