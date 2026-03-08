import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubscription } from '../useSubscription';
import { apiRequest } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({
  apiRequest: vi.fn(),
  setAccessToken: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns free tier by default when no subscription exists', async () => {
    const mockUser = { id: 'test-user-id' };
    vi.mocked(apiRequest).mockImplementation(async (path: string) => {
      if (path === '/auth/me') {
        return mockUser as never;
      }
      if (path === '/subscription') {
        return { subscription: null } as never;
      }
      throw new Error(`Unexpected path: ${path}`);
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tier).toBe('free');
  });

  it('checks feature access correctly for free tier', async () => {
    const mockUser = { id: 'test-user-id' };
    vi.mocked(apiRequest).mockImplementation(async (path: string) => {
      if (path === '/auth/me') {
        return mockUser as never;
      }
      if (path === '/subscription') {
        return { subscription: null } as never;
      }
      throw new Error(`Unexpected path: ${path}`);
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasAccess('basicFrictionTracking')).toBe(true);
    expect(result.current.hasAccess('aiAnalysis')).toBe(false);
    expect(result.current.hasAccess('whiteLabeling')).toBe(false);
  });

  it('checks feature access correctly for professional tier', async () => {
    const mockUser = { id: 'test-user-id' };
    vi.mocked(apiRequest).mockImplementation(async (path: string) => {
      if (path === '/auth/me') {
        return mockUser as never;
      }
      if (path === '/subscription') {
        return {
          subscription: {
            id: 'sub-1',
            userId: mockUser.id,
            tier: 'professional',
            status: 'active',
            cancelAtPeriodEnd: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        } as never;
      }
      throw new Error(`Unexpected path: ${path}`);
    });

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.tier).toBe('professional'));

    expect(result.current.hasAccess('basicFrictionTracking')).toBe(true);
    expect(result.current.hasAccess('aiAnalysis')).toBe(true);
    expect(result.current.hasAccess('whiteLabeling')).toBe(false);
  });
});
