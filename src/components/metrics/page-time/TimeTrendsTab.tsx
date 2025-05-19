
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeTrendsTabProps {
  timeData: {
    date: string;
    pageTime: number;
    scrollDepth: number;
  }[];
  formatTime: (seconds: number) => string;
}

export const TimeTrendsTab: React.FC<TimeTrendsTabProps> = ({ timeData, formatTime }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs">
          <span className="font-medium">Time Range:</span> Last 30 days
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={timeData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value}s`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Scroll Depth (%)', angle: 90, position: 'insideRight' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name === 'pageTime') return [formatTime(value), 'Page Time'];
              return [`${value}%`, 'Scroll Depth'];
            }}
          />
          <Legend 
            payload={[
              { value: 'Page Time', type: 'line', color: '#8884d8' },
              { value: 'Scroll Depth', type: 'line', color: '#82ca9d' }
            ]}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="pageTime" 
            stroke="#8884d8" 
            name="Page Time" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="scrollDepth" 
            stroke="#82ca9d" 
            name="Scroll Depth" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
