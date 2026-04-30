import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getAccessToken } from '@/lib/apiClient';

interface RealtimeMessage {
  type: string;
  data?: unknown;
  timestamp?: string;
}

export const useRealtimeDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<number | null>(null);

  const getRealtimeUrl = useCallback(() => {
    const token = getAccessToken();

    const withToken = (url: string): string => {
      if (!token) return url;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}token=${encodeURIComponent(token)}`;
    };

    if (import.meta.env.VITE_REALTIME_WS_URL) {
      return withToken(import.meta.env.VITE_REALTIME_WS_URL);
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiBaseUrl) {
      return withToken(apiBaseUrl
        .replace(/^http:\/\//i, 'ws://')
        .replace(/^https:\/\//i, 'wss://')
        .replace(/\/$/, '') + '/ws/realtime-dashboard');
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return withToken(`${protocol}//${window.location.host}/ws/realtime-dashboard`);
  }, []);

  const connect = useCallback(() => {
    try {
      const wsUrl = getRealtimeUrl();
      
      if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
        console.debug('Connecting to WebSocket:', wsUrl);
      }
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
          console.debug('WebSocket connected');
        }
        setIsConnected(true);
        
        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
            console.debug('Received message:', message);
          }
          
          setMessages((prev) => [...prev.slice(-49), message]); // Keep last 50 messages

          // Show toast for important updates
          if (message.type === 'friction_alert' || message.type === 'anomaly_detected') {
            toast({
              title: message.type === 'friction_alert' ? '⚠️ Friction Alert' : '🔍 Anomaly Detected',
              description: message.data?.description || 'New event detected',
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to real-time updates',
          variant: 'destructive',
        });
      };

      wsRef.current.onclose = () => {
        if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
          console.debug('WebSocket closed');
        }
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (import.meta.env.VITE_DEBUG_TELEMETRY === 'true') {
            console.debug('Attempting to reconnect...');
          }
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [getRealtimeUrl, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    setIsConnected(false);
  }, []);

  const subscribe = (channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    messages,
    subscribe,
    disconnect,
  };
};
