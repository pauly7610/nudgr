import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

export interface PrivacySettings {
  id: string;
  propertyId: string | null;
  retentionDays: number;
  autoCleanup: boolean;
  archiveBeforeDelete: boolean;
  redactText: boolean;
  respectDoNotTrack: boolean;
  requireConsent: boolean;
  captureQueryString: boolean;
  captureUrlHash: boolean;
  allowScreenshots: boolean;
  recordingSampleRate: number;
  domainAllowlist: string[];
  sensitiveSelectors: string[];
  updatedAt: string;
}

export interface PrivacyAudit {
  generatedAt: string;
  score: number;
  risk: 'low' | 'medium' | 'high';
  dataCollected: string[];
  findings: {
    inspectedEvents: number;
    redactedEvents: number;
    potentialSensitiveMetadata: number;
    unrestrictedActiveKeys: number;
    recentRecordings: number;
  };
  recommendations: string[];
}

export interface SetupCheck {
  generatedAt: string;
  propertyId: string | null;
  score: number;
  readyForProduction: boolean;
  lastSignalAt: string | null;
  sdkVersion: string | null;
  schemaVersion: number | null;
  checks: Array<{
    id: string;
    label: string;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
  }>;
}

export interface EventDefinition {
  id: string;
  propertyId: string | null;
  eventName: string;
  displayName?: string | null;
  description?: string | null;
  category: string;
  status: 'active' | 'draft' | 'deprecated';
  owner?: string | null;
  requiredProperties: string[];
  optionalProperties: string[];
  conversionEvent: boolean;
  piiRisk: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CollectionObservability {
  generatedAt: string;
  score: number;
  health: 'healthy' | 'watch' | 'needs_attention';
  totals: {
    events: number;
    errors: number;
    performanceMetrics: number;
    rateLimitWindows: number;
  };
  quality: {
    eventIdCoverage: number;
    timestampCoverage: number;
    sdkEventCoverage: number;
    queueDelayP50Ms: number | null;
    queueDelayP95Ms: number | null;
  };
  eventTypes: Array<{ eventType: string; count: number }>;
  sdkVersions: Array<{ version: string; count: number }>;
  schemaVersions: Array<{ version: string; count: number }>;
  domains: Array<{ domain: string; count: number }>;
  unknownEvents: Array<{ eventType: string; count: number }>;
  recommendations: string[];
}

export interface SecurityPosture {
  generatedAt: string;
  score: number;
  posture: 'strong' | 'needs_review' | 'at_risk';
  counts: {
    activeKeys: number;
    oldKeys: number;
    unrestrictedKeys: number;
    privacyGaps: number;
    auditEvents: number;
  };
  keys: Array<{
    id: string;
    keyName: string;
    keyPrefix: string;
    isActive: boolean;
    ageDays: number;
    allowedDomains: string[];
    lastUsedAt: string | null;
    needsRotation: boolean;
    unrestricted: boolean;
    property?: { id: string; name: string; domain: string } | null;
  }>;
  recentAudit: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId: string | null;
    createdAt: string;
    metadata?: unknown;
  }>;
  recommendations: string[];
}

export interface ExportDestination {
  id: string;
  name: string;
  destinationType: 'webhook' | 's3' | 'warehouse' | 'email';
  cadence: 'manual' | 'daily' | 'weekly' | 'monthly';
  config: Record<string, unknown>;
  isActive: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOpportunities {
  generatedAt: string;
  opportunities: Array<{
    id: string;
    pageUrl: string;
    impactScore: number;
    events: number;
    sessions: number;
    highFriction: number;
    errors: number;
    averageLoadMs: number | null;
    recommendation: string;
  }>;
}

export interface RecordingInsights {
  generatedAt: string;
  summary: {
    recordings: number;
    frictionRecordings: number;
    averageDurationSeconds: number;
    totalSizeBytes: number;
  };
  controls: {
    sampling: string;
    masking: string;
    retention: string;
  };
  replaySearch: Array<{
    id: string;
    sessionId: string;
    frictionEventsCount: number;
    durationSeconds: number | null;
    createdAt: string;
    pageUrl: unknown;
  }>;
}

const withProperty = (path: string, propertyId?: string | null, extras?: Record<string, string | number>) => {
  const params = new URLSearchParams();
  if (propertyId) {
    params.set('propertyId', propertyId);
  }

  Object.entries(extras ?? {}).forEach(([key, value]) => params.set(key, String(value)));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

export const usePrivacySettings = (propertyId?: string | null) => {
  return useQuery({
    queryKey: ['privacy-settings', propertyId ?? 'global'],
    queryFn: () => apiRequest<PrivacySettings>(withProperty('/privacy/settings', propertyId)),
  });
};

export const useUpdatePrivacySettings = (propertyId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<PrivacySettings>) =>
      apiRequest<PrivacySettings>('/privacy/settings', {
        method: 'PATCH',
        body: JSON.stringify({ ...input, propertyId: propertyId ?? null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      queryClient.invalidateQueries({ queryKey: ['privacy-audit'] });
      toast({ title: 'Privacy controls saved' });
    },
    onError: (error) => {
      toast({ title: 'Could not save privacy controls', description: error.message, variant: 'destructive' });
    },
  });
};

export const usePrivacyAudit = (propertyId?: string | null, days = 30) => {
  return useQuery({
    queryKey: ['privacy-audit', propertyId ?? 'global', days],
    queryFn: () => apiRequest<PrivacyAudit>(withProperty('/privacy/audit', propertyId, { days })),
  });
};

export const useSetupCheck = (propertyId?: string | null) => {
  return useQuery({
    queryKey: ['setup-check', propertyId ?? 'global'],
    queryFn: () => apiRequest<SetupCheck>(withProperty('/setup/check', propertyId)),
    enabled: Boolean(propertyId),
  });
};

export const useEventDefinitions = (propertyId?: string | null) => {
  return useQuery({
    queryKey: ['event-definitions', propertyId ?? 'global'],
    queryFn: () => apiRequest<EventDefinition[]>(withProperty('/event-definitions', propertyId)),
  });
};

export const useCreateEventDefinition = (propertyId?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<EventDefinition> & { eventName: string }) =>
      apiRequest<EventDefinition>('/event-definitions', {
        method: 'POST',
        body: JSON.stringify({ ...input, propertyId: propertyId ?? null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-definitions'] });
      queryClient.invalidateQueries({ queryKey: ['collection-observability'] });
      toast({ title: 'Event added to taxonomy' });
    },
    onError: (error) => {
      toast({ title: 'Could not add event', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCollectionObservability = (propertyId?: string | null, hours = 24) => {
  return useQuery({
    queryKey: ['collection-observability', propertyId ?? 'global', hours],
    queryFn: () => apiRequest<CollectionObservability>(withProperty('/collection/observability', propertyId, { hours })),
    refetchInterval: 30_000,
  });
};

export const useSecurityPosture = () => {
  return useQuery({
    queryKey: ['security-posture'],
    queryFn: () => apiRequest<SecurityPosture>('/security/posture'),
  });
};

export const useRotateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ id: string; apiKey: string }>(`/api-keys/${id}/rotate`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-posture'] });
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({ title: 'API key rotated', description: 'A fresh key was generated and the old key was disabled.' });
    },
    onError: (error) => {
      toast({ title: 'Could not rotate key', description: error.message, variant: 'destructive' });
    },
  });
};

export const useExportDestinations = () => {
  return useQuery({
    queryKey: ['export-destinations'],
    queryFn: () => apiRequest<ExportDestination[]>('/export-destinations'),
  });
};

export const useCreateExportDestination = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<ExportDestination, 'id' | 'createdAt' | 'updatedAt' | 'lastRunAt'>) =>
      apiRequest<ExportDestination>('/export-destinations', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-destinations'] });
      toast({ title: 'Export destination saved' });
    },
    onError: (error) => {
      toast({ title: 'Could not save destination', description: error.message, variant: 'destructive' });
    },
  });
};

export const useExportCsv = () => {
  return useMutation({
    mutationFn: (input: { exportType: 'events' | 'errors' | 'performance' | 'taxonomy'; propertyId?: string | null; days: number }) =>
      apiRequest<{ ok: boolean; rows: number; downloadUrl: string }>('/api/export-csv', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      toast({ title: 'CSV generated', description: `${data.rows.toLocaleString()} rows are ready.` });
      window.open(data.downloadUrl, '_blank');
    },
    onError: (error) => {
      toast({ title: 'CSV export failed', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAnalyticsOpportunities = (propertyId?: string | null, days = 30) => {
  return useQuery({
    queryKey: ['analytics-opportunities', propertyId ?? 'global', days],
    queryFn: () => apiRequest<AnalyticsOpportunities>(withProperty('/analytics/opportunities', propertyId, { days })),
  });
};

export const useRecordingInsights = (propertyId?: string | null) => {
  return useQuery({
    queryKey: ['recording-insights', propertyId ?? 'global'],
    queryFn: () => apiRequest<RecordingInsights>(withProperty('/recording-insights', propertyId)),
  });
};
