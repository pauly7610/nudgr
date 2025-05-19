
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MatrixDataItem } from './types';
import { getCurveBehavior, getSuggestedAction, getCategoryColor, formatNumber } from './utils';

interface FrictionMatrixProps {
  matrixData: MatrixDataItem[];
}

export const FrictionMatrix: React.FC<FrictionMatrixProps> = ({ matrixData }) => {
  return (
    <div className="h-[280px] border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Friction-to-Value Matrix</h4>
        <div className="flex gap-2 items-center">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
            <span className="text-xs">Stale</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></div>
            <span className="text-xs">Watch</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-xs">Reevaluate</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="% Drop in Use" 
            unit="%" 
            domain={[0, 100]} 
            label={{ value: '% Drop in Use', position: 'bottom' }} 
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Recent Engagement Ratio" 
            label={{ value: 'Recent Engagement Ratio', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as MatrixDataItem;
                const behavior = getCurveBehavior(data.curveBehavior);
                const action = getSuggestedAction({
                  name: data.name,
                  type: data.type as any,
                  lastInteraction: data.lastInteraction,
                  viewsLast30Days: data.viewsLast30Days,
                  previousViews: data.previousViews,
                  change: data.change,
                  curveBehavior: data.curveBehavior
                });
                
                return (
                  <div className="bg-white p-3 border rounded-md shadow-md">
                    <p className="font-semibold text-sm">{data.name}</p>
                    <p className="text-xs">Last interaction: {data.lastInteraction} days ago</p>
                    <p className="text-xs">Recent views: {formatNumber(data.viewsLast30Days)}</p>
                    <p className="text-xs">Usage change: {data.change}%</p>
                    <p className="text-xs">{behavior.icon} {behavior.label}</p>
                    <p className="text-xs mt-1 font-medium text-muted-foreground">
                      Recommendation: {action.action}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Content Items" data={matrixData}>
            {matrixData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getCategoryColor(entry.category)} 
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
