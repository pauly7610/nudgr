
import { MarketingPlaybook } from '../types/marketingPlaybookTypes';

export const getCategoryBadgeStyle = (category: MarketingPlaybook['category']) => {
  const styles: Record<MarketingPlaybook['category'], string> = {
    landing_page: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    checkout: 'bg-green-100 text-green-800 hover:bg-green-200',
    signup: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    onboarding: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    product: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
  };
  
  return styles[category];
};

export const getImplementationStyle = (time: MarketingPlaybook['implementationTime']) => {
  const styles: Record<MarketingPlaybook['implementationTime'], string> = {
    quick: 'text-green-700',
    medium: 'text-amber-700',
    complex: 'text-red-700'
  };
  
  return styles[time];
};

export const getStatusIcon = (status?: string) => {
  if (!status) return null;
  
  switch (status) {
    case 'success':
      return 'CheckCircle2';
    case 'warning':
      return 'AlertCircle';
    case 'info':
      return 'BookText';
    default:
      return null;
  }
};
