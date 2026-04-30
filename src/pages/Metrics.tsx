
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatsCard } from '@/components/StatsCard';
import { TrendingDown, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingMetrics } from '@/components/metrics/MarketingMetrics';
import { StaleContentAnalysis } from '@/components/metrics/StaleContentAnalysis';
import { PageTimeAnalytics } from '@/components/metrics/PageTimeAnalytics';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useProductAnalyticsSummary } from '@/hooks/useProductAnalytics';

const daysForRange = (range: string): number => {
  switch (range) {
    case 'today':
      return 1;
    case '90days':
      return 90;
    case '30days':
      return 30;
    default:
      return 7;
  }
};

const Metrics = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const { selectedProperty } = useAnalyticsPropertyContext();
  const days = daysForRange(timeRange);
  const { data: analyticsSummary } = useProductAnalyticsSummary(days, selectedProperty?.id ?? null);
  
  const totalVisitors = analyticsSummary?.summary.sessions ?? 0;
  const conversionRate = analyticsSummary?.summary.frictionScore ?? 0;
  const avgDropOffRate = analyticsSummary ? Math.max(0, 100 - analyticsSummary.summary.frictionScore) : 0;
  const trendData = analyticsSummary?.trend.map((entry) => {
    const totalSignals = entry.events + entry.errors;
    const frictionSignals = entry.highFrictionEvents + entry.errors;
    const dropoff = totalSignals > 0 ? Math.round((frictionSignals / totalSignals) * 100) : 0;

    return {
      day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${entry.date}T00:00:00Z`)),
      visitors: entry.events,
      conversion: Math.max(0, 100 - dropoff),
      dropoff,
    };
  }) ?? [];
  
  return (
    <>
      <DashboardHeader title="Metrics" description="Key performance indicators and trends" />
      
      <div className="container py-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="content">Content Analytics</TabsTrigger>
            <TabsTrigger value="pageTime">Page Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="flex justify-end mb-4">
                <select 
                  className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard 
                  title="Total Visitors"
                  value={totalVisitors.toLocaleString()}
                  description="Active visitors in selected period"
                  change={5.2}
                  icon={<Users className="h-5 w-5 text-primary" />}
                />
                
                <StatsCard 
                  title="Conversion Rate"
                  value={`${Math.round(conversionRate)}%`}
                  description="Funnel completion rate"
                  change={1.8}
                  icon={<TrendingUp className="h-5 w-5 text-primary" />}
                />
                
                <StatsCard 
                  title="Drop-off Rate"
                  value={`${Math.round(avgDropOffRate)}%`}
                  description="Average funnel abandonment"
                  change={-2.3}
                  icon={<TrendingDown className="h-5 w-5 text-primary" />}
                />
              </div>
              
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="bg-muted/50 px-4 py-3">
                  <h3 className="font-semibold">Trend Analysis</h3>
                </div>
                
                <div className="p-4" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#6366f1" name="Visitors" />
                      <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10b981" name="Conversion %" />
                      <Line yAxisId="right" type="monotone" dataKey="dropoff" stroke="#ef4444" name="Drop-off %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="marketing">
            <MarketingMetrics className="mb-8" />
          </TabsContent>
          
          <TabsContent value="content">
            <StaleContentAnalysis className="mb-8" />
          </TabsContent>
          
          <TabsContent value="pageTime">
            <PageTimeAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Metrics;
