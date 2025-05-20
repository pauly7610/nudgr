
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line 
} from 'recharts';

interface MetricData {
  name: string;
  cohortA: number;
  cohortB: number;
}

export const VisualAnalyticsTab: React.FC = () => {
  // Sample data for charts
  const conversionData: MetricData[] = [
    { name: 'Homepage', cohortA: 95, cohortB: 88 },
    { name: 'Product', cohortA: 78, cohortB: 63 },
    { name: 'Cart', cohortA: 55, cohortB: 42 },
    { name: 'Checkout', cohortA: 40, cohortB: 30 },
    { name: 'Confirmation', cohortA: 32, cohortB: 23 },
  ];
  
  const engagementData: MetricData[] = [
    { name: 'Time on Page', cohortA: 85, cohortB: 60 },
    { name: 'Scroll Depth', cohortA: 76, cohortB: 58 },
    { name: 'Interaction Rate', cohortA: 68, cohortB: 45 },
    { name: 'Return Rate', cohortA: 42, cohortB: 35 },
  ];
  
  return (
    <div className="p-6 w-full">
      <h3 className="font-medium mb-3">Visual Comparison</h3>
      <p className="text-muted-foreground mb-4">
        Visualize differences in metrics across selected audience cohorts
      </p>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="border rounded-lg p-4 bg-card">
          <h4 className="text-sm font-medium mb-4">Conversion Funnel Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, '']}
                  labelFormatter={(label) => `Step: ${label}`}
                />
                <Legend />
                <Bar dataKey="cohortA" name="Cohort A" fill="#8884d8" />
                <Bar dataKey="cohortB" name="Cohort B" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Comparison of conversion rates at each step of the journey
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <h4 className="text-sm font-medium mb-4">Engagement Metrics Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={engagementData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, '']}
                  labelFormatter={(label) => `Metric: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cohortA" 
                  name="Cohort A" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cohortB" 
                  name="Cohort B" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Comparison of key engagement metrics between cohorts
          </div>
        </div>
      </div>
    </div>
  );
};
