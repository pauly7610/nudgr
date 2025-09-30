import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const RealtimeUpdates = () => {
  const { isConnected, messages } = useRealtimeDashboard();

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'friction_alert':
        return '⚠️';
      case 'anomaly_detected':
        return '🔍';
      case 'connection':
        return '✅';
      default:
        return '📊';
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Real-time Updates</CardTitle>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? (
              <>
                <Wifi className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Live friction events and anomaly detection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice().reverse().map((message, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-2xl">{getMessageIcon(message.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm capitalize">
                        {message.type.replace('_', ' ')}
                      </span>
                      {message.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      )}
                    </div>
                    {message.data && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {JSON.stringify(message.data)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>
                {isConnected
                  ? 'Waiting for real-time updates...'
                  : 'Connecting to real-time service...'}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
