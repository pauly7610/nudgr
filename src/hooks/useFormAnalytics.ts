import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

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
  common_error_messages: string[];
  date_bucket: string;
}

interface FrictionEvent {
  id: string;
  pageUrl: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface MetricsResponse {
  events: FrictionEvent[];
}

const toFormAnalytic = (event: FrictionEvent): FormAnalytic => {
  const metadata = event.metadata ?? {};
  const totalInteractions = Number(metadata.totalInteractions ?? 1);
  const totalErrors = Number(metadata.totalErrors ?? 0);

  return {
    id: event.id,
    page_url: event.pageUrl,
    form_selector: String(metadata.formSelector ?? 'form'),
    field_name: String(metadata.fieldName ?? 'unknown_field'),
    field_type: typeof metadata.fieldType === 'string' ? metadata.fieldType : null,
    total_interactions: totalInteractions,
    total_errors: totalErrors,
    error_rate: totalInteractions > 0 ? totalErrors / totalInteractions : 0,
    avg_time_to_complete_ms: typeof metadata.avgTimeToCompleteMs === 'number'
      ? metadata.avgTimeToCompleteMs
      : null,
    abandonment_count: Number(metadata.abandonmentCount ?? 0),
    abandonment_rate: typeof metadata.abandonmentRate === 'number'
      ? metadata.abandonmentRate
      : null,
    common_error_messages: Array.isArray(metadata.commonErrorMessages)
      ? metadata.commonErrorMessages.filter((msg): msg is string => typeof msg === 'string')
      : [],
    date_bucket: event.createdAt,
  };
};

export const useFormAnalytics = (pageUrl?: string) => {
  return useQuery({
    queryKey: ['form-analytics', pageUrl],
    queryFn: async () => {
      const data = await apiRequest<MetricsResponse>('/metrics/recent');

      return data.events
        .map(toFormAnalytic)
        .filter((analytic) => (pageUrl ? analytic.page_url === pageUrl : true))
        .sort((a, b) => b.error_rate - a.error_rate);
    },
  });
};

export const useTopFormErrors = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-form-errors', limit],
    queryFn: async () => {
      const data = await apiRequest<MetricsResponse>('/metrics/recent');

      return data.events
        .map(toFormAnalytic)
        .sort((a, b) => b.total_errors - a.total_errors)
        .slice(0, limit);
    },
  });
};
