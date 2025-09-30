import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export type UsageType = 'session_recording' | 'data_storage';

export interface UsageRecord {
  id: string;
  user_id: string;
  usage_type: UsageType;
  amount: number;
  unit: string;
  period_start: string;
  period_end: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface UsageLimit {
  id: string;
  tier: string;
  usage_type: UsageType;
  included_amount: number;
  overage_price: number;
  unit: string;
}

export interface UsageSummary {
  current: number;
  limit: number;
  unit: string;
  percentUsed: number;
  overage: number;
  overagePrice: number;
  estimatedCost: number;
  isUnlimited: boolean;
}

export const useUsageTracking = () => {
  const { user } = useAuth();
  const { tier } = useSubscription();

  // Fetch usage limits for current tier
  const { data: limits } = useQuery({
    queryKey: ['usage-limits', tier],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('tier', tier);

      if (error) throw error;
      return data as UsageLimit[];
    },
  });

  // Fetch current usage
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-records', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('usage_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', startOfMonth.toISOString());

      if (error) throw error;
      return data as UsageRecord[];
    },
    enabled: !!user?.id,
  });

  const getUsageSummary = (usageType: UsageType): UsageSummary => {
    const limit = limits?.find(l => l.usage_type === usageType);
    const currentUsage = usage?.find(u => u.usage_type === usageType);
    
    const current = currentUsage?.amount || 0;
    const limitAmount = limit?.included_amount || 0;
    const isUnlimited = limitAmount === -1;
    
    const percentUsed = isUnlimited ? 0 : (current / limitAmount) * 100;
    const overage = Math.max(0, current - limitAmount);
    const overagePrice = limit?.overage_price || 0;
    const estimatedCost = overage * overagePrice;

    return {
      current,
      limit: limitAmount,
      unit: limit?.unit || 'units',
      percentUsed,
      overage,
      overagePrice,
      estimatedCost,
      isUnlimited,
    };
  };

  const recordingUsage = getUsageSummary('session_recording');
  const storageUsage = getUsageSummary('data_storage');

  const totalEstimatedCost = recordingUsage.estimatedCost + storageUsage.estimatedCost;

  return {
    recordingUsage,
    storageUsage,
    totalEstimatedCost,
    isLoading: usageLoading,
    limits,
  };
};
