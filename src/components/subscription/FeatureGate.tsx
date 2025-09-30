import React, { ReactNode } from 'react';
import { useSubscription, Feature, SubscriptionTier } from '@/hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';
import { Skeleton } from '@/components/ui/skeleton';

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  description?: string;
}

const getRequiredTier = (feature: Feature): SubscriptionTier => {
  const { FEATURE_ACCESS } = require('@/hooks/useSubscription');
  const tiers = FEATURE_ACCESS[feature];
  
  if (tiers.includes('free')) return 'free';
  if (tiers.includes('professional')) return 'professional';
  return 'enterprise';
};

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  featureName,
  description 
}) => {
  const { hasAccess, isLoading } = useSubscription();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!hasAccess(feature)) {
    const requiredTier = getRequiredTier(feature);
    
    return fallback || (
      <UpgradePrompt 
        feature={featureName || feature}
        requiredTier={requiredTier}
        description={description}
      />
    );
  }

  return <>{children}</>;
};
