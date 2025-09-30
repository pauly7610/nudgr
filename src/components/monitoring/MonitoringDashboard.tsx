import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const MonitoringDashboard = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const getTimeRangeDate = () => {
    const now = new Date();
    const ranges = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    return ranges[timeRange];
  };

  // Fetch error statistics
  const { data: errorStats, refetch: refetchErrors } = useQuery({
    queryKey: ['error-stats', timeRange],
    queryFn: async () => {
      const startDate = getTimeRangeDate().toISOString();
      const endDate = new Date().toISOString();

      const { data, error } = await supabase
        .rpc('get_error_statistics', {
          p_start_date: startDate,
          p_end_date: endDate,
        });

      if (error) throw error;
      return data?.[0] || { total_errors: 0, critical_errors: 0, unresolved_errors: 0, error_rate: 0 };
    },
  });

  // Fetch recent errors
  const { data: recentErrors } = useQuery({
    queryKey: ['recent-errors', timeRange],
    queryFn: async () => {
      const startDate = getTimeRangeDate().toISOString();

      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Fetch performance metrics
  const { data: performanceData } = useQuery({
    queryKey: ['performance-metrics', timeRange],
    queryFn: async () => {
      const startDate = getTimeRangeDate().toISOString();

      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Aggregate by metric name
      const aggregated: Record<string, any[]> = {};
      data?.forEach((metric: any) => {
        if (!aggregated[metric.metric_name]) {
          aggregated[metric.metric_name] = [];
        }
        aggregated[metric.metric_name].push({
          timestamp: new Date(metric.created_at).toLocaleTimeString(),
          value: Number(metric.metric_value),
        });
      });

      return aggregated;
    },
  });

  // Fetch analytics events
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-events', timeRange],
    queryFn: async () => {
      const startDate = getTimeRangeDate().toISOString();

      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_name')
        .gte('created_at', startDate);

      if (error) throw error;

      // Count events by name
      const eventCounts: Record<string, number> = {};
      data?.forEach((event: any) => {
        eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
      });

      return Object.entries(eventCounts).map(([name, count]) => ({
        name,
        count,
      }));
    },
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of errors, performance, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => refetchErrors()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats?.total_errors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {errorStats?.error_rate?.toFixed(1)}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {errorStats?.critical_errors || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats?.unresolved_errors || 0}</div>
            <p className="text-xs text-muted-foreground">Pending investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {errorStats?.error_rate && errorStats.error_rate < 5 ? 'Healthy' : 'Degraded'}
            </div>
            <p className="text-xs text-muted-foreground">Overall status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest error logs from the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentErrors && recentErrors.length > 0 ? (
                  recentErrors.map((error: any) => (
                    <Alert key={error.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <span className="font-medium">{error.error_type}</span>
                          </div>
                          <AlertDescription className="text-sm">
                            {error.error_message}
                          </AlertDescription>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{error.component_name || 'Unknown'}</span>
                            <span>{new Date(error.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>No errors in the selected time range</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Load Performance</CardTitle>
              <CardDescription>Monitor page load times and core web vitals</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData?.page_load_time && performanceData.page_load_time.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.page_load_time}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Load Time (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No performance data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>Breakdown of analytics events</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData && analyticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No analytics data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
