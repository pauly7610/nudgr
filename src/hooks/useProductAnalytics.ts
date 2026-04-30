import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export interface ProductAnalyticsSummary {
  windowDays: number;
  propertyId: string | null;
  since: string;
  generatedAt: string;
  summary: {
    events: number;
    sessions: number;
    pageViews: number;
    uniquePages: number;
    highFrictionEvents: number;
    errors: number;
    averageSeverity: number;
    frictionScore: number;
    averagePageLoadMs: number | null;
    instrumentationCoverage: number;
  };
  topPages: Array<{
    pageUrl: string;
    events: number;
    sessions: number;
    highFrictionEvents: number;
    errors: number;
    averageSeverity: number;
  }>;
  eventTypes: Array<{
    eventType: string;
    count: number;
  }>;
  trend: Array<{
    date: string;
    events: number;
    highFrictionEvents: number;
    errors: number;
  }>;
  paths: Array<{
    from: string;
    to: string;
    sessions: number;
  }>;
  journeys?: Array<{
    id: string;
    flow: string;
    steps: Array<{
      label: string;
      users: number;
      dropOff?: number;
      friction?: Array<'rage_clicks' | 'form_abandonment' | 'navigation_loops' | 'excessive_scrolling'>;
    }>;
    details?: Array<{
      page: string;
      url: string;
      actions: Array<{
        type: 'click' | 'view' | 'scroll' | 'form_input' | 'hover';
        element: string;
        description: string;
        timestamp: string;
        duration?: number;
        hoverData?: {
          coordinates: string;
          dwellTime: number;
        };
      }>;
      timeSpent: number;
    }>;
  }>;
  alerts?: Array<{
    id: string;
    timestamp: string;
    message: string;
    type: 'warning' | 'error';
    flowId: string;
    stepIndex: number;
  }>;
  cohorts?: Array<{
    id: string;
    name: string;
    conversionRate: number;
    frictionScore: number;
    change: number;
  }>;
  predictions?: Array<{
    type: 'friction_increase' | 'conversion_drop' | 'performance_issue' | 'improvement';
    confidence: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
  }>;
}

export const useProductAnalyticsSummary = (days = 30, propertyId?: string | null) => {
  return useQuery({
    queryKey: ['product-analytics-summary', days, propertyId ?? 'all'],
    queryFn: () => {
      const params = new URLSearchParams({ days: String(days) });
      if (propertyId) {
        params.set('propertyId', propertyId);
      }

      return apiRequest<ProductAnalyticsSummary>(`/analytics/summary?${params.toString()}`);
    },
    staleTime: 30_000,
  });
};
