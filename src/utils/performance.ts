import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Performance monitoring utilities for Core Web Vitals tracking
 * Ensures we meet the constitutional requirement of <3s load time
 */

/**
 * Initialize Core Web Vitals monitoring
 * Reports metrics to console in development, could be extended to send to analytics
 */
export const initPerformanceMonitoring = (): void => {
  const reportWebVital = (metric: Metric) => {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`);
    }
    
    // Check against constitutional requirements
    if (metric.name === 'LCP' && metric.value > 3000) {
      console.warn('⚠️ Constitutional violation: LCP > 3s', metric);
    }
    
    if (metric.name === 'FCP' && metric.value > 1000) {
      console.warn('⚠️ Poor FCP performance: > 1s', metric);
    }
    
    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Note: Analytics integration can be added when needed
      // sendToAnalytics('web-vitals', metric);
    }
  };

  // Initialize all Core Web Vitals
  onCLS(reportWebVital);
  onINP(reportWebVital); // INP replaced FID in web-vitals v3
  onFCP(reportWebVital);
  onLCP(reportWebVital);
  onTTFB(reportWebVital);
};

/**
 * Measure and report custom performance metrics
 */
export const measureNavigationTime = (): void => {
  performance.mark('navigation-start');
  
  // Measure time to interactive
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.name === 'navigation-end') {
        const navigationStart = performance.getEntriesByName('navigation-start')[0];
        const navigationTime = entry.startTime - navigationStart.startTime;
        
        // Constitutional requirement: <1s navigation time
        if (navigationTime > 1000) {
          console.warn('⚠️ Constitutional violation: Navigation > 1s', {
            time: navigationTime,
            startTime: navigationStart.startTime,
            endTime: entry.startTime,
          });
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['mark'] });
};

/**
 * Mark navigation end for performance measurement
 */
export const markNavigationEnd = (route: string): void => {
  performance.mark('navigation-end', { detail: route });
};