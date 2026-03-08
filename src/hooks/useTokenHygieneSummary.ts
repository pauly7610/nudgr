import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

interface TokenHygieneSummary {
  issuedTokens: number;
  activeTokens: number;
  revokedTokens: number;
  rotatedTokens: number;
  expiredTokens: number;
  logoutRevocations: number;
  reuseDetections: number;
}

interface TokenHygieneSummaryResponse {
  windowDays: number;
  since: string;
  summary: TokenHygieneSummary;
}

export const useTokenHygieneSummary = () => {
  return useQuery({
    queryKey: ['auth-token-hygiene-summary'],
    queryFn: async () => {
      try {
        return await apiRequest<TokenHygieneSummaryResponse>('/auth/token-hygiene-summary');
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
};
