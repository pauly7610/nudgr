
// Define the behavior curve types
export type CurveBehavior = 'recentSpike' | 'suddenDrop' | 'lowValue' | 'slowDecay';

export interface StaleContentItem {
  name: string;
  type: 'article' | 'feature' | 'page';
  lastInteraction: number; // days ago
  viewsLast30Days: number;
  previousViews: number;
  change: number;
  lifetimeViews?: number;
  viewHistory?: number[]; // Last 90 days of views (newest to oldest)
  curveBehavior?: CurveBehavior;
}

export interface MatrixDataItem {
  name: string;
  x: number; 
  y: number; 
  lastInteraction: number;
  viewsLast30Days: number;
  previousViews: number;
  change: number;
  type: string;
  category: 'stale' | 'watch' | 'reevaluate';
  curveBehavior?: CurveBehavior;
  viewHistory: number[];
}

export type CategoryType = 'stale' | 'watch' | 'reevaluate';
