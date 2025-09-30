import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FormAnalytic {
  id: string;
  page_url: string;
  form_selector: string;
  field_name: string;
  field_type: string | null;
  total_interactions: number;
  total_errors: number;
  error_rate: number;
  avg_time_to_complete_ms: number | null;
  abandonment_count: number;
  abandonment_rate: number | null;
  common_error_messages: any[];
  date_bucket: string;
}

export const useFormAnalytics = (pageUrl?: string) => {
  return useQuery({
    queryKey: ['form-analytics', pageUrl],
    queryFn: async () => {
      let query = supabase
        .from('form_analytics')
        .select('*')
        .order('error_rate', { ascending: false });

      if (pageUrl) {
        query = query.eq('page_url', pageUrl);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FormAnalytic[];
    },
  });
};

export const useTopFormErrors = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-form-errors', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_analytics')
        .select('*')
        .order('total_errors', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as FormAnalytic[];
    },
  });
};
