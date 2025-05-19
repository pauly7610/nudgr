
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBarIcon } from 'lucide-react';
import { PageTimeAnalytics } from './PageTimeAnalytics';
import { MarketingMetricsProps, SegmentType } from './marketing/types';
import { marketingData } from './marketing/mockData';
import { MarketingMetricsSummary } from './marketing/MarketingMetricsSummary';
import { KeyMetricsTab } from './marketing/KeyMetricsTab';
import { CTRAnalysisTab } from './marketing/CTRAnalysisTab';
import { HoverAnalysisTab } from './marketing/HoverAnalysisTab';

export const MarketingMetrics: React.FC<MarketingMetricsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState('7days');
  const [segmentType, setSegmentType] = useState<SegmentType>('all');
  const [selectedTab, setSelectedTab] = useState('metrics');

  // Calculate metrics
  const aggregateMetrics = marketingData.reduce((acc, day) => {
    let dataToUse = day;
    
    if (segmentType === 'authenticated') {
      dataToUse = day.authenticated as any;
    } else if (segmentType === 'nonAuthenticated') {
      dataToUse = day.nonAuthenticated as any;
    }
    
    return {
      totalImpressions: acc.totalImpressions + dataToUse.impressions,
      totalClicks: acc.totalClicks + dataToUse.clicks,
      totalViews: acc.totalViews + dataToUse.views,
      totalConversions: acc.totalConversions + dataToUse.conversions
    };
  }, {
    totalImpressions: 0,
    totalClicks: 0,
    totalViews: 0,
    totalConversions: 0
  });

  const ctr = (aggregateMetrics.totalClicks / aggregateMetrics.totalImpressions * 100).toFixed(2);
  const viewToClickRate = (aggregateMetrics.totalClicks / aggregateMetrics.totalViews * 100).toFixed(2);
  const conversionRate = (aggregateMetrics.totalConversions / aggregateMetrics.totalViews * 100).toFixed(2);

  // Function to get chart data based on segment type
  const getChartData = () => {
    return marketingData.map(day => {
      if (segmentType === 'authenticated' && day.authenticated) {
        return {
          ...day.authenticated,
          date: day.date,
          ctr: (day.authenticated.clicks / day.authenticated.impressions * 100).toFixed(2)
        };
      } else if (segmentType === 'nonAuthenticated' && day.nonAuthenticated) {
        return {
          ...day.nonAuthenticated,
          date: day.date,
          ctr: (day.nonAuthenticated.clicks / day.nonAuthenticated.impressions * 100).toFixed(2)
        };
      }
      return {
        ...day,
        ctr: (day.clicks / day.impressions * 100).toFixed(2)
      };
    });
  };

  const chartData = getChartData();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-primary" />
          Marketing Performance Metrics
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={segmentType} onValueChange={(value) => setSegmentType(value as SegmentType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="User Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="authenticated">Authenticated</SelectItem>
              <SelectItem value="nonAuthenticated">Non-Authenticated</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <MarketingMetricsSummary 
          totalImpressions={aggregateMetrics.totalImpressions}
          totalClicks={aggregateMetrics.totalClicks}
          ctr={ctr}
          conversionRate={conversionRate}
        />
        
        <Tabs defaultValue="metrics" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="ctr">CTR Analysis</TabsTrigger>
            <TabsTrigger value="page-time">Page Time Analysis</TabsTrigger>
            <TabsTrigger value="hover-analysis">Hover Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="h-[350px]">
            <KeyMetricsTab chartData={chartData} />
          </TabsContent>
          
          <TabsContent value="ctr" className="h-[350px]">
            <CTRAnalysisTab chartData={chartData} />
          </TabsContent>

          <TabsContent value="page-time" className="h-[350px]">
            <PageTimeAnalytics />
          </TabsContent>

          <TabsContent value="hover-analysis" className="h-[350px]">
            <HoverAnalysisTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
