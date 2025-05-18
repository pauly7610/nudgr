
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, 
  LineChart, Line
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';

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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={pageTimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="page" angle={-45} textAnchor="end" height={60} />
              <YAxis yAxisId="left" label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Bounce Rate (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'avgTime') return [formatTime(value as number), 'Avg. Time'];
                  return [`${value}%`, 'Bounce Rate'];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="avgTime" name="Time Spent" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="bounceRate" name="Bounce Rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trends">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={timeTrendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Pages/Session', angle: 90, position: 'insideRight' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'avgTimeOnSite') return [formatTime(value as number), 'Avg. Time on Site'];
                  return [value, 'Pages per Session'];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgTimeOnSite" name="Avg Time on Site" stroke="#8884d8" />
              <Line yAxisId="right" type="monotone" dataKey="pagesPerSession" name="Pages per Session" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="border rounded-md p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Page Flow Engagement</h4>
              <p className="text-xs text-muted-foreground">How users move through pages and where they spend the most time</p>
            </div>

            <div className="flex overflow-x-auto pb-4 space-x-4">
              {[
                { page: 'Home', time: '0:45', engaged: 85 },
                { page: 'Category', time: '1:32', engaged: 76 },
                { page: 'Product', time: '2:08', engaged: 92 },
                { page: 'Cart', time: '1:05', engaged: 68 },
                { page: 'Checkout', time: '3:30', engaged: 94 }
              ].map((item, i) => (
                <div key={i} className="flex-shrink-0 w-40 border rounded-lg p-3">
                  <div className="text-sm font-medium">{item.page}</div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{item.time}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Engaged:</span>
                    <span className={`font-medium ${item.engaged > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                      {item.engaged}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${item.engaged > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${item.engaged}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground text-center">
              <Clock className="h-3 w-3 inline mr-1" />
              Users spend the most time on product and checkout pages
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-1">Average Session Duration</div>
          <div className="text-2xl font-bold text-primary">3:45</div>
          <div className="text-xs text-green-600">↑ 12% vs last period</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-1">Pages per Session</div>
          <div className="text-2xl font-bold text-primary">3.8</div>
          <div className="text-xs text-green-600">↑ 5% vs last period</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm font-medium mb-1">Avg. Time per Page</div>
          <div className="text-2xl font-bold text-primary">0:59</div>
          <div className="text-xs text-amber-600">↓ 3% vs last period</div>
        </div>
      </div>
    </div>
  );
};
