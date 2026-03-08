import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealtimeDashboard } from '../useRealtimeDashboard';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const getAccessTokenMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/apiClient', () => ({
  getAccessToken: getAccessTokenMock,
}));

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = WebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    queueMicrotask(() => this.onopen?.());
  }

  send(): void {}

  close(): void {
    // no-op to avoid reconnect loops during test teardown
  }
}

describe('useRealtimeDashboard', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
    vi.stubEnv('VITE_REALTIME_WS_URL', 'ws://localhost:4000/ws/realtime-dashboard');
    getAccessTokenMock.mockReturnValue('test-token-123');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('appends access token to realtime websocket url', async () => {
    const { unmount } = renderHook(() => useRealtimeDashboard());

    await waitFor(() => {
      expect(MockWebSocket.instances.length).toBe(1);
    });

    expect(MockWebSocket.instances[0].url).toContain('ws://localhost:4000/ws/realtime-dashboard');
    expect(MockWebSocket.instances[0].url).toContain('token=test-token-123');

    unmount();
  });
});
