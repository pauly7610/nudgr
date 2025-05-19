
import { CurveBehavior, StaleContentItem, CategoryType } from './types';

// Helper function to get category (for color coding)
export function getCategory(change: number, engagementRatio: number): CategoryType {
  if (change < -70 && engagementRatio < 1) return 'stale';
  if (change < -50 && engagementRatio < 3) return 'watch';
  return 'reevaluate';
}

// Helper to get color based on category
export function getCategoryColor(category: CategoryType): string {
  switch (category) {
    case 'stale': return '#ea384c';
    case 'watch': return '#F97316';
    case 'reevaluate': return '#10b981';
    default: return '#8884d8';
  }
}

// Get curve behavior icon and description
export function getCurveBehavior(behavior: CurveBehavior | undefined) {
  switch (behavior) {
    case 'recentSpike':
      return { icon: '📈', label: 'Recent Spike', description: 'Increase in views in last 7-14 days' };
    case 'suddenDrop':
      return { icon: '📉', label: 'Sudden Drop', description: 'Sharp decline after sustained usage' };
    case 'lowValue':
      return { icon: '🧊', label: 'Low Value', description: 'Very low engagement over entire tracked period' };
    case 'slowDecay':
      return { icon: '🔄', label: 'Slow Decay', description: 'Gradual decline, may still have value' };
    default:
      return { icon: '❓', label: 'Unknown', description: 'Behavior pattern not classified' };
  }
}

// Helper to get the suggested action based on curve behavior
export function getSuggestedAction(item: StaleContentItem) {
  const engagementRatio = item.lifetimeViews ? (item.viewsLast30Days / item.lifetimeViews) * 100 : 0;
  const category = getCategory(item.change, engagementRatio);
  
  // Adjust recommendation based on curve behavior
  if (item.curveBehavior === 'recentSpike') {
    return { icon: 'trending-up', action: 'Promote' };
  }
  
  switch (category) {
    case 'stale': 
      return item.curveBehavior === 'slowDecay' 
        ? { icon: 'refresh-cw', action: 'Refresh' }
        : { icon: 'archive', action: 'Archive' };
    case 'watch': 
      return { icon: 'refresh-cw', action: 'Refresh' };
    case 'reevaluate': 
      return { icon: 'trending-up', action: 'Promote' };
    default: 
      return { icon: 'help-circle', action: 'Investigate' };
  }
}

// Format numbers with commas
export const formatNumber = (num: number) => {
  return num.toLocaleString();
};
