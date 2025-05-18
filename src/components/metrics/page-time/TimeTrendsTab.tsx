
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';

interface TimeTrendData {
  date: string;
  avgTimeOnSite: number;
  pagesPerSession: number;
}

interface TimeTrendsTabProps {
  timeTrendData: TimeTrendData[];
  formatTime: (seconds: number) => string;
}

export const TimeTrendsTab: React.FC<TimeTrendsTabProps> = ({ timeTrendData, formatTime }) => {
  return (
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
  );
};
