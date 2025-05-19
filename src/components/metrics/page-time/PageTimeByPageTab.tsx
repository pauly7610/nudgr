
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, LabelList
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
  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill="#666"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {formatTime(value)}
      </text>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs">
          <span className="font-medium">Time Range:</span> Last 30 days
        </div>
        <div className="flex items-center text-xs">
          <div className="flex items-center mr-3">
            <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-1.5"></div>
            <span>Average Time Spent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-1.5"></div>
            <span>Bounce Rate</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={pageTimeData}
          margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="page" angle={-45} textAnchor="end" height={60} />
          <YAxis 
            yAxisId="left" 
            label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value}s`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            label={{ value: 'Bounce Rate (%)', angle: 90, position: 'insideRight' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'avgTime') return [formatTime(value as number), 'Avg. Time'];
              return [`${value}%`, 'Bounce Rate'];
            }}
            labelFormatter={(label) => `Page: ${label}`}
          />
          <Legend
            payload={[
              { value: 'Average Time Spent', type: 'square', color: '#8884d8' },
              { value: 'Bounce Rate', type: 'square', color: '#82ca9d' }
            ]}
          />
          <Bar 
            yAxisId="left" 
            dataKey="avgTime" 
            name="Average Time Spent" 
            fill="#8884d8" 
          >
            <LabelList dataKey="avgTime" content={renderCustomizedLabel} />
          </Bar>
          <Bar 
            yAxisId="right" 
            dataKey="bounceRate" 
            name="Bounce Rate" 
            fill="#82ca9d"
            label={{
              position: 'top',
              formatter: (value: number) => `${value}%`,
              fontSize: 12
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
