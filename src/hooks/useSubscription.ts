import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { isAuthDisabled } from '@/lib/authMode';

export type SubscriptionTier = 'free' | 'professional' | 'enterprise';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export const FEATURE_ACCESS = {
  // Free tier
  basicFrictionTracking: ['free', 'professional', 'enterprise'],
  basicDashboard: ['free', 'professional', 'enterprise'],
  basicAlerts: ['free', 'professional', 'enterprise'],
  
  // Professional tier
  aiAnalysis: ['professional', 'enterprise'],
  advancedAnalytics: ['professional', 'enterprise'],
  cohortAnalysis: ['professional', 'enterprise'],
  heatmaps: ['professional', 'enterprise'],
  predictiveAnalytics: ['professional', 'enterprise'],
  sessionRecordings: ['professional', 'enterprise'],
  abTesting: ['professional', 'enterprise'],
  
  // Enterprise tier
  apiAccess: ['enterprise'],
  whiteLabeling: ['enterprise'],
  customIntegrations: ['enterprise'],
  teamCollaboration: ['enterprise'],
  advancedSecurity: ['enterprise'],
  dedicatedSupport: ['enterprise'],
} as const;

export type Feature = keyof typeof FEATURE_ACCESS;

export const useSubscription = () => {
  const { user } = useAuth();
  const authDisabled = isAuthDisabled() && import.meta.env.MODE !== 'test';

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const response = await apiRequest<{ subscription: Subscription | null }>('/subscription');
      return response.subscription;
    },
    enabled: !!user?.id,
  });

  const tier: SubscriptionTier = authDisabled ? 'enterprise' : subscription?.tier || 'free';

  const hasAccess = (feature: Feature): boolean => {
    const allowedTiers = FEATURE_ACCESS[feature] as readonly string[];
    return (allowedTiers as string[]).includes(tier);
  };

  const canUpgrade = tier !== 'enterprise';

  const nextTier: SubscriptionTier | null = 
    tier === 'free' ? ('professional' as SubscriptionTier) : 
    tier === 'professional' ? ('enterprise' as SubscriptionTier) : 
    null;

  return {
    subscription,
    tier,
    isLoading,
    hasAccess,
    canUpgrade,
    nextTier,
  };
};
