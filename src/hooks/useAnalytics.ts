import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('friction_events').insert({
        event_type: 'page_view',
        page_url: path,
        session_id: getSessionId(),
        severity_score: 0,
        metadata: {
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
          user_id: user?.id,
        },
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackEvent = async ({ event_name, properties }: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('friction_events').insert({
        event_type: event_name,
        page_url: location.pathname,
        session_id: getSessionId(),
        severity_score: 0,
        metadata: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
        },
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
