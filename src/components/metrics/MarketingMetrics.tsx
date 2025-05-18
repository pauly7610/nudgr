
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBarIcon } from 'lucide-react';

// Define types for marketing metrics data
interface MarketingMetricItem {
  date: string;
  impressions: number;
  clicks: number;
  views: number;
  conversions: number;
  authenticated?: {
    impressions: number;
    clicks: number;
    views: number;
    conversions: number;
  };
  nonAuthenticated?: {
    impressions: number;
    clicks: number;
    views: number;
    conversions: number;
  };
}

interface MarketingMetricsProps {
  className?: string;
}

export const MarketingMetrics: React.FC<MarketingMetricsProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState('7days');
  const [segmentType, setSegmentType] = useState<'all' | 'authenticated' | 'nonAuthenticated'>('all');

  // Mock marketing metrics data
  const marketingData: MarketingMetricItem[] = [
    {
      date: 'May 12',
      impressions: 24500,
      clicks: 1225,
      views: 3750,
      conversions: 125,
      authenticated: {
        impressions: 9800,
        clicks: 735,
        views: 2250,
        conversions: 98
      },
      nonAuthenticated: {
        impressions: 14700,
        clicks: 490,
        views: 1500,
        conversions: 27
      }
    },
    {
      date: 'May 13',
      impressions: 26800,
      clicks: 1340,
      views: 4100,
      conversions: 142,
      authenticated: {
        impressions: 10720,
        clicks: 804,
        views: 2460,
        conversions: 112
      },
      nonAuthenticated: {
        impressions: 16080,
        clicks: 536,
        views: 1640,
        conversions: 30
      }
    },
    {
      date: 'May 14',
      impressions: 22300,
      clicks: 1115,
      views: 3400,
      conversions: 118,
      authenticated: {
        impressions: 8920,
        clicks: 669,
        views: 2040,
        conversions: 93
      },
      nonAuthenticated: {
        impressions: 13380,
        clicks: 446,
        views: 1360,
        conversions: 25
      }
    },
    {
      date: 'May 15',
      impressions: 28900,
      clicks: 1445,
      views: 4400,
      conversions: 154,
      authenticated: {
        impressions: 11560,
        clicks: 867,
        views: 2640,
        conversions: 121
      },
      nonAuthenticated: {
        impressions: 17340,
        clicks: 578,
        views: 1760,
        conversions: 33
      }
    },
    {
      date: 'May 16',
      impressions: 31200,
      clicks: 1560,
      views: 4750,
      conversions: 165,
      authenticated: {
        impressions: 12480,
        clicks: 936,
        views: 2850,
        conversions: 130
      },
      nonAuthenticated: {
        impressions: 18720,
        clicks: 624,
        views: 1900,
        conversions: 35
      }
    },
    {
      date: 'May 17',
      impressions: 29600,
      clicks: 1480,
      views: 4500,
      conversions: 158,
      authenticated: {
        impressions: 11840,
        clicks: 888,
        views: 2700,
        conversions: 124
      },
      nonAuthenticated: {
        impressions: 17760,
        clicks: 592,
        views: 1800,
        conversions: 34
      }
    },
    {
      date: 'May 18',
      impressions: 27200,
      clicks: 1360,
      views: 4150,
      conversions: 145,
      authenticated: {
        impressions: 10880,
        clicks: 816,
        views: 2490,
        conversions: 114
      },
      nonAuthenticated: {
        impressions: 16320,
        clicks: 544,
        views: 1660,
        conversions: 31
      }
    }
  ];

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
          <Select value={segmentType} onValueChange={(value) => setSegmentType(value as any)}>
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
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Impressions</div>
            <div className="text-2xl font-bold mt-1">{aggregateMetrics.totalImpressions.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Clicks</div>
            <div className="text-2xl font-bold mt-1">{aggregateMetrics.totalClicks.toLocaleString()}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">CTR</div>
            <div className="text-2xl font-bold mt-1">{ctr}%</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
            <div className="text-2xl font-bold mt-1">{conversionRate}%</div>
          </div>
        </div>
        
        <Tabs defaultValue="metrics">
          <TabsList className="mb-4">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="ctr">CTR Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#8884d8" />
                <Line yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="views" name="Page Views" stroke="#ffc658" />
                <Line yAxisId="right" type="monotone" dataKey="conversions" name="Conversions" stroke="#ff8042" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="ctr" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
                <YAxis domain={[0, 'auto']} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'CTR']} />
                <Legend />
                <Line type="monotone" dataKey="ctr" stroke="#ff7300" name="CTR (%)" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
