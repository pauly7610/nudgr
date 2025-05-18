
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const VisualAnalyticsTab: React.FC = () => {
  // Sample data for the charts
  const conversionData = [
    { name: 'Homepage', 'Mobile Users': 95, 'Desktop Users': 98, 'Tablet Users': 91 },
    { name: 'Product List', 'Mobile Users': 80, 'Desktop Users': 90, 'Tablet Users': 85 },
    { name: 'Product Detail', 'Mobile Users': 70, 'Desktop Users': 85, 'Tablet Users': 78 },
    { name: 'Add to Cart', 'Mobile Users': 55, 'Desktop Users': 75, 'Tablet Users': 62 },
    { name: 'Checkout', 'Mobile Users': 40, 'Desktop Users': 65, 'Tablet Users': 48 },
    { name: 'Purchase', 'Mobile Users': 30, 'Desktop Users': 58, 'Tablet Users': 42 },
  ];

  const frictionData = [
    { name: 'Homepage', 'Mobile Users': 15, 'Desktop Users': 5, 'Tablet Users': 12 },
    { name: 'Product List', 'Mobile Users': 25, 'Desktop Users': 12, 'Tablet Users': 20 },
    { name: 'Product Detail', 'Mobile Users': 35, 'Desktop Users': 20, 'Tablet Users': 28 },
    { name: 'Add to Cart', 'Mobile Users': 45, 'Desktop Users': 25, 'Tablet Users': 38 },
    { name: 'Checkout', 'Mobile Users': 65, 'Desktop Users': 30, 'Tablet Users': 52 },
    { name: 'Purchase', 'Mobile Users': 40, 'Desktop Users': 22, 'Tablet Users': 35 },
  ];

  return (
    <div className="p-6">
      <h3 className="font-medium mb-3">Visual Comparison</h3>
      <p className="text-muted-foreground mb-4">
        Visualize differences in metrics across selected cohorts
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Conversion Rate by Journey Stage</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Mobile Users" fill="#8884d8" />
                <Bar dataKey="Desktop Users" fill="#82ca9d" />
                <Bar dataKey="Tablet Users" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Friction Score by Journey Stage</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={frictionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Mobile Users" fill="#ff8042" />
                <Bar dataKey="Desktop Users" fill="#0088fe" />
                <Bar dataKey="Tablet Users" fill="#00c49f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
