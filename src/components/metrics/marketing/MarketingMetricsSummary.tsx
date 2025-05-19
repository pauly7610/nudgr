
import React from 'react';

interface MetricsSummaryProps {
  totalImpressions: number;
  totalClicks: number;
  ctr: string;
  conversionRate: string;
}

export const MarketingMetricsSummary: React.FC<MetricsSummaryProps> = ({
  totalImpressions,
  totalClicks,
  ctr,
  conversionRate
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Impressions</div>
        <div className="text-2xl font-bold mt-1">{totalImpressions.toLocaleString()}</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Clicks</div>
        <div className="text-2xl font-bold mt-1">{totalClicks.toLocaleString()}</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground">CTR</div>
        <div className="text-2xl font-bold mt-1">{ctr}%</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="text-sm text-muted-foreground">Conversion Rate</div>
        <div className="text-2xl font-bold mt-1">{conversionRate}%</div>
      </div>
    </div>
  );
};
