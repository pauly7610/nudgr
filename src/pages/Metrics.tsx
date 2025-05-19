
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatsCard } from '@/components/StatsCard';
import { useFrictionData } from '@/hooks/useFrictionData';
import { Activity, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingMetrics } from '@/components/metrics/MarketingMetrics';
import { StaleContentAnalysis } from '@/components/metrics/StaleContentAnalysis';
import { PageTimeAnalytics } from '@/components/metrics/PageTimeAnalytics';

const Metrics = () => {
  const { flows } = useFrictionData();
  const [timeRange, setTimeRange] = useState('7days');
  
  // Calculate metrics
  const totalVisitors = flows.reduce((acc, flow) => acc + flow.steps[0].users, 0);
  
  const avgDropOffRate = flows.reduce((acc, flow) => {
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    const dropOffRate = (firstStep.users - lastStep.users) / firstStep.users;
    return acc + dropOffRate;
  }, 0) / flows.length * 100;
  
  const conversionRate = 100 - avgDropOffRate;
  
  // Generate mock trend data
  const trendData = [
    { day: 'Mon', visitors: Math.floor(totalVisitors * 0.85), conversion: conversionRate - 3, dropoff: avgDropOffRate + 3 },
    { day: 'Tue', visitors: Math.floor(totalVisitors * 0.9), conversion: conversionRate - 2, dropoff: avgDropOffRate + 2 },
    { day: 'Wed', visitors: Math.floor(totalVisitors * 0.95), conversion: conversionRate - 1, dropoff: avgDropOffRate + 1 },
    { day: 'Thu', visitors: totalVisitors, conversion: conversionRate, dropoff: avgDropOffRate },
    { day: 'Fri', visitors: Math.floor(totalVisitors * 1.05), conversion: conversionRate + 1, dropoff: avgDropOffRate - 1 },
    { day: 'Sat', visitors: Math.floor(totalVisitors * 0.85), conversion: conversionRate - 0.5, dropoff: avgDropOffRate + 0.5 },
    { day: 'Sun', visitors: Math.floor(totalVisitors * 0.8), conversion: conversionRate - 1.5, dropoff: avgDropOffRate + 1.5 },
  ];
  
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
