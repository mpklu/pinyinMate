/**
 * Performance Optimization Utilities
 * Utilities for component performance monitoring and optimization
 */

import React, { type ComponentType } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Only log if render time is above threshold (5ms)
      if (renderTime > 5) {
        console.debug(`🔍 Performance: ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

// HOC for adding performance monitoring to components
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName?: string
) {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const PerformanceMonitoredComponent: React.FC<P> = (props) => {
    usePerformanceMonitor(name);
    return <WrappedComponent {...props} />;
  };
  
  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${name})`;
  
  return PerformanceMonitoredComponent;
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Virtual list item interface for large lists
export interface VirtualListItem {
  id: string;
  height: number;
  data: unknown;
}

// Virtual list hook for performance with large datasets
export const useVirtualList = (
  items: VirtualListItem[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, scrollTop, containerHeight, itemHeight]);
  
  const totalHeight = items.length * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop
  };
};

// Memory usage monitoring
export const useMemoryMonitor = (intervalMs: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (!('memory' in performance)) {
      return;
    }
    
    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      });
    };
    
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs]);
  
  return memoryInfo;
};