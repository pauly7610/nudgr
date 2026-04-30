
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import { PageTimeByPageTab } from './page-time/PageTimeByPageTab';
import { TimeTrendsTab } from './page-time/TimeTrendsTab';
import { EngagementFlowTab } from './page-time/EngagementFlowTab';
import { TimeMetricCards } from './page-time/TimeMetricCards';
import { Separator } from '@/components/ui/separator';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useProductAnalyticsSummary } from '@/hooks/useProductAnalytics';

export const PageTimeAnalytics: React.FC = () => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: analyticsSummary } = useProductAnalyticsSummary(30, selectedProperty?.id ?? null);
  const pageTimeData = analyticsSummary?.topPages.map((page) => ({
    page: page.pageUrl,
    avgTime: analyticsSummary.summary.averagePageLoadMs
      ? Math.max(1, Math.round(analyticsSummary.summary.averagePageLoadMs / 1000))
      : Math.max(5, page.events * 8),
    bounceRate: page.events > 0 ? Math.round((page.highFrictionEvents / page.events) * 100) : 0,
  })) ?? [];

  const timeTrendData = analyticsSummary?.trend.map((entry) => ({
    date: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${entry.date}T00:00:00Z`)),
    avgTimeOnSite: Math.max(0, entry.events * 8 + entry.errors * 12),
    pagesPerSession: entry.events > 0 ? Math.max(1, Number((entry.events / Math.max(1, analyticsSummary.summary.sessions)).toFixed(1))) : 0,
  })) ?? [];

  // Format seconds to min:sec
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const totalEvents = analyticsSummary?.summary.events ?? 0;
  const sessions = analyticsSummary?.summary.sessions ?? 0;
  const averageTimePerPageSeconds = pageTimeData.length > 0
    ? Math.round(pageTimeData.reduce((sum, page) => sum + page.avgTime, 0) / pageTimeData.length)
    : 0;
  const averageSessionDurationSeconds = sessions > 0
    ? Math.max(averageTimePerPageSeconds, Math.round((totalEvents / sessions) * averageTimePerPageSeconds))
    : 0;
  const pagesPerSession = sessions > 0
    ? ((analyticsSummary?.summary.uniquePages ?? 0) / sessions).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-base font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          Page Time Analysis
        </h3>
        <span className="text-xs text-muted-foreground">
          Average time spent on each page and engagement metrics
        </span>
      </div>

      <div className="border rounded-md p-4">
        <Tabs defaultValue="by-page">
          <TabsList className="mb-4">
            <TabsTrigger value="by-page">By Page</TabsTrigger>
            <TabsTrigger value="trends">Time Trends</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="by-page">
            <PageTimeByPageTab pageTimeData={pageTimeData} formatTime={formatTime} />
          </TabsContent>

          <TabsContent value="trends">
            <TimeTrendsTab timeTrendData={timeTrendData} formatTime={formatTime} />
          </TabsContent>

          <TabsContent value="engagement">
            <EngagementFlowTab />
          </TabsContent>
        </Tabs>
        
        <TimeMetricCards
          averageSessionDuration={formatTime(averageSessionDurationSeconds)}
          pagesPerSession={pagesPerSession}
          averageTimePerPage={formatTime(averageTimePerPageSeconds)}
        />
      </div>
      
      <Separator className="my-4" />
    </div>
  );
};
