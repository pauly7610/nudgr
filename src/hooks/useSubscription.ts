import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionTier = 'free' | 'professional' | 'enterprise';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
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

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });

  const tier: SubscriptionTier = subscription?.tier || 'free';

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
