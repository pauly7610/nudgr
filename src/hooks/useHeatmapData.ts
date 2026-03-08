import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export interface HeatmapPoint {
  id: string;
  page_url: string;
  element_selector: string;
  interaction_type: 'click' | 'hover' | 'scroll' | 'form_field' | 'rage_click';
  x_position: number | null;
  y_position: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  interaction_count: number;
  total_duration_ms: number;
  avg_duration_ms: number;
  friction_score: number;
  date_bucket: string;
}

interface FrictionEvent {
  id: string;
  eventType: string;
  pageUrl: string;
  severityScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface MetricsResponse {
  events: FrictionEvent[];
}

const toHeatmapPoint = (event: FrictionEvent): HeatmapPoint => {
  const metadata = event.metadata ?? {};

  return {
    id: event.id,
    page_url: event.pageUrl,
    element_selector: String(metadata.elementSelector ?? 'body'),
    interaction_type: (metadata.interactionType as HeatmapPoint['interaction_type']) ?? 'click',
    x_position: typeof metadata.x === 'number' ? metadata.x : null,
    y_position: typeof metadata.y === 'number' ? metadata.y : null,
    viewport_width: typeof metadata.viewportWidth === 'number' ? metadata.viewportWidth : null,
    viewport_height: typeof metadata.viewportHeight === 'number' ? metadata.viewportHeight : null,
    interaction_count: 1,
    total_duration_ms: typeof metadata.durationMs === 'number' ? metadata.durationMs : 0,
    avg_duration_ms: typeof metadata.durationMs === 'number' ? metadata.durationMs : 0,
    friction_score: event.severityScore,
    date_bucket: event.createdAt,
  };
};

export const useHeatmapData = (pageUrl?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['heatmap-data', pageUrl, dateRange],
    queryFn: async () => {
      const data = await apiRequest<MetricsResponse>('/metrics/recent');

      return data.events
        .map(toHeatmapPoint)
        .filter((point) => {
          const matchesPage = pageUrl ? point.page_url === pageUrl : true;
          const matchesDate = dateRange
            ? point.date_bucket >= dateRange.start && point.date_bucket <= dateRange.end
            : true;
          return matchesPage && matchesDate;
        })
        .sort((a, b) => b.interaction_count - a.interaction_count);
    },
  });
};

export const useTopFrictionElements = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-friction-elements', limit],
    queryFn: async () => {
      const data = await apiRequest<MetricsResponse>('/metrics/recent');

      return data.events
        .map(toHeatmapPoint)
        .sort((a, b) => b.friction_score - a.friction_score)
        .slice(0, limit);
    },
  });
};
