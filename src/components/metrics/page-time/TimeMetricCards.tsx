
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendValue: number;
}

export const TimeMetricCards: React.FC = () => {
  const metrics: MetricCardProps[] = [
    {
      title: "Average Session Duration",
      value: "3:45",
      trend: "up",
      trendValue: 12
    },
    {
      title: "Pages per Session",
      value: "3.8",
      trend: "up",
      trendValue: 5
    },
    {
      title: "Avg. Time per Page",
      value: "0:59",
      trend: "down",
      trendValue: 3
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard 
          key={index}
          title={metric.title}
          value={metric.value}
          trend={metric.trend}
          trendValue={metric.trendValue}
        />
      ))}
    </div>
  );
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendValue }) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="text-sm font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-primary">{value}</div>
        <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-amber-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}% vs last period
        </div>
      </CardContent>
    </Card>
  );
};
