
import React from 'react';
import { Flow } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopFrictionFunnelsProps {
  flows: Flow[];
  onFlowClick: (flowId: string) => void;
  activeFlowId: string | null;
}

export const TopFrictionFunnels: React.FC<TopFrictionFunnelsProps> = ({ 
  flows, 
  onFlowClick,
  activeFlowId
}) => {
  // Calculate drop-off rate for each flow
  const chartData = flows.map(flow => {
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    const totalDropOff = firstStep.users - lastStep.users;
    const dropOffRate = Math.round((totalDropOff / firstStep.users) * 100);
    
    return {
      name: flow.flow,
      dropOffRate,
      id: flow.id,
    };
  });
  
  // Sort by drop-off rate (highest first)
  chartData.sort((a, b) => b.dropOffRate - a.dropOffRate);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Drop-off rate: <span className="font-medium text-red-500">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3">
        <h3 className="font-semibold">Top Friction Funnels</h3>
      </div>
      
      <div className="p-4" style={{ height: '250px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={35}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              unit="%" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="dropOffRate" 
              fill="#7209b7" 
              radius={[4, 4, 0, 0]} 
              onClick={(data) => onFlowClick(data.id)}
              cursor="pointer"
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
