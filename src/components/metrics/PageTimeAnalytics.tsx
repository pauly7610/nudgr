
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import { PageTimeByPageTab } from './page-time/PageTimeByPageTab';
import { TimeTrendsTab } from './page-time/TimeTrendsTab';
import { EngagementFlowTab } from './page-time/EngagementFlowTab';
import { TimeMetricCards } from './page-time/TimeMetricCards';

export const PageTimeAnalytics: React.FC = () => {
  // Mock data for page time analytics
  const pageTimeData = [
    { page: 'Home', avgTime: 45, bounceRate: 32 },
    { page: 'Product Listing', avgTime: 95, bounceRate: 22 },
    { page: 'Product Detail', avgTime: 128, bounceRate: 18 },
    { page: 'Shopping Cart', avgTime: 62, bounceRate: 42 },
    { page: 'Checkout', avgTime: 210, bounceRate: 38 },
    { page: 'Account', avgTime: 73, bounceRate: 12 },
    { page: 'Help Center', avgTime: 156, bounceRate: 25 },
  ];

  // Mock data for time trend
  const timeTrendData = [
    { date: 'May 12', avgTimeOnSite: 180, pagesPerSession: 3.2 },
    { date: 'May 13', avgTimeOnSite: 195, pagesPerSession: 3.4 },
    { date: 'May 14', avgTimeOnSite: 175, pagesPerSession: 3.1 },
    { date: 'May 15', avgTimeOnSite: 210, pagesPerSession: 3.8 },
    { date: 'May 16', avgTimeOnSite: 230, pagesPerSession: 4.2 },
    { date: 'May 17', avgTimeOnSite: 215, pagesPerSession: 3.9 },
    { date: 'May 18', avgTimeOnSite: 205, pagesPerSession: 3.7 },
  ];

  // Format seconds to min:sec
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-base font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary" />
          Page Time Analysis
        </h3>
        <span className="text-xs text-muted-foreground">
          Average time spent on each page and engagement metrics
        </span>
      </div>

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

      <div className="mt-4">
        <TimeMetricCards />
      </div>
    </div>
  );
};
