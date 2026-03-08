import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '@/lib/apiClient';

interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
}

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    trackPageView(location.pathname);
  }, [location]);

  const trackPageView = async (path: string) => {
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
      console.error('Analytics tracking error:', error);
    }
  };

  const trackEvent = async ({ event_name, properties }: AnalyticsEvent) => {
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
      console.error('Analytics tracking error:', error);
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

  return { trackEvent };
};
