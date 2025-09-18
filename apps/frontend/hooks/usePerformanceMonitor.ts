import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep only last 100 metrics

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && metric.renderTime > 16) {
      console.warn(`Slow render detected in ${metric.componentName}: ${metric.renderTime.toFixed(2)}ms`);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, m) => sum + m.renderTime, 0);
    return total / componentMetrics.length;
  }

  getSlowestComponents(limit = 5): Array<{ name: string; avgTime: number }> {
    const componentNames = [...new Set(this.metrics.map(m => m.componentName))];
    const averages = componentNames.map(name => ({
      name,
      avgTime: this.getAverageRenderTime(name)
    }));
    
    return averages
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  clear() {
    this.metrics = [];
  }
}

/**
 * Hook to monitor component render performance
 * @param componentName - Name of the component being monitored
 * @param enabled - Whether monitoring is enabled (default: true in development)
 */
export function usePerformanceMonitor(
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const renderStartTime = useRef<number>(0);
  const monitor = PerformanceMonitor.getInstance();

  // Mark render start
  const markRenderStart = useCallback(() => {
    if (enabled) {
      renderStartTime.current = performance.now();
    }
  }, [enabled]);

  // Mark render end and record metrics
  const markRenderEnd = useCallback(() => {
    if (enabled && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      monitor.addMetric({
        componentName,
        renderTime,
        timestamp: Date.now()
      });
      renderStartTime.current = 0;
    }
  }, [enabled, componentName, monitor]);

  // Auto-mark render start on every render
  markRenderStart();

  // Auto-mark render end after render completes
  useEffect(() => {
    markRenderEnd();
  });

  return {
    markRenderStart,
    markRenderEnd,
    getMetrics: () => monitor.getMetrics(),
    getAverageRenderTime: () => monitor.getAverageRenderTime(componentName),
    getSlowestComponents: () => monitor.getSlowestComponents()
  };
}

/**
 * Hook to measure async operation performance
 * @param operationName - Name of the operation being measured
 */
export function useAsyncPerformanceMonitor(operationName: string) {
  const measureAsync = useCallback(async <T>(
    asyncOperation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await asyncOperation();
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
        
        if (duration > 1000) {
          console.warn(`Slow async operation: ${operationName} took ${duration.toFixed(2)}ms`);
        }
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      }
      
      throw error;
    }
  }, [operationName]);

  return { measureAsync };
}

/**
 * Development-only performance debugging utilities
 */
export const PerformanceDebugger = {
  logMetrics: () => {
    if (process.env.NODE_ENV === 'development') {
      const monitor = PerformanceMonitor.getInstance();
      console.group('Performance Metrics');
      console.table(monitor.getSlowestComponents());
      console.groupEnd();
    }
  },
  
  clearMetrics: () => {
    if (process.env.NODE_ENV === 'development') {
      PerformanceMonitor.getInstance().clear();
      console.log('Performance metrics cleared');
    }
  }
};

// Add global performance debugging functions in development
if (process.env.NODE_ENV === 'development') {
  (window as any).performanceDebugger = PerformanceDebugger;
}