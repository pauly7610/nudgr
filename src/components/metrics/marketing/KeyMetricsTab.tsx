
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface KeyMetricsTabProps {
  chartData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    views: number;
    conversions: number;
    ctr: string;
  }>;
}

export const KeyMetricsTab: React.FC<KeyMetricsTabProps> = ({ chartData }) => {
  // Format numbers with commas
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
        <YAxis 
          yAxisId="left"
          tickFormatter={formatNumber} 
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          tickFormatter={formatNumber} 
        />
        <Tooltip 
          formatter={(value, name) => {
            if (typeof value === 'number') {
              return [formatNumber(value), name];
            }
            return [value, name];
          }}
        />
        <Legend 
          verticalAlign="top"
          wrapperStyle={{ paddingBottom: '10px' }}
        />
        <Line 
          yAxisId="left" 
          type="monotone" 
          dataKey="impressions" 
          name="Impressions" 
          stroke="#8884d8" 
          activeDot={{ r: 8 }}
        />
        <Line 
          yAxisId="left" 
          type="monotone" 
          dataKey="clicks" 
          name="Clicks" 
          stroke="#82ca9d" 
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="views" 
          name="Page Views" 
          stroke="#ffc658" 
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="conversions" 
          name="Conversions" 
          stroke="#ff8042" 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
