import { Activity, AlertTriangle, Gauge, GitBranch, Loader2, MousePointerClick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProductAnalyticsSummary } from '@/hooks/useProductAnalytics';
import { cn } from '@/lib/utils';

interface ProductAnalyticsPulseProps {
  analytics?: ProductAnalyticsSummary;
  isLoading?: boolean;
}

const compactNumber = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
};

const formatDuration = (value: number | null): string => {
  if (value === null) {
    return 'No data';
  }

  return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : `${value}ms`;
};

const shortenPath = (value: string): string => {
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}` || '/';
  } catch {
    return value;
  }
};

const scoreTone = (score: number): string => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

export const ProductAnalyticsPulse = ({ analytics, isLoading }: ProductAnalyticsPulseProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading live product analytics...
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Live product analytics are unavailable. Check the backend API connection.
        </CardContent>
      </Card>
    );
  }

  const maxTrendValue = Math.max(
    1,
    ...analytics.trend.map((entry) => entry.events + entry.errors)
  );
  const hasLiveData = analytics.summary.events > 0 || analytics.summary.errors > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Product Analytics Pulse
            </CardTitle>
            <CardDescription>
              Live behavior, friction, performance, and instrumentation quality for the last {analytics.windowDays} days.
            </CardDescription>
          </div>
          <Badge variant={hasLiveData ? 'default' : 'secondary'}>
            {hasLiveData ? 'Live data' : 'Awaiting traffic'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Friction Score</span>
              <Gauge className="h-4 w-4" />
            </div>
            <div className={cn('mt-2 text-3xl font-semibold', scoreTone(analytics.summary.frictionScore))}>
              {analytics.summary.frictionScore}
            </div>
            <Progress value={analytics.summary.frictionScore} className="mt-3 h-2" />
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Sessions</span>
              <MousePointerClick className="h-4 w-4" />
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {compactNumber(analytics.summary.sessions)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {compactNumber(analytics.summary.pageViews)} page views
            </p>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>High Friction</span>
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {compactNumber(analytics.summary.highFrictionEvents)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {compactNumber(analytics.summary.errors)} logged errors
            </p>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Instrumentation</span>
              <GitBranch className="h-4 w-4" />
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {analytics.summary.instrumentationCoverage}%
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Avg load {formatDuration(analytics.summary.averagePageLoadMs)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Top Product Surfaces</h3>
              <span className="text-xs text-muted-foreground">by friction impact</span>
            </div>
            <div className="overflow-hidden rounded-md border">
              {analytics.topPages.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No page-level events yet.</div>
              ) : (
                analytics.topPages.map((page) => (
                  <div key={page.pageUrl} className="grid gap-3 border-b p-3 last:border-b-0 md:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{shortenPath(page.pageUrl)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {compactNumber(page.events)} events, {compactNumber(page.sessions)} sessions
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Badge variant={page.highFrictionEvents > 0 ? 'destructive' : 'secondary'}>
                        {page.highFrictionEvents} high
                      </Badge>
                      <Badge variant="outline">{page.averageSeverity.toFixed(1)} avg</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Daily Volume</h3>
                <span className="text-xs text-muted-foreground">events + errors</span>
              </div>
              <div className="flex h-32 items-end gap-1 rounded-md border p-3">
                {analytics.trend.slice(-30).map((entry) => {
                  const height = Math.max(4, ((entry.events + entry.errors) / maxTrendValue) * 100);
                  return (
                    <div
                      key={entry.date}
                      className="flex flex-1 items-end"
                      title={`${entry.date}: ${entry.events} events, ${entry.errors} errors`}
                    >
                      <div
                        className={cn(
                          'w-full rounded-sm',
                          entry.highFrictionEvents > 0 || entry.errors > 0 ? 'bg-amber-500' : 'bg-primary'
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Leading Event Types</h3>
              <div className="space-y-2">
                {analytics.eventTypes.slice(0, 5).map((event) => (
                  <div key={event.eventType} className="flex items-center justify-between text-sm">
                    <span className="truncate">{event.eventType.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{compactNumber(event.count)}</span>
                  </div>
                ))}
                {analytics.eventTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No event mix available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {analytics.paths.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Common Session Paths</h3>
              <span className="text-xs text-muted-foreground">observed transitions</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {analytics.paths.slice(0, 4).map((path) => (
                <div key={`${path.from}-${path.to}`} className="rounded-md border p-3 text-sm">
                  <div className="truncate font-medium">{shortenPath(path.from)}</div>
                  <div className="text-muted-foreground">to</div>
                  <div className="truncate font-medium">{shortenPath(path.to)}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{compactNumber(path.sessions)} sessions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analytics.summary.collectionQuality && (
          <div className="grid gap-3 rounded-md border p-4 md:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Event IDs</div>
              <div className="mt-1 text-lg font-semibold">{analytics.summary.collectionQuality.eventIdCoverage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Timestamps</div>
              <div className="mt-1 text-lg font-semibold">{analytics.summary.collectionQuality.timestampCoverage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SDK events</div>
              <div className="mt-1 text-lg font-semibold">{analytics.summary.collectionQuality.sdkEventCoverage}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SDK versions</div>
              <div className="mt-1 truncate text-sm font-medium">
                {analytics.summary.collectionQuality.sdkVersions.join(', ') || 'none'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
