// Offline IndexedDB and LocalStorage persistent storage engine
import {
  Language,
  LevelId,
  TopicProgress,
  UserStats,
  UserSettings,
  QuestionAttemptLog,
  MasteryStatus
} from '../types/curriculum';

const DB_NAME = 'MatematikPintarDB';
const DB_VERSION = 1;

const DEFAULT_SETTINGS: UserSettings = {
  language: 'bm',
  soundFxEnabled: true,
  voiceEnabled: true,
  autoVoiceLevel: 'beginner_preschool',
  voiceSpeed: 0.95,
  voicePitch: 1.35,
  voicePersona: 'child',
  parentPin: '8888'
};

const DEFAULT_STATS: UserStats = {
  stars: 10, // initial welcome stars
  totalAnswered: 0,
  correctAnswers: 0,
  currentStreak: 1,
  highestStreak: 1,
  minutesSpent: 0,
  lastPlayedDate: new Date().toISOString().split('T')[0]
};

class StorageService {
  private db: IDBDatabase | null = null;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('topicProgress')) {
          db.createObjectStore('topicProgress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('recentQuestions')) {
          db.createObjectStore('recentQuestions', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('attemptLogs')) {
          const store = db.createObjectStore('attemptLogs', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('topicId', 'topicId', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        // Silently fallback to localStorage
        resolve();
      };
    });
  }

  // --- Settings ---
  public getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem('mp_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignored
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem('mp_settings', JSON.stringify(updated));
    } catch {
      // Ignored
    }
    return updated;
  }

  // --- User Stats ---
  public getStats(): UserStats {
    try {
      const stored = localStorage.getItem('mp_stats');
      if (stored) {
        return { ...DEFAULT_STATS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignored
    }
    return DEFAULT_STATS;
  }

  public saveStats(stats: Partial<UserStats>): UserStats {
    const current = this.getStats();
    const updated = { ...current, ...stats };
    try {
      localStorage.setItem('mp_stats', JSON.stringify(updated));
    } catch {
      // Ignored
    }
    return updated;
  }

  public addStars(count: number): number {
    const stats = this.getStats();
    const newStars = Math.max(0, stats.stars + count);
    this.saveStats({ stars: newStars });
    return newStars;
  }

  // --- Topic Progress & Mastery ---
  public async getTopicProgress(level: LevelId, topicId: string): Promise<TopicProgress> {
    await this.isReady;
    const key = `${level}_${topicId}`;

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction('topicProgress', 'readonly');
          const store = tx.objectStore('topicProgress');
          const req = store.get(key);
          req.onsuccess = () => {
            if (req.result) {
              resolve(req.result.data);
            } else {
              resolve({
                topicId,
                level,
                attempted: 0,
                correct: 0,
                mastery: 'not_started',
                starsEarned: 0,
                lastAttemptedTimestamp: 0
              });
            }
          };
          req.onerror = () => {
            resolve(this.getFallbackTopicProgress(level, topicId));
          };
        } catch {
          resolve(this.getFallbackTopicProgress(level, topicId));
        }
      });
    }

    return this.getFallbackTopicProgress(level, topicId);
  }

  private getFallbackTopicProgress(level: LevelId, topicId: string): TopicProgress {
    try {
      const stored = localStorage.getItem(`mp_tp_${level}_${topicId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignored
    }
    return {
      topicId,
      level,
      attempted: 0,
      correct: 0,
      mastery: 'not_started',
      starsEarned: 0,
      lastAttemptedTimestamp: 0
    };
  }

  public async getAllTopicProgress(): Promise<Record<string, TopicProgress>> {
    await this.isReady;
    const result: Record<string, TopicProgress> = {};

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction('topicProgress', 'readonly');
          const store = tx.objectStore('topicProgress');
          const req = store.getAll();
          req.onsuccess = () => {
            if (req.result) {
              req.result.forEach((item: { key: string; data: TopicProgress }) => {
                result[item.key] = item.data;
              });
            }
            resolve(result);
          };
          req.onerror = () => resolve(result);
        } catch {
          resolve(result);
        }
      });
    }

    return result;
  }

  public async recordAttempt(
    level: LevelId,
    topicId: string,
    questionId: string,
    isCorrect: boolean,
    timeSpentSeconds: number,
    usedHint: boolean
  ): Promise<{ newProgress: TopicProgress; starsEarned: number }> {
    await this.isReady;
    const currentProgress = await this.getTopicProgress(level, topicId);

    const attempted = currentProgress.attempted + 1;
    const correct = currentProgress.correct + (isCorrect ? 1 : 0);
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    // Determine mastery progression
    let mastery: MasteryStatus = 'learning';
    if (attempted >= 3 && accuracy >= 50) mastery = 'practising';
    if (attempted >= 6 && accuracy >= 75) mastery = 'confident';
    if (attempted >= 10 && accuracy >= 85) mastery = 'mastered';

    const starsEarnedThisTime = isCorrect ? (usedHint ? 1 : 2) : 0;

    const newProgress: TopicProgress = {
      topicId,
      level,
      attempted,
      correct,
      mastery,
      starsEarned: currentProgress.starsEarned + starsEarnedThisTime,
      lastAttemptedTimestamp: Date.now()
    };

    const key = `${level}_${topicId}`;

    // Save to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(['topicProgress', 'attemptLogs'], 'readwrite');
        tx.objectStore('topicProgress').put({ key, data: newProgress });

        const log: QuestionAttemptLog = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          questionId,
          topicId,
          level,
          timestamp: Date.now(),
          isCorrect,
          attemptsCount: 1,
          timeSpentSeconds,
          usedHint
        };
        tx.objectStore('attemptLogs').put(log);
      } catch {
        // Fallback
      }
    }

    // Save fallback in localStorage
    try {
      localStorage.setItem(`mp_tp_${key}`, JSON.stringify(newProgress));
    } catch {
      // Ignored
    }

    // Update global stats
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = stats.lastPlayedDate !== today;

    this.saveStats({
      totalAnswered: stats.totalAnswered + 1,
      correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
      stars: stats.stars + starsEarnedThisTime,
      currentStreak: isNewDay ? stats.currentStreak + 1 : stats.currentStreak,
      highestStreak: Math.max(stats.highestStreak, isNewDay ? stats.currentStreak + 1 : stats.currentStreak),
      lastPlayedDate: today,
      minutesSpent: stats.minutesSpent + Math.round(timeSpentSeconds / 60)
    });

    return { newProgress, starsEarned: starsEarnedThisTime };
  }

  // --- Anti-Repetition Registry ---
  public async registerRecentQuestion(questionSignature: string): Promise<void> {
    await this.isReady;
    try {
      const stored = localStorage.getItem('mp_recent_q');
      let recents: string[] = stored ? JSON.parse(stored) : [];
      recents.push(questionSignature);
      if (recents.length > 60) {
        recents = recents.slice(recents.length - 60);
      }
      localStorage.setItem('mp_recent_q', JSON.stringify(recents));
    } catch {
      // Ignored
    }
  }

  public isQuestionRecent(questionSignature: string): boolean {
    try {
      const stored = localStorage.getItem('mp_recent_q');
      if (stored) {
        const recents: string[] = JSON.parse(stored);
        return recents.includes(questionSignature);
      }
    } catch {
      // Ignored
    }
    return false;
  }

  // --- Parent Area Question Logs ---
  public async getRecentAttemptLogs(limit = 40): Promise<QuestionAttemptLog[]> {
    await this.isReady;
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction('attemptLogs', 'readonly');
          const store = tx.objectStore('attemptLogs');
          const req = store.getAll();
          req.onsuccess = () => {
            const logs = (req.result as QuestionAttemptLog[]) || [];
            logs.sort((a, b) => b.timestamp - a.timestamp);
            resolve(logs.slice(0, limit));
          };
          req.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });
    }
    return [];
  }

  // Reset progress (Parent security gated)
  public async resetAllProgress(): Promise<void> {
    await this.isReady;
    if (this.db) {
      try {
        const tx = this.db.transaction(['topicProgress', 'recentQuestions', 'attemptLogs'], 'readwrite');
        tx.objectStore('topicProgress').clear();
        tx.objectStore('recentQuestions').clear();
        tx.objectStore('attemptLogs').clear();
      } catch {
        // Ignored
      }
    }
    try {
      localStorage.removeItem('mp_stats');
      localStorage.removeItem('mp_recent_q');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mp_tp_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // Ignored
    }
  }
}

export const storage = new StorageService();
