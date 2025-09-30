/**
 * Performance Optimization Service
 * Provides bundle optimization, code splitting, and performance monitoring
 */

import { lazy, type ComponentType } from 'react';

// Performance monitoring interface
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  timestamp: number;
}

// Component lazy loading configuration
interface LazyLoadConfig {
  preload?: boolean;
  timeout?: number;
  retries?: number;
  fallback?: ComponentType;
}

/**
 * Performance Optimization Service
 */
export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private metrics: PerformanceMetrics[] = [];
  private preloadedComponents = new Set<string>();
  private resourceHints = new Map<string, string>();

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  /**
   * Create lazy-loaded component with optimization
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
    config: LazyLoadConfig = {}
  ): ComponentType<any> {
    const LazyComponent = lazy(async () => {
      const startTime = performance.now();
      
      try {
        // Add timeout for import
        const importPromise = importFn();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Component load timeout')), config.timeout || 10000);
        });

        const result = await Promise.race([importPromise, timeoutPromise]);
        
        // Record load time
        const loadTime = performance.now() - startTime;
        this.recordMetric({
          loadTime,
          renderTime: 0,
          bundleSize: 0,
          memoryUsage: this.getMemoryUsage(),
          timestamp: Date.now()
        });

        return result;

      } catch (error) {
        console.error(`Failed to load ${componentName}:`, error);
        
        // Return fallback if available
        if (config.fallback) {
          return { default: config.fallback };
        }
        throw error;
      }
    });

    // Set display name for debugging
    LazyComponent.displayName = `Lazy(${componentName})`;

    return LazyComponent;
  }

  /**
   * Preload component for better UX
   */
  async preloadComponent(
    importFn: () => Promise<any>,
    componentName: string
  ): Promise<boolean> {
    if (this.preloadedComponents.has(componentName)) {
      return true;
    }

    try {
      await importFn();
      this.preloadedComponents.add(componentName);
      console.log(`Preloaded ${componentName}`);
      return true;

    } catch (error) {
      console.error(`Failed to preload ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Add resource hints for performance
   */
  addResourceHint(url: string, type: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect'): void {
    if (typeof document === 'undefined') return;

    const existingHint = document.querySelector(`link[href="${url}"]`);
    if (existingHint) return;

    const link = document.createElement('link');
    link.rel = type;
    link.href = url;

    if (type === 'preload') {
      // Detect resource type
      if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.match(/\.(woff2?|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
    }

    document.head.appendChild(link);
    this.resourceHints.set(url, type);
  }

  /**
   * Optimize bundle loading with dynamic imports
   */
  async loadModule<T>(modulePath: string): Promise<T> {
    const startTime = performance.now();

    try {
      // Add prefetch hint
      this.addResourceHint(modulePath, 'prefetch');

      // Dynamic import with error handling
      const module = await import(/* webpackChunkName: "[request]" */ modulePath);
      
      const loadTime = performance.now() - startTime;
      console.log(`Module ${modulePath} loaded in ${loadTime.toFixed(2)}ms`);

      return module;

    } catch (error) {
      console.error(`Failed to load module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Measure and record component render performance
   */
  measureRenderPerformance<T extends (...args: any[]) => any>(
    componentName: string,
    renderFn: T
  ): T {
    return ((...args: Parameters<T>) => {
      const startTime = performance.now();
      const result = renderFn(...args);
      const renderTime = performance.now() - startTime;

      this.recordMetric({
        loadTime: 0,
        renderTime,
        bundleSize: 0,
        memoryUsage: this.getMemoryUsage(),
        timestamp: Date.now()
      });

      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
      }

      return result;
    }) as T;
  }

  /**
   * Optimize images with lazy loading and WebP support
   */
  createOptimizedImageUrl(
    originalUrl: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    // In a real implementation, this would integrate with an image optimization service
    // For now, return the original URL with query parameters
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    return `${originalUrl}${params.toString() ? '?' + params.toString() : ''}`;
  }

  /**
   * Defer non-critical CSS loading
   */
  loadCSS(href: string, media = 'all'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Load as non-blocking
      link.onload = () => {
        link.media = media; // Apply when loaded
        resolve();
      };
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }

  /**
   * Implement virtual scrolling for large lists
   */
  createVirtualScrollConfig(
    itemHeight: number,
    containerHeight: number,
    totalItems: number
  ) {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const bufferSize = Math.min(5, Math.floor(visibleItems * 0.5));

    return {
      itemHeight,
      visibleItems,
      bufferSize,
      totalItems,
      getVisibleRange: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + visibleItems + bufferSize,
          totalItems - 1
        );
        
        return {
          start: Math.max(0, startIndex - bufferSize),
          end: endIndex,
          offsetY: Math.max(0, startIndex - bufferSize) * itemHeight
        };
      }
    };
  }

  /**
   * Monitor Core Web Vitals
   */
  initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1] as PerformanceEntry & { renderTime: number };
        console.log('LCP:', lcp.renderTime || lcp.startTime);
      });
      
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // Ignore if not supported
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = (entry as any).processingStart - entry.startTime;
          console.log('FID:', fid);
        });
      });

      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // Ignore if not supported
      }
    }

    // Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries: any[] = [];

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
      console.log('CLS:', clsValue);
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Ignore if not supported
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  clearOldMetrics(maxAge = 300000): void { // 5 minutes
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Get bundle size estimate
   */
  getBundleSize(): number {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      // Estimate based on network info
      const connection = (navigator as any).connection;
      return connection.downlink * 1024 * 1024; // Convert Mbps to bytes
    }
    return 0;
  }

  // Private methods

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }
}

// Lazy-loaded page components with optimization
export const LazyHomePage = lazy(() => 
  import(/* webpackChunkName: "home-page" */ '../components/templates/HomePage')
);

export const LazyLibraryPage = lazy(() => 
  import(/* webpackChunkName: "library-page" */ '../components/templates/LibraryPage')
);

export const LazyLessonPage = lazy(() => 
  import(/* webpackChunkName: "lesson-page" */ '../components/templates/AnnotationPage')
);

export const LazyFlashcardPage = lazy(() => 
  import(/* webpackChunkName: "flashcard-page" */ '../components/templates/FlashcardPage')
);

export const LazyQuizPage = lazy(() => 
  import(/* webpackChunkName: "quiz-page" */ '../components/templates/QuizPage')
);

// Performance monitoring hook for components
export const usePerformanceMonitoring = (componentName: string) => {
  const performanceService = PerformanceOptimizationService.getInstance();
  
  return {
    measureRender: <T extends (...args: any[]) => any>(renderFn: T): T => 
      performanceService.measureRenderPerformance(componentName, renderFn),
    recordMetric: (metric: Partial<PerformanceMetrics>) =>
      performanceService.recordMetric({
        loadTime: 0,
        renderTime: 0,
        bundleSize: 0,
        memoryUsage: performanceService.getMemoryUsage(),
        timestamp: Date.now(),
        ...metric
      } as PerformanceMetrics)
  };
};

// Export service instance
export const performanceOptimizationService = PerformanceOptimizationService.getInstance();

// Preload critical components
export const preloadCriticalComponents = async () => {
  const service = PerformanceOptimizationService.getInstance();
  
  // Preload likely-to-be-used components
  await Promise.allSettled([
    service.preloadComponent(
      () => import('../components/templates/LibraryPage'),
      'LibraryPage'
    ),
    service.preloadComponent(
      () => import('../components/templates/AnnotationPage'),  
      'LessonPage'
    ),
  ]);
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceOptimizationService.initWebVitals();
}