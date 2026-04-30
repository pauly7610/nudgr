import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '@/lib/apiClient';

interface PerformanceMetric {
  name: string;
  value: number;
  metadata?: Record<string, unknown>;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
}

interface FirstInputPerformanceEntry extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftPerformanceEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

const shouldSkipTelemetry = (path: string): boolean => {
  return path === '/auth' || path.startsWith('/auth/');
};

const logTelemetryError = (error: unknown): void => {
  if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
    console.debug('Performance telemetry skipped or failed:', error);
  }
};

export const usePerformanceMonitor = () => {
  const location = useLocation();
  const telemetryEnabled = !shouldSkipTelemetry(location.pathname);

  const logMetric = useCallback(async (metric: PerformanceMetric) => {
    if (!telemetryEnabled) {
      return;
    }

    try {
      await apiRequest<{ id: string; createdAt: string }>('/performance-metrics', {
        method: 'POST',
        body: JSON.stringify({
          metricName: metric.name,
          metricValue: metric.value,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          metadata: metric.metadata || {},
        }),
      });
    } catch (error) {
      logTelemetryError(error);
    }
  }, [telemetryEnabled]);

  // Monitor page load performance
  useEffect(() => {
    if (!telemetryEnabled) return;
    if (typeof window === 'undefined' || !window.performance) return;

    const logPagePerformance = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Log various performance metrics
          logMetric({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
          });

          logMetric({
            name: 'dom_content_loaded',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          });

          logMetric({
            name: 'time_to_interactive',
            value: navigation.domInteractive - navigation.fetchStart,
          });

          logMetric({
            name: 'first_contentful_paint',
            value: navigation.responseStart - navigation.fetchStart,
          });
        }

        // Log Core Web Vitals if available
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint (LCP)
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry | undefined;
            if (!lastEntry) {
              return;
            }
            logMetric({
              name: 'largest_contentful_paint',
              value: lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime,
            });
          });
          
          try {
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            // LCP not supported
          }

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              const firstInputEntry = entry as FirstInputPerformanceEntry;
              logMetric({
                name: 'first_input_delay',
                value: firstInputEntry.processingStart - firstInputEntry.startTime,
              });
            });
          });

          try {
            fidObserver.observe({ type: 'first-input', buffered: true });
          } catch (e) {
            // FID not supported
          }

          // Cumulative Layout Shift (CLS)
          let clsScore = 0;
          const clsObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              const layoutShiftEntry = entry as LayoutShiftPerformanceEntry;
              if (!layoutShiftEntry.hadRecentInput) {
                clsScore += layoutShiftEntry.value ?? 0;
              }
            });
            logMetric({
              name: 'cumulative_layout_shift',
              value: clsScore,
            });
          });

          try {
            clsObserver.observe({ type: 'layout-shift', buffered: true });
          } catch (e) {
            // CLS not supported
          }
        }
      } catch (error) {
        logTelemetryError(error);
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      logPagePerformance();
    } else {
      window.addEventListener('load', logPagePerformance);
      return () => window.removeEventListener('load', logPagePerformance);
    }
  }, [logMetric, telemetryEnabled]);

  // Monitor component render time
  const measureRenderTime = useCallback((componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    logMetric({
      name: 'component_render_time',
      value: renderTime,
      metadata: { componentName },
    });
  }, [logMetric]);

  // Monitor API call performance
  const measureApiCall = useCallback((
    apiName: string,
    duration: number,
    success: boolean
  ) => {
    logMetric({
      name: 'api_call_duration',
      value: duration,
      metadata: { apiName, success },
    });
  }, [logMetric]);

  return {
    logMetric,
    measureRenderTime,
    measureApiCall,
  };
};
