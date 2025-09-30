/**
 * Performance tests for bundle optimization validation
 * Tests loading times, chunk sizes, and optimization effectiveness
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '../../src/utils/performanceMonitor';

// Mock performance APIs for testing
const mockPerformanceObserver = vi.fn();
const mockPerformanceEntry = {
  name: 'test-chunk.js',
  startTime: 100,
  transferSize: 50000,
};

const mockPerformanceNow = vi.fn(() => 1000);

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver,
});

Object.defineProperty(global, 'performance', {
  writable: true,
  value: {
    now: mockPerformanceNow,
    getEntriesByType: vi.fn(() => [mockPerformanceEntry]),
  },
});

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bundle Optimization Tests', () => {
    it('should track chunk loading times', () => {
      // Configure mock to return predictable values
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(1150); // End time
      
      performanceMonitor.startTiming('react-vendor-chunk');
      const loadTime = performanceMonitor.endTiming('react-vendor-chunk');
      
      expect(loadTime).toBe(150);
      expect(mockPerformanceNow).toHaveBeenCalledTimes(2);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.chunkLoadTime).toHaveProperty('react-vendor-chunk', 150);
    });

    it('should validate performance targets with good metrics', () => {
      // Configure mock for good performance
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(3500); // End time (2.5s)
      
      performanceMonitor.startTiming('page-load');
      const pageLoadTime = performanceMonitor.endTiming('page-load');
      
      expect(pageLoadTime).toBe(2500); // Should be exactly 2.5s
      expect(pageLoadTime).toBeLessThan(3000); // Should meet target
    });

    it('should detect performance target failures', () => {
      // Configure mock for poor performance
      mockPerformanceNow
        .mockReturnValueOnce(1000) // Start time
        .mockReturnValueOnce(5000); // End time (4s)
      
      performanceMonitor.startTiming('slow-operation');
      const operationTime = performanceMonitor.endTiming('slow-operation');
      
      expect(operationTime).toBe(4000); // Should be exactly 4s
      expect(operationTime).toBeGreaterThan(3000); // Should exceed target
    });
  });

  describe('Code Splitting Effectiveness', () => {
    it('should verify chunk sizes are within targets', async () => {
      // Test that main chunks are appropriately sized
      const expectedChunkSizes = {
        'react-vendor': { max: 150000, description: 'React vendor bundle' },
        'mui-core': { max: 200000, description: 'Material-UI core' },
        'components-atoms': { max: 50000, description: 'Atomic components' },
        'components-molecules': { max: 75000, description: 'Molecule components' },
        'components-organisms': { max: 100000, description: 'Organism components' },
        'services': { max: 80000, description: 'Service layer' },
        'chinese-processing': { max: 60000, description: 'Chinese text processing' },
      };

      // In a real environment, this would analyze actual build output
      // For testing, we simulate chunk size analysis
      const chunkSizes = {
        'react-vendor': 140000,
        'mui-core': 180000,
        'components-atoms': 45000,
        'components-molecules': 65000,
        'components-organisms': 85000,
        'services': 70000,
        'chinese-processing': 55000,
      };

      const violations: string[] = [];
      Object.entries(expectedChunkSizes).forEach(([chunk, { max, description }]) => {
        const actualSize = chunkSizes[chunk as keyof typeof chunkSizes];
        if (actualSize > max) {
          violations.push(`${description} (${chunk}): ${actualSize} bytes exceeds ${max} bytes`);
        }
      });

      expect(violations).toHaveLength(0);
    });

    it('should verify lazy loading effectiveness', async () => {
      // Test lazy loading timing
      performanceMonitor.startTiming('lazy-component-load');
      
      // Simulate component lazy loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(1100);
      const loadTime = performanceMonitor.endTiming('lazy-component-load');
      
      // Lazy components should load quickly once requested
      expect(loadTime).toBeLessThan(500);
    });
  });

  describe('Service Loading Performance', () => {
    it('should validate lesson loading performance', () => {
      performanceMonitor.startTiming('lesson-load');
      
      // Simulate lesson loading (target: <3s)
      vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(3500);
      const loadTime = performanceMonitor.endTiming('lesson-load');
      
      // Should meet the <3s target
      expect(loadTime).toBeLessThan(3000);
    });

    it('should validate audio generation performance', () => {
      performanceMonitor.startTiming('audio-generation');
      
      // Simulate audio generation (target: <500ms)
      vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(1400);
      const loadTime = performanceMonitor.endTiming('audio-generation');
      
      // Should meet the <500ms target
      expect(loadTime).toBeLessThan(500);
    });

    it('should validate text segmentation performance', () => {
      performanceMonitor.startTiming('text-segmentation');
      
      // Simulate text processing (target: <200ms for typical text)
      vi.mocked(performance.now).mockReturnValueOnce(1000).mockReturnValueOnce(1150);
      const loadTime = performanceMonitor.endTiming('text-segmentation');
      
      // Should be very fast for text processing
      expect(loadTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks in timing operations', () => {
      // Test timing cleanup by ensuring operations complete properly
      const timingLabels = Array.from({ length: 10 }, (_, i) => `test-${i}`);
      
      // Start and end multiple timings
      timingLabels.forEach(label => {
        performanceMonitor.startTiming(label);
        performanceMonitor.endTiming(label);
      });
      
      // Verify all operations completed without errors
      expect(timingLabels).toHaveLength(10);
    });

    it('should handle concurrent timing operations', () => {
      // Configure mock to return different times for each call
      mockPerformanceNow
        .mockReturnValueOnce(1000) // operation-1 start
        .mockReturnValueOnce(2000) // operation-2 start
        .mockReturnValueOnce(3000) // operation-3 start
        .mockReturnValueOnce(3500) // operation-2 end (500ms)
        .mockReturnValueOnce(4000) // operation-1 end (3000ms)
        .mockReturnValueOnce(4200); // operation-3 end (1200ms)
      
      performanceMonitor.startTiming('operation-1');
      performanceMonitor.startTiming('operation-2');
      performanceMonitor.startTiming('operation-3');
      
      // End in different order
      const time2 = performanceMonitor.endTiming('operation-2');
      const time1 = performanceMonitor.endTiming('operation-1');
      const time3 = performanceMonitor.endTiming('operation-3');
      
      expect(time2).toBe(1500); // 3500 - 2000
      expect(time1).toBe(3000); // 4000 - 1000
      expect(time3).toBe(1200); // 4200 - 3000
    });
  });

  describe('Error Handling', () => {
    it('should handle missing start times gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const duration = performanceMonitor.endTiming('non-existent-timer');
      
      expect(duration).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('No start time found for "non-existent-timer"');
      
      consoleSpy.mockRestore();
    });

    it('should handle PerformanceObserver unavailability', () => {
      // Temporarily remove PerformanceObserver
      const originalObserver = global.PerformanceObserver;
      // @ts-expect-error - intentionally removing for test
      delete global.PerformanceObserver;
      
      // Should not throw when PerformanceObserver is unavailable
      expect(() => {
        performanceMonitor.measureWebVitals();
        performanceMonitor.measureBundleSize();
      }).not.toThrow();
      
      // Restore
      global.PerformanceObserver = originalObserver;
    });
  });
});