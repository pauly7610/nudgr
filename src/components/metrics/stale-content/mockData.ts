
import { StaleContentItem } from './types';

// Mock data for stale content with added viewHistory for 90 days
export const staleContent: StaleContentItem[] = [
  { 
    name: 'Technical Error Correlation', 
    type: 'feature', 
    lastInteraction: 67, 
    viewsLast30Days: 3, 
    previousViews: 29, 
    change: -89.7, 
    lifetimeViews: 1250,
    viewHistory: [2, 1, 0, 1, 2, 0, 0, 2, 0, 3, 1, 4, 6, 7, 8, 7, 5, 5, 4, 3, 2, 2, 1, 0, 0, 1, 0, 0, 1, 2, 3, 4, 
      5, 5, 6, 8, 10, 12, 13, 10, 8, 7, 6, 5, 4, 3, 3, 4, 5, 7, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 2, 3, 4, 
      5, 6, 7, 9, 10, 12, 15, 18, 16, 14, 12, 10, 8, 7, 5, 4, 2, 1, 0, 0, 0],
    curveBehavior: 'slowDecay'
  },
  { 
    name: 'Advanced Segmentation', 
    type: 'feature', 
    lastInteraction: 78, 
    viewsLast30Days: 5, 
    previousViews: 54, 
    change: -90.7, 
    lifetimeViews: 2800,
    viewHistory: [0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 
      8, 10, 12, 14, 13, 12, 10, 8, 7, 6, 5, 5, 4, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 7, 10, 15, 20, 18, 
      15, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    curveBehavior: 'suddenDrop'
  },
  { 
    name: 'Legacy Landing Page', 
    type: 'page', 
    lastInteraction: 94, 
    viewsLast30Days: 7, 
    previousViews: 215, 
    change: -96.7, 
    lifetimeViews: 12500,
    viewHistory: [1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
      1, 1, 2, 2, 3, 4, 5, 8, 10, 15, 20, 28, 35, 42, 38, 32, 25, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 10, 5, 3, 0],
    curveBehavior: 'lowValue'
  },
  { 
    name: 'Marketing Playbook: B2B SaaS', 
    type: 'article', 
    lastInteraction: 32, 
    viewsLast30Days: 8, 
    previousViews: 24, 
    change: -66.7, 
    lifetimeViews: 890,
    viewHistory: [3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 
      1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
      0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 3, 2, 1, 0],
    curveBehavior: 'slowDecay'
  },
  { 
    name: 'How to Use Journey Maps', 
    type: 'article', 
    lastInteraction: 45, 
    viewsLast30Days: 12, 
    previousViews: 86, 
    change: -85.1, 
    lifetimeViews: 3200,
    viewHistory: [0, 0, 0, 0, 0, 1, 2, 3, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 
      4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 
      4, 5, 6, 7, 8, 10, 12, 15, 18, 20, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0],
    curveBehavior: 'recentSpike'
  },
  { 
    name: 'Customer Journey Templates', 
    type: 'article', 
    lastInteraction: 18, 
    viewsLast30Days: 26, 
    previousViews: 45, 
    change: -42.2, 
    lifetimeViews: 1450,
    viewHistory: [3, 4, 5, 6, 7, 8, 9, 10, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 
      2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 
      8, 9, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 4, 3],
    curveBehavior: 'recentSpike'
  },
  { 
    name: 'Analytics Exports', 
    type: 'feature', 
    lastInteraction: 27, 
    viewsLast30Days: 16, 
    previousViews: 31, 
    change: -48.4, 
    lifetimeViews: 950,
    viewHistory: [4, 4, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 6, 8, 10, 9, 8, 7, 
      6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 
      1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    curveBehavior: 'recentSpike'
  }
];
