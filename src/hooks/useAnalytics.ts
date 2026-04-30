import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '@/lib/apiClient';

interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, unknown>;
}

const shouldSkipAnalytics = (path: string): boolean => {
  return path === '/auth' || path.startsWith('/auth/');
};

const logTelemetryError = (error: unknown): void => {
  if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
    console.debug('Analytics tracking skipped or failed:', error);
  }
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const location = useLocation();

  const trackPageView = useCallback(async (path: string) => {
    if (shouldSkipAnalytics(path)) {
      return;
    }

    try {
      await apiRequest<{ id: string; createdAt: string }>('/events', {
        method: 'POST',
        body: JSON.stringify({
          eventType: 'page_view',
          pageUrl: path,
          sessionId: getSessionId(),
          severityScore: 0,
        metadata: {
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
            source: 'frontend',
        },
        }),
      });
    } catch (error) {
      logTelemetryError(error);
    }
  }, []);

  useEffect(() => {
    void trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  const trackEvent = useCallback(async ({ event_name, properties }: AnalyticsEvent) => {
    if (shouldSkipAnalytics(location.pathname)) {
      return;
    }

    try {
      await apiRequest<{ id: string; createdAt: string }>('/events', {
        method: 'POST',
        body: JSON.stringify({
          eventType: event_name,
          pageUrl: location.pathname,
          sessionId: getSessionId(),
          severityScore: 0,
        metadata: {
          ...properties,
          timestamp: new Date().toISOString(),
            source: 'frontend',
        },
        }),
      });
    } catch (error) {
      logTelemetryError(error);
    }
  }, [location.pathname]);

  return { trackEvent };
};
