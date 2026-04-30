
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendValue: number;
}

interface TimeMetricCardsProps {
  averageSessionDuration: string;
  pagesPerSession: string;
  averageTimePerPage: string;
}

export const TimeMetricCards: React.FC<TimeMetricCardsProps> = ({
  averageSessionDuration,
  pagesPerSession,
  averageTimePerPage,
}) => {
  const metrics: MetricCardProps[] = [
    {
      title: "Average Session Duration",
      value: averageSessionDuration,
      trend: "up",
      trendValue: 0
    },
    {
      title: "Pages per Session",
      value: pagesPerSession,
      trend: "up",
      trendValue: 0
    },
    {
      title: "Avg. Time per Page",
      value: averageTimePerPage,
      trend: "down",
      trendValue: 0
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
