import { VideoAnalysis, HistoricalAnalysis } from '../types';

interface HistoryStore {
  [videoId: string]: HistoricalAnalysis[];
}

const HISTORY_KEY = 'videoAnalysisHistory';

const getFullHistory = (): HistoryStore => {
  try {
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    return storedHistory ? JSON.parse(storedHistory) : {};
  } catch (e) {
    console.error("Failed to parse history from localStorage", e);
    return {};
  }
};

const saveFullHistory = (history: HistoryStore): void => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history to localStorage", e);
  }
};

export const getHistoryForVideo = (videoId: string): HistoricalAnalysis[] => {
  const history = getFullHistory();
  return history[videoId] || [];
};

export const addAnalysisToHistory = (videoId: string, analysis: VideoAnalysis): void => {
  const fullHistory = getFullHistory();
  const videoHistory = fullHistory[videoId] || [];

  const newEntry: HistoricalAnalysis = {
    ...analysis,
    timestamp: new Date().toISOString(),
  };

  // Add new entry to the front of the array and limit history size to 10
  const updatedHistory = [newEntry, ...videoHistory].slice(0, 10);

  fullHistory[videoId] = updatedHistory;
  saveFullHistory(fullHistory);
};
