
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
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
  // Calculate averages for reference lines
  const avgTime = timeTrendData.reduce((sum, item) => sum + item.avgTimeOnSite, 0) / timeTrendData.length;
  const avgPages = timeTrendData.reduce((sum, item) => sum + item.pagesPerSession, 0) / timeTrendData.length;
  
  // Find max time for context
  const maxTime = Math.max(...timeTrendData.map(item => item.avgTimeOnSite));
  const maxTimeFormatted = formatTime(maxTime);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs">
          <span className="font-medium">Analysis period:</span> Last 7 days
        </div>
        <div className="text-xs">
          <span className="font-medium">Max time on site:</span> {maxTimeFormatted}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={timeTrendData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${formatTime(value)}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Pages/Session', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'avgTimeOnSite') return [formatTime(value as number), 'Avg. Time on Site'];
              return [value, 'Pages per Session'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            payload={[
              { value: 'Avg Time on Site', type: 'line', color: '#8884d8' },
              { value: 'Pages per Session', type: 'line', color: '#82ca9d' },
              { value: 'Time Average', type: 'line', color: '#ff7300', strokeDasharray: '3 3' },
              { value: 'Pages Average', type: 'line', color: '#0088fe', strokeDasharray: '3 3' }
            ]}
          />
          <ReferenceLine y={avgTime} yAxisId="left" label="Avg Time" stroke="#ff7300" strokeDasharray="3 3" />
          <ReferenceLine y={avgPages} yAxisId="right" label="Avg Pages" stroke="#0088fe" strokeDasharray="3 3" />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="avgTimeOnSite" 
            name="Avg Time on Site" 
            stroke="#8884d8" 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="pagesPerSession" 
            name="Pages per Session" 
            stroke="#82ca9d" 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>* Time values shown in minutes:seconds format</p>
      </div>
    </div>
  );
};
