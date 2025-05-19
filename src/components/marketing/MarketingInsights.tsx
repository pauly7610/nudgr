
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { ColorLegend } from '@/components/ui/ColorLegend';

export const MarketingInsights: React.FC = () => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-3">Marketing Pattern Insights</h3>
      
      <ColorLegend className="mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Friction Types by Marketing Source</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Google Ads', rageClicks: 25, formAbandonment: 40, navigationLoops: 15 },
                  { name: 'Facebook', rageClicks: 35, formAbandonment: 20, navigationLoops: 10 },
                  { name: 'Direct', rageClicks: 15, formAbandonment: 25, navigationLoops: 30 },
                  { name: 'Email', rageClicks: 10, formAbandonment: 30, navigationLoops: 5 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="rageClicks" name="Rage Clicks" fill="#8884d8" />
                <Bar dataKey="formAbandonment" name="Form Abandonment" fill="#82ca9d" />
                <Bar dataKey="navigationLoops" name="Navigation Loops" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Conversion Lift by Implementation Strategy</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Form Simplification', lift: 23 },
                  { name: 'Clear CTAs', lift: 18 },
                  { name: 'Progress Indicators', lift: 12 },
                  { name: 'Social Proof', lift: 15 },
                  { name: 'Guest Checkout', lift: 31 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 'dataMax + 5']} />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip formatter={(value) => [`${value}% lift`, 'Conversion Improvement']} />
                <Bar dataKey="lift" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
