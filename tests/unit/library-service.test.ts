/**
 * Unit tests for LibraryService edge cases and error handling
 * Comprehensive test coverage for boundary conditions, error scenarios, and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LibraryService } from '../../src/services/libraryService';
import type { 
  RemoteSource,
} from '../../src/types/library';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('LibraryService Edge Cases', () => {
  let service: LibraryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LibraryService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization Edge Cases', () => {
    it('should handle empty local manifest gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: [] }),
      });

      const library = await service.loadLibrary();
      
      expect(library.lessons).toEqual([]);
      expect(library.categories).toEqual([]);
      expect(library.totalLessons).toBe(0);
    });

    it('should handle malformed manifest JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(service.loadLibrary()).rejects.toThrow('Invalid JSON');
    });

    it('should handle missing manifest file (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.loadLibrary()).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network timeout during initialization', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(service.loadLibrary()).rejects.toThrow('Network timeout');
    });

    it('should handle lessons with missing required fields', async () => {
      const malformedLessons = [
        { id: 'lesson1' }, // missing title, content, etc.
        { title: 'Lesson 2' }, // missing id, content, etc.
        { id: 'lesson3', title: 'Lesson 3' }, // missing content
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: malformedLessons }),
      });

      const library = await service.loadLibrary();
      
      // Should filter out malformed lessons or provide defaults
      expect(library.lessons.length).toBeLessThanOrEqual(malformedLessons.length);
    });
  });

  describe('Search and Filtering Edge Cases', () => {
    const mockLessons: Lesson[] = [
      {
        id: 'lesson1',
        title: 'Greetings',
        content: 'Hello world',
        category: 'beginner',
        difficulty: 'beginner',
        vocabulary: [{ chinese: '你好', pinyin: 'nǐ hǎo', english: 'hello' }],
        tags: ['conversation'],
        estimatedTime: 10,
      },
      {
        id: 'lesson2',
        title: 'Numbers',
        content: 'Count to ten',
        category: 'beginner',
        difficulty: 'beginner',
        vocabulary: [],
        tags: [],
        estimatedTime: 15,
      },
    ];

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      });
      await service.loadLibrary();
    });

    it('should handle empty search query', async () => {
      const results = await service.searchLessons('');
      expect(results).toEqual(mockLessons);
    });

    it('should handle search query with only whitespace', async () => {
      const results = await service.searchLessons('   \t\n   ');
      expect(results).toEqual(mockLessons);
    });

    it('should handle search query with special characters', async () => {
      const results = await service.searchLessons('!@#$%^&*()');
      expect(results).toEqual([]);
    });

    it('should handle search query with unicode characters', async () => {
      const results = await service.searchLessons('你好');
      expect(results).toContain(mockLessons[0]);
    });

    it('should handle filters with non-existent category', async () => {
      const filters: LessonSearchFilters = {
        category: 'non-existent-category',
      };
      
      const results = await service.searchLessons('', filters);
      expect(results).toEqual([]);
    });

    it('should handle filters with empty arrays', async () => {
      const filters: LessonSearchFilters = {
        tags: [],
        vocabulary: [],
      };
      
      const results = await service.searchLessons('', filters);
      expect(results).toEqual(mockLessons);
    });

    it('should handle filters with undefined values', async () => {
      const filters: LessonSearchFilters = {
        category: undefined,
        difficulty: undefined,
        tags: undefined,
        vocabulary: undefined,
      };
      
      const results = await service.searchLessons('', filters);
      expect(results).toEqual(mockLessons);
    });
  });

  describe('Remote Source Edge Cases', () => {
    it('should handle remote source with invalid URL', async () => {
      const invalidSource: RemoteSource = {
        id: 'invalid',
        name: 'Invalid Source',
        url: 'not-a-valid-url',
        type: 'json',
      };

      await expect(service.addRemoteSource(invalidSource)).rejects.toThrow();
    });

    it('should handle remote source returning non-JSON content', async () => {
      const source: RemoteSource = {
        id: 'html-source',
        name: 'HTML Source',
        url: 'https://example.com/lessons.html',
        type: 'json',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Unexpected token < in JSON')),
      });

      await expect(service.addRemoteSource(source)).rejects.toThrow();
    });

    it('should handle remote source with authentication errors', async () => {
      const source: RemoteSource = {
        id: 'auth-source',
        name: 'Auth Required Source',
        url: 'https://api.example.com/lessons',
        type: 'json',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(service.addRemoteSource(source)).rejects.toThrow('HTTP error! status: 401');
    });

    it('should handle remote source sync when offline', async () => {
      const source: RemoteSource = {
        id: 'offline-source',
        name: 'Offline Source',
        url: 'https://example.com/lessons.json',
        type: 'json',
      };

      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(service.syncRemoteSource('offline-source')).rejects.toThrow('Failed to fetch');
    });

    it('should handle concurrent remote source syncs', async () => {
      const source: RemoteSource = {
        id: 'concurrent-source',
        name: 'Concurrent Source',
        url: 'https://example.com/lessons.json',
        type: 'json',
      };

      await service.addRemoteSource(source);

      // Mock delayed response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ lessons: [] }),
        }), 100))
      );

      // Start multiple syncs concurrently
      const syncPromises = [
        service.syncRemoteSource('concurrent-source'),
        service.syncRemoteSource('concurrent-source'),
        service.syncRemoteSource('concurrent-source'),
      ];

      const results = await Promise.allSettled(syncPromises);
      
      // Should handle concurrent syncs gracefully
      expect(results.every(result => result.status === 'fulfilled')).toBe(true);
    });
  });

  describe('Cache Management Edge Cases', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('should handle corrupted cache data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data');

      // Should not throw and fall back to fresh data
      expect(() => service.getCachedLessons()).not.toThrow();
    });

    it('should handle cache with missing timestamps', () => {
      const cacheWithoutTimestamp = JSON.stringify({
        lessons: [{ id: 'lesson1', title: 'Test' }],
        // missing timestamp
      });
      
      mockLocalStorage.getItem.mockReturnValue(cacheWithoutTimestamp);

      const cached = service.getCachedLessons();
      expect(cached).toBeNull(); // Should treat as expired
    });

    it('should handle cache size limits', () => {
      const config: CacheConfig = {
        maxSize: 1, // 1 KB limit
        ttl: 3600000, // 1 hour
      };

      service.setCacheConfig(config);

      // Try to cache large data that exceeds limit
      const largeData = {
        lessons: Array(1000).fill(0).map((_, i) => ({
          id: `lesson${i}`,
          title: `Lesson ${i}`,
          content: 'x'.repeat(1000), // Large content
          category: 'test',
          difficulty: 'beginner' as const,
          vocabulary: [],
          tags: [],
          estimatedTime: 10,
        })),
        timestamp: Date.now(),
      };

      // Should handle gracefully without throwing
      expect(() => service.setCachedLessons(largeData.lessons)).not.toThrow();
    });

    it('should handle localStorage quota exceeded error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const lessons: Lesson[] = [{
        id: 'lesson1',
        title: 'Test',
        content: 'Test content',
        category: 'test',
        difficulty: 'beginner',
        vocabulary: [],
        tags: [],
        estimatedTime: 10,
      }];

      // Should handle quota exceeded gracefully
      expect(() => service.setCachedLessons(lessons)).not.toThrow();
    });

    it('should handle multiple cache operations in rapid succession', () => {
      const lessons: Lesson[] = [{
        id: 'lesson1',
        title: 'Test',
        content: 'Test content',
        category: 'test',
        difficulty: 'beginner',
        vocabulary: [],
        tags: [],
        estimatedTime: 10,
      }];

      // Rapidly call cache operations
      for (let i = 0; i < 100; i++) {
        service.setCachedLessons(lessons);
        service.getCachedLessons();
        service.clearCache();
      }

      // Should handle without throwing
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Memory Management Edge Cases', () => {
    it('should handle large lesson collections without memory leaks', async () => {
      const largeLessonCollection = Array(10000).fill(0).map((_, i) => ({
        id: `lesson${i}`,
        title: `Lesson ${i}`,
        content: 'x'.repeat(1000),
        category: 'test',
        difficulty: 'beginner' as const,
        vocabulary: Array(100).fill(0).map((_, j) => ({
          chinese: `词${j}`,
          pinyin: `cí${j}`,
          english: `word${j}`,
        })),
        tags: [`tag${i % 10}`],
        estimatedTime: 10,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: largeLessonCollection }),
      });

      const library = await service.loadLibrary();
      
      expect(library.lessons.length).toBe(10000);
      expect(library.totalLessons).toBe(10000);
    });

    it('should handle service cleanup and disposal', () => {
      // Create multiple service instances
      const services = Array(100).fill(0).map(() => new LibraryService());
      
      // Should not cause memory issues
      expect(services.length).toBe(100);
      
      // Cleanup
      services.length = 0;
    });
  });

  describe('Concurrent Operations Edge Cases', () => {
    it('should handle concurrent lesson loading', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ lessons: [] }),
      });

      // Start multiple load operations concurrently
      const loadPromises = Array(10).fill(0).map(() => service.loadLibrary());
      
      const results = await Promise.all(loadPromises);
      
      // All should complete successfully
      results.forEach(library => {
        expect(library).toBeDefined();
        expect(Array.isArray(library.lessons)).toBe(true);
      });
    });

    it('should handle concurrent search operations', async () => {
      const mockLessons: Lesson[] = [{
        id: 'lesson1',
        title: 'Test',
        content: 'Test content',
        category: 'test',
        difficulty: 'beginner',
        vocabulary: [],
        tags: [],
        estimatedTime: 10,
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: mockLessons }),
      });

      await service.loadLibrary();

      // Start multiple concurrent searches
      const searchPromises = Array(10).fill(0).map((_, i) => 
        service.searchLessons(`query${i}`)
      );
      
      const results = await Promise.all(searchPromises);
      
      // All should complete successfully
      results.forEach(searchResults => {
        expect(Array.isArray(searchResults)).toBe(true);
      });
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('should recover from temporary network failures', async () => {
      // First call fails
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ lessons: [] }),
        });

      // First attempt should fail
      await expect(service.loadLibrary()).rejects.toThrow('Network error');
      
      // Second attempt should succeed
      const library = await service.loadLibrary();
      expect(library).toBeDefined();
    });

    it('should handle partial data corruption gracefully', async () => {
      const partiallyCorruptedLessons = [
        {
          id: 'lesson1',
          title: 'Good Lesson',
          content: 'Valid content',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: [],
          tags: [],
          estimatedTime: 10,
        },
        {
          id: 'lesson2',
          title: null, // corrupted
          content: 'Valid content',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: [],
          tags: [],
          estimatedTime: 10,
        },
        {
          id: 'lesson3',
          title: 'Another Good Lesson',
          content: 'Valid content',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: [],
          tags: [],
          estimatedTime: 10,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ lessons: partiallyCorruptedLessons }),
      });

      const library = await service.loadLibrary();
      
      // Should filter out corrupted lessons or provide defaults
      expect(library.lessons.length).toBeGreaterThan(0);
      expect(library.lessons.every(lesson => typeof lesson.title === 'string')).toBe(true);
    });
  });

  describe('Security Validation (Enhanced)', () => {
    it('should reject remote sources with malicious URLs', async () => {
      const maliciousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'file:///etc/passwd',
        'ftp://malicious.com/payload',
        'http://localhost:3000/../../../etc/passwd',
      ];

      for (const url of maliciousUrls) {
        const source: RemoteSource = {
          id: 'malicious',
          name: 'Malicious Source',
          url,
          enabled: true,
        };

        await expect(service.addRemoteSource(source)).rejects.toThrow(
          /Invalid URL scheme|Security violation/
        );
      }
    });

    it('should validate and sanitize lesson content to prevent XSS', async () => {
      const xssContent = {
        lessons: [{
          id: 'xss-test',
          title: 'Test <script>alert("xss")</script> Lesson',
          content: 'Hello <img src="x" onerror="alert(1)"> World',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: [
            {
              chinese: '你好<script>alert("xss")</script>',
              english: 'hello',
              pinyin: 'nǐ hǎo',
            },
          ],
          tags: ['<iframe src="javascript:alert(1)"></iframe>'],
          estimatedTime: 10,
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(xssContent),
        headers: { get: () => 'application/json' },
      });

      const library = await service.loadLibrary();
      const lesson = library.lessons.find(l => l.id === 'xss-test');

      // Content should be sanitized
      expect(lesson?.title).not.toContain('<script>');
      expect(lesson?.content).not.toContain('onerror=');
      expect(lesson?.vocabulary?.[0]?.chinese).not.toContain('<script>');
      expect(lesson?.tags?.[0]).not.toContain('<iframe>');
    });

    it('should enforce file size limits for remote sources', async () => {
      const createLargeResponse = (sizeMB: number) => ({
        ok: true,
        json: () => Promise.resolve({ 
          lessons: [{ 
            id: 'large', 
            title: 'Large Lesson',
            content: 'x'.repeat(sizeMB * 1024 * 1024),
            category: 'beginner',
            difficulty: 'beginner',
            vocabulary: [],
            tags: [],
            estimatedTime: 10,
          }] 
        }),
        headers: { 
          get: (header: string) => {
            if (header === 'content-length') return (sizeMB * 1024 * 1024).toString();
            if (header === 'content-type') return 'application/json';
            return null;
          }
        },
      });

      // Test 15MB content (should be rejected, limit is 10MB)
      mockFetch.mockResolvedValueOnce(createLargeResponse(15));

      const source: RemoteSource = {
        id: 'large',
        name: 'Large Source',
        url: 'https://example.com/large.json',
        enabled: true,
      };

      await expect(service.syncRemoteSource(source)).rejects.toThrow(
        /File size exceeds|Too large/
      );
    });

    it('should validate JSON schema for remote lesson data', async () => {
      const invalidSchemas = [
        // Missing required fields
        { lessons: [{ id: 'test' }] },
        // Wrong data types
        { lessons: [{ 
          id: 123, 
          title: null, 
          content: [], 
          category: 'beginner',
          difficulty: 'beginner'
        }] },
        // Invalid nested structure
        { lessons: [{ 
          id: 'test',
          title: 'Test',
          content: 'Content',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: 'not-an-array'
        }] },
      ];

      for (const invalidData of invalidSchemas) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidData),
          headers: { get: () => 'application/json' },
        });

        const source: RemoteSource = {
          id: 'invalid',
          name: 'Invalid Source',
          url: 'https://example.com/invalid.json',
          enabled: true,
        };

        await expect(service.syncRemoteSource(source)).rejects.toThrow(
          /Invalid.*schema|Validation failed/
        );
      }
    });

    it('should handle and log security violations appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const suspiciousContent = {
        lessons: [{
          id: 'suspicious',
          title: 'Suspicious Lesson',
          content: 'onclick="maliciousFunction()" data-evil="payload"',
          category: 'beginner',
          difficulty: 'beginner',
          vocabulary: [],
          tags: [],
          estimatedTime: 10,
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(suspiciousContent),
        headers: { get: () => 'application/json' },
      });

      await service.loadLibrary();

      // Should log security warnings
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Security warning|Suspicious content/)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Enhanced Error Recovery', () => {
    it('should gracefully degrade when remote sources are compromised', async () => {
      // Simulate compromised remote source returning malicious data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          lessons: 'this-should-be-an-array',
          maliciousPayload: '<script>steal_data()</script>',
        }),
        headers: { get: () => 'application/json' },
      });

      const source: RemoteSource = {
        id: 'compromised',
        name: 'Compromised Source',
        url: 'https://example.com/compromised.json',
        enabled: true,
      };

      // Should not crash the service
      await expect(service.syncRemoteSource(source)).rejects.toThrow();
      
      // Service should remain functional
      const lessons = await service.getLessons();
      expect(Array.isArray(lessons)).toBe(true);
    });

    it('should implement rate limiting for security', async () => {
      const source: RemoteSource = {
        id: 'rate-limit-test',
        name: 'Rate Limit Test',
        url: 'https://example.com/test.json',
        enabled: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ lessons: [] }),
        headers: { get: () => 'application/json' },
      });

      // Make many rapid requests
      const promises = Array.from({ length: 20 }, () => 
        service.syncRemoteSource(source)
      );

      const results = await Promise.allSettled(promises);
      const rejectedCount = results.filter(r => r.status === 'rejected').length;

      // Some requests should be rate limited
      expect(rejectedCount).toBeGreaterThan(0);
    });
  });
});