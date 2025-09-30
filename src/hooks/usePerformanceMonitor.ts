import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

export const usePerformanceMonitor = () => {
  const logMetric = useCallback(async (metric: PerformanceMetric) => {
    try {
      const { data: user } = await supabase.auth.getUser();

      await supabase.from('performance_metrics').insert({
        user_id: user?.user?.id,
        metric_name: metric.name,
        metric_value: metric.value,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        metadata: metric.metadata || {},
      });
    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }, []);

  // Monitor page load performance
  useEffect(() => {
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
            const lastEntry = entries[entries.length - 1] as any;
            logMetric({
              name: 'largest_contentful_paint',
              value: lastEntry.renderTime || lastEntry.loadTime,
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
            entries.forEach((entry: any) => {
              logMetric({
                name: 'first_input_delay',
                value: entry.processingStart - entry.startTime,
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
            list.getEntries().forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
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
        console.error('Failed to log page performance:', error);
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      logPagePerformance();
    } else {
      window.addEventListener('load', logPagePerformance);
      return () => window.removeEventListener('load', logPagePerformance);
    }
  }, [logMetric]);

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
