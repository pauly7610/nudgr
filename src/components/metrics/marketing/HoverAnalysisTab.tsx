
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointer, Clock } from 'lucide-react';

export const HoverAnalysisTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <MousePointer className="h-4 w-4 mr-1 text-primary" />
          Top Elements by Hover Time
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: 'Hero Banner', hoverTime: 12.5 },
              { name: 'Product Features', hoverTime: 9.3 },
              { name: 'Pricing Table', hoverTime: 8.7 },
              { name: 'Testimonials', hoverTime: 7.2 },
              { name: 'CTA Button', hoverTime: 6.1 }
            ]}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" unit="s" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={(value) => [`${value}s`, 'Average Hover Time']} />
            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
            <Bar dataKey="hoverTime" fill="#8884d8" radius={[0, 4, 4, 0]} name="Hover Time (seconds)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-1 text-primary" />
          Page Interaction Density
        </h4>
        <div className="border rounded-lg relative h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-gray-100 opacity-50">
            <img 
              src="/placeholder.svg" 
              alt="Heatmap placeholder" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="bg-red-500/20 border border-red-500 rounded-md w-16 h-10"></div>
              <div className="bg-orange-500/30 border border-orange-500 rounded-md w-20 h-12"></div>
            </div>
            <div className="flex justify-center">
              <div className="bg-red-600/40 border border-red-600 rounded-md w-32 h-14"></div>
            </div>
            <div className="flex justify-between">
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-md w-24 h-10"></div>
              <div className="bg-red-500/30 border border-red-500 rounded-md w-16 h-12"></div>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Interaction heat map visualization
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
