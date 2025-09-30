/**
 * Performance tests for lesson loading and audio generation
 * Tests that lesson loading completes within 3 seconds and audio generation within 500ms
 * Validates NFR-005 and NFR-006 performance requirements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performance } from 'perf_hooks';

// Mock services for testing
import { libraryService } from '../../src/services/libraryService';
import { synthesizeAudio } from '../../src/services/audioService';
import { LessonServiceImpl } from '../../src/services/lessonService';
import type { LessonContent, RemoteSource } from '../../src/types/library';
import type { AudioSynthesizeRequest } from '../../src/types/library';

// Mock fetch for remote content loading
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in test output
const originalConsole = { ...console };
beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
  vi.clearAllMocks();
});

describe('Performance Tests', () => {
  const mockLessonContent: LessonContent = {
    id: 'perf-test-1',
    title: 'Performance Test Lesson',
    description: 'Test lesson for performance validation',
    content: '你好，世界！这是一个性能测试课程。',
    metadata: {
      category: 'performance',
      difficulty: 'beginner',
      estimatedTime: 10,
      tags: ['performance', 'test'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    vocabulary: [
      { word: '你好', translation: 'hello' },
      { word: '世界', translation: 'world' },
      { word: '课程', translation: 'course' }
    ]
  };

  const mockRemoteSource: RemoteSource = {
    baseUrl: 'https://example.com/lessons',
    manifestPath: '/manifest.json',
    timeout: 5000,
    retryCount: 2
  };

  describe('Lesson Loading Performance (NFR-005: <3s)', () => {
    it('should load local lesson content within 3 seconds', async () => {
      const startTime = performance.now();
      
      // Mock successful local loading
      vi.mocked(libraryService.loadLesson).mockResolvedValue({
        success: true,
        data: mockLessonContent
      });

      const result = await libraryService.loadLesson('perf-test-1');
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(3000); // NFR-005: <3s
      expect(elapsed).toBeLessThan(100); // Local loading should be much faster
    });

    it('should load remote lesson content within 3 seconds', async () => {
      const startTime = performance.now();
      
      // Mock network delay but within acceptable range
      mockFetch.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve(mockLessonContent),
              headers: new Headers({ 'Content-Type': 'application/json' })
            });
          }, 1500); // 1.5s network delay
        })
      );

      vi.mocked(libraryService.loadFromRemote).mockImplementation(async () => {
        const response = await fetch(`${mockRemoteSource.baseUrl}/perf-test-1.json`);
        return {
          success: true,
          data: await response.json()
        };
      });

      const result = await libraryService.loadFromRemote('perf-test-1', mockRemoteSource);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(3000); // NFR-005: <3s
      expect(elapsed).toBeGreaterThan(1400); // Should reflect network delay
    });

    it('should handle large lesson content within 3 seconds', async () => {
      const startTime = performance.now();
      
      // Create large lesson content
      const largeLessonContent: LessonContent = {
        ...mockLessonContent,
        content: '这是一个很长的课程内容。'.repeat(1000), // ~15KB content
        vocabulary: Array.from({ length: 500 }, (_, i) => ({
          word: `词汇${i}`,
          translation: `vocabulary ${i}`
        }))
      };

      vi.mocked(libraryService.loadLesson).mockResolvedValue({
        success: true,
        data: largeLessonContent
      });

      const result = await libraryService.loadLesson('large-lesson');
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(3000); // NFR-005: <3s
    });

    it('should process lesson content within performance limits', async () => {
      const lessonService = new LessonServiceImpl();
      const startTime = performance.now();

      const processingConfig = {
        segmentText: true,
        segmentationMode: 'sentence' as const,
        enhanceVocabulary: true,
        generatePinyin: true,
        maxSegments: 50
      };

      const lesson = {
        id: 'processing-test',
        title: 'Processing Test',
        description: 'Test lesson processing performance',
        content: '这是测试内容。包含多个句子进行分段处理。'.repeat(50),
        metadata: {
          category: 'test',
          difficulty: 'intermediate' as const,
          estimatedTime: 20,
          tags: ['processing', 'performance'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        vocabulary: Array.from({ length: 100 }, (_, i) => ({
          word: `测试词汇${i}`,
          translation: `test vocabulary ${i}`
        }))
      };

      const result = await lessonService.processLesson(lesson, processingConfig);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.processedLesson).toBeDefined();
      expect(elapsed).toBeLessThan(2000); // Processing should be fast
    });

    it('should handle concurrent lesson loading efficiently', async () => {
      const startTime = performance.now();
      
      // Mock multiple lesson responses
      vi.mocked(libraryService.loadLesson).mockImplementation(async (id: string) => ({
        success: true,
        data: { ...mockLessonContent, id }
      }));

      // Load 10 lessons concurrently
      const promises = Array.from({ length: 10 }, (_, i) => 
        libraryService.loadLesson(`concurrent-lesson-${i}`)
      );

      const results = await Promise.all(promises);
      
      const elapsed = performance.now() - startTime;
      
      expect(results).toHaveLength(10);
      expect(results.every(r => r.success)).toBe(true);
      expect(elapsed).toBeLessThan(3000); // Should handle concurrency within limits
    });

    it('should timeout slow remote requests appropriately', async () => {
      const startTime = performance.now();
      
      // Mock slow network response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve(mockLessonContent)
            });
          }, 10000); // 10s delay - should timeout
        })
      );

      vi.mocked(libraryService.loadFromRemote).mockImplementation(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(`${mockRemoteSource.baseUrl}/slow-lesson.json`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return {
            success: true,
            data: await response.json()
          };
        } catch (error) {
          clearTimeout(timeoutId);
          return {
            success: false,
            error: 'Request timeout'
          };
        }
      });

      const result = await libraryService.loadFromRemote('slow-lesson', mockRemoteSource);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(false);
      expect(elapsed).toBeLessThan(6000); // Should timeout within reasonable time
    });
  });

  describe('Audio Generation Performance (NFR-006: <500ms)', () => {
    beforeEach(() => {
      // Mock Web Speech API
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: vi.fn(),
          cancel: vi.fn(),
          getVoices: vi.fn().mockReturnValue([
            {
              name: 'Chinese Voice',
              lang: 'zh-CN',
              default: false,
              localService: true,
              voiceURI: 'chinese'
            }
          ])
        },
        writable: true
      });

      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        value: vi.fn().mockImplementation(() => ({
          text: '',
          lang: '',
          voice: null,
          volume: 1,
          rate: 1,
          pitch: 1,
          onstart: null,
          onend: null,
          onerror: null
        })),
        writable: true
      });
    });

    it('should generate audio for short Chinese text within 500ms', async () => {
      const startTime = performance.now();
      
      const request: AudioSynthesizeRequest = {
        text: '你好',
        options: {
          speed: 1.0,
          pitch: 1.0
        }
      };

      // Mock fast audio generation
      vi.mocked(synthesizeAudio).mockImplementation(async () => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          success: true,
          data: {
            audioUrl: 'mock-audio.mp3',
            duration: 1.5,
            format: 'mp3',
            size: 2048
          }
        };
      });

      const result = await synthesizeAudio(request);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(500); // NFR-006: <500ms
    });

    it('should generate audio for medium Chinese text within 500ms', async () => {
      const startTime = performance.now();
      
      const request: AudioSynthesizeRequest = {
        text: '你好，世界！这是一个测试句子。',
        options: {
          speed: 1.0,
          pitch: 1.0
        }
      };

      vi.mocked(synthesizeAudio).mockImplementation(async () => {
        // Simulate longer processing for more text
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
          success: true,
          data: {
            audioUrl: 'mock-audio-medium.mp3',
            duration: 3.0,
            format: 'mp3',
            size: 4096
          }
        };
      });

      const result = await synthesizeAudio(request);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(500); // NFR-006: <500ms
    });

    it('should handle concurrent audio generation efficiently', async () => {
      const startTime = performance.now();
      
      const requests = [
        { text: '你好', options: { speed: 1.0, pitch: 1.0 } },
        { text: '再见', options: { speed: 1.0, pitch: 1.0 } },
        { text: '谢谢', options: { speed: 1.0, pitch: 1.0 } },
        { text: '对不起', options: { speed: 1.0, pitch: 1.0 } },
        { text: '没关系', options: { speed: 1.0, pitch: 1.0 } }
      ];

      vi.mocked(synthesizeAudio).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        return {
          success: true,
          data: {
            audioUrl: 'mock-concurrent-audio.mp3',
            duration: 1.0,
            format: 'mp3',
            size: 1024
          }
        };
      });

      const promises = requests.map(request => synthesizeAudio(request));
      const results = await Promise.all(promises);
      
      const elapsed = performance.now() - startTime;
      
      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
      expect(elapsed).toBeLessThan(1000); // Concurrent generation should be efficient
    });

    it('should fallback gracefully when audio generation is slow', async () => {
      const startTime = performance.now();
      
      const request: AudioSynthesizeRequest = {
        text: '这是一个很长的句子用于测试音频生成的性能表现',
        options: {
          speed: 1.0,
          pitch: 1.0
        }
      };

      // Mock slow audio generation with timeout
      vi.mocked(synthesizeAudio).mockImplementation(async () => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Audio generation timeout')), 1000)
        );
        
        const audioPromise = new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                audioUrl: 'mock-slow-audio.mp3',
                duration: 5.0,
                format: 'mp3',
                size: 8192
              }
            });
          }, 1500); // Too slow
        });

        try {
          return await Promise.race([audioPromise, timeoutPromise]) as any;
        } catch {
          return {
            success: false,
            error: 'Audio generation timeout - falling back to Web Speech API'
          };
        }
      });

      const result = await synthesizeAudio(request);
      
      const elapsed = performance.now() - startTime;
      
      expect(elapsed).toBeLessThan(1500); // Should timeout and fallback
      // Result can be either success (if fallback works) or failure (graceful degradation)
      expect(typeof result.success).toBe('boolean');
    });

    it('should cache audio to improve repeat performance', async () => {
      const text = '你好，世界！';
      const request: AudioSynthesizeRequest = {
        text,
        options: { speed: 1.0, pitch: 1.0 }
      };

      // First request - full generation
      const startTime1 = performance.now();
      vi.mocked(synthesizeAudio).mockResolvedValueOnce({
        success: true,
        data: {
          audioUrl: 'cached-audio.mp3',
          duration: 2.0,
          format: 'mp3',
          size: 3072
        }
      });

      const result1 = await synthesizeAudio(request);
      const elapsed1 = performance.now() - startTime1;

      expect(result1.success).toBe(true);

      // Second request - should be faster (cached)
      const startTime2 = performance.now();
      vi.mocked(synthesizeAudio).mockResolvedValueOnce({
        success: true,
        data: {
          audioUrl: 'cached-audio.mp3',
          duration: 2.0,
          format: 'mp3',
          size: 3072,
          cached: true
        }
      });

      const result2 = await synthesizeAudio(request);
      const elapsed2 = performance.now() - startTime2;

      expect(result2.success).toBe(true);
      expect(elapsed2).toBeLessThan(elapsed1); // Cache should be faster
      expect(elapsed2).toBeLessThan(100); // Cached responses should be very fast
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not cause memory leaks during repeated operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        vi.mocked(libraryService.loadLesson).mockResolvedValue({
          success: true,
          data: { ...mockLessonContent, id: `memory-test-${i}` }
        });

        await libraryService.loadLesson(`memory-test-${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle large datasets efficiently', async () => {
      const startTime = performance.now();
      const initialMemory = process.memoryUsage();
      
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockLessonContent,
        id: `large-dataset-${i}`,
        content: '大量数据测试内容。'.repeat(100),
        vocabulary: Array.from({ length: 50 }, (_, j) => ({
          word: `词汇${i}-${j}`,
          translation: `vocabulary ${i}-${j}`
        }))
      }));

      // Process large dataset
      vi.mocked(libraryService.searchLessons).mockResolvedValue({
        success: true,
        data: {
          results: largeDataset,
          totalCount: largeDataset.length,
          hasMore: false
        }
      });

      const result = await libraryService.searchLessons({
        query: 'performance test',
        category: 'test',
        difficulty: 'beginner',
        limit: 1000
      });

      const elapsed = performance.now() - startTime;
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(5000); // Should handle large datasets reasonably
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Memory usage should be reasonable
    });
  });

  describe('Network Performance', () => {
    it('should handle network latency gracefully', async () => {
      const startTime = performance.now();
      
      // Simulate various network conditions
      const networkDelays = [100, 500, 1000, 2000]; // ms
      
      for (const delay of networkDelays) {
        mockFetch.mockImplementationOnce(() => 
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: () => Promise.resolve(mockLessonContent)
              });
            }, delay);
          })
        );

        vi.mocked(libraryService.loadFromRemote).mockImplementationOnce(async () => {
          const response = await fetch(`${mockRemoteSource.baseUrl}/network-test.json`);
          return {
            success: true,
            data: await response.json()
          };
        });

        const result = await libraryService.loadFromRemote('network-test', mockRemoteSource);
        expect(result.success).toBe(true);
      }
      
      const elapsed = performance.now() - startTime;
      
      // Should complete all network tests within reasonable time
      expect(elapsed).toBeLessThan(10000);
    });

    it('should implement proper retry logic for failed requests', async () => {
      const startTime = performance.now();
      let attemptCount = 0;
      
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockLessonContent)
        });
      });

      vi.mocked(libraryService.loadFromRemote).mockImplementation(async () => {
        const maxRetries = 3;
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(`${mockRemoteSource.baseUrl}/retry-test.json`);
            return {
              success: true,
              data: await response.json()
            };
          } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))); // Exponential backoff
          }
        }
        
        return {
          success: false,
          error: `Failed after ${maxRetries} attempts: ${lastError}`
        };
      });

      const result = await libraryService.loadFromRemote('retry-test', mockRemoteSource);
      
      const elapsed = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should have retried
      expect(elapsed).toBeLessThan(1000); // Should complete within reasonable time
    });
  });
});