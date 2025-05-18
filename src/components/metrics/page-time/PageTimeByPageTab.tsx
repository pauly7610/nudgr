
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface PageTimeData {
  page: string;
  avgTime: number;
  bounceRate: number;
}

interface PageTimeByPageTabProps {
  pageTimeData: PageTimeData[];
  formatTime: (seconds: number) => string;
}

export const PageTimeByPageTab: React.FC<PageTimeByPageTabProps> = ({ pageTimeData, formatTime }) => {
  return (
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
  );
};
