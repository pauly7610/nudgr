
import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface MiniTrendChartProps {
  viewHistory?: number[];
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({ viewHistory = [] }) => {
  // Get last 30 days of data
  const last30Days = viewHistory.slice(0, 30).reverse();
  const data = last30Days.map((value, index) => ({
    day: index,
    views: value
  }));

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#8884d8" 
            dot={false} 
            strokeWidth={1.5} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
