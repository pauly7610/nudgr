
import React from 'react';
import { Flow } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, TrendingDown } from 'lucide-react';

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
  // Calculate drop-off rate and average time for each flow
  const chartData = flows.map(flow => {
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    const totalDropOff = firstStep.users - lastStep.users;
    const dropOffRate = Math.round((totalDropOff / firstStep.users) * 100);
    
    // Calculate estimated time (mock data)
    const avgTimeInSeconds = 30 + Math.floor(Math.random() * 120) + dropOffRate * 2;
    const minutes = Math.floor(avgTimeInSeconds / 60);
    const seconds = avgTimeInSeconds % 60;
    const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    return {
      name: flow.flow,
      dropOffRate,
      avgTime: avgTimeInSeconds,
      timeFormatted,
      id: flow.id,
      isActive: flow.id === activeFlowId
    };
  });
  
  // Sort by drop-off rate (highest first)
  chartData.sort((a, b) => b.dropOffRate - a.dropOffRate);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const minutes = Math.floor(payload[0].payload.avgTime / 60);
      const seconds = payload[0].payload.avgTime % 60;
      const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Drop-off rate: <span className="font-medium text-red-500">{payload[0].value}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Avg. completion time: <span className="font-medium">{timeFormatted}</span>
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
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-muted-foreground flex items-center">
            <TrendingDown className="h-3.5 w-3.5 mr-1 text-red-500" />
            <span>Higher values indicate more drop-offs</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>Click on bars for journey details</span>
          </div>
        </div>
        
        <div style={{ height: '250px' }}>
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
              <Legend 
                payload={[
                  { value: 'Drop-off Rate', type: 'rect', color: '#7209b7' },
                  { value: 'Click to view journey details', type: 'rect', color: '#7209b7', opacity: 0.5 }
                ]}
              />
              <Bar 
                dataKey="dropOffRate" 
                fill="#7209b7" 
                radius={[4, 4, 0, 0]} 
                onClick={(data) => onFlowClick(data.id)}
                cursor="pointer"
                className="hover:opacity-80 transition-opacity"
                label={{
                  position: 'top',
                  formatter: (value: number) => `${value}%`,
                  fontSize: 12
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
          <span>Data from last 30 days</span>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Average journey time: 4:25 minutes
          </span>
        </div>
      </div>
    </div>
  );
};
