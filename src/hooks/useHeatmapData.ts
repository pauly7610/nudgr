import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useHeatmapData = (pageUrl?: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['heatmap-data', pageUrl, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('heatmap_data')
        .select('*')
        .order('interaction_count', { ascending: false });

      if (pageUrl) {
        query = query.eq('page_url', pageUrl);
      }

      if (dateRange) {
        query = query
          .gte('date_bucket', dateRange.start)
          .lte('date_bucket', dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HeatmapPoint[];
    },
  });
};

export const useTopFrictionElements = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-friction-elements', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heatmap_data')
        .select('*')
        .order('friction_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as HeatmapPoint[];
    },
  });
};
