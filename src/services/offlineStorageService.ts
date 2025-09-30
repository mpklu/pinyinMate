/**
 * Offline Storage Service
 * Implements offline lesson storage and caching per NFR-007
 * Provides IndexedDB integration with fallback to localStorage
 */

// Define LessonData interface locally to avoid import issues
interface LessonData {
  id: string;
  title: string;
  content: string;
  level?: string;
  category?: string;
  vocabulary?: Array<{ word: string; pinyin: string; translation: string }>;
  audio?: string;
  metadata?: Record<string, unknown>;
}

// Storage configuration
const STORAGE_CONFIG = {
  dbName: 'LearnChineseDB',
  dbVersion: 1,
  stores: {
    lessons: 'lessons',
    progress: 'progress',
    cache: 'cache',
    settings: 'settings'
  },
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  maxStorageSize: 50 * 1024 * 1024, // 50MB
};

// Storage interfaces
interface StoredLesson extends LessonData {
  timestamp: number;
  size: number;
  version: string;
}

interface StorageProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  attempts: number;
  lastAttempt: number;
  timeSpent: number;
}

interface CacheEntry {
  key: string;
  data: unknown;
  timestamp: number;
  expiry: number;
  size: number;
}

interface StorageQuota {
  used: number;
  available: number;
  total: number;
}

/**
 * Offline Storage Service Implementation
 */
export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  // Maximum retry attempts for operations
  // private readonly maxRetries = 3; // Currently unused

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  /**
   * Initialize the storage service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if IndexedDB is supported
      if (!this.isIndexedDBSupported()) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        this.isInitialized = true;
        return true;
      }

      // Initialize IndexedDB
      await this.initializeIndexedDB();
      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      this.isInitialized = true; // Still allow localStorage fallback
      return false;
    }
  }

  /**
   * Store lesson data offline
   */
  async storeLesson(lesson: LessonData): Promise<boolean> {
    await this.initialize();

    try {
      const storedLesson: StoredLesson = {
        ...lesson,
        timestamp: Date.now(),
        size: this.calculateDataSize(lesson),
        version: '1.0'
      };

      // Check storage quota before storing
      const quota = await this.getStorageQuota();
      if (quota.used + storedLesson.size > quota.available) {
        await this.cleanupOldContent();
      }

      // Try IndexedDB first
      if (this.db) {
        return await this.storeInIndexedDB('lessons', storedLesson, lesson.id);
      }

      // Fallback to localStorage
      return this.storeInLocalStorage(`lesson-${lesson.id}`, storedLesson);

    } catch (error) {
      console.error('Failed to store lesson:', error);
      return false;
    }
  }

  /**
   * Retrieve lesson data from offline storage
   */
  async getLesson(lessonId: string): Promise<LessonData | null> {
    await this.initialize();

    try {
      // Try IndexedDB first
      if (this.db) {
        const storedLesson = await this.getFromIndexedDB<StoredLesson>('lessons', lessonId);
        if (storedLesson) {
          return this.convertStoredToLesson(storedLesson);
        }
      }

      // Fallback to localStorage
      const storedLesson = this.getFromLocalStorage<StoredLesson>(`lesson-${lessonId}`);
      if (storedLesson) {
        return this.convertStoredToLesson(storedLesson);
      }

      return null;

    } catch (error) {
      console.error('Failed to retrieve lesson:', error);
      return null;
    }
  }

  /**
   * Get all stored lessons
   */
  async getAllLessons(): Promise<LessonData[]> {
    await this.initialize();

    try {
      const lessons: LessonData[] = [];

      // Try IndexedDB first
      if (this.db) {
        const storedLessons = await this.getAllFromIndexedDB<StoredLesson>('lessons');
        lessons.push(...storedLessons.map(sl => this.convertStoredToLesson(sl)));
      } else {
        // Fallback to localStorage
        const localLessons = this.getAllFromLocalStorage<StoredLesson>('lesson-');
        lessons.push(...localLessons.map(sl => this.convertStoredToLesson(sl)));
      }

      return lessons;

    } catch (error) {
      console.error('Failed to retrieve all lessons:', error);
      return [];
    }
  }

  /**
   * Store lesson progress
   */
  async storeProgress(progress: StorageProgress): Promise<boolean> {
    await this.initialize();

    try {
      if (this.db) {
        return await this.storeInIndexedDB('progress', progress, progress.lessonId);
      }

      return this.storeInLocalStorage(`progress-${progress.lessonId}`, progress);

    } catch (error) {
      console.error('Failed to store progress:', error);
      return false;
    }
  }

  /**
   * Retrieve lesson progress
   */
  async getProgress(lessonId: string): Promise<StorageProgress | null> {
    await this.initialize();

    try {
      if (this.db) {
        return await this.getFromIndexedDB<StorageProgress>('progress', lessonId);
      }

      return this.getFromLocalStorage<StorageProgress>(`progress-${lessonId}`);

    } catch (error) {
      console.error('Failed to retrieve progress:', error);
      return null;
    }
  }

  /**
   * Cache arbitrary data with expiry
   */
  async cacheData(key: string, data: unknown, expiryMs: number = STORAGE_CONFIG.cacheExpiry): Promise<boolean> {
    await this.initialize();

    try {
      const cacheEntry: CacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + expiryMs,
        size: this.calculateDataSize(data)
      };

      if (this.db) {
        return await this.storeInIndexedDB('cache', cacheEntry, key);
      }

      return this.storeInLocalStorage(`cache-${key}`, cacheEntry);

    } catch (error) {
      console.error('Failed to cache data:', error);
      return false;
    }
  }

  /**
   * Retrieve cached data
   */
  async getCachedData<T>(key: string): Promise<T | null> {
    await this.initialize();

    try {
      let cacheEntry: CacheEntry | null = null;

      if (this.db) {
        cacheEntry = await this.getFromIndexedDB<CacheEntry>('cache', key);
      } else {
        cacheEntry = this.getFromLocalStorage<CacheEntry>(`cache-${key}`);
      }

      if (!cacheEntry) {
        return null;
      }

      // Check if expired
      if (Date.now() > cacheEntry.expiry) {
        await this.removeCachedData(key);
        return null;
      }

      return cacheEntry.data as T;

    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<boolean> {
    await this.initialize();

    try {
      if (this.db) {
        return await this.deleteFromIndexedDB('cache', key);
      }

      return this.removeFromLocalStorage(`cache-${key}`);

    } catch (error) {
      console.error('Failed to remove cached data:', error);
      return false;
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(): Promise<StorageQuota> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          total: estimate.quota || 0
        };
      }

      // Fallback estimation for localStorage
      const used = this.estimateLocalStorageUsage();
      const available = Math.max(0, 5 * 1024 * 1024 - used); // Assume 5MB limit
      
      return {
        used,
        available,
        total: 5 * 1024 * 1024
      };

    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * Clean up old content to free space
   */
  async cleanupOldContent(): Promise<number> {
    let deletedBytes = 0;

    try {
      // Clean up expired cache entries
      deletedBytes += await this.cleanupExpiredCache();

      // Clean up old lessons if still need space
      const quota = await this.getStorageQuota();
      if (quota.available < 10 * 1024 * 1024) { // Less than 10MB available
        deletedBytes += await this.cleanupOldLessons();
      }

      return deletedBytes;

    } catch (error) {
      console.error('Failed to cleanup old content:', error);
      return 0;
    }
  }

  /**
   * Delete lesson from offline storage
   */
  async deleteLesson(lessonId: string): Promise<boolean> {
    await this.initialize();

    try {
      let success = true;

      if (this.db) {
        success = await this.deleteFromIndexedDB('lessons', lessonId);
      } else {
        success = this.removeFromLocalStorage(`lesson-${lessonId}`);
      }

      // Also clean up related data
      await this.deleteFromIndexedDB('progress', lessonId);
      this.removeFromLocalStorage(`progress-${lessonId}`);

      return success;

    } catch (error) {
      console.error('Failed to delete lesson:', error);
      return false;
    }
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<boolean> {
    try {
      if (this.db) {
        const stores = Object.values(STORAGE_CONFIG.stores);
        const promises = stores.map(store => this.clearStore(store));
        await Promise.all(promises);
      }

      // Clear localStorage
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => 
        key.startsWith('lesson-') || 
        key.startsWith('progress-') ||
        key.startsWith('cache-')
      );
      
      appKeys.forEach(key => localStorage.removeItem(key));

      return true;

    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  // Private implementation methods

  private isIndexedDBSupported(): boolean {
    return typeof window !== 'undefined' && 
           'indexedDB' in window && 
           indexedDB !== null;
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_CONFIG.dbName, STORAGE_CONFIG.dbVersion);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onupgradeneeded = () => {
        const db = request.result;

        // Create object stores
        Object.values(STORAGE_CONFIG.stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Add indexes for common queries
            if (storeName === 'lessons') {
              store.createIndex('timestamp', 'timestamp');
              store.createIndex('category', 'category');
            } else if (storeName === 'cache') {
              store.createIndex('expiry', 'expiry');
            }
          }
        });
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
    });
  }

  private async storeInIndexedDB(storeName: string, data: unknown, id: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const dataWithId = typeof data === 'object' && data !== null 
        ? { ...(data as Record<string, unknown>), id }
        : { data, id };
      const request = store.put(dataWithId);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  private async getFromIndexedDB<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
      request.onerror = () => resolve(null);
    });
  }

  private async getAllFromIndexedDB<T>(storeName: string): Promise<T[]> {
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  private async deleteFromIndexedDB(storeName: string, id: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  private async clearStore(storeName: string): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  }

  private storeInLocalStorage(key: string, data: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to store in localStorage:', error);
      return false;
    }
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve from localStorage:', error);
      return null;
    }
  }

  private getAllFromLocalStorage<T>(prefix: string): T[] {
    try {
      const items: T[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          const data = this.getFromLocalStorage<T>(key);
          if (data) items.push(data);
        }
      }
      return items;
    } catch (error) {
      console.error('Failed to retrieve all from localStorage:', error);
      return [];
    }
  }

  private removeFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  private calculateDataSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  private estimateLocalStorageUsage(): number {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          total += (key.length + (value?.length || 0)) * 2; // UTF-16 encoding
        }
      }
    } catch (error) {
      console.error('Failed to estimate localStorage usage:', error);
    }
    return total;
  }

  private convertStoredToLesson(stored: StoredLesson): LessonData {
    // Extract lesson data without metadata fields
    const lesson: LessonData = {
      id: stored.id,
      title: stored.title,
      content: stored.content,
      level: stored.level,
      category: stored.category,
      vocabulary: stored.vocabulary,
      audio: stored.audio,
      metadata: stored.metadata
    };
    return lesson;
  }

  private async cleanupExpiredCache(): Promise<number> {
    let deletedBytes = 0;

    try {
      if (this.db) {
        const cacheEntries = await this.getAllFromIndexedDB<CacheEntry>('cache');
        const now = Date.now();
        
        for (const entry of cacheEntries) {
          if (now > entry.expiry) {
            await this.deleteFromIndexedDB('cache', entry.key);
            deletedBytes += entry.size;
          }
        }
      } else {
        // Clean localStorage cache
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith('cache-'));
        
        for (const key of cacheKeys) {
          const entry = this.getFromLocalStorage<CacheEntry>(key);
          if (entry && Date.now() > entry.expiry) {
            this.removeFromLocalStorage(key);
            deletedBytes += entry.size;
          }
        }
      }

    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }

    return deletedBytes;
  }

  private async cleanupOldLessons(): Promise<number> {
    let deletedBytes = 0;

    try {
      const lessons = await this.getAllFromIndexedDB<StoredLesson>('lessons');
      
      // Sort by timestamp, oldest first
      lessons.sort((a, b) => a.timestamp - b.timestamp);
      
      // Delete oldest 25% of lessons
      const deleteCount = Math.floor(lessons.length * 0.25);
      
      for (let i = 0; i < deleteCount; i++) {
        const lesson = lessons[i];
        await this.deleteLesson(lesson.id);
        deletedBytes += lesson.size;
      }

    } catch (error) {
      console.error('Failed to cleanup old lessons:', error);
    }

    return deletedBytes;
  }
}

// Export singleton instance
export const offlineStorageService = OfflineStorageService.getInstance();

// Export types for external use
export type { StoredLesson, StorageProgress, CacheEntry, StorageQuota };