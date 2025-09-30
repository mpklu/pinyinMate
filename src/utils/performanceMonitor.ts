/**
 * Performance monitoring utilities for tracking app metrics
 * Measures loading times, bundle sizes, and user experience metrics
 */

export interface PerformanceMetrics {
  pageLoad: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  chunkLoadTime: Record<string, number>;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

class PerformanceMonitor {
  private readonly metrics: Partial<PerformanceMetrics> = {};
  private startTimes: Record<string, number> = {};

  /**
   * Start timing a specific operation
   */
  startTiming(label: string): void {
    this.startTimes[label] = performance.now();
  }

  /**
   * End timing and record the duration
   */
  endTiming(label: string): number {
    const startTime = this.startTimes[label];
    if (!startTime) {
      console.warn(`No start time found for "${label}"`);
      return 0;
    }

    const duration = performance.now() - startTime;
    delete this.startTimes[label];
    
    // Store chunk load times
    if (label.includes('chunk')) {
      this.metrics.chunkLoadTime = {
        ...this.metrics.chunkLoadTime,
        [label]: duration
      };
    }

    return duration;
  }

  /**
   * Measure Web Vitals using Performance Observer API
   */
  measureWebVitals(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          const layoutEntry = entry as LayoutShiftEntry;
          if (!layoutEntry.hadRecentInput) {
            cls += layoutEntry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = cls;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Time to Interactive (simplified approximation)
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.metrics.timeToInteractive = performance.now();
      }, 0);
    });
  }

  /**
   * Measure bundle size from network requests
   */
  measureBundleSize(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        let totalSize = 0;
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.name.includes('.js') || resourceEntry.name.includes('.css')) {
            totalSize += resourceEntry.transferSize || 0;
          }
        }
        this.metrics.bundleSize = totalSize;
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Report metrics to console (development) or analytics (production)
   */
  reportMetrics(): void {
    const metrics = this.getMetrics();
    
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Performance Metrics');
      console.log('Page Load Time:', metrics.pageLoad?.toFixed(2), 'ms');
      console.log('Time to Interactive:', metrics.timeToInteractive?.toFixed(2), 'ms');
      console.log('First Contentful Paint:', metrics.firstContentfulPaint?.toFixed(2), 'ms');
      console.log('Largest Contentful Paint:', metrics.largestContentfulPaint?.toFixed(2), 'ms');
      console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift?.toFixed(3));
      console.log('Bundle Size:', (metrics.bundleSize ? (metrics.bundleSize / 1024).toFixed(2) + ' KB' : 'Unknown'));
      
      if (metrics.chunkLoadTime) {
        console.group('Chunk Load Times:');
        Object.entries(metrics.chunkLoadTime).forEach(([chunk, time]) => {
          console.log(`${chunk}:`, time.toFixed(2), 'ms');
        });
        console.groupEnd();
      }
      console.groupEnd();
    } else {
      // In production, send to analytics service
      // Example: analytics.track('performance_metrics', metrics);
    }
  }

  /**
   * Check if performance meets targets
   */
  validatePerformanceTargets(): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];
    const metrics = this.getMetrics();

    // Performance targets from project specs
    if (metrics.pageLoad && metrics.pageLoad > 3000) {
      failures.push(`Page load time ${metrics.pageLoad.toFixed(0)}ms exceeds 3s target`);
    }

    if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > 2000) {
      failures.push(`FCP ${metrics.firstContentfulPaint.toFixed(0)}ms exceeds 2s target`);
    }

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 4000) {
      failures.push(`LCP ${metrics.largestContentfulPaint.toFixed(0)}ms exceeds 4s target`);
    }

    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
      failures.push(`CLS ${metrics.cumulativeLayoutShift.toFixed(3)} exceeds 0.1 target`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measureWebVitals();
  performanceMonitor.measureBundleSize();
  
  // Report metrics after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.reportMetrics();
    }, 5000); // Wait 5s for all metrics to stabilize
  });
}