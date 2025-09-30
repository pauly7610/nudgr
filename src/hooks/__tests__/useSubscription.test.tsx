import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubscription } from '../useSubscription';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
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
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tier).toBe('free');
  });

  it('checks feature access correctly for free tier', async () => {
    const mockUser = { id: 'test-user-id' };
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    } as any);

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
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { tier: 'professional' },
              error: null,
            }),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasAccess('basicFrictionTracking')).toBe(true);
    expect(result.current.hasAccess('aiAnalysis')).toBe(true);
    expect(result.current.hasAccess('whiteLabeling')).toBe(false);
  });
});
