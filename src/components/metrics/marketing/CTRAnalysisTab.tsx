
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CTRAnalysisTabProps {
  chartData: Array<{
    date: string;
    ctr: string;
  }>;
}

export const CTRAnalysisTab: React.FC<CTRAnalysisTabProps> = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
        <YAxis domain={[0, 'auto']} unit="%" />
        <Tooltip formatter={(value) => [`${value}%`, 'CTR']} />
        <Legend 
          verticalAlign="top"
          wrapperStyle={{ paddingBottom: '10px' }}
        />
        <Line 
          type="monotone" 
          dataKey="ctr" 
          stroke="#ff7300" 
          name="CTR (%)" 
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
