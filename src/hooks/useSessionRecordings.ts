import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export interface SessionRecordingSummary {
  id: string;
  session_id: string;
  property_id: string | null;
  storage_path: string;
  recording_start: string;
  recording_end: string | null;
  duration_seconds: number | null;
  file_size_bytes: string | null;
  friction_events_count: number;
  metadata: Record<string, unknown>;
}

export const useSessionRecordings = (propertyId?: string | null) => {
  return useQuery({
    queryKey: ['session-recordings', propertyId ?? 'all'],
    queryFn: () => {
      const params = new URLSearchParams();
      if (propertyId) {
        params.set('propertyId', propertyId);
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      return apiRequest<SessionRecordingSummary[]>(`/recordings${suffix}`);
    },
    staleTime: 20_000,
  });
};
