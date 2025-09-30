import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface RealtimeMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export const useRealtimeDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = () => {
    try {
      // Use the full Supabase project URL for WebSocket
      const wsUrl = `wss://nykvaozegqidulsgqrfg.supabase.co/functions/v1/realtime-dashboard`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
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
          console.log('Received message:', message);
          
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
        console.log('WebSocket closed');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    setIsConnected(false);
  };

  const subscribe = (channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return {
    isConnected,
    messages,
    subscribe,
    disconnect,
  };
};
