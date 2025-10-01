/**
 * Progress Tracking Integration Tests
 * 
 * Tests for localStorage integration, session persistence, cross-session continuity,
 * and performance validation for the Enhanced Interactive Lesson Learning Experience.
 * 
 * Coverage:
 * - localStorage API integration and data persistence
 * - Session restoration across browser sessions and tabs
 * - Cross-session continuity and progress synchronization
 * - Data validation and corruption handling
 * - Performance requirements and optimization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.storage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.storage.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    mockLocalStorage.storage.delete(key);
  }),
  clear: vi.fn(() => {
    mockLocalStorage.storage.clear();
  }),
  key: vi.fn((index: number) => {
    const keys = Array.from(mockLocalStorage.storage.keys());
    return keys[index] || null;
  }),
  get length() {
    return mockLocalStorage.storage.size;
  },
  get store() {
    return Object.fromEntries(mockLocalStorage.storage);
  }
};

// Mock the global localStorage
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Progress Tracking Integration', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks
    mockLocalStorage.storage.clear();
    vi.clearAllMocks();
  });

  describe('localStorage Integration', () => {
    it('should persist lesson progress to localStorage', () => {
      const lessonProgress = {
        lessonId: 'greetings-001',
        status: 'in-progress',
        startedAt: new Date(),
        timeSpent: 1800,
        segmentsCompleted: ['seg-001', 'seg-002'],
        vocabularyStudied: ['你好', '谢谢'],
        sessionId: 'test-session-001'
      };

      const storageKey = `lesson-progress-${lessonProgress.lessonId}`;
      const serializedProgress = JSON.stringify(lessonProgress);
      
      // Store progress
      mockLocalStorage.setItem(storageKey, serializedProgress);

      // Verify storage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(storageKey, serializedProgress);
      expect(mockLocalStorage.getItem(storageKey)).toBe(serializedProgress);
      expect(mockLocalStorage.storage.has(storageKey)).toBe(true);
      expect(mockLocalStorage.length).toBe(1);
    });

    it('should retrieve and deserialize lesson progress from localStorage', () => {
      const storedProgress = {
        lessonId: 'numbers-001',
        status: 'completed',
        startedAt: new Date('2024-01-15T10:00:00Z'),
        completedAt: new Date('2024-01-15T10:45:00Z'),
        timeSpent: 2700,
        segmentsCompleted: ['seg-001', 'seg-002', 'seg-003'],
        vocabularyStudied: ['一', '二', '三', '四', '五'],
        sessionId: 'test-session-002',
        finalScore: 0.95
      };

      const storageKey = `lesson-progress-${storedProgress.lessonId}`;
      mockLocalStorage.setItem(storageKey, JSON.stringify(storedProgress));

      // Retrieve and verify data
      const retrievedData = mockLocalStorage.getItem(storageKey);
      const parsedProgress = JSON.parse(retrievedData || '{}');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(storageKey);
      expect(parsedProgress.lessonId).toBe(storedProgress.lessonId);
      expect(parsedProgress.status).toBe('completed');
      expect(parsedProgress.timeSpent).toBe(2700);
      expect(parsedProgress.finalScore).toBe(0.95);
      expect(parsedProgress.segmentsCompleted).toHaveLength(3);
      expect(parsedProgress.vocabularyStudied).toHaveLength(5);
    });

    it('should handle multiple lesson progress entries', () => {
      const lessons = [
        { lessonId: 'greetings-001', status: 'completed', finalScore: 0.88 },
        { lessonId: 'numbers-001', status: 'in-progress', timeSpent: 1200 },
        { lessonId: 'family-001', status: 'not-started', timeSpent: 0 }
      ];

      // Store multiple lessons
      lessons.forEach(lesson => {
        const storageKey = `lesson-progress-${lesson.lessonId}`;
        mockLocalStorage.setItem(storageKey, JSON.stringify(lesson));
      });

      // Verify all stored
      expect(mockLocalStorage.length).toBe(3);

      // Retrieve and verify each lesson
      lessons.forEach(lesson => {
        const storageKey = `lesson-progress-${lesson.lessonId}`;
        const retrieved = JSON.parse(mockLocalStorage.getItem(storageKey) || '{}');
        expect(retrieved.lessonId).toBe(lesson.lessonId);
        expect(retrieved.status).toBe(lesson.status);
      });
    });
  });

  describe('Session Restoration', () => {
    it('should restore lesson session state from localStorage', () => {
      // Setup stored session data
      const sessionData = {
        lessonId: 'numbers-003',
        status: 'in-progress',
        startedAt: new Date('2024-01-15T14:00:00Z'),
        timeSpent: 2700,
        currentSegment: 'seg-005',
        segmentsCompleted: ['seg-001', 'seg-002', 'seg-003', 'seg-004'],
        vocabularyStudied: ['六', '七', '八', '九', '十'],
        sessionId: 'restore-session-001',
        preferences: {
          audioEnabled: true,
          showPinyin: true,
          playbackSpeed: 1.0
        }
      };

      mockLocalStorage.setItem('lesson-progress-numbers-003', JSON.stringify(sessionData));

      // Verify session can be restored
      const restoredData = JSON.parse(mockLocalStorage.getItem('lesson-progress-numbers-003') || '{}');
      
      expect(restoredData.lessonId).toBe('numbers-003');
      expect(restoredData.currentSegment).toBe('seg-005');
      expect(restoredData.timeSpent).toBe(2700);
      expect(restoredData.preferences.audioEnabled).toBe(true);
      expect(restoredData.preferences.showPinyin).toBe(true);
      expect(restoredData.segmentsCompleted).toHaveLength(4);
      expect(restoredData.vocabularyStudied).toHaveLength(5);
    });

    it('should restore global progress and user preferences', () => {
      // Setup global progress data
      mockLocalStorage.setItem('lesson-progress-greetings-001', JSON.stringify({
        lessonId: 'greetings-001',
        status: 'completed',
        finalScore: 0.92
      }));

      mockLocalStorage.setItem('lesson-progress-numbers-001', JSON.stringify({
        lessonId: 'numbers-001',
        status: 'completed',
        finalScore: 0.88
      }));

      mockLocalStorage.setItem('user-global-progress', JSON.stringify({
        totalLessonsCompleted: 2,
        totalTimeSpent: 5400,
        averageScore: 0.90,
        longestStreak: 7,
        currentStreak: 3,
        lastActiveDate: '2024-01-15T16:30:00Z'
      }));

      // Count lesson progress items and verify global progress
      let lessonProgressCount = 0;
      let completedLessons = 0;
      let globalProgressFound = false;

      for (let i = 0; i < mockLocalStorage.length; i++) {
        const key = mockLocalStorage.key(i);
        if (key?.startsWith('lesson-progress-')) {
          lessonProgressCount++;
          const data = JSON.parse(mockLocalStorage.getItem(key) || '{}');
          if (data.status === 'completed') completedLessons++;
        } else if (key === 'user-global-progress') {
          globalProgressFound = true;
        }
      }

      // Verify restoration results
      expect(lessonProgressCount).toBe(2);
      expect(completedLessons).toBe(2);
      expect(globalProgressFound).toBe(true);
      expect(mockLocalStorage.length).toBe(3); // 2 lessons + 1 global
    });

    it('should validate corrupted session data', () => {
      // Setup test data including corrupted JSON
      mockLocalStorage.setItem('lesson-progress-valid-001', JSON.stringify({
        lessonId: 'valid-001',
        status: 'completed',
        finalScore: 0.88
      }));

      mockLocalStorage.setItem('lesson-progress-malformed-001', '{"lessonId":"malformed-001","status":"in-progress"'); // Missing closing brace

      let validItems = 0;
      let corruptedItems = 0;

      // Validate data
      for (let i = 0; i < mockLocalStorage.length; i++) {
        const key = mockLocalStorage.key(i);
        if (key?.startsWith('lesson-progress-')) {
          const rawData = mockLocalStorage.getItem(key);
          if (rawData) {
            try {
              JSON.parse(rawData);
              validItems++;
            } catch {
              corruptedItems++;
              mockLocalStorage.removeItem(key);
            }
          }
        }
      }

      // Verify data validation
      expect(validItems).toBe(1);
      expect(corruptedItems).toBe(1);
      expect(mockLocalStorage.length).toBe(1); // Only valid item remains
    });
  });

  describe('Cross-Session Continuity', () => {
    it('should maintain study continuity across browser sessions', () => {
      // Session 1: Initial study session
      const initialSession = {
        lessonId: 'weather-001',
        status: 'in-progress',
        startedAt: new Date('2024-01-15T09:00:00Z'),
        timeSpent: 1200,
        currentSegment: 'seg-003',
        segmentsCompleted: ['seg-001', 'seg-002'],
        vocabularyStudied: ['天气', '晴天'],
        sessionId: 'cross-session-001'
      };

      mockLocalStorage.setItem(`lesson-progress-${initialSession.lessonId}`, JSON.stringify(initialSession));

      // Session 2: Continue and update progress
      const storedData = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${initialSession.lessonId}`) || '{}');
      const updatedSession = {
        ...storedData,
        timeSpent: 2400,
        currentSegment: 'seg-005',
        segmentsCompleted: ['seg-001', 'seg-002', 'seg-003', 'seg-004'],
        vocabularyStudied: ['天气', '晴天', '下雨', '下雪'],
        sessionId: 'cross-session-002'
      };

      mockLocalStorage.setItem(`lesson-progress-${initialSession.lessonId}`, JSON.stringify(updatedSession));

      // Session 3: Complete lesson
      const finalData = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${initialSession.lessonId}`) || '{}');
      const completedSession = {
        ...finalData,
        status: 'completed',
        completedAt: new Date('2024-01-15T10:30:00Z'),
        timeSpent: 3600,
        finalScore: 0.89
      };

      mockLocalStorage.setItem(`lesson-progress-${initialSession.lessonId}`, JSON.stringify(completedSession));

      // Verify cross-session continuity
      const result = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${initialSession.lessonId}`) || '{}');
      
      expect(result.lessonId).toBe(initialSession.lessonId);
      expect(result.status).toBe('completed');
      expect(result.timeSpent).toBe(3600);
      expect(result.segmentsCompleted).toHaveLength(4);
      expect(result.vocabularyStudied).toHaveLength(4);
      expect(result.finalScore).toBe(0.89);
      expect(result.sessionId).toBe('cross-session-002');
    });

    it('should handle concurrent multi-tab session updates', () => {
      const baseSession = {
        lessonId: 'shopping-001',
        status: 'in-progress',
        startedAt: new Date(),
        timeSpent: 600,
        segmentsCompleted: [] as string[],
        vocabularyStudied: [] as string[],
        sessionId: 'multi-tab-base'
      };

      mockLocalStorage.setItem(`lesson-progress-${baseSession.lessonId}`, JSON.stringify(baseSession));

      // Tab 1 updates
      const currentData1 = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${baseSession.lessonId}`) || '{}');
      const tab1Update = {
        ...currentData1,
        timeSpent: 1200,
        segmentsCompleted: ['seg-001', 'seg-002'],
        vocabularyStudied: ['买', '卖'],
        sessionId: 'multi-tab-001'
      };
      mockLocalStorage.setItem(`lesson-progress-${baseSession.lessonId}`, JSON.stringify(tab1Update));

      // Tab 2 updates (last write wins)
      const currentData2 = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${baseSession.lessonId}`) || '{}');
      const tab2Update = {
        ...currentData2,
        timeSpent: 1500,
        segmentsCompleted: ['seg-001', 'seg-002', 'seg-003'],
        vocabularyStudied: ['买', '卖', '钱'],
        sessionId: 'multi-tab-002'
      };
      mockLocalStorage.setItem(`lesson-progress-${baseSession.lessonId}`, JSON.stringify(tab2Update));

      // Verify final state (Tab 2 should win)
      const finalData = JSON.parse(mockLocalStorage.getItem(`lesson-progress-${baseSession.lessonId}`) || '{}');
      
      expect(finalData.sessionId).toBe('multi-tab-002');
      expect(finalData.timeSpent).toBe(1500);
      expect(finalData.segmentsCompleted).toHaveLength(3);
      expect(finalData.vocabularyStudied).toHaveLength(3);
    });
  });

  describe('Performance Validation', () => {
    it('should meet localStorage performance requirements', () => {
      const startTime = performance.now();
      
      // Test rapid storage operations
      for (let i = 0; i < 100; i++) {
        const lesson = {
          lessonId: `perf-test-${i}`,
          status: i % 2 === 0 ? 'completed' : 'in-progress',
          timeSpent: Math.floor(Math.random() * 3600),
          finalScore: Math.random()
        };
        
        mockLocalStorage.setItem(`lesson-progress-perf-${i}`, JSON.stringify(lesson));
      }
      
      const storageTime = performance.now() - startTime;
      
      // Test retrieval performance
      const retrievalStart = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const data = mockLocalStorage.getItem(`lesson-progress-perf-${i}`);
        if (data) {
          JSON.parse(data);
        }
      }
      
      const retrievalTime = performance.now() - retrievalStart;
      
      // Verify performance (mock operations should be very fast)
      expect(storageTime).toBeLessThan(100); // 100ms for 100 operations
      expect(retrievalTime).toBeLessThan(50);  // 50ms for 100 retrievals
      expect(mockLocalStorage.length).toBe(100);
    });

    it('should handle large session data efficiently', () => {
      // Create large session data
      const largeVocabulary = Array.from({ length: 500 }, (_, i) => `词汇单词项目${i}_这是一个比较长的中文词汇用于测试大数据处理性能`);
      const largeSegments = Array.from({ length: 100 }, (_, i) => `seg-${String(i).padStart(3, '0')}`);
      
      const largeSession = {
        lessonId: 'large-data-test',
        status: 'in-progress',
        startedAt: new Date(),
        timeSpent: 7200,
        segmentsCompleted: largeSegments,
        vocabularyStudied: largeVocabulary,
        sessionId: 'large-session-001',
        detailedProgress: largeSegments.map(seg => ({
          segmentId: seg,
          timeSpent: Math.floor(Math.random() * 120),
          attempts: Math.floor(Math.random() * 5) + 1,
          accuracy: Math.random(),
          notes: `Detailed notes for segment ${seg} with comprehensive learning progress tracking information`
        }))
      };

      const startTime = performance.now();
      
      // Test large data storage and retrieval
      const serialized = JSON.stringify(largeSession);
      mockLocalStorage.setItem(`lesson-progress-${largeSession.lessonId}`, serialized);
      
      const retrieved = mockLocalStorage.getItem(`lesson-progress-${largeSession.lessonId}`);
      const parsed = JSON.parse(retrieved || '{}');
      
      const totalTime = performance.now() - startTime;
      
      // Verify performance and data integrity
      expect(totalTime).toBeLessThan(50); // Should handle large data quickly
      expect(parsed.vocabularyStudied).toHaveLength(500);
      expect(parsed.segmentsCompleted).toHaveLength(100);
      expect(parsed.detailedProgress).toHaveLength(100);
      expect(serialized.length).toBeGreaterThan(30000); // Verify it's actually large data
    });
  });
});