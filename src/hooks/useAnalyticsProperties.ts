import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

export type AnalyticsPropertyStatus = 'connected' | 'awaiting_traffic';
export type AnalyticsPropertyType = 'website' | 'web_app' | 'mobile_app' | 'desktop_app' | 'backend_service';
export type AnalyticsPropertyEnvironment = 'production' | 'staging' | 'development';

export interface AnalyticsPropertyApiKey {
  id: string;
  keyName: string;
  keyPrefix: string;
  isActive: boolean;
  allowedDomains: string[];
  lastUsedAt: string | null;
  createdAt: string;
}

export interface AnalyticsProperty {
  id: string;
  name: string;
  domain: string;
  propertyType: AnalyticsPropertyType;
  environment: AnalyticsPropertyEnvironment;
  status: AnalyticsPropertyStatus;
  lastSeenAt: string | null;
  eventCount: number;
  apiKeyCount: number;
  createdAt: string;
  updatedAt: string;
  apiKeys: AnalyticsPropertyApiKey[];
}

export interface CreateAnalyticsPropertyInput {
  name: string;
  domain: string;
  propertyType: AnalyticsPropertyType;
  environment: AnalyticsPropertyEnvironment;
}

export interface CreateAnalyticsPropertyResponse {
  property: AnalyticsProperty;
  apiKey: string;
}

export interface CreatePropertyApiKeyResponse extends AnalyticsPropertyApiKey {
  apiKey: string;
}

export interface VerifyAnalyticsPropertyResponse {
  connected: boolean;
  status: AnalyticsPropertyStatus;
  lastSeenAt: string | null;
  eventCount: number;
  apiKeyCount: number;
}

export const analyticsPropertiesQueryKey = ['analytics-properties'];

export const useAnalyticsProperties = () => {
  return useQuery({
    queryKey: analyticsPropertiesQueryKey,
    queryFn: () => apiRequest<AnalyticsProperty[]>('/properties'),
    staleTime: 15_000,
  });
};

export const useCreateAnalyticsProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAnalyticsPropertyInput) =>
      apiRequest<CreateAnalyticsPropertyResponse>('/properties', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsPropertiesQueryKey });
      toast({
        title: 'Site connected',
        description: 'Your install snippet is ready.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Could not connect site',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreatePropertyApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, keyName }: { propertyId: string; keyName?: string }) =>
      apiRequest<CreatePropertyApiKeyResponse>(`/properties/${propertyId}/api-keys`, {
        method: 'POST',
        body: JSON.stringify({ keyName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsPropertiesQueryKey });
      toast({
        title: 'Install key created',
        description: 'A fresh snippet key is ready.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Could not create key',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useVerifyAnalyticsProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      apiRequest<VerifyAnalyticsPropertyResponse>(`/properties/${propertyId}/verify`, {
        method: 'POST',
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: analyticsPropertiesQueryKey });
      toast({
        title: result.connected ? 'Install verified' : 'Waiting for traffic',
        description: result.connected
          ? 'Nudgr has received a signal from this property.'
          : 'Open the installed site once the snippet is live.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
