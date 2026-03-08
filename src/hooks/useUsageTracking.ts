import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export type UsageType = 'session_recording' | 'data_storage';

export interface UsageRecord {
  id: string;
  userId: string;
  usageType: UsageType;
  amount: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLimit {
  id: string;
  tier: string;
  usageType: UsageType;
  includedAmount: number;
  overagePrice: number;
  unit: string;
}

interface UsageResponse {
  tier: string;
  limits: UsageLimit[];
  usageRecords: UsageRecord[];
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

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['usage', user?.id, tier],
    queryFn: async () => {
      if (!user?.id) return [];

      return apiRequest<UsageResponse>('/usage');
    },
    enabled: !!user?.id,
  });

  const limits = usageData && !Array.isArray(usageData)
    ? usageData.limits
    : [];

  const usage = usageData && !Array.isArray(usageData)
    ? usageData.usageRecords
    : [];

  const getUsageSummary = (usageType: UsageType): UsageSummary => {
    const limit = limits?.find((l) => l.usageType === usageType);
    const currentUsage = usage?.find((u) => u.usageType === usageType);
    
    const current = currentUsage?.amount || 0;
    const limitAmount = limit?.includedAmount || 0;
    const isUnlimited = limitAmount === -1;
    
    const percentUsed = isUnlimited ? 0 : (current / limitAmount) * 100;
    const overage = Math.max(0, current - limitAmount);
    const overagePrice = limit?.overagePrice || 0;
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
