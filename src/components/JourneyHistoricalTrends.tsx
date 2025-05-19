
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { BarChart2, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ColorLegend } from './ui/ColorLegend';

interface JourneyHistoricalTrendsProps {
  flow: Flow | null;
}

export const JourneyHistoricalTrends: React.FC<JourneyHistoricalTrendsProps> = ({ flow }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!flow) return null;
  
  // Generate mock historical data for the past 7 days
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();
    const conversionRate = flow.steps[flow.steps.length - 1].users / flow.steps[0].users;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Add some random variation to the metrics
      const randomVariation = () => 1 + (Math.random() * 0.4 - 0.2); // ±20% variation
      
      // Add average time metrics
      const avgTimeInSeconds = Math.floor(180 + Math.random() * 120);
      const minutes = Math.floor(avgTimeInSeconds / 60);
      const seconds = avgTimeInSeconds % 60;
      const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      data.push({
        date: dateStr,
        conversionRate: Math.min(100, Math.max(1, conversionRate * 100 * randomVariation())).toFixed(1),
        dropOffRate: Math.min(100, Math.max(1, (1 - conversionRate) * 100 * randomVariation())).toFixed(1),
        frictionPoints: Math.floor(flow.steps.reduce((acc, step) => acc + (step.friction?.length || 0), 0) * randomVariation()),
        avgTime: avgTimeInSeconds,
        timeFormatted
      });
    }
    
    return data;
  };
  
  const historicalData = generateHistoricalData();
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden mt-6">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-500" />
          Historical Trends
        </h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-6">
          <ColorLegend className="mb-6" />
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium flex items-center">
                  Conversion Rate Over Time
                </h4>
                <div className="text-xs flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>Last 7 days</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis unit="%" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                        if (name === 'dropOffRate') return [`${value}%`, 'Drop-off Rate'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="conversionRate" stroke="#8884d8" name="Conversion Rate (%)" />
                    <Line type="monotone" dataKey="dropOffRate" stroke="#ff7300" name="Drop-off Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium flex items-center">
                  Friction Points & Time Analysis
                </h4>
                <div className="text-xs flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Average completion: {
                    (() => {
                      const avgTime = historicalData.reduce((sum, item) => sum + item.avgTime, 0) / historicalData.length;
                      const minutes = Math.floor(avgTime / 60);
                      const seconds = Math.floor(avgTime % 60);
                      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    })()
                  }</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'frictionPoints') return [value, 'Friction Points'];
                        if (name === 'avgTime') {
                          const minutes = Math.floor(value as number / 60);
                          const seconds = Math.floor(value as number % 60);
                          return [`${minutes}:${seconds.toString().padStart(2, '0')}`, 'Average Time'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="frictionPoints" stroke="#82ca9d" name="Friction Points" />
                    <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#8884d8" name="Avg. Completion Time" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                * Time values shown in minutes:seconds format
              </div>
              <Button>
                Export Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
