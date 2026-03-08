
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

type MarketingProvider = 'ga4' | 'google_ads' | 'meta_ads';

interface MarketingProviderSummary {
  importedEvents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
}

interface MarketingImportSummaryResponse {
  summary: {
    ga4: MarketingProviderSummary;
    google_ads: MarketingProviderSummary;
    meta_ads: MarketingProviderSummary;
  };
}

const createSamplePayload = (provider: MarketingProvider) => ({
  provider,
  events: [
    {
      externalEventId: `${provider}_${Date.now()}`,
      campaignName: `${provider.toUpperCase()} Spring Campaign`,
      source: provider,
      medium: provider === 'ga4' ? 'analytics' : 'paid',
      sessionId: `mkt-${Math.random().toString(36).slice(2, 10)}`,
      pageUrl: '/pricing',
      impressions: 1200,
      clicks: 144,
      conversions: 18,
      costMicros: 9500000,
      timestamp: new Date().toISOString(),
      metadata: {
        importedBy: 'marketing-export-ui',
      },
    },
  ],
});

export const MarketingExport: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: summary } = useQuery({
    queryKey: ['marketing-import-summary'],
    queryFn: async () => {
      try {
        return await apiRequest<MarketingImportSummaryResponse>('/marketing/import-summary');
      } catch {
        return null;
      }
    },
  });

  const importMutation = useMutation({
    mutationFn: async (provider: MarketingProvider) => {
      return apiRequest<{ ok: boolean; accepted: number }>('/marketing/import-events', {
        method: 'POST',
        body: JSON.stringify(createSamplePayload(provider)),
      });
    },
    onSuccess: (_data, provider) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-import-summary'] });
      toast({
        title: 'Marketing import accepted',
        description: `Sample ${provider} data imported successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Marketing import failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const providers: Array<{ id: MarketingProvider; title: string; subtitle: string }> = [
    {
      id: 'ga4',
      title: 'Google Analytics 4',
      subtitle: 'Import GA4 campaign/session metrics',
    },
    {
      id: 'google_ads',
      title: 'Google Ads',
      subtitle: 'Import paid traffic and conversion metrics',
    },
    {
      id: 'meta_ads',
      title: 'Meta Ads',
      subtitle: 'Import social campaign performance metrics',
    },
  ];

  return (
    <div className="mt-12 rounded-lg border bg-blue-50 p-6">
      <h2 className="mb-3 text-lg font-semibold text-blue-800">Marketing Data Imports</h2>
      <p className="mb-4 text-sm text-blue-700">
        Import marketing metrics into Nudgr so funnel diagnostics can correlate channel performance with UX friction.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {providers.map((provider) => {
          const providerSummary = summary?.summary?.[provider.id];
          const ctr = providerSummary && providerSummary.impressions > 0
            ? (providerSummary.clicks / providerSummary.impressions) * 100
            : 0;

          return (
            <Card key={provider.id} className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{provider.title}</CardTitle>
                <CardDescription>{provider.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {providerSummary ? (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Imported events: {providerSummary.importedEvents}</div>
                    <div>Impressions: {providerSummary.impressions}</div>
                    <div>CTR: {ctr.toFixed(2)}%</div>
                    <div>Conversions: {providerSummary.conversions}</div>
                    <Badge variant="secondary">Cost: ${(providerSummary.costMicros / 1_000_000).toFixed(2)}</Badge>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No imported metrics yet.</p>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  disabled={importMutation.isPending}
                  onClick={() => importMutation.mutate(provider.id)}
                >
                  Import Sample Data
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
