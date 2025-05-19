
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock } from 'lucide-react';

export const VisualAnalyticsTab: React.FC = () => {
  // Sample data for the charts
  const conversionData = [
    { name: 'Homepage', 'Mobile Visitors': 95, 'Desktop Visitors': 98, 'Tablet Visitors': 91 },
    { name: 'Product List', 'Mobile Visitors': 80, 'Desktop Visitors': 90, 'Tablet Visitors': 85 },
    { name: 'Product Detail', 'Mobile Visitors': 70, 'Desktop Visitors': 85, 'Tablet Visitors': 78 },
    { name: 'Add to Cart', 'Mobile Visitors': 55, 'Desktop Visitors': 75, 'Tablet Visitors': 62 },
    { name: 'Checkout', 'Mobile Visitors': 40, 'Desktop Visitors': 65, 'Tablet Visitors': 48 },
    { name: 'Purchase', 'Mobile Visitors': 30, 'Desktop Visitors': 58, 'Tablet Visitors': 42 },
  ];

  const frictionData = [
    { name: 'Homepage', 'Mobile Visitors': 15, 'Desktop Visitors': 5, 'Tablet Visitors': 12 },
    { name: 'Product List', 'Mobile Visitors': 25, 'Desktop Visitors': 12, 'Tablet Visitors': 20 },
    { name: 'Product Detail', 'Mobile Visitors': 35, 'Desktop Visitors': 20, 'Tablet Visitors': 28 },
    { name: 'Add to Cart', 'Mobile Visitors': 45, 'Desktop Visitors': 25, 'Tablet Visitors': 38 },
    { name: 'Checkout', 'Mobile Visitors': 65, 'Desktop Visitors': 30, 'Tablet Visitors': 52 },
    { name: 'Purchase', 'Mobile Visitors': 40, 'Desktop Visitors': 22, 'Tablet Visitors': 35 },
  ];

  // Mock time data for journey stages
  const timeData = {
    mobile: {
      homepage: '0:15',
      productList: '0:48',
      productDetail: '1:24',
      addToCart: '0:22',
      checkout: '2:35',
      purchase: '1:10'
    },
    desktop: {
      homepage: '0:12',
      productList: '0:35',
      productDetail: '1:10',
      addToCart: '0:18',
      checkout: '1:45',
      purchase: '0:58'
    },
    tablet: {
      homepage: '0:18',
      productList: '0:52',
      productDetail: '1:18',
      addToCart: '0:25',
      checkout: '2:15',
      purchase: '1:05'
    }
  };

  return (
    <div className="p-6">
      <h3 className="font-medium mb-3">Visual Comparison</h3>
      <p className="text-muted-foreground mb-4">
        Visualize differences in metrics across selected cohorts
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Conversion Rate by Journey Stage</h4>
            <div className="text-xs flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last 30 days</span>
            </div>
          </div>
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
                <YAxis 
                  tickFormatter={(value) => `${value}%`} 
                  domain={[0, 100]}
                  label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft', offset: 0 }}
                />
                <Tooltip 
                  formatter={(value, name: string | number) => {
                    if (typeof name === 'string') {
                      const parts = name.split(" ");
                      const deviceType = parts[0].toLowerCase();
                      const stageName = parts[1]?.toLowerCase();
                      if (stageName && deviceType in timeData) {
                        const device = deviceType as keyof typeof timeData;
                        const stage = stageName as keyof typeof timeData.mobile;
                        const timeSpent = timeData[device][stage] || 'N/A';
                        return [
                          <div>
                            <div>{`${value}%`}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Avg time: {timeSpent}</span>
                            </div>
                          </div>,
                          name
                        ];
                      }
                    }
                    return [`${value}%`, name];
                  }}
                  labelFormatter={(label) => `Stage: ${label}`}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Mobile Visitors" fill="#8884d8" />
                <Bar dataKey="Desktop Visitors" fill="#82ca9d" />
                <Bar dataKey="Tablet Visitors" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted-foreground mt-2 flex justify-center items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>Longer time spent on a stage often indicates friction points</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Friction Score by Journey Stage</h4>
            <div className="text-xs flex items-center gap-2">
              <div className="flex items-center mr-2">
                <div className="w-2 h-2 rounded-full bg-[#ff8042] mr-1"></div>
                <span>Mobile</span>
              </div>
              <div className="flex items-center mr-2">
                <div className="w-2 h-2 rounded-full bg-[#0088fe] mr-1"></div>
                <span>Desktop</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#00c49f] mr-1"></div>
                <span>Tablet</span>
              </div>
            </div>
          </div>
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
                <YAxis 
                  label={{ value: 'Friction Score', angle: -90, position: 'insideLeft', offset: 0 }}
                />
                <Tooltip 
                  formatter={(value, name: string | number) => {
                    if (typeof name === 'string') {
                      const parts = name.split(" ");
                      const deviceType = parts[0].toLowerCase();
                      const stageName = parts[1]?.toLowerCase();
                      if (stageName && deviceType in timeData) {
                        const device = deviceType as keyof typeof timeData;
                        const stage = stageName as keyof typeof timeData.mobile;
                        const timeSpent = timeData[device][stage] || 'N/A';
                        return [
                          <div>
                            <div>Score: {value}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Avg time: {timeSpent}</span>
                            </div>
                          </div>,
                          name
                        ];
                      }
                    }
                    return [`${value}`, name];
                  }}
                />
                <Legend />
                <Bar dataKey="Mobile Visitors" fill="#ff8042" label={{ position: 'top', fontSize: 10 }} />
                <Bar dataKey="Desktop Visitors" fill="#0088fe" label={{ position: 'top', fontSize: 10 }} />
                <Bar dataKey="Tablet Visitors" fill="#00c49f" label={{ position: 'top', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs flex justify-between items-center mt-2">
            <span className="text-muted-foreground">
              * Higher friction scores indicate more problems
            </span>
            <span className="text-muted-foreground">
              Data collected: May 1 - May 19, 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
