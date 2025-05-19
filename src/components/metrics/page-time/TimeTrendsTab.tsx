
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeTrendsTabProps {
  timeData?: {
    date: string;
    avgTimeOnSite: number;
    pagesPerSession: number;
  }[];
  timeTrendData?: {
    date: string;
    avgTimeOnSite: number;
    pagesPerSession: number;
  }[];
  formatTime: (seconds: number) => string;
}

export const TimeTrendsTab: React.FC<TimeTrendsTabProps> = ({ timeData, timeTrendData, formatTime }) => {
  // Use either timeData or timeTrendData, preferring timeData if provided
  const dataToUse = timeData || timeTrendData || [];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs">
          <span className="font-medium">Time Range:</span> Last 30 days
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={dataToUse}
          margin={{ top: 20, right: 50, left: 40, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            tickFormatter={(value) => `${value}s`}
            tick={{ fontSize: 9 }}
            width={60}
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Pages per Session', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
            tick={{ fontSize: 9 }}
            width={60}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name === 'avgTimeOnSite') return [formatTime(value), 'Page Time'];
              return [value, 'Pages/Session'];
            }}
            contentStyle={{ fontSize: 11 }}
          />
          <Legend 
            payload={[
              { value: 'Page Time', type: 'line', color: '#8884d8' },
              { value: 'Pages per Session', type: 'line', color: '#82ca9d' }
            ]}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="avgTimeOnSite" 
            stroke="#8884d8" 
            name="Page Time" 
            activeDot={{ r: 6 }} 
            strokeWidth={1.5}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="pagesPerSession" 
            stroke="#82ca9d" 
            name="Pages per Session" 
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
