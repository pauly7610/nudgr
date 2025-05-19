
export interface MarketingMetricItem {
  date: string;
  impressions: number;
  clicks: number;
  views: number;
  conversions: number;
  authenticated?: {
    impressions: number;
    clicks: number;
    views: number;
    conversions: number;
  };
  nonAuthenticated?: {
    impressions: number;
    clicks: number;
    views: number;
    conversions: number;
  };
}

export interface MarketingMetricsProps {
  className?: string;
}

export type SegmentType = 'all' | 'authenticated' | 'nonAuthenticated';
