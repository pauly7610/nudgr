import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const SDKDebugger = () => {
  // In a real implementation, this would check for SDK installation
  const isSDKDetected = false;
  const lastEvent = null;
  const eventCount = 0;

  const checks = [
    {
      name: 'SDK Script Loaded',
      status: isSDKDetected ? 'pass' : 'fail',
      message: isSDKDetected
        ? 'Tracking SDK successfully loaded'
        : 'SDK not detected. Install the tracking script on your website.',
    },
    {
      name: 'API Key Valid',
      status: isSDKDetected ? 'pass' : 'unknown',
      message: isSDKDetected
        ? 'API key validated successfully'
        : 'Install SDK to validate API key',
    },
    {
      name: 'Events Being Sent',
      status: eventCount > 0 ? 'pass' : 'warning',
      message: eventCount > 0
        ? `${eventCount} events received in last 24 hours`
        : 'No events received yet. Trigger friction events to test.',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          SDK Debugger
        </CardTitle>
        <CardDescription>
          Verify your tracking implementation is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.name} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{check.name}</span>
                  <Badge variant={
                    check.status === 'pass' ? 'default' :
                    check.status === 'fail' ? 'destructive' :
                    'secondary'
                  }>
                    {check.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Installation Checklist:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Copy SDK snippet from Settings → API Keys</li>
              <li>Add script tag to your website's {'<head>'} section</li>
              <li>Replace API key placeholder with your actual key</li>
              <li>Deploy changes and trigger test friction events</li>
            </ol>
          </AlertDescription>
        </Alert>

        {lastEvent && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Last Event Received</Label>
            <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(lastEvent, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
